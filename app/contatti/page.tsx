"use client";

import { useState } from "react";
import { Mail, CalendarCheck } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";
import { pushInbox } from "@/lib/analytics";

export default function ContattiPage() {
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
        type: "contact",
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        subject: String(fd.get("subject") ?? ""),
        message: String(fd.get("message") ?? ""),
      });
      form.reset();
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">{t.contact.kicker}</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">{t.contact.titleA} <span className="text-fire-gradient">{t.contact.titleB}</span></h1>
        <p className="mt-4 text-white/60">{t.contact.sub}</p>
      </Reveal>
      <Reveal delay={0.1} className="mt-10 grid gap-4 sm:grid-cols-2">
        <a href="/eventi" className="card-hover rounded-3xl border border-fire/30 bg-gradient-to-br from-[#200d00] to-obsidian-card p-7">
          <CalendarCheck className="h-6 w-6 text-fire" />
          <p className="mt-3 font-display text-lg font-semibold">{t.contact.card1T}</p>
          <p className="mt-1 text-sm text-white/55">{t.contact.card1D}</p>
        </a>
        <a href="mailto:info@dbyoung.it" className="card-hover rounded-3xl border border-white/10 bg-obsidian-card p-7">
          <Mail className="h-6 w-6 text-fire" />
          <p className="mt-3 font-display text-lg font-semibold">{t.contact.card2T}</p>
          <p className="mt-1 text-sm text-white/55">{t.contact.card2D}</p>
        </a>
      </Reveal>
      <Reveal delay={0.15} className="mt-6 rounded-[2rem] border border-white/10 bg-obsidian-card p-7">
        <form action="/api/contact" method="post" onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required name="name" placeholder={t.contact.name} className="h-11 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
            <input required type="email" name="email" placeholder={t.contact.email} className="h-11 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
          </div>
          <input name="subject" placeholder={t.contact.subject} className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
          <textarea required name="message" rows={5} placeholder={t.contact.message} className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
          <button disabled={status === "sending"} className="btn-fire w-full rounded-full py-3.5 text-sm font-semibold disabled:opacity-60">
            {status === "sending" ? t.forms.sending : t.contact.submit}
          </button>
          {status === "ok" && <p className="text-sm text-fire-ember">{t.forms.okContact}</p>}
          {status === "err" && <p className="text-sm text-red-300">{t.forms.err}</p>}
        </form>
      </Reveal>
    </div>
  );
}
