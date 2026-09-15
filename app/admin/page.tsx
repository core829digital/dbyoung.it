"use client";

import { useEffect, useState } from "react";
import { BarChart3, ShoppingBag, MessageSquare, Upload, LogOut, Trash2, Inbox } from "lucide-react";
import { SUPERADMIN_EMAIL } from "@/lib/utils";
import { PHOTOS } from "@/lib/i18n";
import { PRODUCTS, ARTWORK_PACKS, type Product, type ProductType } from "@/lib/data";
import {
  getStats,
  getInbox,
  clearInbox,
  getCustomProducts,
  addCustomProduct,
  removeCustomProduct,
  type Stats,
  type InboxItem,
} from "@/lib/analytics";
import { cloudFetchOverview, convexConfigured, type CloudOverview } from "@/lib/backend";

/**
 * Dashboard admin custom-made (stile Shopify essenziale).
 * Dati local-first (localStorage), pronti alla migrazione su Convex.
 */
export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [authed, setAuthed] = useState(false);
  const [denied, setDenied] = useState(false);
  const [tab, setTab] = useState<"stats" | "prodotti" | "messaggi">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [cloud, setCloud] = useState<CloudOverview | null>(null);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [custom, setCustom] = useState<Product[]>([]);
  const [notice, setNotice] = useState("");

  // Form nuovo prodotto
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProductType>("beat");
  const [price, setPrice] = useState("");
  const [stripe, setStripe] = useState("");
  const [desc, setDesc] = useState("");

  const refresh = () => {
    setStats(getStats());
    setInbox(getInbox());
    setCustom(getCustomProducts());
    if (convexConfigured()) cloudFetchOverview().then((o) => o && setCloud(o));
  };

  useEffect(() => {
    if (authed) refresh();
  }, [authed, tab]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === SUPERADMIN_EMAIL) {
      setAuthed(true);
      setDenied(false);
    } else {
      setDenied(true);
    }
  };

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `custom-${Date.now()}`;
    addCustomProduct({
      id,
      slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`,
      title,
      type,
      price: Number(price),
      cover: ARTWORK_PACKS,
      stripeLink: stripe,
      tags: [type],
      description: desc || title,
    });
    setTitle(""); setPrice(""); setStripe(""); setDesc("");
    setNotice(`“${title}” pubblicato nello shop.`);
    refresh();
  };

  const titleOf = (id: string) =>
    PRODUCTS.find((p) => p.id === id)?.title ?? custom.find((p) => p.id === id)?.title ?? id;

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-obsidian px-4">
        <form onSubmit={login} className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-obsidian-card p-8">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.logo} alt="DBYoung logo" className="h-10 w-10 rounded-full object-cover" />
            <div><p className="font-display font-bold">Admin</p><p className="text-xs text-white/50">dbyoung.it/admin</p></div>
          </div>
          <label className="mt-6 block text-sm text-white/60">Email superadmin</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="contact.core829@gmail.com" className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none" />
          <button className="btn-fire mt-4 w-full rounded-full py-3 text-sm font-semibold">Accedi</button>
          {denied && <p className="mt-3 text-xs text-fire-ember">Accesso negato: solo il superadmin può entrare.</p>}
          <p className="mt-4 text-[11px] leading-relaxed text-white/35">Accesso riservato al superadmin.</p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PHOTOS.logo} alt="DBYoung logo" className="h-10 w-10 rounded-full object-cover" />
            <div><p className="font-display font-bold">Admin</p><p className="text-xs text-white/50">{SUPERADMIN_EMAIL}</p></div>
          </div>
          <button onClick={() => setAuthed(false)} className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-fire/50 hover:text-white"><LogOut className="h-4 w-4" /> Esci</button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {([["stats", "Statistiche", BarChart3], ["prodotti", "Prodotti", ShoppingBag], ["messaggi", `Messaggi (${inbox.length})`, MessageSquare]] as const).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${tab === k ? "bg-fire text-white shadow-fire" : "border border-white/15 text-white/65 hover:border-fire/50"}`}>
              <Icon className="h-4 w-4" /> {l}
            </button>
          ))}
        </div>

        {notice && <p className="mt-4 rounded-2xl border border-fire/30 bg-fire/10 px-4 py-3 text-sm text-fire-ember">{notice}</p>}

        {tab === "stats" && stats && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Visitatori oggi", String(stats.todayViews)],
              ["Visite totali", String(cloud?.totalViews ?? stats.totalViews)],
              ["Click su Compra", String(stats.buyClicks)],
              ["Ordini / Ricavo", cloud ? `${cloud.orders} ordini · €${cloud.revenue}` : "€ —"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-3xl border border-white/10 bg-obsidian-card p-6">
                <p className="text-xs uppercase tracking-widest text-white/45">{l}</p>
                <p className="mt-2 font-display text-3xl font-bold">{v}</p>
              </div>
            ))}
            <div className="rounded-3xl border border-white/10 bg-obsidian-card p-6 sm:col-span-2">
              <p className="font-display font-semibold">Pagine più viste</p>
              {stats.topPages.length === 0 && <p className="mt-2 text-sm text-white/45">Nessun dato ancora — naviga il sito per generare statistiche.</p>}
              <ul className="mt-3 space-y-1.5 text-sm">
                {stats.topPages.map((r) => (
                  <li key={r.path} className="flex justify-between text-white/65"><span>{r.path}</span><strong className="text-white">{r.count}</strong></li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-obsidian-card p-6 sm:col-span-2">
              <p className="font-display font-semibold">Click per prodotto</p>
              {stats.clicksByProduct.length === 0 && <p className="mt-2 text-sm text-white/45">Nessun click ancora.</p>}
              <ul className="mt-3 space-y-1.5 text-sm">
                {stats.clicksByProduct.map((r) => (
                  <li key={r.id} className="flex justify-between text-white/65"><span>{titleOf(r.id)}</span><strong className="text-fire-ember">{r.count}</strong></li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "prodotti" && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <form onSubmit={publish} className="h-fit rounded-3xl border border-fire/25 bg-obsidian-card p-6">
              <p className="flex items-center gap-2 font-display font-semibold"><Upload className="h-4 w-4 text-fire" /> Nuovo prodotto (Beat / Pack / Offerta)</p>
              <div className="mt-4 space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Titolo (es. Midnight Brass)" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={price} onChange={(e) => setPrice(e.target.value)} required inputMode="decimal" placeholder="Prezzo €" className="h-11 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none" />
                  <select value={type} onChange={(e) => setType(e.target.value as ProductType)} className="h-11 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white focus:border-fire/60 focus:outline-none">
                    <option value="beat">Beat</option><option value="sample-pack">Sample Pack</option><option value="offerta">Offerta</option>
                  </select>
                </div>
                <input value={stripe} onChange={(e) => setStripe(e.target.value)} required placeholder="Stripe Payment Link (https://buy.stripe.com/…)" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none" />
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Descrizione breve" className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-fire/60 focus:outline-none" />
                <button className="btn-fire w-full rounded-full py-3 text-sm font-semibold">Pubblica nello Shop</button>
              </div>
            </form>
            <div className="space-y-3">
              {custom.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl border border-fire/25 bg-obsidian-card px-4 py-3">
                  <div><p className="text-sm font-semibold">{p.title} <span className="ml-1 rounded-full bg-fire/15 px-2 py-0.5 text-[10px] text-fire-ember">NUOVO</span></p><p className="text-xs text-white/45">€{p.price} · {p.type}</p></div>
                  <button onClick={() => { removeCustomProduct(p.id); refresh(); }} className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs text-red-300 hover:border-red-400/50"><Trash2 className="h-3 w-3" /> Rimuovi</button>
                </div>
              ))}
              {PRODUCTS.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-obsidian-card px-4 py-3 opacity-70">
                  <div><p className="text-sm font-semibold">{p.title}</p><p className="text-xs text-white/45">€{p.price} · {p.type} · catalogo base</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "messaggi" && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-obsidian-card p-6">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-display font-semibold"><Inbox className="h-4 w-4 text-fire" /> Inbox — newsletter, booking, contatti</p>
              {inbox.length > 0 && <button onClick={() => { clearInbox(); refresh(); }} className="text-xs text-white/45 underline hover:text-white">Svuota</button>}
            </div>
            {inbox.length === 0 && <p className="mt-3 text-sm text-white/45">Nessun messaggio. I form del sito salvano qui una copia e inviano email automatiche.</p>}
            <div className="mt-4 space-y-3">
              {inbox.map((m) => (
                <div key={m.id} className="rounded-2xl border border-white/10 bg-black/40 p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-fire/15 px-2.5 py-0.5 text-[11px] font-semibold text-fire-ember">{m.type}</span>
                    <span className="text-white/80">{m.name ?? m.email}</span>
                    <span className="text-xs text-white/40">{new Date(m.date).toLocaleString()}</span>
                  </div>
                  {(m.subject || m.city || m.day) && <p className="mt-1.5 text-white/65">{[m.subject, m.city, m.day].filter(Boolean).join(" · ")}</p>}
                  {m.message && <p className="mt-1 text-white/55">{m.message}</p>}
                  <p className="mt-1 text-xs text-white/40">{m.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
