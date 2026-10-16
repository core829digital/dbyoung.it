"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { WORKS, ARTWORK_PACKS } from "@/lib/data";
import { useLang } from "@/lib/i18n";

/** Opere reali: anteprima inline + link al prodotto nello shop. */
export default function OperePage() {
  const { t, lang } = useLang();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">{t.works.kicker}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {t.works.titleA} <span className="text-fire-gradient">{t.works.titleB}</span>
        </h1>
        <p className="mt-4 leading-relaxed text-white/60">{t.works.sub}</p>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {WORKS.map((w, i) => (
          <Reveal key={w.id} delay={Math.min(i * 0.07, 0.3)}>
            <div className="card-hover flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-obsidian-card">
              <div className="flex items-center gap-4 p-5">
                <Image src={ARTWORK_PACKS} alt={w.title[lang]} width={128} height={128} className="h-16 w-16 shrink-0 rounded-2xl border border-white/10 object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold text-white">{w.title[lang]}</p>
                  <p className="mt-0.5 text-xs text-white/50">
                    {w.genre[lang]} · {w.year} · {w.description[lang]}
                  </p>
                </div>
              </div>
              {w.preview && (
                <div className="px-5">
                  <audio controls preload="none" src={w.preview} className="h-9 w-full" />
                </div>
              )}
              <div className="mt-auto flex items-center justify-between p-5 pt-4">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-white/60">
                  {w.genre[lang]}
                </span>
                {w.shopSlug && (
                  <Link href="/shop" className="flex items-center gap-1 text-sm font-semibold text-fire-hot transition-colors hover:text-fire-ember">
                    Shop <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10 rounded-[2rem] border border-fire/25 bg-gradient-to-br from-[#200d00] to-obsidian-card p-8 text-center md:p-12">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">{t.works.ctaTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 md:text-base">{t.works.ctaText}</p>
        <Link href="/contatti" className="btn-fire mt-6 inline-flex rounded-full px-8 py-3.5 font-semibold">{t.works.ctaButton}</Link>
      </Reveal>
    </div>
  );
}
