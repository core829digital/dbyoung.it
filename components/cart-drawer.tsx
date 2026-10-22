"use client";

import Link from "next/link";
import { Trash2, X, ShieldCheck, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/i18n";
import { PRODUCTS, HOLIDAY_PROMO, isHolidayPromoActive, promoPrice } from "@/lib/data";

/**
 * Drawer carrello: si aggiunge a ogni pagina (provider globale) e si apre
 * dall'ANY pulsante dello shop. Da qui l'utente decide se continuare a
 * comprare o procedere al checkout Stripe.
 */
export function CartDrawer() {
  const { items, remove, open, closeCart } = useCart();
  const { t } = useLang();
  const promo = isHolidayPromoActive();
  const total = items.reduce((s, i) => s + (PRODUCTS.find((p) => p.slug === i.slug)?.price ?? 0), 0);
  const totalAfterPromo = items.reduce((s, i) => {
    const p = PRODUCTS.find((x) => x.slug === i.slug);
    return p ? s + promoPrice(p.price, promo) : s;
  }, 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cart-drawer"
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button aria-label="Chiudi carrello" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeCart} />
          <motion.aside
            className="absolute right-2 top-2 bottom-2 flex w-[calc(100vw-1rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-white/10 bg-obsidian-card shadow-card sm:right-4 sm:top-4 sm:bottom-4"
            initial={{ x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 48, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex items-center justify-between border-b border-white/10 p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                <ShoppingCart className="h-5 w-5 text-fire-ember" /> {t.cart.title}
              </h2>
              <button onClick={closeCart} aria-label="Chiudi" className="rounded-full border border-white/10 p-2 text-white/60 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <p className="pt-10 text-center text-white/55">{t.cart.empty}</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((i) => {
                    const p = PRODUCTS.find((x) => x.slug === i.slug);
                    if (!p) return null;
                    return (
                      <li key={i.slug} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 p-3">
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                          {/* cover da data.ts (statica, non cambia) */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.cover} alt="" className="h-full w-full object-cover" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{p.title}</p>
                          <p className="text-xs text-white/50">
                            {promo ? <s className="mr-1 text-white/35">€{p.price}</s> : null}
                            €{promoPrice(p.price, promo)}
                          </p>
                        </div>
                        <button onClick={() => remove(i.slug)} aria-label={`Rimuovi ${p.title}`} className="text-white/40 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="space-y-3 border-t border-white/10 p-5">
                {promo && (
                  <p className="flex items-center justify-between text-sm text-fire-ember">
                    <span>{t.cart.promoLabel} −{HOLIDAY_PROMO.percentOff}%</span>
                    <span>
                      {t.cart.saved} €{(total - totalAfterPromo).toFixed(2)}
                    </span>
                  </p>
                )}
                <div className="flex items-center justify-between font-display text-xl font-bold text-white">
                  <span>Totale</span>
                  <span>€{totalAfterPromo.toFixed(2)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-fire flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold"
                >
                  <ShieldCheck className="h-4 w-4" /> {t.cart.checkout}
                </Link>
                <button onClick={closeCart} className="w-full rounded-full border border-white/15 py-3 text-sm text-white/75 transition-colors hover:border-fire/50 hover:text-white">
                  {t.cart.continue}
                </button>
                <p className="text-center text-[11px] text-white/40">{t.cart.securityNote}</p>
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
