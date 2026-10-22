/**
 * Reproduces EXACTLY the Stripe call of app/api/checkout/route.ts (without turnstile)
 * to isolate 500 errors client-side / via Stripe instead of via Vercel logs.
 * Uso: npx --yes tsx scripts/debug-checkout.mts [email@fittizia.example]
 */
import { readFileSync } from "node:fs";

try {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
  }
} catch { /* già presenti */ }

const KEY = process.env.STRIPE_SECRET_KEY;
const price = process.env.STRIPE_PRICE_GIVE_A_START!;
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dbyoung.it";
const email = process.argv[2] ?? "test.core829@gmail.com";

const body = new URLSearchParams({
  mode: "payment",
  customer_email: email,
  locale: "it",
  billing_address_collection: "required",
  "line_items[0][price]": price,
  "line_items[0][quantity]": "1",
  "metadata[project]": "dbyoung.it",
  "metadata[email]": email,
  "metadata[userId]": "",
  "metadata[items]": JSON.stringify([{ slug: "give-a-start", tier: "base" }]),
  "payment_intent_data[receipt_email]": email,
  "payment_intent_data[metadata][project]": "dbyoung.it",
  "payment_intent_data[metadata][email]": email,
  "invoice_creation[enabled]": "true",
  "invoice_creation[invoice_data][description]": "DBYoung — licenza digitale (beat / sample pack)",
  "invoice_creation[invoice_data][footer]": "Dimitri Boutourline (D.B Young) — www.dbyoung.it",
  "invoice_creation[invoice_data][metadata][project]": "dbyoung.it",
  "invoice_creation[invoice_data][metadata][email]": email,
  success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${base}/checkout/cancel`,
});

const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
  body,
});
const json = (await res.json()) as unknown;
if (!res.ok) {
  console.log("STRIPE RIFIUTA:", res.status);
  console.log(JSON.stringify(json, null, 2).slice(0, 1500));
} else {
  const j = json as { id: string; url: string };
  console.log("OK:", j.id);
  console.log("URL checkout:", j.url);
  // scade subito la sessione di debug
  await fetch(`https://api.stripe.com/v1/checkout/sessions/${j.id}/expire`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}` },
  });
  console.log("Sessione di debug scaduta subito.");
}
