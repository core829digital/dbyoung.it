"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/reveal";

function ResetForm() {
  const params = useSearchParams();
  const preset = params.get("token") ?? "";
  const [token, setToken] = useState(preset);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore");
      setStatus("ok");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Errore");
      setStatus("err");
    }
  };

  if (status === "ok") {
    return (
      <p className="text-sm text-fire-ember">
        Password aggiornata. <Link href="/account" className="underline">Accedi</Link>.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Token dal link email" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 font-mono text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nuova password (min 12 caratteri)" autoComplete="new-password" className="h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none" />
      <button className="btn-fire w-full rounded-full py-3 text-sm font-semibold">Reimposta password</button>
      {status === "err" && <p className="text-sm text-red-300">{err}</p>}
    </form>
  );
}

export default function ResetPage() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="text-center">
        <h1 className="font-display text-4xl font-semibold">Reset <span className="text-fire-gradient">password</span></h1>
      </Reveal>
      <Reveal delay={0.1} className="mt-8 rounded-[2rem] border border-white/10 bg-obsidian-card p-7">
        <Suspense fallback={<p className="text-sm text-white/50">Caricamento…</p>}>
          <ResetForm />
        </Suspense>
      </Reveal>
    </div>
  );
}
