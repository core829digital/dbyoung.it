"use client";

import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";

function Block({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-white">{t}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-white/65">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:px-8">
      <Reveal>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Legale</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Privacy Policy</h1>
        <p className="mt-4 rounded-2xl border border-fire/25 bg-fire/10 px-4 py-3 text-sm text-fire-ember">{t.legal.enNote} {t.legal.privacyEn}</p>
        <p className="mt-3 text-sm text-white/50">Ultimo aggiornamento: settembre 2026 · Titolare: Dimitri Bouturline (DBYoung) — dbyoung.it</p>
        <Block t="1. Dati che raccogliamo">
          <p>Nome, email, contenuti dei messaggi (form contatti/booking), email newsletter, dati d&apos;ordine (prodotti acquistati, importi, esiti pagamento via Stripe) e dati tecnici anonimi/aggregati di navigazione (pagine viste, click, dispositivo).</p>
        </Block>
        <Block t="2. Finalità e basi giuridiche (GDPR art. 6)">
          <p>Rispondere a richieste (esecuzione di misure precontrattuali); evadere ordini e obblighi fiscali (obbligo legale/contratto); newsletter solo previo consenso (revocabile anytime); statistiche aggregate e sicurezza (legittimo interesse).</p>
        </Block>
        <Block t="3. Pagamenti — Stripe">
          <p>I pagamenti sono elaborati da Stripe tramite Payment Link. Non conserviamo numeri di carta. Si applica l&apos;informativa privacy di Stripe.</p>
        </Block>
        <Block t="4. Email — Resend">
          <p>Le email transazionali (ordini, booking, newsletter) sono inviate tramite Resend. L&apos;iscrizione alla newsletter richiede doppio opt-in ove attivato.</p>
        </Block>
        <Block t="5. Conservazione">
          <p>Dati di contatto: fino a 24 mesi dall&apos;ultimo scambio; dati fiscali: 10 anni; dati newsletter: fino a revoca del consenso.</p>
        </Block>
        <Block t="6. I tuoi diritti (GDPR artt. 15–22)">
          <p>Accesso, rettifica, cancellazione, limitazione, portabilità, opposizione e revoca del consenso: scrivi a <strong>privacy@dbyoung.it</strong>. Reclamo al Garante (garanteprivacy.it).</p>
        </Block>
        <Block t="7. Cookie">
          <p>Vedi la <a href="/cookie" className="text-fire-hot underline">Cookie Policy</a>. Nessun cookie di profilazione senza consenso.</p>
        </Block>
      </Reveal>
    </div>
  );
}
