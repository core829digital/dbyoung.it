"use client";

import Link from "next/link";
import { Instagram, Facebook, Youtube, Music2 } from "lucide-react";
import { SOCIALS } from "@/lib/utils";
import { useLang, LangToggle, PHOTOS } from "@/lib/i18n";

const EXPLORE_HREFS = ["/artista", "/musica", "/opere", "/shop", "/eventi", "/contatti"];
const SHOP_LINKS = ["/shop?type=beat", "/shop?type=sample-pack", "/shop?type=offerta", "/termini#licenze"];
const LEGAL_HREFS = ["/privacy", "/termini", "/cookie", "/gdpr"];

export function Footer() {
  const { t } = useLang();

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.logo} alt="DBYoung logo" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-display text-lg font-bold text-white">
              DB<span className="text-fire-gradient">Young</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">{t.footer.tag}</p>
          <div className="mt-5 flex items-center gap-2">
            {[
              { icon: Music2, href: SOCIALS.spotify, label: "Spotify" },
              { icon: Instagram, href: SOCIALS.instagram, label: "Instagram" },
              { icon: Facebook, href: SOCIALS.facebook, label: "Facebook" },
              { icon: Youtube, href: SOCIALS.youtube, label: "YouTube" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all hover:scale-110 hover:border-fire/60 hover:text-fire-hot"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
            <span className="ml-1"><LangToggle compact /></span>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{t.footer.explore}</h4>
          <ul className="space-y-2.5 text-sm">
            {t.footer.exploreLinks.map((l, i) => (
              <li key={EXPLORE_HREFS[i]}><Link href={EXPLORE_HREFS[i]} className="text-white/65 transition-colors hover:text-fire-hot">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{t.footer.shop}</h4>
          <ul className="space-y-2.5 text-sm">
            {t.footer.shopLinks.map((l, i) => (
              <li key={SHOP_LINKS[i]}><Link href={SHOP_LINKS[i]} className="text-white/65 transition-colors hover:text-fire-hot">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{t.footer.legal}</h4>
          <ul className="space-y-2.5 text-sm">
            {t.footer.legalLinks.map((l, i) => (
              <li key={LEGAL_HREFS[i]}><Link href={LEGAL_HREFS[i]} className="text-white/65 transition-colors hover:text-fire-hot">{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/40 md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} DBYoung · Dimitri Bouturline · dbyoung.it — {t.footer.rights} · Powered by CORE829</p>
        </div>
      </div>
    </footer>
  );
}
