import Link from "next/link";
import { ArrowRight, Disc3, CalendarCheck, Flame, Music4, Radio, Star } from "lucide-react";
import { DBYoungHero } from "@/components/ui/prisma-hero";
import { Reveal, SectionHeading } from "@/components/reveal";
import { ProductCard } from "@/components/product-card";
import { PRODUCTS } from "@/lib/data";
import { SOCIALS } from "@/lib/utils";

export default function Home() {
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <DBYoungHero />

      {/* Trust / stats bar */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <Reveal className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["100%", "Strumenti veri"],
            ["360°", "Compositore"],
            ["Live", "Fiati & band"],
            ["24h", "Consegna file"],
          ].map(([v, l]) => (
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
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">L&apos;artista</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
              Jazz, blues e classica con un <span className="text-fire-gradient">tono moderno</span>, attivo ed energetico.
            </h2>
            <p className="mt-5 leading-relaxed text-white/60">
              Dimitri Bouturline, in arte <strong className="text-white">DBYoung</strong>, è un compositore a 360
              gradi: spazia dal jazz al blues fino alla musica classica, scrivendo, arrangiando e producendo con strumenti vivi e reali — dal piano ai fiati, dalla chitarra
                alla batteria. Un ponte tra tradizione jazz, blues e classica e il suono di oggi.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/artista" className="btn-fire inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                Scopri la storia <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/musica" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm text-white/85 transition-all hover:border-fire/60 hover:text-fire-ember">
                <Disc3 className="h-4 w-4" /> Ascolta
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1000&q=80" alt="DBYoung — eventi, jazz, blues e musica classica" className="aspect-[4/5] w-full object-cover md:aspect-square" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2 text-sm text-white/80"><Flame className="h-4 w-4 text-fire" /> Eventi · Studio · Collab</div>
                <Link href="/eventi" className="text-sm font-semibold text-fire-hot hover:text-fire-ember">Prenota →</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Shop preview */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeading kicker="Shop" title={<>Beat & Sample Pack <span className="text-fire-gradient">in evidenza</span></>} sub="File pronti al mix, registrati con strumenti veri. Pagamento sicuro con Stripe." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
        </div>
        <Reveal className="mt-10 text-center">
          <Link href="/shop" className="btn-fire inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold">
            Vai allo Shop completo <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      {/* Eventi CTA */}
      <section className="relative overflow-hidden border-y border-fire/20 bg-gradient-to-br from-[#1a0b00] via-obsidian to-obsidian">
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-20 md:grid-cols-2 md:px-8">
          <Reveal>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Eventi & Booking</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">Organizza il tuo evento <span className="text-fire-gradient">con DBYoung.</span></h2>
            <p className="mt-4 leading-relaxed text-white/60">Club, festival, eventi privati e collaborazioni: Dimitri li organizza e li produce. Prenota una call conoscitiva: raccontaci la tua idea, al resto pensiamo noi — scaletta, artisti, band e produzione.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/eventi" className="btn-fire inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold">
                <CalendarCheck className="h-4 w-4" /> Organizza ora
              </Link>
              <a href={SOCIALS.spotify} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm text-white/85 transition-all hover:border-fire/60 hover:text-fire-ember">
                <Radio className="h-4 w-4" /> Spotify
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid grid-cols-2 gap-3">
              {[["Club & Live", Music4], ["Festival", Star], ["Privati", CalendarCheck], ["Collab", Disc3]].map(([l, Icon]: any) => (
                <div key={l as string} className="card-hover rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur">
                  <Icon className="h-6 w-6 text-fire" />
                  <p className="mt-3 font-display font-semibold">{l as string}</p>
                  <p className="mt-1 text-xs text-white/50">Set su misura</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
        <SectionHeading kicker="Newsletter" title="Beat gratis ogni mese." sub="Iscriviti: un beat free, sconti sugli sample pack e prevendite eventi. Zero spam." />
        <Reveal delay={0.1}>
          <form action="/api/newsletter" method="post" className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input required type="email" name="email" placeholder="la-tua-email@esempio.it" className="h-13 flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
            <button className="btn-fire rounded-full px-7 py-3.5 text-sm font-semibold">Iscriviti</button>
          </form>
          <p className="mt-3 text-xs text-white/40">Iscrivendoti accetti la <Link href="/privacy" className="underline hover:text-fire-hot">Privacy Policy</Link>.</p>
        </Reveal>
      </section>
    </>
  );
}
