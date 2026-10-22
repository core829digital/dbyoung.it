/**
 * Smoke-test dello storage Vercel Blob privato.
 * Uso: npx --yes tsx scripts/verify-blob.mts
 *
 * Verifica per ogni prodotto vendibile:
 *   1. URL presigned GET (~10 min) funziona: risposta 200/206 con byte reali.
 *   2. Lo stesso pathname SENZA firma è NEGATO (4xx): lo store è privato
 *      e nessun URL pubblico/indovinabile può scaricare i file.
 * Legge BLOB_READ_WRITE_TOKEN da .env.local (o da process.env).
 */
import { readFileSync } from "node:fs";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { PRODUCTS, BUNDLE_SLUG } from "../lib/data";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);
const token = process.env.BLOB_READ_WRITE_TOKEN?.trim() ?? env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN mancante.");
  process.exit(1);
}

let ok = 0;
let fail = 0;

for (const product of PRODUCTS) {
  if (product.licenseOnly || product.slug === BUNDLE_SLUG || product.price <= 0 || !product.file) continue;
  const pathname = product.type === "beat" ? `products/${product.slug}.wav` : `products/${product.slug}.zip`;

  const validUntil = Date.now() + 10 * 60 * 1000;
  const signed = await issueSignedToken({ pathname, operations: ["get"], validUntil, token });
  const { presignedUrl } = await presignUrl(
    { delegationToken: signed.delegationToken, clientSigningToken: signed.clientSigningToken },
    { operation: "get", pathname, access: "private", validUntil }
  );

  const rangeRes = await fetch(presignedUrl, { headers: { Range: "bytes=0-1023" } });
  const len = rangeRes.headers.get("content-range") ?? rangeRes.headers.get("content-length") ?? "?";
  const signedOk = rangeRes.status === 200 || rangeRes.status === 206;

  const basePath = new URL(presignedUrl);
  basePath.search = "";
  const unsigned = await fetch(basePath.toString());
  const unsignedDenied = unsigned.status >= 400;

  if (signedOk && unsignedDenied) {
    ok += 1;
    console.log(`✓ ${pathname} — firmato ${rangeRes.status} (${len}); non firmato ${unsigned.status} (negato)`);
  } else {
    fail += 1;
    console.error(`✖ ${pathname} — firmato ${rangeRes.status} | non firmato ${unsigned.status}`);
  }
}

console.log(`\nRISULTATO: ${ok} OK, ${fail} FALLITI`);
process.exit(fail > 0 ? 1 : 0);
