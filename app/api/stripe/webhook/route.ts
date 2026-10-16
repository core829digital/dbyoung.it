import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createHash } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { signServerAction } from "@/lib/adminSign";
import { sendMail, escapeHtml } from "@/lib/mail";
import { slugForPriceId } from "@/lib/stripe";
import { PRODUCTS } from "@/lib/data";
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
    { title: local.title, type: local.type, price: local.price, stripeLink: "", description: local.description }
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
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;
        const email = (session.customer_details?.email ?? (session.metadata?.email as string) ?? "").trim().toLowerCase();
        const items = JSON.parse((session.metadata?.items as string) ?? "[]") as Array<{ slug: string; tier: string }>;
        const userId = (session.metadata?.userId as string) || undefined;
        if (!email || items.length === 0) break;

        // Già esaudita? (retry) → niente duplicati
        const existing = (await q(c, api.licenses.listBySession, "licenses.listBySession", { stripeSessionId: sessionId }, { stripeSessionId: sessionId })) as Array<unknown>;
        if (!existing || existing.length === 0) {
          const lines: Array<{ title: string; code: string }> = [];
          for (const item of items) {
            const product = PRODUCTS.find((p) => p.slug === item.slug);
            if (!product || product.licenseOnly) continue;
            const productId = await resolveProductId(c, item.slug);
            if (!productId) continue;
            const code = deterministicCode(sessionId, item.slug);
            await m(c, api.orders.create, "orders.create", { email }, {
              productId, email, amount: product.price,
              stripeSessionId: sessionId, stripeEventId: event.id,
              ...(userId ? { userId } : {}), status: "paid",
            });
            await m(c, api.licenses.create, "licenses.create", { code }, {
              code, productSlug: item.slug, email,
              ...(userId ? { userId } : {}), stripeSessionId: sessionId,
            });
            lines.push({ title: product.title, code });
          }
          if (lines.length > 0) {
            const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dbyoung.it";
            await sendMail({
              to: email,
              subject: "Il tuo ordine DBYoung è pronto",
              html: `<h1>Grazie per l'acquisto!</h1><ul>${lines
                .map((l) => `<li>${escapeHtml(l.title)} — codice <strong>${escapeHtml(l.code)}</strong></li>`)
                .join("")}</ul><p>Scarica da <a href="${escapeHtml(base)}/libreria">${escapeHtml(base)}/libreria</a> inserendo i codici.</p>`,
            });
          }
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
