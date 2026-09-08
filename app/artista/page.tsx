import Link from "next/link";
import { ArrowRight, Music2, Guitar, Piano, Drum } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/reveal";

export const metadata = { title: "Chi è DBYoung · Dimitri Bouturline" };

export default function ArtistaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Dimitri Bouturline</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
            DB<span className="text-fire-gradient">Young</span>
          </h1>
          <p className="mt-5 leading-relaxed text-white/65">
            Artista e compositore a 360 gradi: jazz, blues e musica classica con un tono moderno, attivo ed energetico.
            Lavora con strumenti vivi e reali — piano, chitarra, basso, batteria e fiati — tra studio e palco.
          </p>
          <p className="mt-4 leading-relaxed text-white/65">
            Il suo suono unisce la tradizione jazz, blues e classica alla produzione contemporanea: perfetto per artisti che cercano
            beat con carattere, sample pack registrati live e show dal vivo ad alta energia.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-fire inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">Compra i Beat <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/eventi" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm text-white/85 transition-all hover:border-fire/60 hover:text-fire-ember">Collabora</Link>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="overflow-hidden rounded-[2rem] border border-white/10">
            {/* TODO: sostituire con foto reale di Dimitri */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1000&q=80" alt="Dimitri Bouturline — DBYoung (foto placeholder)" className="aspect-[4/5] w-full object-cover" />
          </div>
        </Reveal>
      </div>

      <div className="mt-20">
        <SectionHeading kicker="Il suono" title="Strumenti veri, energia moderna" sub="Ogni produzione nasce da take live, poi rifinite con produzione contemporanea." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Piano, "Keys & Piano", "Rhodes, Wurlitzer, piano acustico"],
            [Guitar, "Chitarre Blues", "Riff, lick e ritmiche live"],
            [Drum, "Batteria Live", "Groove e fill registrati in studio"],
            [Music2, "Fiati & Horns", "Sezioni ottoni ad alta energia"],
          ].map(([Icon, t, d]: any) => (
            <Reveal key={t as string} className="card-hover rounded-3xl border border-white/10 bg-obsidian-card p-6">
              <Icon className="h-6 w-6 text-fire" />
              <p className="mt-3 font-display font-semibold">{t as string}</p>
              <p className="mt-1 text-sm text-white/55">{d as string}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
