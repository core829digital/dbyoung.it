"use client";

import type { Product } from "@/lib/data";
import { ARTWORK_PACKS } from "@/lib/data";
import {
  cloudTrackView,
  cloudCreateProduct,
  cloudCreateBooking,
  cloudCreateMessage,
  cloudSubscribeNewsletter,
} from "./backend";

/**
 * Analytics & inbox LOCAL-FIRST (localStorage).
 * Funziona subito senza backend; quando Convex sarà collegato,
 * queste funzioni diventeranno thin wrapper delle mutation/query.
 */

const VIEWS_KEY = "dby-views-v1";
const CLICKS_KEY = "dby-clicks-v1";
const INBOX_KEY = "dby-inbox-v1";
const CUSTOM_PRODUCTS_KEY = "dby-custom-products-v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage pieno o bloccato: ignora */
  }
}

const today = () => new Date().toISOString().slice(0, 10);

/* ---------- Visite aggregate (path|giorno → conteggio) ---------- */
export function trackView(path: string) {
  const all = read<Record<string, number>>(VIEWS_KEY, {});
  const k = `${path}|${today()}`;
  all[k] = (all[k] ?? 0) + 1;
  write(VIEWS_KEY, all);
  cloudTrackView(path); // best-effort verso Convex
}

/* ---------- Click su "Compra" (per prodotto) ---------- */
export function trackBuy(productId: string) {
  const all = read<Record<string, number>>(CLICKS_KEY, {});
  all[productId] = (all[productId] ?? 0) + 1;
  write(CLICKS_KEY, all);
}

export interface Stats {
  totalViews: number;
  todayViews: number;
  buyClicks: number;
  topPages: { path: string; count: number }[];
  clicksByProduct: { id: string; count: number }[];
}

export function getStats(): Stats {
  const views = read<Record<string, number>>(VIEWS_KEY, {});
  const clicks = read<Record<string, number>>(CLICKS_KEY, {});
  const t = today();
  let total = 0;
  let todayCount = 0;
  const byPage: Record<string, number> = {};
  Object.entries(views).forEach(([k, n]) => {
    total += n;
    const [path, day] = k.split("|");
    if (day === t) todayCount += n;
    byPage[path] = (byPage[path] ?? 0) + n;
  });
  return {
    totalViews: total,
    todayViews: todayCount,
    buyClicks: Object.values(clicks).reduce((s, n) => s + n, 0),
    topPages: Object.entries(byPage)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    clicksByProduct: Object.entries(clicks)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count),
  };
}

/* ---------- Inbox (newsletter / booking / contatti) ---------- */
export interface InboxItem {
  id: string;
  type: "newsletter" | "booking" | "contact";
  date: string;
  name?: string;
  email: string;
  city?: string;
  day?: string;
  subject?: string;
  message?: string;
}

export function pushInbox(item: Omit<InboxItem, "id" | "date">) {
  const all = read<InboxItem[]>(INBOX_KEY, []);
  all.unshift({ ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date: new Date().toISOString() });
  write(INBOX_KEY, all.slice(0, 500));
  // Mirror best-effort verso Convex
  if (item.type === "newsletter") cloudSubscribeNewsletter(item.email);
  else if (item.type === "booking")
    cloudCreateBooking({ name: item.name ?? "", email: item.email, date: item.day ?? "", city: item.city, message: item.message ?? "" });
  else cloudCreateMessage({ name: item.name ?? "", email: item.email, subject: item.subject ?? "", body: item.message ?? "" });
}

export function getInbox(): InboxItem[] {
  return read<InboxItem[]>(INBOX_KEY, []);
}

export function clearInbox() {
  write(INBOX_KEY, []);
}

/* ---------- Prodotti custom (pubblicati da /admin, in attesa di Convex) ---------- */
export function getCustomProducts(): Product[] {
  return read<Product[]>(CUSTOM_PRODUCTS_KEY, []);
}

export function addCustomProduct(p: Product) {
  const all = read<Product[]>(CUSTOM_PRODUCTS_KEY, []);
  all.unshift(p);
  write(CUSTOM_PRODUCTS_KEY, all);
  cloudCreateProduct({ title: p.title, type: p.type, price: p.price, stripeLink: p.stripeLink, description: p.description });
}

export function removeCustomProduct(id: string) {
  write(
    CUSTOM_PRODUCTS_KEY,
    read<Product[]>(CUSTOM_PRODUCTS_KEY, []).filter((p) => p.id !== id)
  );
}

export function customProductCover(): string {
  return ARTWORK_PACKS;
}
