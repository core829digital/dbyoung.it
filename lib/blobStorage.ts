/**
 * URL pubblico Vercel Blob per i file dei prodotti (solo server-side).
 * La licenza viene verificata PRIMA di redirect: il blob non è indicizzato
 * e l'URL non viene mai esposto nel catalogo client.
 */

export function blobUrlForSlug(slug: string): string | null {
  const key = `BLOB_URL_${slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
  const value = process.env[key]?.trim();
  return value || null;
}
