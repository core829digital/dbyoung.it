import { Reveal } from "@/components/reveal";

export const metadata = { title: "GDPR & Trattamento dati — DBYoung" };

export default function GdprPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:px-8">
      <Reveal>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Legale</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">GDPR & Trattamento dati</h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-white/65">
          <p><strong className="text-white">Titolare:</strong> Dimitri Bouturline (DBYoung) — email privacy@dbyoung.it (TODO: attivare).</p>
          <p><strong className="text-white">Responsabili esterni (art. 28):</strong> Vercel (hosting), Convex (database), Stripe (pagamenti), Resend (email), Calendly (booking) — con DPA e, ove extra-UE, clausole SCC.</p>
          <p><strong className="text-white">Misure:</strong> HTTPS, accessi admin con autenticazione, minimizzazione, backup, log accessi.</p>
          <p><strong className="text-white">Data breach:</strong> notifica al Garante entro 72h e agli interessati ove ad alto rischio (artt. 33–34 GDPR).</p>
          <p><strong className="text-white">Minori:</strong> i servizi non sono rivolti a under-14 senza consenso genitoriale.</p>
          <p>Per esercitare i diritti (accesso, cancellazione, portabilità, opposizione): <strong className="text-white">privacy@dbyoung.it</strong> — risposta entro 30 giorni.</p>
        </div>
      </Reveal>
    </div>
  );
}
