import Stripe from "stripe";
import { ok, fail } from "@/lib/mail";
import { checkoutSchema, zodErrors } from "@/lib/validation";
import { sanitizeEmail } from "@/lib/sanitize";
import { verifyTurnstile } from "@/lib/turnstile";
import { clientIpFromHeaders } from "@/lib/ipAllowlist";
import { rateLimit, limitKey, maybeCleanupRateLimits } from "@/lib/rateLimit";
import { getSessionUser } from "@/lib/serverConvex";
import { readSessionToken } from "@/lib/session";
import { priceIdForSlug } from "@/lib/stripe";
import { PRODUCTS, HOLIDAY_PROMO, isHolidayPromoActive } from "@/lib/data";

/**
 * Crea una Checkout Session Stripe.
 * Prezzi e prodotti risolti SOLO dal catalogo server (lib/data.ts + Price ID env):
 * il client invia solo slug+tier, mai importi.
 */
export async function POST(req: Request) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(limitKey(ip, "checkout"), 10, 60_000);
    if (!rl.allowed) return fail("Troppe richieste, riprova tra poco.", 429);

    const parsed = checkoutSchema.safeParse((await req.json()) as Record<string, unknown>);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const t = await verifyTurnstile(String(parsed.data.turnstile), ip);
    if (!t.ok) return fail("Verifica anti-bot fallita, riprova.", 403);

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return fail("Pagamenti non configurati.", 503);
    const stripe = new Stripe(secret);

    const email = sanitizeEmail(parsed.data.email);
    const user = await getSessionUser(await readSessionToken());

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const metaItems: Array<{ slug: string; tier: string }> = [];
    for (const item of parsed.data.items) {
      const product = PRODUCTS.find((p) => p.slug === item.slug);
      if (!product || product.licenseOnly || product.price <= 0) {
        return fail(`"${item.slug}" disponibile solo con licenza su misura (contattaci).`, 400);
      }
      const priceId = priceIdForSlug(item.slug);
      if (!priceId) return fail(`Prodotto "${item.slug}" non configurato per il checkout.`, 503);
      line_items.push({ price: priceId, quantity: 1 });
      metaItems.push({ slug: item.slug, tier: item.tier });
    }

    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dbyoung.it";
    // Promo Natale: sconto -30% applicato SOLO dentro la finestra decisa server-side.
    // Il coupon è attivo su Stripe ma non è usabile dal client furbo:
    // nessun `allow_promotion_codes`, solo questa decisione centralizzata.
    const discounts = isHolidayPromoActive()
      ? [{ coupon: (await ensureHolidayCoupon(stripe)).id }]
      : undefined;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      locale: "it",
      billing_address_collection: "required",
      line_items,
      ...(discounts ? { discounts } : {}),
      metadata: {
        project: "dbyoung.it",
        email,
        userId: user?.id ?? "",
        items: JSON.stringify(metaItems),
      },
      payment_intent_data: {
        receipt_email: email,
        metadata: { project: "dbyoung.it", email },
      },
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: "DBYoung — licenza digitale (beat / sample pack)",
          footer: "Dimitri Boutourline (D.B Young) — www.dbyoung.it",
          metadata: { project: "dbyoung.it", email },
        },
      },
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancel`,
    });

    // I diritti vengono conferiti SOLO dal webhook firmato (mai da questa risposta)
    return ok({ url: session.url });
  } catch (e) {
    console.error("[checkout] errore creazione sessione:", e);
    return fail("Checkout non riuscito, riprova.", 500);
  }
}

/** Creazione idempotente del coupon promo: id fisso + finestra di sicurezza. */
async function ensureHolidayCoupon(stripe: Stripe): Promise<Stripe.Coupon> {
  const existing = await stripe.coupons.retrieve(HOLIDAY_PROMO.couponId).catch(() => null);
  if (existing) return existing;
  return stripe.coupons.create({
    id: HOLIDAY_PROMO.couponId,
    name: `${HOLIDAY_PROMO.couponName} (${HOLIDAY_PROMO.percentOff}%)`,
    percent_off: HOLIDAY_PROMO.percentOff,
    duration: "once",
    redeem_by: Math.floor(new Date(HOLIDAY_PROMO.endISO).getTime() / 1000),
    max_redemptions: 500,
    metadata: { project: "dbyoung.it", promo: "natale-2026" },
  });
}
