"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, LogOut, KeyRound } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { TurnstileWidget } from "@/components/turnstile";

interface User {
  id: string;
  email: string;
  role: string;
  totpEnabled: boolean;
  isAdmin: boolean;
}

type Mode = "loading" | "login" | "register" | "verify" | "reset-req" | "twofa" | "user";

async function post(path: string, body: Record<string, unknown>) {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Errore");
  return data;
}

export default function AccountPage() {
  const [mode, setMode] = useState<Mode>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState("");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [qr, setQr] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [useBackup, setUseBackup] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data.user);
      setMode("user");
    } catch {
      setMode("login");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const run = async (fn: () => Promise<void>) => {
    setErr("");
    setMsg("");
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Errore");
    }
  };

  const inputCls = "h-11 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white placeholder:text-white/35 focus:border-fire/60 focus:outline-none";

  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-28 md:px-8">
      <Reveal className="text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-fire-hot">Portale cliente</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Il tuo <span className="text-fire-gradient">account</span></h1>
      </Reveal>

      <Reveal delay={0.1} className="mt-8 rounded-[2rem] border border-white/10 bg-obsidian-card p-7">
        {mode === "loading" && <p className="text-center text-sm text-white/50">Caricamento…</p>}

        {(mode === "login" || mode === "register") && (
          <div>
            <div className="mb-5 flex gap-2">
              {(["login", "register"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setErr(""); }} className={`flex-1 rounded-full py-2.5 text-sm font-semibold ${mode === m ? "btn-fire" : "border border-white/15 text-white/70"}`}>
                  {m === "login" ? "Accedi" : "Registrati"}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  if (mode === "register") {
                    await post("/api/auth/register", { email, password, turnstile: token });
                    setMsg("Controlla l'email: inserisci il codice a 6 cifre.");
                    setMode("verify");
                  } else {
                    const d = await post("/api/auth/login", { email, password, turnstile: token });
                    if (d.need2fa) {
                      setChallenge(d.challenge);
                      setCode("");
                      setUseBackup(false);
                      setMode("twofa");
                    } else {
                      setUser(d.user);
                      setMode("user");
                    }
                  }
                });
              }}
              className="space-y-3"
            >
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className={inputCls} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "register" ? "Password (min 12 caratteri)" : "Password"} autoComplete={mode === "register" ? "new-password" : "current-password"} className={inputCls} />
              <TurnstileWidget onToken={setToken} />
              <button className="btn-fire w-full rounded-full py-3 text-sm font-semibold">{mode === "register" ? "Crea account" : "Accedi"}</button>
            </form>
            <button onClick={() => setMode("reset-req")} className="mt-3 text-xs text-white/50 underline hover:text-white">Password dimenticata?</button>
          </div>
        )}

        {mode === "verify" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await post("/api/auth/verify-email", { email, code });
                setMsg("Email verificata: ora accedi.");
                setMode("login");
              });
            }}
            className="space-y-3"
          >
            <p className="text-sm text-white/65">Codice inviato a <strong>{email}</strong> (scade tra 15 minuti).</p>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" inputMode="numeric" maxLength={6} className={`${inputCls} text-center font-mono tracking-[0.5em]`} />
            <button className="btn-fire w-full rounded-full py-3 text-sm font-semibold">Verifica email</button>
          </form>
        )}

        {mode === "reset-req" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await post("/api/auth/request-reset", { email, turnstile: token });
                setMsg("Se l'account esiste, riceverai il link di reset.");
              });
            }}
            className="space-y-3"
          >
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" className={inputCls} />
            <TurnstileWidget onToken={setToken} />
            <button className="btn-fire w-full rounded-full py-3 text-sm font-semibold">Invia link di reset</button>
            <button type="button" onClick={() => setMode("login")} className="text-xs text-white/50 underline">Torna al login</button>
          </form>
        )}

        {mode === "twofa" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                const d = useBackup
                  ? await post("/api/auth/backup-code", { challenge, code: code.toUpperCase() })
                  : await post("/api/auth/verify-2fa", { challenge, code });
                setUser(d.user);
                setMode("user");
              });
            }}
            className="space-y-3"
          >
            <p className="flex items-center gap-2 text-sm text-white/70"><ShieldCheck className="h-4 w-4 text-fire" /> Verifica in due passaggi</p>
            <input
              value={code} onChange={(e) => setCode(e.target.value)} placeholder={useBackup ? "Codice di recupero" : "000000"}
              inputMode={useBackup ? "text" : "numeric"} maxLength={useBackup ? 8 : 6}
              className={`${inputCls} text-center font-mono tracking-[0.3em]`}
            />
            <button className="btn-fire w-full rounded-full py-3 text-sm font-semibold">Verifica</button>
            <button type="button" onClick={() => { setUseBackup((v) => !v); setCode(""); }} className="text-xs text-white/50 underline">
              {useBackup ? "Usa l'app authenticator" : "Usa un codice di recupero"}
            </button>
          </form>
        )}

        {mode === "user" && user && (
          <div className="space-y-5">
            <div>
              <p className="font-display text-lg font-semibold">{user.email}</p>
              <p className="text-xs text-white/45">Ruolo: {user.role} · 2FA: {user.totpEnabled ? "attiva" : "non attiva"}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link href="/libreria" className="rounded-full border border-white/15 px-4 py-2 text-white/80 hover:border-fire/50">Le mie licenze</Link>
              {user.isAdmin && <Link href="/admin" className="rounded-full border border-fire/40 px-4 py-2 text-fire-ember">Pannello admin</Link>}
              <button
                onClick={() => run(async () => { await post("/api/auth/logout", {}); setUser(null); setMode("login"); })}
                className="flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-white/70 hover:border-red-400/50"
              >
                <LogOut className="h-3.5 w-3.5" /> Esci
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold"><KeyRound className="h-4 w-4 text-fire" /> Autenticazione a due fattori</p>
              {!user.totpEnabled && !qr && (
                <button
                  onClick={() => run(async () => {
                    const d = await post("/api/auth/totp-setup", {});
                    setQr(d.qr);
                    setManualKey(d.manualKey);
                    setCode("");
                  })}
                  className="mt-3 rounded-full border border-fire/40 px-5 py-2 text-sm text-fire-ember"
                >
                  Attiva 2FA
                </button>
              )}
              {!user.totpEnabled && qr && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run(async () => {
                      const d = await post("/api/auth/totp-enable", { code });
                      setBackupCodes(d.backupCodes);
                      setQr("");
                      await refresh();
                    });
                  }}
                  className="mt-3 space-y-3"
                >
                  {/* Data URL generata runtime: next/image non ottimizza i data URL, <img> è corretto qui */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt="QR 2FA" className="h-48 w-48 rounded-xl bg-white p-2" />
                  <p className="break-all font-mono text-xs text-white/60">{manualKey}</p>
                  <p className="text-xs text-white/50">Inquadra il QR con l&apos;app authenticator, poi inserisci il codice a 6 cifre.</p>
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" inputMode="numeric" maxLength={6} className={`${inputCls} text-center font-mono tracking-[0.5em]`} />
                  <button className="btn-fire w-full rounded-full py-2.5 text-sm font-semibold">Conferma e attiva</button>
                </form>
              )}
              {backupCodes.length > 0 && (
                <div className="mt-3 rounded-xl border border-fire/40 bg-fire/10 p-4">
                  <p className="text-xs font-semibold text-fire-ember">Codici di recupero (mostrati una sola volta — salvali ora):</p>
                  <ul className="mt-2 grid grid-cols-2 gap-1 font-mono text-sm text-white">
                    {backupCodes.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              )}
              {user.totpEnabled && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run(async () => {
                      await post("/api/auth/totp-disable", { password });
                      setPassword("");
                      await refresh();
                    });
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password per disattivare" autoComplete="current-password" className={inputCls} />
                  <button className="shrink-0 rounded-full border border-white/15 px-4 text-sm text-red-300">Disattiva</button>
                </form>
              )}
            </div>
          </div>
        )}

        {msg && <p className="mt-4 text-sm text-fire-ember">{msg}</p>}
        {err && <p className="mt-4 text-sm text-red-300">{err}</p>}
      </Reveal>
    </div>
  );
}
