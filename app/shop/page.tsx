"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { PRODUCTS, type Product } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { getCustomProducts } from "@/lib/analytics";
import { cloudFetchProducts, convexConfigured } from "@/lib/backend";

const FILTERS = [
  { key: 0, type: undefined as string | undefined },
  { key: 1, type: "beat" },
  { key: 2, type: "sample-pack" },
  { key: 3, type: "offerta" },
];

function ShopInner() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const filter = searchParams.get("type") ?? undefined;
  const [custom, setCustom] = useState<Product[]>([]);
  useEffect(() => {
    setCustom(getCustomProducts());
    // Prodotti live da Convex (se il backend ha dati, sostituiscono i locali)
    if (convexConfigured()) {
      cloudFetchProducts().then((cloud) => {
        if (cloud && cloud.length > 0) setCustom(cloud);
      });
    }
  }, [filter]);
  const catalog = [...custom, ...PRODUCTS];
  const shown = filter ? catalog.filter((p) => p.type === filter) : catalog;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="max-w-3xl">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">{t.shop.kicker}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {t.shop.titleA} <span className="text-fire-gradient">{t.shop.titleB}</span>
        </h1>
        <p className="mt-4 leading-relaxed text-white/60">{t.shop.sub}</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map(({ key, type }) => {
          const href = type ? `/shop?type=${type}` : "/shop";
          const active = (filter ?? undefined) === type;
          return (
            <a key={href} href={href} className={`rounded-full border px-5 py-2.5 text-sm transition-all ${active ? "border-fire bg-fire/15 text-fire-ember" : "border-white/15 text-white/70 hover:border-fire/50 hover:text-white"}`}>
              {t.shop.filters[key]}
            </a>
          );
        })}
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
      </div>

      <Reveal className="mt-14 rounded-[2rem] border border-fire/25 bg-gradient-to-br from-[#200d00] to-obsidian-card p-8 text-center md:p-12">
        <h2 className="font-display text-2xl font-semibold md:text-4xl">{t.shop.customTitleA} <span className="text-fire-gradient">{t.shop.customTitleB}</span></h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 md:text-base">{t.shop.customText}</p>
        <a href="/eventi" className="btn-fire mt-6 inline-flex rounded-full px-8 py-3.5 font-semibold">{t.shop.customCta}</a>
      </Reveal>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopInner />
    </Suspense>
  );
}
