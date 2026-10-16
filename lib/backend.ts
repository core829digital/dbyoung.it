import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Product, ProductType } from "@/lib/data";
import { ARTWORK_PACKS } from "@/lib/data";

/**
 * Ponte verso Convex via HTTP client — SOLO chiamate pubbliche
 * (tracking aggregato, lista prodotti, verifica licenze).
 * Nessun import node:crypto qui: questo modulo gira anche nel browser.
 * Le operazioni privilegiate passano da /api/admin/* e /api/auth/*
 * (firma HMAC server-side, vedi lib/serverConvex.ts).
 */

let client: ConvexHttpClient | null = null;

function http(): ConvexHttpClient | null {
  const url =
    process.env.NEXT_PUBLIC_CONVEX_URL ??
    process.env.CONVEX_HTTP_URL?.replace(".convex.site", ".convex.cloud");
  if (!url) return null;
  if (!client) client = new ConvexHttpClient(url);
  return client;
}

export function convexConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

async function callQuery<T>(fn: unknown, args: Record<string, unknown>): Promise<T | null> {
  try {
    const c = http();
    if (!c) return null;
    return (await (c.query as (...a: unknown[]) => Promise<T>)(fn, args)) ?? null;
  } catch {
    return null;
  }
}

async function callMutation(fn: unknown, args: Record<string, unknown>): Promise<boolean> {
  try {
    const c = http();
    if (!c) return false;
    await (c.mutation as (...a: unknown[]) => Promise<unknown>)(fn, args);
    return true;
  } catch {
    return false;
  }
}

const day = () => new Date().toISOString().slice(0, 10);

/* ---------- Tracking visite (pubblico: solo contatori) ---------- */
export function cloudTrackView(path: string) {
  void callMutation(api.stats.track as never, { path: path.slice(0, 120), day: day() });
}

/* ---------- Prodotti pubblici ---------- */
interface CloudProduct {
  _id: string;
  title: string;
  slug: string;
  type: ProductType;
  price: number;
  oldPrice?: number;
  bpm?: number;
  musicalKey?: string;
  coverUrl?: string;
  stripeLink: string;
  tags: string[];
  featured?: boolean;
  description: string;
  filePath?: string;
}

function mapProduct(d: CloudProduct): Product {
  return {
    id: String(d._id),
    slug: d.slug,
    title: d.title,
    type: d.type,
    price: d.price,
    oldPrice: d.oldPrice,
    bpm: d.bpm,
    key: d.musicalKey,
    cover: d.coverUrl ?? ARTWORK_PACKS,
    stripeLink: d.stripeLink,
    tags: d.tags ?? [],
    featured: d.featured,
    description: d.description,
    descriptionEn: d.description,
    preview: "",
    // file privato risolto dal backend via slug (mai esposto al client)
    file: "",
  };
}

export async function cloudFetchProducts(): Promise<Product[] | null> {
  const docs = await callQuery<CloudProduct[]>(api.products.list as never, {});
  return docs ? docs.map(mapProduct) : null;
}

/* ---------- Licenze download (verifica pubblica: ritorna solo slug+email) ---------- */
export interface CloudLicense {
  productSlug: string;
  email: string;
}

export async function cloudVerifyLicense(code: string): Promise<CloudLicense | null> {
  const clean = code.trim().toUpperCase().slice(0, 20);
  if (!/^DBY-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(clean)) return null;
  return callQuery<CloudLicense>(api.licenses.getByCode as never, { code: clean });
}
