"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Download, ShieldCheck, XCircle } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { useLang, PHOTOS } from "@/lib/i18n";

interface Verified {
  slug: string;
  title: string;
  type: string;
  cover: string;
  preview: string;
}

export default function LibreriaPage() {
  const { t } = useLang();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "err">("idle");
  const [product, setProduct] = useState<Verified | null>(null);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("checking");
    setProduct(null);
    try {
      const res = await fetch(`/api/licenses/verify?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.valid) {
        setProduct(data.product);
        setStatus("ok");
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">{t.library.kicker}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {t.library.titleA} <span className="text-fire-gradient">{t.library.titleB}</span>
        </h1>
        <p className="mt-4 leading-relaxed text-white/60">{t.library.sub}</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 rounded-[2rem] border border-white/10 bg-obsidian-card p-7 md:p-10">
        <form onSubmit={verify} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fire" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t.library.codePlaceholder}
              className="h-13 w-full rounded-full border border-white/15 bg-black/40 py-3.5 pl-11 pr-4 font-mono text-sm tracking-widest text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none"
            />
          </div>
          <button disabled={status === "checking"} className="btn-fire rounded-full px-8 py-3.5 text-sm font-semibold disabled:opacity-60">
            {status === "checking" ? t.library.checking : t.library.check}
          </button>
        </form>

        {status === "err" && (
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-red-300">
            <XCircle className="h-4 w-4" /> {t.library.invalid}
          </p>
        )}

        {status === "ok" && product && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-fire/30 bg-black/50">
            <div className="flex flex-col items-center gap-5 p-6 sm:flex-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.cover} alt={product.title} className="h-28 w-28 rounded-2xl border border-white/10 object-cover" />
              <div className="flex-1 text-center sm:text-left">
                <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-fire-ember sm:justify-start">
                  <ShieldCheck className="h-3.5 w-3.5" /> {t.library.yourFile}
                </p>
                <p className="mt-1 font-display text-xl font-semibold text-white">{product.title}</p>
                {product.preview && (
                  <audio controls preload="none" src={product.preview} className="mt-3 h-9 w-full max-w-sm" />
                )}
              </div>
              <a
                href={`/api/download/${product.slug}?license=${encodeURIComponent(code.trim())}`}
                className="btn-fire flex shrink-0 items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
              >
                <Download className="h-4 w-4" /> {t.library.download}
              </a>
            </div>
            <p className="border-t border-white/10 px-6 py-3 text-center text-xs text-white/40">{t.library.downloadHint}</p>
          </div>
        )}
      </Reveal>

      <Reveal delay={0.15} className="mt-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTOS.logo} alt="DBYoung" className="mx-auto h-12 w-12 rounded-full object-cover opacity-70" />
        <p className="mt-3 text-sm text-white/45">
          <Link href="/shop" className="underline hover:text-fire-hot">Shop</Link>
        </p>
      </Reveal>
    </div>
  );
}
