/**
 * Carica i file vendibili su Vercel Blob (store PRIVATO) e stampa le env BLOB_PATH_*.
 * - Beat → file singolo
 * - Sample pack → ZIP creato al volo (livello 1)
 * - Bundle → NON caricato: emette 4 licenze separate per i 4 pack
 *
 * Uso:
 *   1. Creare un Blob store su Vercel (Basta “Create” — private è la scelta giusta)
 *      e mettere BLOB_READ_WRITE_TOKEN in .env.local
 *   2. npx --yes tsx scripts/upload-blob.mts
 *
 * Il token NON viene mai stampato. I pathname generati vanno in `.env.blob.local`
 * (gitignored) ma sono anche calcolabili lato server: le env servono solo come
 * override esplicito.
 */
import { createReadStream, createWriteStream, promises as fsp, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { ZipArchive } from "archiver";
import { put } from "@vercel/blob";
import { PRODUCTS, BUNDLE_SLUG } from "../lib/data";

function loadEnv(): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(".env.local", "utf8")
        .split(/\r?\n/)
        .filter((l) => /^[A-Z0-9_]+=/.test(l))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i), l.slice(i + 1)];
        })
    );
  } catch {
    return {};
  }
}

const env = loadEnv();
const token = process.env.BLOB_READ_WRITE_TOKEN ?? env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN mancante: crea un Blob store su Vercel e aggiungilo a .env.local.");
  process.exit(1);
}

async function zipDir(src: string, out: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(out);
    const archive = new ZipArchive({ zlib: { level: 1 } });
    output.on("close", () => resolve());
    output.on("error", reject);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(src, false);
    void archive.finalize();
  });
}

const urls: Record<string, string> = {};

for (const product of PRODUCTS) {
  if (product.licenseOnly || product.price <= 0 || !product.file) continue;
  // Il bundle è venduto come 4 licenze separate: nessun file unico da caricare.
  if (product.slug === BUNDLE_SLUG) continue;

  const src = path.join(process.cwd(), "private_audio", product.file);
  const stat = await fsp.stat(src).catch(() => null);
  if (!stat) {
    console.warn(`skip ${product.slug}: file locale non trovato`);
    continue;
  }

  let uploadPath = src;
  let key: string;
  let contentType: string;

  if (stat.isDirectory()) {
    uploadPath = path.join(os.tmpdir(), `dbyoung-${product.slug}.zip`);
    await zipDir(src, uploadPath);
    key = `products/${product.slug}.zip`;
    contentType = "application/zip";
  } else {
    const ext = path.extname(src).toLowerCase();
    key = `products/${product.slug}${ext || ".bin"}`;
    contentType = ext === ".wav" ? "audio/wav" : ext === ".mp3" ? "audio/mpeg" : "application/octet-stream";
  }

  const size = (await fsp.stat(uploadPath)).size;
  console.log(`↑ ${product.slug} — ${(size / 1024 / 1024).toFixed(1)} MB`);
  const blob = await put(key, createReadStream(uploadPath), {
    access: "private",
    token,
    addRandomSuffix: false,
    allowOverwrite: true,
    multipart: size > 100 * 1024 * 1024,
    contentType,
  });
  console.log(`✓ ${blob.pathname}`);
  urls[product.slug] = blob.pathname;

  if (uploadPath !== src) await fsp.unlink(uploadPath).catch(() => undefined);
}

const envLines = Object.entries(urls).map(
  ([slug, pathname]) => `BLOB_PATH_${slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}=${pathname}`
);
writeFileSync(".env.blob.local", `${envLines.join("\n")}\n`);
console.log("\n--- BLOB_PATH (opzionali: il server le calcola da solo) ---");
for (const line of envLines) console.log(line);
