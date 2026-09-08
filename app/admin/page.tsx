"use client";

import { useState } from "react";
import { Flame, BarChart3, ShoppingBag, MessageSquare, Upload, LogOut } from "lucide-react";
import { SUPERADMIN_EMAIL } from "@/lib/utils";
import { PRODUCTS } from "@/lib/data";

/**
 * Dashboard admin custom-made (stile Shopify essenziale).
 * Auth: gate via email superadmin in locale — TODO: sostituire con Convex Auth / Clerk / Auth.js
 * e ruoli reali. Dati: mock locale — TODO: collegare a convex (products.ts, stats.ts, chat.ts).
 */
export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"stats" | "prodotti" | "messaggi">("stats");

  // Form upload prodotto (mock → TODO: mutation Convex + Stripe Payment Link API)
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stripe, setStripe] = useState("");
  const [notice, setNotice] = useState("");

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === SUPERADMIN_EMAIL) {
      setAuthed(true);
    } else {
      setNotice("Accesso negato: solo il superadmin può entrare.");
    }
  };

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: picks → convex mutation createProduct + notifica Resend + cron promozionale
    setNotice(`“${title}” pronto alla pubblicazione (mock). Collega Convex + Stripe per andare live.`);
    setTitle(""); setPrice(""); setStripe("");
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian px-4">
        <form onSubmit={login} className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-obsidian-card p-8">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fire to-fire-deep"><Flame className="h-5 w-5 text-white" /></span>
            <div><p className="font-display font-bold">DBYoung Admin</p><p className="text-xs text-white/50">dbyoung.it/admin</p></div>
          </div>
          <label className="mt-6 block text-sm text-white/60">Email superadmin</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="contact.core829@gmail.com" className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none" />
          <button className="btn-fire mt-4 w-full rounded-full py-3 text-sm font-semibold">Accedi</button>
          {notice && <p className="mt-3 text-xs text-fire-ember">{notice}</p>}
          <p className="mt-4 text-[11px] leading-relaxed text-white/35">TODO: sostituire con auth reale (Convex Auth). Mai committare password/chiavi.</p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fire to-fire-deep"><Flame className="h-5 w-5 text-white" /></span>
            <div><p className="font-display font-bold">DBYoung Admin</p><p className="text-xs text-white/50">{SUPERADMIN_EMAIL}</p></div>
          </div>
          <button onClick={() => setAuthed(false)} className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-fire/50 hover:text-white"><LogOut className="h-4 w-4" /> Esci</button>
        </div>

        <div className="mt-6 flex gap-2">
          {([["stats", "Statistiche", BarChart3], ["prodotti", "Prodotti", ShoppingBag], ["messaggi", "Messaggi", MessageSquare]] as const).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${tab === k ? "bg-fire text-white shadow-fire" : "border border-white/15 text-white/65 hover:border-fire/50"}`}>
              <Icon className="h-4 w-4" /> {l}
            </button>
          ))}
        </div>

        {notice && <p className="mt-4 rounded-2xl border border-fire/30 bg-fire/10 px-4 py-3 text-sm text-fire-ember">{notice}</p>}

        {tab === "stats" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Visitatori oggi", "—", "TODO: Convex stats"],
              ["Visite totali", "—", "TODO: Convex stats"],
              ["Click su Compra", "—", "TODO: event tracking"],
              ["Ricavo mese (MR)", "€ —", "TODO: Stripe + Convex"],
            ].map(([l, v, d]) => (
              <div key={l} className="rounded-3xl border border-white/10 bg-obsidian-card p-6">
                <p className="text-xs uppercase tracking-widest text-white/45">{l}</p>
                <p className="mt-2 font-display text-3xl font-bold">{v}</p>
                <p className="mt-1 text-xs text-white/40">{d}</p>
              </div>
            ))}
            <div className="rounded-3xl border border-white/10 bg-obsidian-card p-6 sm:col-span-2 lg:col-span-4">
              <p className="font-display font-semibold">Visitatori live (TODO)</p>
              <p className="mt-1 text-sm text-white/50">Collega Convex (query reactive) per contatore realtime + grafico visite/click/ordini.</p>
            </div>
          </div>
        )}

        {tab === "prodotti" && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <form onSubmit={publish} className="rounded-3xl border border-fire/25 bg-obsidian-card p-6">
              <p className="flex items-center gap-2 font-display font-semibold"><Upload className="h-4 w-4 text-fire" /> Nuovo prodotto (Beat / Pack / Offerta)</p>
              <div className="mt-4 space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Titolo (es. Midnight Brass)" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={price} onChange={(e) => setPrice(e.target.value)} required inputMode="decimal" placeholder="Prezzo €" className="h-11 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none" />
                  <select className="h-11 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white focus:border-fire/60 focus:outline-none">
                    <option>Beat</option><option>Sample Pack</option><option>Offerta</option>
                  </select>
                </div>
                <input value={stripe} onChange={(e) => setStripe(e.target.value)} required placeholder="Stripe Payment Link (https://buy.stripe.com/…)" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none" />
                <input placeholder="URL cover (o upload — TODO: Convex file storage)" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none" />
                <button className="btn-fire w-full rounded-full py-3 text-sm font-semibold">Pubblica nello Shop</button>
              </div>
            </form>
            <div className="space-y-3">
              {PRODUCTS.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-obsidian-card px-4 py-3">
                  <div><p className="text-sm font-semibold">{p.title}</p><p className="text-xs text-white/45">€{p.price} · {p.type}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => setNotice(`CTA “${p.title}” evidenziata in homepage (mock).`)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs hover:border-fire/50">Evidenzia CTA</button>
                    <button onClick={() => setNotice(`“${p.title}” — eliminazione mock. Collegare Convex. `)} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-red-300 hover:border-red-400/50">Rimuovi</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "messaggi" && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-obsidian-card p-6">
            <p className="font-display font-semibold">Inbox (TODO: Convex chat + Resend notify)</p>
            <p className="mt-1 text-sm text-white/50">Qui arriveranno messaggi da chat widget, form contatti e richieste booking — con notifiche email automatiche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
