import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { PRODUCTS } from "@/lib/data";

export const metadata = { title: "Shop · Beat & Sample Pack — DBYoung" };

export default async function ShopPage({ searchParams }: { searchParams?: Promise<{ type?: string }> }) {
  const filter = (await searchParams)?.type;
  const list = filter ? PRODUCTS.filter((p) => p.type === filter.replace("-", "-")) : PRODUCTS;
  const shown = filter ? PRODUCTS.filter((p) => p.type === (filter as string)) : PRODUCTS;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="max-w-3xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Shop · shop.dbyoung.it</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Beat & <span className="text-fire-gradient">Sample Pack</span>
        </h1>
        <p className="mt-4 leading-relaxed text-white/60">
          Strumenti veri, mix pronti, licenze chiare. Paghi in sicurezza con Stripe (Payment Link) e ricevi i file via email.
          Anteprime audio complete in arrivo.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-2">
        {[
          ["Tutti", "/shop"],
          ["Beats", "/shop?type=beat"],
          ["Sample Packs", "/shop?type=sample-pack"],
          ["Offerte", "/shop?type=offerta"],
        ].map(([l, h]) => (
          <a key={h} href={h} className={`rounded-full border px-5 py-2.5 text-sm transition-all ${(!filter && l === "Tutti") || filter === h.split("=")[1] ? "border-fire bg-fire/15 text-fire-ember" : "border-white/15 text-white/70 hover:border-fire/50 hover:text-white"}`}>
            {l}
          </a>
        ))}
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(shown.length ? shown : list).map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
      </div>

      <Reveal className="mt-14 rounded-[2rem] border border-fire/25 bg-gradient-to-br from-[#200d00] to-obsidian-card p-8 text-center md:p-12">
        <h2 className="font-display text-2xl font-semibold md:text-4xl">Vuoi un beat <span className="text-fire-gradient">su misura?</span></h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 md:text-base">Commissiona una produzione esclusiva: raccontaci riferimenti, BPM e mood — consegna con stems e licenza esclusiva.</p>
        <a href="/eventi" className="btn-fire mt-6 inline-flex rounded-full px-8 py-3.5 font-semibold">Richiedi produzione custom</a>
      </Reveal>
    </div>
  );
}
