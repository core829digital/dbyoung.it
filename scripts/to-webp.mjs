/**
 * Converte i PNG di public/dimitri-potos in WebP con nomi slug.
 * Uso: node scripts/to-webp.mjs (richiede `sharp` nelle devDependencies)
 * Sicuro da rieseguire: salta i file già convertiti.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "dimitri-potos");

const JOBS = [
  { from: "ChatGPT Image 28 ago 2026, 17_03_29.png", to: "dbyoung-hero-profile.webp", width: 800 },
  { from: "ChatGPT Image 28 ago 2026, 16_32_34.png", to: "dbyoung-home-artist.webp", width: 1200 },
  { from: "ChatGPT Image 28 ago 2026, 17_28_57.png", to: "dbyoung-artist-portrait.webp", width: 1200 },
  { from: "ChatGPT Image 28 ago 2026, 17_15_42.png", to: "dbyoung-events-mood.webp", width: 1600 },
  { from: "ChatGPT Image 28 ago 2026, 16_44_51.png", to: "dbyoung-gallery-1.webp", width: 1200 },
  { from: "ChatGPT Image 28 ago 2026, 16_53_22.png", to: "dbyoung-gallery-2.webp", width: 1200 },
  { from: "ChatGPT Image 28 ago 2026, 17_07_52.png", to: "dbyoung-gallery-3.webp", width: 1200 },
  { from: "dbyoung-sample-packs-compositions-artwork.png", to: "artwork-sample-packs.webp", width: 1200 },
];

const DELETE = [
  "ChatGPT Image 28 ago 2026, 16_32_34.png",
  "ChatGPT Image 28 ago 2026, 16_44_51.png",
  "ChatGPT Image 28 ago 2026, 16_53_22.png",
  "ChatGPT Image 28 ago 2026, 17_03_29.png",
  "ChatGPT Image 28 ago 2026, 17_07_52.png",
  "ChatGPT Image 28 ago 2026, 17_15_42.png",
  "ChatGPT Image 28 ago 2026, 17_28_57.png",
  "DBYOUNG LOGO.png",
  "DBYOUNG LOGO.webp",
  "DBYOUNG LOGO trasparent webp.webp",
  "dbyoung-sample-packs-compositions-artwork.png",
  "onespec trasparente.png",
  "professional_billiard_header_banner (1).png",
];

const exists = async (p) => !!(await fs.stat(p).catch(() => null));

for (const job of JOBS) {
  const src = path.join(dir, job.from);
  const dst = path.join(dir, job.to);
  if (!(await exists(src))) {
    console.log(`skip (sorgente assente): ${job.from}`);
    continue;
  }
  await sharp(src).resize({ width: job.width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(dst);
  const { size } = await fs.stat(dst);
  console.log(`ok: ${job.to} (${Math.round(size / 1024)} KB)`);
}

// Logo: copia il webp esistente col nuovo nome (se non già fatto)
const logoSrc = path.join(dir, "DBYOUNG LOGO trasparent webp.webp");
const logoDst = path.join(dir, "dbyoung-logo.webp");
if (!(await exists(logoDst)) && (await exists(logoSrc))) {
  await fs.copyFile(logoSrc, logoDst);
  console.log("ok: dbyoung-logo.webp");
}

for (const name of DELETE) {
  const p = path.join(dir, name);
  if (await exists(p)) {
    await fs.unlink(p);
    console.log(`del: ${name}`);
  }
}

const rest = await fs.readdir(dir);
console.log(`\nfile rimasti (${rest.length}):`, rest.join(", "));
