"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LicenseTier } from "@/lib/cart-types";

export interface CartItem {
  slug: string;
  tier: LicenseTier;
}

const KEY = "dby-cart-v1";

function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(arr) ? arr.filter((i) => typeof i?.slug === "string") : [];
  } catch {
    return [];
  }
}

interface CartCtx {
  items: CartItem[];
  count: number;
  add: (slug: string, tier?: LicenseTier) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
}

const Ctx = createContext<CartCtx>({ items: [], count: 0, add: () => undefined, remove: () => undefined, clear: () => undefined, has: () => false });

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => setItems(read()), []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignora */
    }
  }, [items]);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      count: items.length,
      add: (slug, tier = "base") =>
        setItems((prev) => (prev.some((i) => i.slug === slug) ? prev : [...prev, { slug, tier }])),
      remove: (slug) => setItems((prev) => prev.filter((i) => i.slug !== slug)),
      clear: () => setItems([]),
      has: (slug) => items.some((i) => i.slug === slug),
    }),
    [items]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  return useContext(Ctx);
}
