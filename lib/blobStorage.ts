/**
 * Storage file vendibili su Vercel Blob (store PRIVATO), solo server-side.
 *
 * Flusso download:
 *   1. /api/download verifica la LICENZA (convex/licenses) — mai prima.
 *   2. blobDownloadUrl() chiede un token firmato e presigna un URL GET
 *      valido ~10 minuti per il solo pathname del prodotto.
 *   3. La route risponde 302 verso l'URL presigned: il browser scarica
 *      direttamente dal CDN Blob (nessuno stream pesante su Vercel).
 *
 * L'URL presigned è temporaneo e legato al pathname: chi lo condivide
 * perde l'accesso dopo la scadenza, e l'URL non è derivabile dal catalogo.
 */
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { PRODUCTS } from "@/lib/data";

const envKeyFor = (slug: string) => `BLOB_PATH_${slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;

/** pathname Blob del prodotto: env `BLOB_PATH_*` ha priorità, poi regola deterministica. */
export function blobPathForSlug(slug: string): string | null {
  const override = process.env[envKeyFor(slug)]?.trim();
  if (override) return override;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product || product.licenseOnly || !product.file || product.price <= 0) return null;
  return product.type === "beat" ? `products/${slug}.wav` : `products/${slug}.zip`;
}

/**
 * URL presigned GET (~10 min) per il pathname del prodotto, oppure null se
 * lo storage non è configurato (sviluppo locale: si usa private_audio/).
 */
export async function blobDownloadUrl(slug: string): Promise<string | null> {
  const pathname = blobPathForSlug(slug);
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!pathname || !token) return null;
  try {
    const validUntil = Date.now() + 10 * 60 * 1000;
    const signed = await issueSignedToken({ pathname, operations: ["get"], validUntil, token });
    const { presignedUrl } = await presignUrl(
      { delegationToken: signed.delegationToken, clientSigningToken: signed.clientSigningToken },
      { operation: "get", pathname, access: "private", validUntil }
    );
    return presignedUrl;
  } catch {
    return null;
  }
}
