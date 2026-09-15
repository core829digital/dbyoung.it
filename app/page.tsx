"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Disc3, CalendarCheck, Flame, Music4, Radio, Star } from "lucide-react";
import { DBYoungHero } from "@/components/ui/prisma-hero";
import { Reveal, SectionHeading } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/lib/data";
import { SOCIALS } from "@/lib/utils";
import { useLang, PHOTOS } from "@/lib/i18n";
import { pushInbox } from "@/lib/analytics";

const CARD_ICONS = [Music4, Star, CalendarCheck, Disc3];

export default function Home() {
  const { t } = useLang();
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 3);
  const [news, setNews] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const subscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setNews("sending");
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form) });
      if (!res.ok) throw new Error();
      pushInbox({ type: "newsletter", email });
      form.reset();
      setNews("ok");
    } catch {
      setNews("err");
    }
  };

  return (
    <>
      <DBYoungHero />

      {/* Trust / stats bar */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <Reveal className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {t.home.stats.map(([v, l]) => (
            <div key={l} className="card-hover rounded-3xl border border-white/10 bg-obsidian-card p-6 text-center">
              <p className="font-display text-3xl font-bold text-fire-gradient md:text-4xl">{v}</p>
              <p className="mt-1 text-sm text-white/60">{l}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Chi è */}
      <section className="border-y border-white/10 bg-obsidian-soft">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-2 md:px-8">
          <Reveal>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">{t.home.artistKicker}</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              {t.home.artistTitleA} <span className="text-fire-gradient">{t.home.artistTitleB}</span>{t.home.artistTitleC}
            </h2>
            <p className="mt-5 leading-relaxed text-white/60">{t.home.artistText}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/artista" className="btn-fire inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                {t.home.artistCta1} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/musica" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm text-white/85 transition-all hover:border-fire/60 hover:text-fire-ember">
                <Disc3 className="h-4 w-4" /> {t.home.artistCta2}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PHOTOS.homeArtist} alt="Dimitri Bouturline — DBYoung" className="aspect-[4/5] w-full object-cover md:aspect-square" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2 text-sm text-white/80"><Flame className="h-4 w-4 text-fire" /> {t.home.artistBadge}</div>
                <Link href="/eventi" className="text-sm font-semibold text-fire-hot hover:text-fire-ember">{t.home.artistBadgeLink}</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Shop preview */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeading kicker={t.home.shopKicker} title={<>{t.home.shopTitleA} <span className="text-fire-gradient">{t.home.shopTitleB}</span></>} sub={t.home.shopSub} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
        <Reveal className="mt-10 text-center">
          <Link href="/shop" className="btn-fire inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold">
            {t.home.shopCta} <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      {/* Eventi CTA */}
      <section className="relative overflow-hidden border-y border-fire/20 bg-gradient-to-br from-[#1a0b00] via-obsidian to-obsidian">
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-20 md:grid-cols-2 md:px-8">
          <Reveal>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">{t.home.eventsKicker}</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">{t.home.eventsTitleA} <span className="text-fire-gradient">{t.home.eventsTitleB}</span></h2>
            <p className="mt-4 leading-relaxed text-white/60">{t.home.eventsText}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/eventi" className="btn-fire inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold">
                <CalendarCheck className="h-4 w-4" /> {t.home.eventsCta}
              </Link>
              <a href={SOCIALS.spotify} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm text-white/85 transition-all hover:border-fire/60 hover:text-fire-ember">
                <Radio className="h-4 w-4" /> Spotify
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-3">
              {t.home.eventsCards.map(([l, d], i) => {
                const Icon = CARD_ICONS[i % CARD_ICONS.length];
                return (
                  <div key={l} className="card-hover rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur">
                    <Icon className="h-6 w-6 text-fire" />
                    <p className="mt-3 font-display font-semibold">{l}</p>
                    <p className="mt-1 text-xs text-white/50">{d}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
        <SectionHeading kicker={t.home.newsKicker} title={t.home.newsTitle} sub={t.home.newsSub} />
        <Reveal delay={0.1}>
          <form action="/api/newsletter" method="post" onSubmit={subscribe} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input required type="email" name="email" placeholder={t.home.newsPlaceholder} className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
            <button disabled={news === "sending"} className="btn-fire rounded-full px-7 py-3.5 text-sm font-semibold disabled:opacity-60">
              {news === "sending" ? t.forms.sending : t.home.newsButton}
            </button>
          </form>
          {news === "ok" && <p className="mt-3 text-sm text-fire-ember">{t.forms.okNews}</p>}
          {news === "err" && <p className="mt-3 text-sm text-red-300">{t.forms.err}</p>}
          <p className="mt-3 text-xs text-white/40">{t.home.newsPrivacy} <Link href="/privacy" className="underline hover:text-fire-hot">{t.home.newsPrivacyLink}</Link>.</p>
        </Reveal>
      </section>
    </>
  );
}
