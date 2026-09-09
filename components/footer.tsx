"use client";

import Link from "next/link";
import { Flame, Instagram, Facebook, Youtube, Music2 } from "lucide-react";
import { SOCIALS } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fire to-fire-deep">
              <Flame className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-lg font-bold text-white">
              DB<span className="text-fire-gradient">Young</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
            Dimitri Bouturline — jazz, blues e musica classica dal suono moderno, strumenti veri, energia pura.
            Beat, sample pack e organizzazione eventi.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { icon: Music2, href: SOCIALS.spotify, label: "Spotify" },
              { icon: Instagram, href: SOCIALS.instagram, label: "Instagram" },
              { icon: Facebook, href: SOCIALS.facebook, label: "Facebook" },
              { icon: Youtube, href: SOCIALS.youtube, label: "YouTube" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all hover:scale-110 hover:border-fire/60 hover:text-fire-hot"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Esplora</h4>
          <ul className="space-y-2.5 text-sm">
            {[["Chi è DBYoung", "/artista"], ["Musica", "/musica"], ["Shop", "/shop"], ["Eventi", "/eventi"], ["Contatti", "/contatti"]].map(([l, h]) => (
              <li key={h}><Link href={h} className="text-white/65 transition-colors hover:text-fire-hot">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            {[["Beats", "/shop?type=beat"], ["Sample Packs", "/shop?type=sample-pack"], ["Offerte", "/shop?type=offerta"], ["Licenze", "/termini#licenze"]].map(([l, h]) => (
              <li key={h}><Link href={h} className="text-white/65 transition-colors hover:text-fire-hot">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Legale</h4>
          <ul className="space-y-2.5 text-sm">
            {[["Privacy Policy", "/privacy"], ["Termini di utilizzo", "/termini"], ["Cookie Policy", "/cookie"], ["GDPR & Trattamento dati", "/gdpr"]].map(([l, h]) => (
              <li key={h}><Link href={h} className="text-white/65 transition-colors hover:text-fire-hot">{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/40 md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} DBYoung · Dimitri Bouturline · dbyoung.it — Tutti i diritti riservati. · Powered by CORE829</p>
        </div>
      </div>
    </footer>
  );
}
