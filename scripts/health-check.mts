/**
 * Health check + security scan + verifica infrastruttura pagamenti di dbyoung.it
 * (SOLO sonde read-only di produzione: nessun pagamento, nessuna scrittura dati).
 * Uso: npx --yes tsx scripts/health-check.mts [https://www.dbyoung.it]
 */
import { readFileSync } from "node:fs";

const BASE = (process.argv[2] ?? "https://www.dbyoung.it").replace(/\/$/, "");
const results: Array<{ name: string; pass: boolean; detail: string }> = [];
const check = (name: string, pass: boolean, detail: string) =>
  results.push({ name, pass, detail });

async function probe(path: string, init?: RequestInit) {
  const res = await fetch(BASE + path, { redirect: "manual", ...init });
  return { res, text: await res.text().catch(() => "") };
}

const statusOf = (r: Response) => `${r.status} ${r.headers.get("location") ? `→ ${r.headers.get("location")}` : ""}`.trim();

/* ---------- 1. HEALTH CHECK: route pubbliche ---------- */
const pages = ["/", "/shop", "/artista", "/musica", "/libreria", "/opere", "/contatti", "/checkout", "/privacy", "/termini", "/gdpr", "/cookie"];
for (const p of pages) {
  const { res } = await probe(p);
  check(`GET ${p}`, res.status === 200, statusOf(res));
}

const { res: robots } = await probe("/robots.txt");
check("GET /robots.txt", robots.status === 200, statusOf(robots));
const { res: sitemap } = await probe("/sitemap.xml");
const sitemapText = await fetch(BASE + "/sitemap.xml").then((r) => r.text()).catch(() => "");
check("GET /sitemap.xml", sitemap.status === 200 && /<urlset|<loc>/i.test(sitemapText), statusOf(sitemap));

// apex → www (redirect)
try {
  const apex = new URL(BASE);
  apex.hostname = apex.hostname.replace(/^www\./, "");
  const r = await fetch(apex.toString(), { redirect: "manual" });
  check("Redirect apex → www", [301, 302, 308].includes(r.status) && (r.headers.get("location") ?? "").includes("www."), `${r.status} → ${r.headers.get("location")}`);
} catch (e) { check("Redirect apex → www", false, String(e).slice(0, 90)); }

// pagina inesistente → 404 pulita
{
  const { res } = await probe("/pagina-inesistente-xyz");
  check("404 su route inesistente", res.status === 404, statusOf(res));
}

/* ---------- 2. SECURITY SCAN ---------- */
// Header di sicurezza sulla homepage
{
  const { res, text } = await probe("/");
  const h = (n: string) => res.headers.get(n);
  check("CSP presente", !!h("content-security-policy"), (h("content-security-policy") ?? "MANCANTE").slice(0, 70));
  check("HSTS", (h("strict-transport-security") ?? "").includes("max-age"), h("strict-transport-security") ?? "MANCANTE");
  check("X-Content-Type-Options: nosniff", h("x-content-type-options") === "nosniff", h("x-content-type-options") ?? "MANCANTE");
  check("Referrer-Policy", !!h("referrer-policy"), h("referrer-policy") ?? "MANCANTE");
  const frame = h("x-frame-options") ?? (h("content-security-policy") ?? "").match(/frame-ancestors[^;]*/)?.[0] ?? "";
  check("Clickjacking (XFO/frame-ancestors)", frame.length > 0, frame || "MANCANTE");
  check("Permissions-Policy", !!h("permissions-policy"), (h("permissions-policy") ?? "MANCANTE").slice(0, 60));

  // Nessun segreto nell'HTML client
  const leaks = ["sk_live", "sk_test", "rk_live", "whsec", "BLOB_READ_WRITE", "TURNSTILE_SECRET", "ADMIN_ACTION_SECRET", "TOTP_ENCRYPTION"].filter((s) => text.includes(s));
  check("Nessun segreto nell'HTML", leaks.length === 0, leaks.length ? `LEAK: ${leaks.join(", ")}` : "pulito");
}

