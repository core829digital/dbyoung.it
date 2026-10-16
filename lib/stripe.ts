import { PRODUCTS } from "./data";

/**
 * Mappa slug prodotto → Stripe Price ID (solo server-side, da env).
 * I prezzi vivono in Stripe: il client non decide mai gli importi.
 * Prodotti `licenseOnly` (colonne sonore) esclusi: licenza su misura via contatti.
 */

function envPriceId(slug: string): string | null {
  const key = `STRIPE_PRICE_${slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
  return process.env[key] ?? null;
}

/** Price ID per slug, o null se non acquistabile online. */
export function priceIdForSlug(slug: string): string | null {
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product || product.licenseOnly || product.price <= 0) return null;
  return envPriceId(slug);
}

/** Slug da Price ID (per il webhook). */
export function slugForPriceId(priceId: string): string | null {
  for (const p of PRODUCTS) {
    const id = p.licenseOnly ? null : envPriceId(p.slug);
    if (id === priceId) return p.slug;
  }
  return null;
}

/** Slugs acquistabili con Price ID configurato (per diagnostica avvio). */
export function purchasableSlugs(): string[] {
  return PRODUCTS.filter((p) => priceIdForSlug(p.slug)).map((p) => p.slug);
}
