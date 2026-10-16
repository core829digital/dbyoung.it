import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Firme HMAC-SHA256 per le chiamate privilegiate Next → Convex.
 * SOLO server-side: questo modulo importa node:crypto e il segreto.
 * MAI importare da componenti client o da codice eseguito nel browser.
 *
 * La verifica lato Convex è implementata in convex/crypto.ts con la STESSA
 * canonicalizzazione (JSON a chiavi ordinate). Non cambiare una senza l'altra.
 */

const WINDOW_MS = 5 * 60 * 1000;

function secret(): string {
  const s = process.env.ADMIN_ACTION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("ADMIN_ACTION_SECRET mancante o troppo corto (min 32 caratteri).");
  }
  return s;
}

/** JSON canonico: chiavi ordinate ricorsivamente (deve combaciare con convex/crypto.ts). */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

export interface ServerAuth {
  action: string;
  exp: number;
  sig: string;
}

/** Firma un'azione privilegiata. exp = scadenza unix ms (default +5 min). */
export function signServerAction(action: string, params: Record<string, unknown>, exp = Date.now() + WINDOW_MS): ServerAuth {
  const payload = `${action}.${exp}.${canonicalJson(params)}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return { action, exp, sig };
}

/** Verifica locale (usata nei test e come doppio controllo, mai al posto di Convex). */
export function verifyServerActionLocal(action: string, params: Record<string, unknown>, auth: ServerAuth): boolean {
  if (auth.action !== action) return false;
  if (!Number.isFinite(auth.exp) || auth.exp <= Date.now()) return false;
  const payload = `${action}.${auth.exp}.${canonicalJson(params)}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(auth.sig, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
