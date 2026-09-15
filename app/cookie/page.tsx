"use client";

import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";

export default function CookiePage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:px-8">
      <Reveal>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Legale</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Cookie Policy</h1>
        <p className="mt-4 rounded-2xl border border-fire/25 bg-fire/10 px-4 py-3 text-sm text-fire-ember">{t.legal.enNote} {t.legal.cookieEn}</p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-white/65">
          <p><strong className="text-white">Cookie tecnici (sempre attivi):</strong> preferenze essenziali, sicurezza, bilanciamento. Non richiedono consenso.</p>
          <p><strong className="text-white">Statistiche aggregate:</strong> conteggi visite/click interni (dashboard admin) in forma aggregata.</p>
          <p><strong className="text-white">Terze parti (solo previo consenso):</strong> Calendly (widget booking), Stripe (pagamenti), Spotify/YouTube (player embed), Vercel Analytics (se attivato).</p>
          <p>Puoi gestire i cookie dalle impostazioni del browser. Il banner di consenso del sito blocca i contenuti di terzi (Calendly, Spotify) fino alla tua scelta — puoi cambiare idea in qualsiasi momento cancellando la scelta dal browser (localStorage).</p>
        </div>
      </Reveal>
    </div>
  );
}
