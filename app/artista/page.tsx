"use client";

import Link from "next/link";
import { ArrowRight, Music2, Guitar, Piano, Drum } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";
import { useLang, PHOTOS } from "@/lib/i18n";

export default function ArtistaPage() {
  const { t } = useLang();
  const icons = [Piano, Guitar, Drum, Music2];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">{t.artist.kicker}</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
            DB<span className="text-fire-gradient">Young</span>
          </h1>
          <p className="mt-5 leading-relaxed text-white/65">{t.artist.p1}</p>
          <p className="mt-4 leading-relaxed text-white/65">{t.artist.p2}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-fire inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">{t.artist.ctaShop} <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/opere" className="inline-flex items-center gap-2 rounded-full border border-fire/40 bg-fire/10 px-6 py-3 text-sm text-fire-ember transition-all hover:bg-fire/20">{t.artist.ctaWorks}</Link>
            <Link href="/eventi" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm text-white/85 transition-all hover:border-fire/60 hover:text-fire-ember">{t.artist.ctaCollab}</Link>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-[2rem] border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.artistPortrait} alt="Dimitri Bouturline — DBYoung" className="aspect-[4/5] w-full object-cover" />
          </div>
        </Reveal>
      </div>

      <div className="mt-20">
        <SectionHeading kicker={t.artist.soundKicker} title={t.artist.soundTitle} sub={t.artist.soundSub} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.artist.cards.map(([title, desc], i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={title} className="card-hover rounded-3xl border border-white/10 bg-obsidian-card p-6">
                <Icon className="h-6 w-6 text-fire" />
                <p className="mt-3 font-display font-semibold">{title}</p>
                <p className="mt-1 text-sm text-white/55">{desc}</p>
              </Reveal>
            );
          })}
        </div>
      </div>

      <div className="mt-20">
        <SectionHeading kicker={t.artist.galleryKicker} title={t.artist.galleryTitle} />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {PHOTOS.gallery.map((src, i) => (
            <Reveal key={src} delay={i * 0.1} className="card-hover overflow-hidden rounded-[2rem] border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Dimitri Bouturline — DBYoung (${i + 1})`} loading="lazy" className="aspect-[3/4] w-full object-cover" />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
