/**
 * Test end-to-end del webhook Stripe in locale (senza pagamento reale).
 * Firma un evento checkout.session.completed con il vero STRIPE_WEBHOOK_SECRET
 * e lo invia a http://localhost:3100/api/stripe/webhook.
 *
 * Uso: node scripts/test-webhook.mjs [sessionId]
 * Richiede `npx next dev -p 3100` attivo e .env.local configurato.
 */
import { createHash, createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

const sessionId = process.argv[2] ?? `cs_live_test_${randomBytes(6).toString("hex")}`;
const email = "contact.core829@gmail.com";
const secret = env.STRIPE_WEBHOOK_SECRET;
if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET mancante in .env.local");

const event = {
  id: `evt_test_${randomBytes(6).toString("hex")}`,
  object: "event",
  type: "checkout.session.completed",
  data: {
    object: {
      id: sessionId,
      object: "checkout.session",
      payment_status: "paid",
      created: Math.floor(Date.now() / 1000),
      customer_details: { email },
      metadata: {
        project: "dbyoung.it",
        email,
        userId: "",
        items: JSON.stringify([
          { slug: "give-a-start", tier: "base" },
          { slug: "bundle-completo", tier: "base" },
        ]),
      },
    },
  },
};

const body = JSON.stringify(event);
const t = Math.floor(Date.now() / 1000);
const sig = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");

const res = await fetch("http://localhost:3100/api/stripe/webhook", {
  method: "POST",
  headers: { "content-type": "application/json", "stripe-signature": `t=${t},v1=${sig}` },
  body,
});
console.log("WEBHOOK:", res.status, await res.text());

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const codeFor = (slug) => {
  const digest = createHash("sha256").update(`${sessionId}:${slug}`).digest();
  const pick = (off) => Array.from(digest.slice(off, off + 4), (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `DBY-${pick(0)}-${pick(4)}`;
};

console.log("SESSION:", sessionId);
const testSlugs = [
  "give-a-start",
  "velvet-tape-neo-soul-chillhop",
  "melancholic-neo-soul-piano",
  "opera-cinematic-orchestral-trap",
  "velvet-nostalgia-cinematic",
];
for (const slug of testSlugs) {
  const code = codeFor(slug);
  const r = await fetch(`${env.NEXT_PUBLIC_CONVEX_URL}/api/query`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: "licenses:getByCode", args: { code }, format: "json" }),
  });
  console.log(`LICENZA ${code} (${slug}):`, await r.text());
}
