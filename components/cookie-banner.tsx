"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";

const KEY = "dby-consent-v1";
export type Consent = "accepted" | "essential" | null;

export function getConsent(): Consent {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY);
  return v === "accepted" || v === "essential" ? v : null;
}

export function setConsent(v: Exclude<Consent, null>) {
  localStorage.setItem(KEY, v);
  window.dispatchEvent(new CustomEvent("dby-consent", { detail: v }));
}

export function useConsent(): Consent {
  const [c, setC] = useState<Consent>(null);
  useEffect(() => {
    setC(getConsent());
    const on = (e: Event) => setC((e as CustomEvent<Consent>).detail);
    window.addEventListener("dby-consent", on);
    return () => window.removeEventListener("dby-consent", on);
  }, []);
  return c;
}

/** Banner consenso GDPR: blocca i contenuti terzi fino a scelta esplicita. */
export function CookieBanner() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsent()) {
      const id = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(id);
    }
  }, []);

  if (!visible) return null;

  const choose = (v: Exclude<Consent, null>) => {
    setConsent(v);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] sm:right-auto sm:max-w-md">
      <div className="rounded-3xl border border-white/15 bg-black/90 p-5 shadow-card backdrop-blur-xl">
        <p className="flex items-center gap-2 font-display font-semibold text-white">
          <Cookie className="h-4 w-4 text-fire" /> Cookie
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          {t.consent.text}{" "}
          <Link href="/cookie" className="underline hover:text-fire-hot">{t.consent.policy}</Link>
        </p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => choose("accepted")} className="btn-fire flex-1 rounded-full py-2.5 text-sm font-semibold">
            {t.consent.accept}
          </button>
          <button onClick={() => choose("essential")} className="flex-1 rounded-full border border-white/20 py-2.5 text-sm text-white/80 transition-all hover:border-fire/50 hover:text-white">
            {t.consent.reject}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Mostra iframe terzi solo dopo consenso; altrimenti segnaposto elegante. */
export function ConsentGate({ children, label }: { children: ReactNode; label: string }) {
  const { t } = useLang();
  const consent = useConsent();

  if (consent === "accepted") return <>{children}</>;

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 bg-obsidian-soft p-8 text-center">
      <ShieldCheck className="h-8 w-8 text-fire" />
      <p className="font-display font-semibold text-white">{t.consent.gateTitle} — {label}</p>
      <p className="max-w-sm text-sm text-white/55">{t.consent.gateText}</p>
      {consent !== null && (
        <button onClick={() => setConsent("accepted")} className="btn-fire rounded-full px-6 py-2.5 text-sm font-semibold">
          {t.consent.gateButton}
        </button>
      )}
    </div>
  );
}
