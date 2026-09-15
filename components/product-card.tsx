"use client";

import { motion } from "framer-motion";
import { Play, ShoppingCart, BadgePercent } from "lucide-react";
import type { Product } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { trackBuy } from "@/lib/analytics";

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { t } = useLang();
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <motion.article
      initial={{ y: 28, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="card-hover group overflow-hidden rounded-3xl border border-white/10 bg-obsidian-card"
    >
      <div className="relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.cover} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {discount > 0 && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-fire px-3 py-1 text-xs font-bold text-white shadow-fire">
            <BadgePercent className="h-3.5 w-3.5" /> -{discount}%
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] uppercase tracking-wider text-white/80 backdrop-blur">
          {t.shop.types[p.type] ?? p.type}
        </span>
        <button aria-label={`${t.shop.listen}: ${p.title}`} className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-all hover:scale-110 hover:bg-fire hover:text-white">
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </button>
        {(p.bpm || p.key) && (
          <div className="absolute bottom-3 left-3 flex gap-2 text-[11px] text-white/80">
            {p.bpm && <span className="rounded-full bg-black/60 px-2.5 py-1 backdrop-blur">{p.bpm} BPM</span>}
            {p.key && <span className="rounded-full bg-black/60 px-2.5 py-1 backdrop-blur">{p.key}</span>}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-white transition-colors group-hover:text-fire-ember">{p.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-white/55">{p.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/60">{tag}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-white">€{p.price}</span>
            {p.oldPrice && <span className="text-sm text-white/40 line-through">€{p.oldPrice}</span>}
          </div>
          <a href={p.stripeLink} onClick={() => trackBuy(p.id)} target={p.stripeLink === "#" ? undefined : "_blank"} rel="noreferrer" className="btn-fire flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
            <ShoppingCart className="h-4 w-4" /> {t.shop.buy}
          </a>
        </div>
      </div>
    </motion.article>
  );
}
