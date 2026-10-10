import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, a) => {
    const email = a.email.trim().toLowerCase().slice(0, 254);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error("Email non valida");
    const existing = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) return existing._id;
    return ctx.db.insert("newsletter", { email, confirmed: false });
  },
});

export const list = query({
  args: {},
  // TODO: restringere a ruolo admin quando si attiva Convex Auth
  handler: async (ctx) => ctx.db.query("newsletter").take(500),
});
