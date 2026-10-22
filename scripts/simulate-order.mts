/**
 * SIMULAZIONE reale del caso d'uso "cliente paga e riceve il prodotto digitale",
 * senza pagamento: 
 *  1) crea una Checkout Session VERA su Stripe LIVE (stessi parametri della route);
 *  2) costruisce l'evento `checkout.session.completed` con payment_status=paid
 *     (esattamente l'evento che Stripe manda dopo un pagamento reale);
 *  3) firma con STRIPE_WEBHOOK_SECRET e lo POSTA al webhook di produzione;
 *  4) verifica: licenza emessa (deterministica) → verify → download presigned.
 *
 * Non paga nulla, non salva token di carta: il completo scaduto viene lasciato
 * senza payment (expire al cleanup). Uso: npx --yes tsx scripts/simulate-order.mts
 */
import { readFileSync } from "node:fs";
import crypto from "node:crypto";

try {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
  }
} catch { /* già presenti */ }

const KEY = process.env.STRIPE_SECRET_KEY!;
const WHSEC = process.env.STRIPE_WEBHOOK_SECRET!;
const WEBHOOK_URL = "https://www.dbyoung.it/api/stripe/webhook";
const PRICE = process.env.STRIPE_PRICE_GIVE_A_START!;
const EMAIL = (process.argv[2] ?? "contact.core829@gmail.com").toLowerCase();
const SLUG = "give-a-start";
const origem = "https://www.dbyoung.it";

const form = (o: Record<string, string>) => new URLSearchParams(o).toString();

// ---------- 1. Checkout session REALE (LIVE), non pagata ----------
const create = await fetch("https://api.stripe.com/v1/checkout/sessions", {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
  body: form({
    mode: "payment",
    customer_email: EMAIL,
    locale: "it",
    billing_address_collection: "required",
    "line_items[0][price]": PRICE,
    "line_items[0][quantity]": "1",
    "metadata[project]": "dbyoung.it",
    "metadata[email]": EMAIL,
    "metadata[items]": JSON.stringify([{ slug: SLUG, tier: "base" }]),
    success_url: `${origem}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origem}/checkout/cancel`,
  }),
});
const session = (await create.json()) as {
  id: string; amount_total: number; currency: string; created: number; payment_status?: string;
};
if (!create.ok || !session.id) { console.error("Creazione sessione fallita:", JSON.stringify(session).slice(0, 300)); process.exit(1); }
console.log(`1. Session creata: ${session.id}  €${(session.amount_total / 100).toFixed(2)} ${session.currency}`);

// Codice licenza DETERMINISTICO = identico a quello del webhook (sha256 sessionId:slug)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const digest = crypto.createHash("sha256").update(`${session.id}:${SLUG}`).digest();
const pick = (off: number) => Array.from(digest.slice(off, off + 4), (b) => ALPHABET[b % ALPHABET.length]).join("");
const expectedCode = `DBY-${pick(0)}-${pick(4)}`;
console.log(`2. Codice licenza atteso (deterministico): ${expectedCode}`);

// ---------- 2. Evento "checkout.session.completed" con pagamento riuscito ----------
const paidSession = {
  ...session,
  payment_status: "paid",
  status: "complete",
  payment_intent: `pi_sim_${crypto.randomBytes(10).toString("hex")}`,
  customer_details: { email: EMAIL, address: null },
  customer_email: EMAIL,
};
const event = {
  id: `evt_sim_${crypto.randomBytes(12).toString("hex")}`,
  object: "event",
  api_version: "2025-12-30.preview",
  created: Math.floor(Date.now() / 1000),
  data: { object: paidSession },
  livemode: true,
  pending_webhooks: 1,
  request: { id: null, idempotency_key: null },
  type: "checkout.session.completed",
};
const payload = JSON.stringify(event);
const t = Math.floor(Date.now() / 1000);
const sig = crypto.createHmac("sha256", WHSEC).update(`${t}.${payload}`).digest("hex");
const stripeSignature = `t=${t},v1=${sig}`;

const wh = await fetch(WEBHOOK_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json", "stripe-signature": stripeSignature },
  body: payload,
});
const whBody = await wh.text();
console.log(`3. Webhook produzione → ${wh.status} ${whBody.slice(0, 120)}`);
if (!wh.ok) {
  // Deterministico = il codice resta valido per il retry: non disperdere nulla.
  console.error("Webhook KO. Attendi un attento e ri-prova con lo stesso script (l'id evento cambia: genera un altro evt_sim_).");
  process.exit(1);
}

// ---------- 4. Verifica il ciclo completo: verify + download ----------
const verify = await fetch(`${origem}/api/licenses/verify?code=${expectedCode}`);
const verifyBody = await verify.json() as { valid?: boolean; product?: { slug?: string; title?: string } };
console.log(`4a. verify licenza → ${verify.status} ${JSON.stringify(verifyBody).slice(0, 160)}`);

const dl = await fetch(`${origem}/api/download/${SLUG}?license=${expectedCode}`, { redirect: "manual" });
const location = dl.headers.get("location") ?? "";
console.log(`4b. download (302→Blob) → ${dl.status} location=${location ? location.slice(0, 90) + (location.length > 90 ? "…" : "") : "(niente)"}`);
const size = dl.status === 200 ? Number(dl.headers.get("content-length")) : 0;
const encodedSize = location ? await fetch(location, { method: "HEAD" }).then((x => ({ st: x.status, len: Number(x.headers.get("content-length")) }))).catch(() => ({ st: 0, len: 0 })) : { st: 0, len: 0 };
console.log(`4c. presigned blob → ${encodedSize.st}, bytes ${encodedSize.len}`);

console.log(`\nEMAIL di consegna: ${EMAIL} (oggetto "Il tuo ordine DBYoung è pronto", allegato PDF licenza).`);
console.log(`SESSION: ${session.id} — lasciamola scadere (mai pagata).`);
console.log(expectedCode === "" ? "" : `LICENZA ATTIVA per la tua prova: ${expectedCode}`);
