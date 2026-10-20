import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { serverAuthArg, mustServerAuth } from "./guards";
import type { ServerAuth } from "./crypto";

/**
 * Ordini creati dal webhook Stripe (firmato) dopo pagamento verificato.
 * Mai dal client: solo server-side con firma HMAC.
 */
export const create = mutation({
  args: {
    productId: v.id("products"),
    email: v.string(),
    amount: v.number(),
    stripeSessionId: v.optional(v.string()),
    stripeEventId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    status: v.string(),
    _auth: serverAuthArg,
  },
  handler: async (ctx, a) => {
    const email = a.email.trim().toLowerCase();
    await mustServerAuth({ email }, a._auth as ServerAuth, "orders.create");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("Email non valida");
    if (!Number.isFinite(a.amount) || a.amount < 0 || a.amount > 1_000_000) throw new Error("Importo non valido");
    const product = await ctx.db.get(a.productId);
    if (!product) throw new Error("Prodotto non trovato");
    return ctx.db.insert("orders", {
      productId: a.productId,
      email,
      amount: a.amount,
      stripeSessionId: a.stripeSessionId,
      stripeEventId: a.stripeEventId,
      userId: a.userId,
      status: a.status.slice(0, 40),
    });
  },
});

export const listBySession = query({
  args: { stripeSessionId: v.string(), _auth: serverAuthArg },
  handler: async (ctx, a) => {
    const sid = a.stripeSessionId.trim().slice(0, 200);
    await mustServerAuth({ stripeSessionId: sid }, a._auth as ServerAuth, "orders.listBySession");
    return ctx.db
      .query("orders")
      .withIndex("by_session", (q) => q.eq("stripeSessionId", sid))
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users"), _auth: serverAuthArg },
  handler: async (ctx, a) => {
    await mustServerAuth({ userId: a.userId }, a._auth as ServerAuth, "orders.listByUser");
    return ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", a.userId))
      .order("desc")
      .take(100);
  },
});
