import { Mail, CalendarCheck } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const metadata = { title: "Contatti — DBYoung" };

export default function ContattiPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Contatti</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">Parliamone <span className="text-fire-gradient">direttamente</span></h1>
        <p className="mt-4 text-white/60">Beat custom, eventi, collaborazioni e stampa. Rispondiamo entro 24–48h.</p>
      </Reveal>
      <Reveal delay={0.1} className="mt-10 grid gap-4 sm:grid-cols-2">
        <a href="/eventi" className="card-hover rounded-3xl border border-fire/30 bg-gradient-to-br from-[#200d00] to-obsidian-card p-7">
          <CalendarCheck className="h-6 w-6 text-fire" />
          <p className="mt-3 font-display text-lg font-semibold">Organizzazione eventi</p>
          <p className="mt-1 text-sm text-white/55">Raccontaci la tua idea o prenota una call dal calendario.</p>
        </a>
        <a href="mailto:info@dbyoung.it" className="card-hover rounded-3xl border border-white/10 bg-obsidian-card p-7">
          <Mail className="h-6 w-6 text-fire" />
          <p className="mt-3 font-display text-lg font-semibold">Email generale</p>
          <p className="mt-1 text-sm text-white/55">info@dbyoung.it (TODO: attivare con Resend)</p>
        </a>
      </Reveal>
      <Reveal delay={0.15} className="mt-6 rounded-[2rem] border border-white/10 bg-obsidian-card p-7">
        <form action="/api/contact" method="post" className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required name="name" placeholder="Nome" className="h-11 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
            <input required type="email" name="email" placeholder="Email" className="h-11 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
          </div>
          <input name="subject" placeholder="Oggetto (es. Beat custom, Evento 12/07, Collab)" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
          <textarea required name="message" rows={5} placeholder="Il tuo messaggio…" className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
          <button className="btn-fire w-full rounded-full py-3.5 text-sm font-semibold">Invia messaggio</button>
        </form>
      </Reveal>
    </div>
  );
}
