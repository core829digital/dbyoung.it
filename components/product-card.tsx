"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Pause, ShoppingCart, FileDown, Lock, Plus, Check } from "lucide-react";
import type { Product } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { trackBuy } from "@/lib/analytics";
import { useCart } from "@/lib/cart";

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { t, lang } = useLang();
  const { add, has } = useCart();
  const inCart = has(p.slug);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [dur, setDur] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else void a.play();
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
  };

  const buyHref = p.licenseOnly || p.stripeLink === "#" ? "/contatti" : p.stripeLink;
  const buyExternal = !p.licenseOnly && p.stripeLink !== "#";
  const desc = lang === "en" ? p.descriptionEn : p.description;

  return (
    <motion.article
      initial={{ y: 28, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="card-hover group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-obsidian-card"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image src={p.cover} alt={p.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] uppercase tracking-wider text-white/80 backdrop-blur">
          {t.shop.types[p.type] ?? p.type}
        </span>
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-fire/40 bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-fire-ember backdrop-blur">
          <Lock className="h-3 w-3" /> {t.shop.preview}
        </span>
        {(p.bpm || p.key) && (
          <div className="absolute bottom-3 left-3 flex gap-2 text-[11px] text-white/80">
            {p.bpm && <span className="rounded-full bg-black/60 px-2.5 py-1 backdrop-blur">{p.bpm} BPM</span>}
            {p.key && <span className="rounded-full bg-black/60 px-2.5 py-1 backdrop-blur">{p.key}</span>}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-white transition-colors group-hover:text-fire-ember">{p.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-white/55">{desc}</p>

        {/* Player anteprima */}
        {p.preview && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-3">
            <audio
              ref={audioRef}
              src={p.preview}
              preload="none"
              onTimeUpdate={(e) => {
                const a = e.currentTarget;
                setProg(a.duration ? a.currentTime / a.duration : 0);
              }}
              onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
              onEnded={() => { setPlaying(false); setProg(0); }}
              onPause={() => setPlaying(false)}
            />
            <div className="flex items-center gap-3">
              <button
                onClick={toggle}
                aria-label={`${t.shop.listen}: ${p.title}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fire text-white shadow-fire transition-transform hover:scale-110"
              >
                {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
              </button>
              <div className="flex-1">
                <div onClick={seek} className="h-1.5 cursor-pointer rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-gradient-to-r from-fire to-fire-ember transition-[width]" style={{ width: `${prog * 100}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-white/45">
                  <span>{t.shop.preview}</span>
                  <span>{dur ? fmt(dur * prog) + " / " + fmt(dur) : ""}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/60">{tag}</span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-baseline gap-2">
            {p.licenseOnly ? (
              <span className="font-display text-lg font-bold text-fire-ember">{t.shop.customPrice}</span>
            ) : (
              <>
                <span className="font-display text-2xl font-bold text-white">€{p.price}</span>
                {p.oldPrice && <span className="text-sm text-white/40 line-through">€{p.oldPrice}</span>}
              </>
            )}
          </div>
          {buyExternal ? (
            <a href={p.stripeLink} onClick={() => trackBuy(p.id)} target="_blank" rel="noreferrer" className="btn-fire flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
              <ShoppingCart className="h-4 w-4" /> {t.shop.buy}
            </a>
          ) : (
            <Link href={buyHref} onClick={() => trackBuy(p.id)} className="btn-fire flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
              <ShoppingCart className="h-4 w-4" /> {p.licenseOnly ? t.shop.request : t.shop.buy}
            </Link>
          )}
        </div>
        {!p.licenseOnly && (
          <button
            onClick={() => { add(p.slug); trackBuy(p.id); }}
            disabled={inCart}
            className="mt-2.5 flex items-center justify-center gap-1.5 rounded-full border border-white/15 py-2 text-xs text-white/70 transition-colors hover:border-fire/50 hover:text-white disabled:opacity-60"
          >
            {inCart ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {inCart ? "Nel carrello" : "Aggiungi al carrello"}
          </button>
        )}
        <Link href="/libreria" className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-white/40 transition-colors hover:text-fire-hot">
          <FileDown className="h-3.5 w-3.5" /> {t.shop.owned} {t.shop.libraryCta}
        </Link>
      </div>
    </motion.article>
  );
}
