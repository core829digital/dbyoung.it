"use client";

import { useState } from "react";
import { CalendarCheck, Mail, Phone, Clock, Instagram, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ConsentGate } from "@/components/cookie-banner";
import { CALENDLY_URL } from "@/lib/utils";
import { useLang, PHOTOS, ISOLA } from "@/lib/i18n";
import { pushInbox } from "@/lib/analytics";

export default function EventiPage() {
  const { t } = useLang();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch(form.action, { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      pushInbox({
        type: "booking",
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        day: String(fd.get("date") ?? ""),
        city: String(fd.get("city") ?? ""),
        message: String(fd.get("message") ?? ""),
      });
      form.reset();
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">{t.events.kicker}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {t.events.titleA} <span className="text-fire-gradient">{t.events.titleB}</span>
        </h1>
        <p className="mt-4 leading-relaxed text-white/60">{t.events.sub}</p>
      </Reveal>

      {/* Isola Events — fascia elegante */}
      <Reveal className="relative mt-10 overflow-hidden rounded-[2rem] border border-fire/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PHOTOS.eventsMood} alt={`${ISOLA.name} — ${ISOLA.location}`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
        <div className="relative grid gap-6 p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-fire/40 bg-black/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-fire-ember backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> {t.events.isolaBadge}
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {ISOLA.name} <span className="text-fire-gradient">· {ISOLA.location}</span>
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-white/70">{t.events.isolaText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={ISOLA.instagramLocation} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-5 py-2.5 text-sm text-white backdrop-blur transition-all hover:border-fire/60 hover:text-fire-ember">
                <Instagram className="h-4 w-4" /> {t.events.isolaInsta1}
              </a>
              <a href={ISOLA.instagramEvents} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-5 py-2.5 text-sm text-white backdrop-blur transition-all hover:border-fire/60 hover:text-fire-ember">
                <Instagram className="h-4 w-4" /> {t.events.isolaInsta2}
              </a>
            </div>
            <p className="mt-4 text-xs text-white/45">{t.events.isolaSoon}</p>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-5 lg:grid-cols-5">
        <Reveal className="overflow-hidden rounded-[2rem] border border-white/10 bg-obsidian-card lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
            <CalendarCheck className="h-5 w-5 text-fire" />
            <p className="font-semibold">{t.events.calTitle}</p>
          </div>
          {/* Widget Calendly reale appena disponibile (URL in lib/utils.ts).
              Formato embed ufficiale:
              <div className="calendly-inline-widget" data-url={CALENDLY_URL} style={{minWidth:320,height:700}} /> + script embed */}
          <ConsentGate label="Calendly">
            <iframe src={CALENDLY_URL} title={t.events.calTitle} className="h-[640px] w-full bg-white" loading="lazy" />
          </ConsentGate>
        </Reveal>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <Reveal delay={0.1} className="rounded-[2rem] border border-white/10 bg-obsidian-card p-7">
            <h2 className="font-display text-xl font-semibold">{t.events.contactsTitle}</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-fire" /> {t.events.contactRows[0]}</li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-fire" /> +39 000 000 0000</li>
              <li className="flex items-center gap-3"><Clock className="h-4 w-4 shrink-0 text-fire" /> {t.events.contactRows[2]}</li>
            </ul>
          </Reveal>

          <Reveal delay={0.15} className="rounded-[2rem] border border-fire/25 bg-gradient-to-br from-[#200d00] to-obsidian-card p-7">
            <h2 className="font-display text-xl font-semibold">{t.events.formTitle}</h2>
            <form action="/api/booking" method="post" onSubmit={submit} className="mt-4 space-y-3">
              <input required name="name" placeholder={t.events.name} className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
              <input required type="email" name="email" placeholder={t.events.email} className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="date" name="date" aria-label={t.events.date} className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white focus:border-fire/60 focus:outline-none" />
                <input name="city" placeholder={t.events.city} className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
              </div>
              <textarea required name="message" rows={4} placeholder={t.events.message} className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
              <button disabled={status === "sending"} className="btn-fire w-full rounded-full py-3.5 text-sm font-semibold disabled:opacity-60">
                {status === "sending" ? t.forms.sending : t.events.submit}
              </button>
              {status === "ok" && <p className="text-sm text-fire-ember">{t.forms.okBooking}</p>}
              {status === "err" && <p className="text-sm text-red-300">{t.forms.err}</p>}
              <p className="text-xs text-white/40">{t.events.privacyNote} <a href="/privacy" className="underline hover:text-fire-hot">{t.events.privacyLink}</a>.</p>
            </form>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
