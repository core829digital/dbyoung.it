import { NextResponse } from "next/server";
import { createReadStream, promises as fsp } from "fs";
import { Readable } from "stream";
import path from "path";
import { ZipArchive } from "archiver";
import { PRODUCTS } from "@/lib/data";
import { cloudVerifyLicense } from "@/lib/backend";
import { blobUrlForSlug } from "@/lib/blobStorage";

export const runtime = "nodejs";

/**
 * Download protetto dei file originali.
 * - Solo con licenza valida e attiva per quello slug (verifica su Convex)
 * - I file vivono in private_audio/ (mai nel web root, mai deployati su Vercel)
 * - Cartelle (sample pack) → ZIP generato al volo · File singoli → stream diretto
 * - Throttle base anti-abuso + header no-store
 * - Con Stripe: il webhook ordini emetterà licenze qui verificate (stesso flusso)
 */

const WINDOW_MS = 60_000;
const MAX_REQ = 20;
const hits = new Map<string, { n: number; t: number }>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > WINDOW_MS) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  h.n += 1;
  return h.n > MAX_REQ;
}

const safeName = (s: string) => s.replace(/[^a-zA-Z0-9._-]+/g, "_");

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (throttled(ip)) return NextResponse.json({ error: "Troppe richieste, riprova tra un minuto." }, { status: 429 });

  const code = new URL(req.url).searchParams.get("license") ?? "";
  if (!code.trim()) return NextResponse.json({ error: "Licenza richiesta." }, { status: 401 });

  // 1. Verifica licenza (solo codici attivi, solo per questo prodotto)
  const lic = await cloudVerifyLicense(code);
  if (!lic || lic.productSlug !== slug) {
    return NextResponse.json({ error: "Licenza non valida per questo prodotto." }, { status: 403 });
  }

  // 2. Risolvi prodotto e percorso privato (path traversal impossibile)
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product || !product.file) {
    return NextResponse.json({ error: "File non disponibile per questo prodotto." }, { status: 404 });
  }

  // 2a. Produzione: redirect al blob firmato/non indicizzato (niente streaming Vercel).
  const blob = blobUrlForSlug(slug);
  if (blob) {
    const url = new URL(blob);
    // Forza il download invece dell'apertura inline (WAV/ZIP).
    url.searchParams.set("download", "1");
    return new Response(null, {
      status: 302,
      headers: { Location: url.toString(), "Cache-Control": "no-store" },
    });
  }

  // 2b. Sviluppo locale: file in private_audio/ (path traversal impossibile)
  const base = path.join(process.cwd(), "private_audio");
  const target = path.normalize(path.join(base, product.file));
  if (!target.startsWith(base)) {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 403 });
  }

  let stat;
  try {
    stat = await fsp.stat(target);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException)?.code;
    // Su hosting senza i file (es. Vercel): il fulfillment avverrà dallo storage dedicato
    if (code === "ENOENT") {
      return NextResponse.json(
        { error: "Download non disponibile su questo nodo — contatta info@dbyoung.it con il tuo codice licenza." },
        { status: 410 }
      );
    }
    return NextResponse.json({ error: "Errore interno del download." }, { status: 500 });
  }

  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });

  // 3a. Cartella (sample pack) → ZIP generato in streaming
  if (stat.isDirectory()) {
    // WAV/MP3 sono già poco comprimibili: livello 1 = ZIP molto più veloce.
    const archive = new ZipArchive({ zlib: { level: 1 } });
    archive.on("error", () => undefined);
    archive.directory(target, product.slug);
    void archive.finalize();
    headers.set("Content-Type", "application/zip");
    headers.set("Content-Disposition", `attachment; filename="${safeName(product.slug)}.zip"`);
    return new Response(Readable.toWeb(archive) as ReadableStream, { headers });
  }

  // 3b. File singolo → stream diretto
  const ext = path.extname(target).toLowerCase();
  const mime = ext === ".wav" ? "audio/wav" : ext === ".mp3" ? "audio/mpeg" : "application/octet-stream";
  headers.set("Content-Type", mime);
  headers.set("Content-Length", String(stat.size));
  headers.set("Content-Disposition", `attachment; filename="${safeName(path.basename(target))}"`);
  return new Response(Readable.toWeb(createReadStream(target)) as ReadableStream, { headers });
}
