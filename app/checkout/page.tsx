"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { TurnstileWidget } from "@/components/turnstile";
import { useCart } from "@/lib/cart";
import { PRODUCTS } from "@/lib/data";

export default function CheckoutPage() {
  const { items, remove, clear } = useCart();
  const [email, setEmail] = useState("");
  const [accept, setAccept] = useState(false);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "err">("idle");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d?.user?.email) setEmail(d.user.email);
    }).catch(() => undefined);
  }, []);

  const total = items.reduce((s, i) => s + (PRODUCTS.find((p) => p.slug === i.slug)?.price ?? 0), 0);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErr("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map((i) => ({ slug: i.slug, tier: "base" })),
          acceptTerms: accept,
          turnstile: token,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout non riuscito");
      clear();
      window.location.href = data.url as string;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Errore");
      setStatus("err");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Checkout sicuro Stripe</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">Il tuo <span className="text-fire-gradient">ordine</span></h1>
      </Reveal>

      {items.length === 0 ? (
        <Reveal className="mt-10 rounded-[2rem] border border-white/10 bg-obsidian-card p-10 text-center">
          <p className="text-white/60">Il carrello è vuoto.</p>
          <Link href="/shop" className="btn-fire mt-6 inline-block rounded-full px-8 py-3 text-sm font-semibold">Torna allo shop</Link>
        </Reveal>
      ) : (
        <Reveal delay={0.1} className="mt-10 rounded-[2rem] border border-white/10 bg-obsidian-card p-7">
          <ul className="space-y-3">
            {items.map((i) => {
              const p = PRODUCTS.find((x) => x.slug === i.slug);
              if (!p) return null;
              return (
                <li key={i.slug} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{p.title}</p>
                    <p className="text-xs text-white/45">€{p.price} · licenza base (file WAV)</p>
                  </div>
                  <button onClick={() => remove(i.slug)} aria-label={`Rimuovi ${p.title}`} className="text-white/40 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-right font-display text-2xl font-bold">Totale €{total}</p>

          <form onSubmit={pay} className="mt-6 space-y-3">
            <div>
              <label htmlFor="co-email" className="mb-1 block text-xs text-white/60">Email (riceverai i codici licenza)</label>
              <input id="co-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} autoComplete="email" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
            </div>
            <label className="flex items-start gap-2 text-xs text-white/60">
              <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} required className="mt-0.5" />
              <span>Accetto i <Link href="/termini#licenze" className="underline hover:text-fire-hot">termini di licenza</Link> e la <Link href="/privacy" className="underline hover:text-fire-hot">privacy policy</Link>.</span>
            </label>
            <TurnstileWidget onToken={setToken} />
            <button disabled={status === "sending"} className="btn-fire flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold disabled:opacity-60">
              <ShieldCheck className="h-4 w-4" /> {status === "sending" ? "Reindirizzamento…" : `Paga €${total} con Stripe`}
            </button>
            {status === "err" && <p className="text-sm text-red-300">{err}</p>}
            <p className="text-[11px] text-white/40">I diritti (licenze download) vengono emessi solo a pagamento confermato da Stripe.</p>
          </form>
        </Reveal>
      )}
    </div>
  );
}
