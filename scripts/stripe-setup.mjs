/**
 * Setup catalogo Stripe live per dbyoung.it — idempotente.
 * - Prodotti/Price marcati metadata project=dbyoung.it (non tocca l'altro progetto)
 * - lookup_key stabili per ritrovare i Price senza duplicati
 * - Crea il webhook https://www.dbyoung.it/api/stripe/webhook se assente
 * Uso: STRIPE_SECRET_KEY=rk_live_... node scripts/stripe-setup.mjs
 */
const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) {
  console.error("STRIPE_SECRET_KEY mancante");
  process.exit(1);
}

const PROJECT = "dbyoung.it";

const CATALOG = [
  { slug: "give-a-start", name: "DBYoung — Give a Start (Beat)", desc: "Beat originale prod. D.B Young · WAV · 150 €", amount: 15000, type: "beat" },
  { slug: "sacred-voices", name: "DBYoung — Sacred Voices (Beat)", desc: "Beat originale con voci prod. D.B Young · WAV · 120 €", amount: 12000, type: "beat" },
  { slug: "velvet-tape-neo-soul-chillhop", name: "DBYoung — Velvet & Tape (Sample Pack)", desc: "Neo-Soul & Chillhop Melodies · 110 BPM E minor · WAV + stems · 25 €", amount: 2500, type: "sample-pack" },
  { slug: "melancholic-neo-soul-piano", name: "DBYoung — Melancholic Neo-Soul Piano (Sample Pack)", desc: "Neo-Soul Piano & Ambient Soundscape · 101 BPM Ab Major · WAV + stems · 30 €", amount: 3000, type: "sample-pack" },
  { slug: "opera-cinematic-orchestral-trap", name: "DBYoung — Opera Cinematic (Sample Pack)", desc: "Orchestral Trap · 73 BPM G minor · WAV + stems · 27 €", amount: 2700, type: "sample-pack" },
  { slug: "velvet-nostalgia-cinematic", name: "DBYoung — Velvet Nostalgia (Sample Pack)", desc: "Cinematic / Emotional · 100 BPM D minor · WAV + stems · 35 €", amount: 3500, type: "sample-pack" },
  { slug: "bundle-completo", name: "DBYoung — Bundle completo Sample Packs", desc: "Tutti i sample pack DBYoung (4 pack, melodie + stems separati) · 95 €", amount: 9500, type: "offerta" },
  { slug: "produzione-personalizzata-acconto", name: "DBYoung — Produzione personalizzata (acconto)", desc: "Acconto per produzione su misura: composizione/beat personalizzato · da 350 €", amount: 35000, type: "custom" },
];

const HOOK_URL = "https://www.dbyoung.it/api/stripe/webhook";
const HOOK_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.expired",
  "payment_intent.succeeded",
  "charge.refunded",
];

async function api(path, method = "GET", form) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`${method} ${path}: ${res.status} ${body.error?.message ?? JSON.stringify(body)}`);
  return body;
}

const priceEnv = {};

// 1) Prodotti + prezzi
const existingProducts = (await api("products?limit=100&active=true")).data;
for (const item of CATALOG) {
  let product = existingProducts.find((p) => p.metadata?.project === PROJECT && p.metadata?.slug === item.slug);
  if (!product) {
    product = await api("products", "POST", {
      name: item.name,
      description: item.desc,
      "metadata[project]": PROJECT,
      "metadata[slug]": item.slug,
      "metadata[type]": item.type,
    });
    console.log(`+ prodotto ${item.slug} → ${product.id}`);
  } else {
    console.log(`= prodotto ${item.slug} → ${product.id}`);
  }

  const prices = (await api(`prices?product=${product.id}&active=true&limit=20`)).data;
  let price = prices.find((p) => p.currency === "eur" && p.unit_amount === item.amount && p.type === "one_time");
  if (!price) {
    price = await api("prices", "POST", {
      product: product.id,
      currency: "eur",
      unit_amount: String(item.amount),
      "metadata[project]": PROJECT,
      "metadata[slug]": item.slug,
      lookup_key: `dbyoung_${item.slug.replace(/-/g, "_")}`,
      nickname: item.name.replace("DBYoung — ", ""),
    });
    console.log(`  + prezzo ${price.id} = ${item.amount / 100} EUR`);
  } else {
    console.log(`  = prezzo ${price.id} = ${item.amount / 100} EUR`);
  }

  const envKey = `STRIPE_PRICE_${item.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
  priceEnv[envKey] = price.id;
}

// 2) Webhook dedicato
const hooks = (await api("webhook_endpoints?limit=100")).data;
let hook = hooks.find((h) => h.url === HOOK_URL);
let webhookSecret = null;
if (!hook) {
  const created = await api("webhook_endpoints", "POST", {
    url: HOOK_URL,
    description: "DBYoung — ordini digitali (checkout + refund)",
    "metadata[project]": PROJECT,
    ...Object.fromEntries(HOOK_EVENTS.map((e, i) => [`enabled_events[${i}]`, e])),
  });
  hook = created;
  webhookSecret = created.secret;
  console.log(`+ webhook ${hook.id} → ${HOOK_URL}`);
} else {
  console.log(`= webhook ${hook.id} → ${HOOK_URL} (segretö già esistente, non rigenerabile via API)`);
}

console.log("\n--- ENV ---");
for (const [k, v] of Object.entries(priceEnv)) console.log(`${k}=${v}`);
if (webhookSecret) console.log(`STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
console.log(`\nTotale prodotti catalogo: ${CATALOG.length}`);
