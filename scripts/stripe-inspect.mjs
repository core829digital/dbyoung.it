/** Diagnostica Stripe live: account, webhook, prodotti esistenti. Nessuna scrittura. */
const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) {
  console.error("STRIPE_SECRET_KEY mancante");
  process.exit(1);
}

async function api(path) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const body = await res.json();
  if (!res.ok) {
    console.error(`ERRORE ${path}:`, res.status, body.error?.message ?? body);
    return null;
  }
  return body;
}

const account = await api("account");
if (account) {
  console.log("ACCOUNT:", account.id, "|", account.settings?.dashboard?.display_name ?? account.business_profile?.name ?? "(no nome)", "| charges:", account.charges_enabled, "| payouts:", account.payouts_enabled, "| country:", account.country);
}

const hooks = await api("webhook_endpoints?limit=100");
if (hooks) {
  console.log(`\nWEBHOOK (${hooks.data.length}):`);
  for (const h of hooks.data) console.log(`- ${h.id} | ${h.url} | ${h.status} | ${h.enabled_events.join(",")}`);
}

const products = await api("products?limit=100&active=true");
if (products) {
  console.log(`\nPRODOTTI ATTIVI (${products.data.length}):`);
  for (const p of products.data) {
    const prices = await api(`prices?product=${p.id}&limit=20&active=true`);
    const list = prices?.data?.map((x) => `${x.id}=${(x.unit_amount ?? 0) / 100}${x.currency.toUpperCase()}${x.recurring ? "/" + x.recurring.interval : ""}`).join(", ") ?? "?";
    console.log(`- ${p.id} | ${p.name} | ${p.metadata?.project ?? p.metadata?.app ?? "(no project)"} | ${list}`);
  }
}
