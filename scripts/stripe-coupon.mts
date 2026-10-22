/**
 * Crea (idempotente) il coupon "natale-30-2026" su Stripe (live o test in base a STRIPE_SECRET_KEY)
 * e valida una Checkout Session reale con discount, senza pagamento: session creata + subito
 * scaduta (expire) per non lasciare fondi impantanati. Stampa l'esito.
 *
 * Uso: npx --yes tsx scripts/stripe-coupon.mts
 */
import { readFileSync } from "node:fs";

// --- env minimale da .env.local (senza dipendenze) ---
try {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
  }
} catch { /* env già presenti */ }

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) { console.error("STRIPE_SECRET_KEY mancante"); process.exit(1); }
const LIVE = KEY.startsWith("sk_live_");
console.log(`Modalità: ${LIVE ? "LIVE ⚠️" : "TEST"}`);

const REDEEM_BY = Math.floor(Date.parse("2027-01-05T23:59:59+02:00") / 1000);
console.log(`redeem_by epoch: ${REDEEM_BY} (${new Date(REDEEM_BY * 1000).toISOString()})`);

const form = (obj: Record<string, string>) => new URLSearchParams(obj).toString();

async function stripeCall(ep: string, method: string, body?: string) {
  const res = await fetch(`https://api.stripe.com/v1/${ep}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as { error?: { message: string; code?: string }; id?: string }; // NOSONAR: risposta Stripe
  if (!res.ok) throw new Error(`Stripe ${ep}: ${res.status} ${json.error?.message ?? JSON.stringify(json).slice(0, 200)}`);
  return json;
}

// 1. Coupon idempotente: GET; se assente, POST una volta sola
const COUPON = "natale-30-2026";
try {
  const c = await stripeCall(`coupons/${COUPON}`, "GET") as { id: string; percent_off: number; redeem_by: number | null; max_redemptions: number | null };
  console.log(`Coupon esistente: ${c.id} ${c.percent_off}% redeem_by=${c.redeem_by} max_redemptions=${c.max_redemptions}`);
} catch {
  const c = await stripeCall("coupons", "POST", form({
    id: COUPON,
    percent_off: "30",
    duration: "once",
    redeem_by: String(REDEEM_BY),
    max_redemptions: "500",
    "metadata[project]": "dbyoung.it",
  })) as { id: string; redeem_by: number; max_redemptions: number };
  console.log(`Coupon CREATO: ${c.id} 30% redeem_by=${c.redeem_by} max_redemptions=${c.max_redemptions}`);
}

// 2. Prova session checkout reale con discount (senza pagamento)
const price = process.env.STRIPE_PRICE_GIVE_A_START;
if (!price) { console.log("Nessun prezzo singolo in env, salto la prova sessione"); process.exit(0); }
const origin = LIVE ? "https://www.dbyoung.it" : "http://localhost:3000";
const sess = (await stripeCall("checkout/sessions", "POST", form({
  mode: "payment",
  "line_items[0][price]": price,
  "line_items[0][quantity]": "1",
  "discounts[0][coupon]": COUPON,
  success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/checkout/cancel`,
  // sessione senza dati cliente: scaduta subito dopo
}))) as { id: string; total_details?: { amount_discount: number }; amount_total: number; currency: string };
console.log(`Session ${sess.id} creata: totale ${(sess.amount_total / 100).toFixed(2)} ${sess.currency} sconto ${((sess.total_details?.amount_discount ?? 0) / 100).toFixed(2)}`);

// 3. Scadenza immediata (nessun effetto a valle)
await stripeCall(`checkout/sessions/${sess.id}/expire`, "POST", "");
console.log(`Session ${sess.id} scaduta: nessun impatto.`);
console.log("\nCoupon live valido per la finestra 23 dic → 5 gen (fino a 500 usi).");
