import { v } from "convex/values";
import { requireServerAuth, type ServerAuth } from "./crypto";

/** Validatore per la firma HMAC server-side (lib/adminSign.ts). */
export const serverAuthArg = v.object({ action: v.string(), exp: v.number(), sig: v.string() });

/** Verifica firma per un'azione privilegiata. Lancia se invalida. */
export async function mustServerAuth(
  params: Record<string, unknown>,
  auth: ServerAuth,
  action: string
): Promise<void> {
  await requireServerAuth(params, auth, action);
}
