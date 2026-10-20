import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createHash } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { signServerAction } from "@/lib/adminSign";
import { sendMail, escapeHtml } from "@/lib/mail";
import { buildLicensePdf } from "@/lib/licensePdf";
import { slugForPriceId } from "@/lib/stripe";
import { PRODUCTS, BUNDLE_SLUG, BUNDLE_PACK_SLUGS } from "@/lib/data";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

/**
 * Webhook Stripe — UNICA fonte di verità per conferire diritti.
 * 1. Verifica firma (header stripe-signature, body raw) → niente firma, niente diritti.
 * 2. Idempotenza: codici licenza DETERMINISTICI per (sessione, prodotto) +
 *    claim evento + controllo licenze già emesse → retry sicuri, zero duplicati.
 */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Codice deterministico DBY-XXXX-XXXX da (sessionId, slug): stesso input → stesso codice. */
function deterministicCode(sessionId: string, slug: string): string {
  const digest = createHash("sha256").update(`${sessionId}:${slug}`).digest();
  const pick = (off: number) =>
    Array.from(digest.slice(off, off + 4), (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `DBY-${pick(0)}-${pick(4)}`;
}

function convex(): ConvexHttpClient | null {
  const url =
    process.env.NEXT_PUBLIC_CONVEX_URL ??
    process.env.CONVEX_HTTP_URL?.replace(".convex.site", ".convex.cloud");
  return url ? new ConvexHttpClient(url) : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function q(c: ConvexHttpClient, fn: any, action: string, subject: Record<string, unknown>, args: Record<string, unknown> = {}) {
  return c.query(fn, { ...args, _auth: signServerAction(action, subject) });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function m(c: ConvexHttpClient, fn: any, action: string, subject: Record<string, unknown>, args: Record<string, unknown> = {}) {
  return c.mutation(fn, { ...args, _auth: signServerAction(action, subject) });
}

async function resolveProductId(c: ConvexHttpClient, slug: string): Promise<string | null> {
  const docs = (await c.query(api.products.list as never, {})) as Array<{ _id: string; slug: string }> | null;
  const found = docs?.find((d) => d.slug === slug);
  if (found) return found._id;
  const local = PRODUCTS.find((p) => p.slug === slug);
  if (!local) return null;
  const created = (await m(
    c,
    api.products.create,
    "products.create",
    { title: local.title },
    { title: local.title, type: local.type, price: local.price, stripeLink: "", description: local.description, slug: local.slug }
  )) as string | null;
  return created;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ ok: false, error: "Stripe non configurato." }, { status: 500 });
  }
  const stripe = new Stripe(secret);
  const c = convex();
  if (!c) return NextResponse.json({ ok: false, error: "Backend non disponibile." }, { status: 500 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ ok: false, error: "Firma mancante." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, webhookSecret);
  } catch {
    return NextResponse.json({ ok: false, error: "Firma non valida." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        // Metodi di pagamento differiti: i diritti arrivano solo con async_payment_succeeded
        if (session.payment_status !== "paid") break;
        const email = (session.customer_details?.email ?? (session.metadata?.email as string) ?? "").trim().toLowerCase();
        const items = JSON.parse((session.metadata?.items as string) ?? "[]") as Array<{ slug: string; tier: string }>;
        const userId = (session.metadata?.userId as string) || undefined;
        if (!email || items.length === 0) break;

        // Fulfillment idempotente per prodotto: i retry completano solo ciò che manca.
        type ExistingLicense = { productSlug: string; code: string };
        const existing = ((await q(c, api.licenses.listBySession, "licenses.listBySession", { stripeSessionId: sessionId }, { stripeSessionId: sessionId })) ?? []) as ExistingLicense[];
        const codeBySlug = new Map(existing.map((l) => [l.productSlug, l.code]));
        const lines: Array<{ title: string; code: string }> = [];

        for (const item of items) {
          const product = PRODUCTS.find((p) => p.slug === item.slug);
          if (!product || product.licenseOnly) continue;

          // Il bundle non è un file unico: emette 4 licenze, una per pack.
          const targetSlugs: string[] = item.slug === BUNDLE_SLUG ? [...BUNDLE_PACK_SLUGS] : [item.slug];
          const missing = targetSlugs.filter((s) => !codeBySlug.has(s) && PRODUCTS.some((p) => p.slug === s && !p.licenseOnly));

          if (missing.length > 0) {
            const productId = await resolveProductId(c, item.slug);
            if (productId) {
              await m(c, api.orders.create, "orders.create", { email }, {
                productId, email, amount: product.price,
                stripeSessionId: sessionId, stripeEventId: event.id,
                ...(userId ? { userId } : {}), status: "paid",
              });
            }
            for (const slug of missing) {
              const code = deterministicCode(sessionId, slug);
              await m(c, api.licenses.create, "licenses.create", { code }, {
                code, productSlug: slug, email,
                ...(userId ? { userId } : {}), stripeSessionId: sessionId,
              });
              codeBySlug.set(slug, code);
            }
          }

          for (const slug of targetSlugs) {
            const pack = PRODUCTS.find((p) => p.slug === slug);
            const code = codeBySlug.get(slug);
            if (pack && code && !lines.some((l) => l.code === code)) {
              lines.push({ title: pack.title, code });
            }
          }
        }

        if (lines.length > 0) {
          const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dbyoung.it";
          let attachments: Array<{ filename: string; content: Buffer }> | undefined;
          try {
            const pdf = await buildLicensePdf({
              email,
              orderId: sessionId,
              date: new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000),
              items: lines,
            });
            attachments = [{ filename: `DBYoung-licenza-${sessionId.slice(-8)}.pdf`, content: Buffer.from(pdf) }];
          } catch {
            // Il PDF non deve bloccare la consegna dei codici
          }
          await sendMail({
            to: email,
            subject: "Il tuo ordine DBYoung è pronto",
            html: `<h1>Grazie per l'acquisto!</h1>
              <p>In allegato trovi il certificato di licenza con i diritti d'autore di <strong>Dimitri Bouturline (D.B Young)</strong>.</p>
              <ul>${lines
                .map((l) => `<li>${escapeHtml(l.title)} — codice <strong>${escapeHtml(l.code)}</strong></li>`)
                .join("")}</ul>
              <p>Scarica da <a href="${escapeHtml(base)}/libreria">${escapeHtml(base)}/libreria</a> inserendo i codici.</p>
              <p style="font-size:12px;color:#666">Credito obbligatorio: Dimitri Bouturline (D.B Young). La rivendita dei file originali è vietata.</p>`,
            ...(attachments ? { attachments } : {}),
            // Stesso ordine → stessa email: Resend deduplica i retry di Stripe
            idempotencyKey: `order-${sessionId}`,
          });
        }
        await m(c, api.stripeEvents.claim, "stripeEvents.claim", { eventId: event.id }, { eventId: event.id, type: event.type });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (pi) {
          const sessions = await stripe.checkout.sessions.list({ payment_intent: pi, limit: 5 });
          for (const s of sessions.data) {
            await m(c, api.licenses.revokeBySession, "licenses.revokeBySession", { stripeSessionId: s.id }, { stripeSessionId: s.id });
          }
        }
        await m(c, api.stripeEvents.claim, "stripeEvents.claim", { eventId: event.id }, { eventId: event.id, type: event.type });
        break;
      }
      case "payment_intent.succeeded":
      case "checkout.session.expired": {
        // Nessun diritto conferito qui: solo tracciamento anti-replay
        await m(c, api.stripeEvents.claim, "stripeEvents.claim", { eventId: event.id }, { eventId: event.id, type: event.type });
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ ok: true, received: true });
  } catch {
    // 500 → Stripe ritenta; l'idempotenza rende i retry sicuri
    return NextResponse.json({ ok: false, error: "Errore interno." }, { status: 500 });
  }
}