// Bundle JS caricate dalla shop: scan segreti
{
  const { text: shopHtml } = await probe("/shop");
  const chunks = [...shopHtml.matchAll(/\/_next\/static\/[^"']+\.js/g)].map((m) => m[0]);
  const uniq = [...new Set(chunks)].slice(0, 25);
  const bad: string[] = [];
  for (const c of uniq) {
    const { res, text } = await probe(c);
    if (res.status !== 200) continue;
    const fl = ["sk_live_", "sk_test_", "rk_live_", "whsec_", "BLOB_READ_WRITE", "TURNSTILE_SECRET", "ADMIN_ACTION_SECRET"].filter((s) => text.includes(s));
    if (fl.length) bad.push(`${c}: ${fl.join(",")}`);
  }
  check("Nessun segreto nel bundle JS", bad.length === 0, bad.length ? bad.join(" | ") : `${uniq.length} chunk puliti`);
}

// API sensibili senza credenziali
{
  const t = [
    ["GET /api/auth/me", await probe("/api/auth/me"), [401]],
    ["POST /api/checkout senza anti-bot", await probe("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }), [400, 403]],
    ["POST /api/stripe/webhook firma invalida", await probe("/api/stripe/webhook", { method: "POST", headers: { "Content-Type": "application/json", "stripe-signature": "t=1,v1=abc" }, body: "{}" }), [400]],
    ["POST /api/newsletter email non valida", await probe("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "email=bad" }), [400, 403]],
    ["POST /api/newsletter formato sbagliato (json)", await probe("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "a@b.it" }) }), [400]],
    ["GET /api/licenses/verify codice fasullo", await probe("/api/licenses/verify?code=DBY-0000-0000-0000"), [200, 400, 401, 403, 404, 429]],
    ["GET /api/download/[slug] senza licenza", await probe("/api/download/give-a-start", new Request(BASE + "/api/download/give-a-start")), [401, 403, 404]],
  ] as const;
  for (const [name, p, ok] of t as unknown as Array<[string, { res: Response; text: string }, number[]]>) {
    check(name, ok.includes(p.res.status), statusOf(p.res));
  }
  // verify con codice inventato: mai validità spuria
  {
    const v = await probe("/api/licenses/verify?code=DBY-0000-0000-0000");
    const okRes = v.res.status === 200 ? /"valid"\s*:\s*false/.test(v.text) : [400, 401, 403, 404, 429].includes(v.res.status);
    check("Codice licenza inventato rifiutato", okRes, `${statusOf(v.res)} body=${v.text.slice(0, 40)}`);
  }
}

// Path traversal sui download
{
  const cmds = ["../../package.json", "..%2F..%2Fpackage.json", "%2e%2e%2fsecret"];
  const ok = (await Promise.all(cmds.map((c) => probe(`/api/download/give-a-start?file=${c}`)))).every((p) => [400, 401, 403, 404].includes(p.res.status));
  check("Path traversal respinto su /api/download", ok, "sonde: " + cmds.join(" , "));
}

// Rate limit su /api/checkout (10 tentativi rapidi): attesi 400/403 e possibilmente 429
{
  const statuses: number[] = [];
  for (let i = 0; i < 10; i++) {
    const { res } = await probe("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    statuses.push(res.status);
  }
  const had429 = statuses.includes(429);
  const all = statuses.every((s) => [400, 403, 429].includes(s));
  check("Rate limit / anti-abuse checkout", all, had429 ? "429 presente ✓" : `10 richieste: ${[...new Set(statuses)].join(",")} (tutte respinte, senza 429 esplicito)`);
}

// Enumerazione licenze: vecchie sonde rimosse (coperta dal blocco verify sopra)

/* ---------- 3. INFRASTRUTTURA PAGAMENTI (read-only) ---------- */
{
  const { res, text } = await probe("/checkout/success");
  check("Pagina success esiste (senza dati)", res.status === 200, statusOf(res));
}
{
  const { res } = await probe("/checkout/cancel");
  check("Pagina cancel esiste", res.status === 200, statusOf(res));
}
// Il webhook rifiuta un evento sconosciuto ma ben formato (senza firma valida resterà 400)
{
  const { res } = await probe("/api/stripe/webhook", { method: "POST", headers: { "Content-Type": "application/json", "stripe-signature": "t=1700000000,v1=pippo" }, body: JSON.stringify({ id: "evt_x", type: "checkout.session.completed", data: { object: {} } }) });
  check("Webhook: firma richiesta", res.status === 400, statusOf(res));
}

/* ---------- Output ---------- */
const fail = results.filter((r) => !r.pass);
console.log(`\n=== HEALTH / SECURITY / PAGAMENTI — ${BASE} ===`);
for (const r of results) console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}  ·  ${r.detail}`);
console.log(`\nRisultato: ${results.length - fail.length}/${results.length} OK`);
if (fail.length) { console.log("FALLITI:"); for (const f of fail) console.log(`  - ${f.name}: ${f.detail}`); process.exitCode = 1; }
