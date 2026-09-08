import { CalendarCheck, Mail, Phone, Clock } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { CALENDLY_URL } from "@/lib/utils";

export const metadata = { title: "Eventi & Booking — DBYoung" };

export default function EventiPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Eventi · events.dbyoung.it</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Prenota <span className="text-fire-gradient">DBYoung live</span>
        </h1>
        <p className="mt-4 leading-relaxed text-white/60">
          Club, festival, eventi privati e collaborazioni. Scegli un orario dal calendario per una call conoscitiva gratuita —
          oppure scrivici direttamente con i dettagli del tuo evento.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 lg:grid-cols-5">
        <Reveal className="overflow-hidden rounded-[2rem] border border-white/10 bg-obsidian-card lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
            <CalendarCheck className="h-5 w-5 text-fire" />
            <p className="font-semibold">Calendario booking — call conoscitiva (30 min, gratis)</p>
          </div>
          {/* TODO: sostituire con widget Calendly reale (URL in lib/utils.ts).
              Sostituire l'iframe qui sotto con:
              <div className="calendly-inline-widget" data-url={CALENDLY_URL} style={{minWidth:320,height:700}} /> + script embed */}
          <iframe src={CALENDLY_URL} title="Prenota una call con DBYoung" className="h-[640px] w-full bg-white" loading="lazy" />
        </Reveal>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <Reveal delay={0.1} className="rounded-[2rem] border border-white/10 bg-obsidian-card p-7">
            <h2 className="font-display text-xl font-semibold">Contatti diretti</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-fire" /> booking@dbyoung.it (TODO: attivare)</li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-fire" /> +39 000 000 0000 (TODO)</li>
              <li className="flex items-center gap-3"><Clock className="h-4 w-4 text-fire" /> Risposta entro 24–48h</li>
            </ul>
          </Reveal>

          <Reveal delay={0.15} className="rounded-[2rem] border border-fire/25 bg-gradient-to-br from-[#200d00] to-obsidian-card p-7">
            <h2 className="font-display text-xl font-semibold">Richiedi preventivo evento</h2>
            <form action="/api/booking" method="post" className="mt-4 space-y-3">
              <input required name="name" placeholder="Nome e cognome" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
              <input required type="email" name="email" placeholder="Email" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="date" name="date" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white focus:border-fire/60 focus:outline-none" />
                <input name="city" placeholder="Città / Venue" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
              </div>
              <textarea required name="message" rows={4} placeholder="Tipo di evento, ospiti attesi, budget indicativo…" className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
              <button className="btn-fire w-full rounded-full py-3.5 text-sm font-semibold">Invia richiesta</button>
              <p className="text-xs text-white/40">Inviando accetti la <a href="/privacy" className="underline hover:text-fire-hot">Privacy Policy</a>.</p>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
