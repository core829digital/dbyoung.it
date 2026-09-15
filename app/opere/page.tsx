"use client";

import Link from "next/link";
import { FileMusic, FileAudio, Download, Clock } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { WORKS } from "@/lib/data";
import { useLang } from "@/lib/i18n";

/**
 * Opere & curriculum composizioni.
 * Per pubblicare un file reale: metti spartito/audio in /public/opere/
 * e sostituisci `file: "#"` con il percorso (es. "/opere/notturno.pdf").
 */
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

      <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10">
        <div className="hidden grid-cols-12 gap-4 border-b border-white/10 bg-black/60 px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-white/45 md:grid">
          <p className="col-span-5">{t.works.headers[0]}</p>
          <p className="col-span-3">{t.works.headers[1]}</p>
          <p className="col-span-2">{t.works.headers[2]}</p>
          <p className="col-span-2 text-right">{t.works.headers[3]}</p>
        </div>
        {WORKS.map((w, i) => (
          <Reveal key={w.id} delay={Math.min(i * 0.05, 0.3)}>
            <div className="grid grid-cols-1 gap-2 border-b border-white/5 bg-obsidian-card px-6 py-5 transition-colors last:border-0 hover:bg-obsidian-soft md:grid-cols-12 md:items-center md:gap-4">
              <div className="md:col-span-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fire/15">
                    {w.kind === "score" ? <FileMusic className="h-4 w-4 text-fire" /> : <FileAudio className="h-4 w-4 text-fire" />}
                  </span>
                  <div>
                    <p className="font-display font-semibold text-white">{w.title[lang]}</p>
                    <p className="text-xs text-white/45">{w.description[lang]}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-white/65 md:col-span-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">{w.genre[lang]}</span>
              </p>
              <p className="text-sm text-white/55 md:col-span-2">{w.year}</p>
              <div className="md:col-span-2 md:text-right">
                {w.file === "#" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-xs text-white/40">
                    <Clock className="h-3.5 w-3.5" /> {t.works.fileSoon}
                  </span>
                ) : (
                  <a href={w.file} download className="btn-fire inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold">
                    <Download className="h-3.5 w-3.5" /> {t.works.download}
                  </a>
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
