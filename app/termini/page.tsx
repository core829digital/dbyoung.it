"use client";

import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";

export default function TerminiPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:px-8">
      <Reveal>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Legale</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Termini di utilizzo</h1>
        <p className="mt-4 rounded-2xl border border-fire/25 bg-fire/10 px-4 py-3 text-sm text-fire-ember">{t.legal.enNote} {t.legal.terminiEn}</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-white/65">
          <section><h2 className="font-display text-xl font-semibold text-white">1. Oggetto</h2><p className="mt-2">dbyoung.it vende beat, sample pack e servizi di organizzazione eventi di Dimitri Bouturline (DBYoung). L&apos;acquisto di un file non trasferisce il diritto d&apos;autore, ma una licenza d&apos;uso secondo il piano scelto.</p></section>
          <section id="licenze"><h2 className="font-display text-xl font-semibold text-white">2. Licenze beat</h2><p className="mt-2"><strong>Base (MP3):</strong> 1 brano commerciale fino a 50.000 stream. <strong>Premium (WAV+Stems):</strong> fino a 250.000 stream, video monetizzati, 1 videoclip. <strong>Esclusiva (su richiesta):</strong> il beat viene ritirato dallo shop. Credit obbligatorio: &quot;Prod. DBYoung&quot;.</p></section>
          <section><h2 className="font-display text-xl font-semibold text-white">3. Sample pack</h2><p className="mt-2">Tutti i suoni sono royalty-free per produzioni originali. Vietata la rivendita/redistribuzione dei sample grezzi o in pack concorrenti.</p></section>
          <section><h2 className="font-display text-xl font-semibold text-white">4. Pagamenti e consegna</h2><p className="mt-2">Pagamenti via Stripe Payment Link. Consegna digitale via email entro 24h (di norma immediata). Essendo beni digitali scaricabili, il diritto di recesso (art. 59 Codice del Consumo) decade con l&apos;inizio del download previo consenso — salvo difetti di file, sostituiti o rimborsati.</p></section>
          <section><h2 className="font-display text-xl font-semibold text-white">5. Eventi</h2><p className="mt-2">Le prenotazioni dal calendario sono call conoscitive gratuite. I contratti di organizzazione eventi (preventivi, caparre, produzione) sono stipulati separatamente per iscritto.</p></section>
          <section><h2 className="font-display text-xl font-semibold text-white">6. Uso vietato</h2><p className="mt-2">Vietato rivendere i file grezzi, aggirare i pagamenti o usare il marchio DBYoung senza autorizzazione.</p></section>
          <section><h2 className="font-display text-xl font-semibold text-white">7. Legge applicabile</h2><p className="mt-2">Legge italiana. Foro competente: quello del consumatore (o Milano per B2B).</p></section>
        </div>
      </Reveal>
    </div>
  );
}
