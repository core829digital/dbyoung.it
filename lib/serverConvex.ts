import { ConvexHttpClient } from "convex/browser";
import { createHash } from "node:crypto";
import { signServerAction, type ServerAuth } from "./adminSign";
import { api } from "../convex/_generated/api";

/**
 * Bridge Next (server) → Convex con firme HMAC.
 * SOLO server-side (route handler / middleware): importa node:crypto.
 * MAI importare da componenti client — usare le API route /api/*.
 */

let client: ConvexHttpClient | null = null;

function http(): ConvexHttpClient | null {
  const url =
    process.env.NEXT_PUBLIC_CONVEX_URL ??
    process.env.CONVEX_HTTP_URL?.replace(".convex.site", ".convex.cloud");
  if (!url) return null;
  if (!client) client = new ConvexHttpClient(url);
  return client;
}

export function convexConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
}

/** Chiama una query Convex allegando la firma server per `action` su `subject`. */
export async function signedQuery<T>(
  fn: unknown,
  action: string,
  subject: Record<string, unknown>,
  args: Record<string, unknown> = {}
): Promise<T | null> {
  try {
    const c = http();
    if (!c) return null;
    const _auth: ServerAuth = signServerAction(action, subject);
    return ((await (c.query as (...a: unknown[]) => Promise<T>)(fn, { ...args, _auth })) ?? null);
  } catch {
    return null;
  }
}

/** Chiama una mutation Convex allegando la firma server. Ritorna ok + valore. */
export async function signedMutation<T>(
  fn: unknown,
  action: string,
  subject: Record<string, unknown>,
  args: Record<string, unknown> = {}
): Promise<{ ok: boolean; value: T | null }> {
  try {
    const c = http();
    if (!c) return { ok: false, value: null };
    const _auth: ServerAuth = signServerAction(action, subject);
    const value = (await (c.mutation as (...a: unknown[]) => Promise<T>)(fn, { ...args, _auth })) ?? null;
    return { ok: true, value };
  } catch {
    return { ok: false, value: null };
  }
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export interface SessionUser {
  id: string;
  email: string;
  emailVerified: boolean;
  role: string;
  totpEnabled: boolean;
  isAdmin: boolean;
}

/** Legge la sessione dal cookie e la valida su Convex. Ritorna null se assente/invalida. */
export async function getSessionUser(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const user = await signedQuery<SessionUser>(api.auth.me, "auth.me", { tokenHash: hashToken(token) }, { tokenHash: hashToken(token) });
  return user;
}

/** Richiede utente admin: lancia { status } se non autorizzato (la route mappa in 401/403). */
export async function requireAdmin(token: string | undefined): Promise<SessionUser> {
  const user = await getSessionUser(token);
  if (!user) throw { status: 401 as const, message: "Non autenticato" };
  if (!user.isAdmin) throw { status: 403 as const, message: "Accesso riservato" };
  return user;
}
