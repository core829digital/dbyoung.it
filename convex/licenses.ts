import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { serverAuthArg, mustServerAuth } from "./guards";
import type { ServerAuth } from "./crypto";

const CODE_RE = /^DBY-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Emissione licenza (solo via /admin server-side o webhook Stripe firmato) */
export const create = mutation({
  args: {
    code: v.string(),
    productSlug: v.string(),
    email: v.string(),
    userId: v.optional(v.id("users")),
    stripeSessionId: v.optional(v.string()),
    _auth: serverAuthArg,
  },
  handler: async (ctx, a) => {
    const code = a.code.trim().toUpperCase();
    await mustServerAuth({ code }, a._auth as ServerAuth, "licenses.create");
    if (!CODE_RE.test(code)) throw new Error("Formato codice non valido");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.productSlug)) throw new Error("Slug non valido");
    const email = a.email.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) throw new Error("Email non valida");
    const existing = await ctx.db
      .query("licenses")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    if (existing) return existing._id;
    return ctx.db.insert("licenses", {
      code,
      productSlug: a.productSlug,
      email,
      userId: a.userId,
      stripeSessionId: a.stripeSessionId,
      active: true,
      createdAt: new Date().toISOString(),
    });
  },
});

/** Verifica licenza per download (pubblica: ritorna solo slug+email, codice in formato strict) */
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, a) => {
    const code = a.code.trim().toUpperCase();
    if (!CODE_RE.test(code)) return null;
    const lic = await ctx.db
      .query("licenses")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    if (!lic || !lic.active) return null;
    return { productSlug: lic.productSlug, email: lic.email };
  },
});

export const revoke = mutation({
  args: { code: v.string(), _auth: serverAuthArg },
  handler: async (ctx, a) => {
    const code = a.code.trim().toUpperCase();
    await mustServerAuth({ code }, a._auth as ServerAuth, "licenses.revoke");
    if (!CODE_RE.test(code)) throw new Error("Formato codice non valido");
    const lic = await ctx.db
      .query("licenses")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();
    if (lic) await ctx.db.patch(lic._id, { active: false });
  },
});

/** Revoca tutte le licenze di una sessione Stripe (refund). Ritorna quante revocate. */
export const revokeBySession = mutation({
  args: { stripeSessionId: v.string(), _auth: serverAuthArg },
  handler: async (ctx, a) => {
    const sid = a.stripeSessionId.trim().slice(0, 200);
    await mustServerAuth({ stripeSessionId: sid }, a._auth as ServerAuth, "licenses.revokeBySession");
    if (!sid) throw new Error("Sessione mancante");
    const all = await ctx.db
      .query("licenses")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", sid))
      .collect();
    let n = 0;
    for (const l of all) {
      if (l.active) {
        await ctx.db.patch(l._id, { active: false });
        n++;
      }
    }
    return { revoked: n };
  },
});

/** Licenze di un utente (portale /account). Solo server-side firmato. */
export const listByUser = query({
  args: { userId: v.id("users"), _auth: serverAuthArg },
  handler: async (ctx, a) => {
    await mustServerAuth({ userId: a.userId }, a._auth as ServerAuth, "licenses.listByUser");
    return ctx.db
      .query("licenses")
      .filter((q) => q.eq(q.field("userId"), a.userId))
      .collect();
  },
});

/** Licenze di una sessione Stripe (idempotenza webhook). Solo server-side firmato. */
export const listBySession = query({
  args: { stripeSessionId: v.string(), _auth: serverAuthArg },
  handler: async (ctx, a) => {
    const sid = a.stripeSessionId.trim().slice(0, 200);
    await mustServerAuth({ stripeSessionId: sid }, a._auth as ServerAuth, "licenses.listBySession");
    if (!sid) return [];
    return ctx.db
      .query("licenses")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", sid))
      .collect();
  },
});
