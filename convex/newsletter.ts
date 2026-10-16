import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { serverAuthArg, mustServerAuth } from "./guards";
import type { ServerAuth } from "./crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const subscribe = mutation({
  args: { email: v.string(), _auth: serverAuthArg },
  handler: async (ctx, a) => {
    const email = a.email.trim().toLowerCase().slice(0, 254);
    await mustServerAuth({ email }, a._auth as ServerAuth, "newsletter.subscribe");
    if (!EMAIL_RE.test(email)) throw new Error("Email non valida");
    const existing = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) return existing._id;
    return ctx.db.insert("newsletter", { email, confirmed: false });
  },
});

export const list = query({
  args: { _auth: serverAuthArg },
  handler: async (ctx, a) => {
    await mustServerAuth({}, a._auth as ServerAuth, "newsletter.list");
    return ctx.db.query("newsletter").take(500);
  },
});
