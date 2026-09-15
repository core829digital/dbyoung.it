import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Product, ProductType } from "@/lib/data";
import { ARTWORK_PACKS } from "@/lib/data";

/**
 * Ponte verso Convex via HTTP client (niente provider/hooks reattivi:
 * funziona anche prima del deploy funzioni e non rompe mai la build).
 * Tutte le chiamate sono best-effort: se il backend non risponde,
 * il sito continua con i dati local-first di lib/analytics.ts.
 * Progetto: festive-ptarmigan-321
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

/* ---------- Tracking visite ---------- */
export function cloudTrackView(path: string) {
  void callMutation(api.stats.track as never, { path, day: day() });
}

/* ---------- Prodotti ---------- */
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
  };
}

export async function cloudFetchProducts(): Promise<Product[] | null> {
  const docs = await callQuery<CloudProduct[]>(api.products.list as never, {});
  return docs ? docs.map(mapProduct) : null;
}

export function cloudCreateProduct(p: {
  title: string;
  type: ProductType;
  price: number;
  stripeLink: string;
  description: string;
}) {
  void callMutation(api.products.create as never, { ...p });
}

/* ---------- Inbox: booking / messaggi / newsletter ---------- */
export function cloudCreateBooking(b: {
  name: string;
  email: string;
  date: string;
  city?: string;
  message: string;
}) {
  void callMutation(api.bookings.create as never, { ...b });
}

export function cloudCreateMessage(m: { name: string; email: string; subject: string; body: string }) {
  void callMutation(api.messages.create as never, { ...m });
}

export function cloudSubscribeNewsletter(email: string) {
  void callMutation(api.newsletter.subscribe as never, { email });
}

/* ---------- Overview statistiche ---------- */
export interface CloudOverview {
  totalViews: number;
  orders: number;
  revenue: number;
}

export async function cloudFetchOverview(): Promise<CloudOverview | null> {
  return callQuery<CloudOverview>(api.stats.overview as never, {});
}
