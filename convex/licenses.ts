import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Emissione licenza (da /admin o webhook Stripe futuro) */
export const create = mutation({
  args: {
    code: v.string(),
    productSlug: v.string(),
    email: v.string(),
  },
  handler: async (ctx, a) => {
    const existing = await ctx.db
      .query("licenses")
      .withIndex("by_code", (q) => q.eq("code", a.code))
      .first();
    if (existing) return existing._id;
    return ctx.db.insert("licenses", {
      ...a,
      active: true,
      createdAt: new Date().toISOString(),
    });
  },
});

/** Verifica licenza per download (solo codici attivi) */
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, a) => {
    const lic = await ctx.db
      .query("licenses")
      .withIndex("by_code", (q) => q.eq("code", a.code.trim().toUpperCase()))
      .first();
    if (!lic || !lic.active) return null;
    return { productSlug: lic.productSlug, email: lic.email };
  },
});

export const revoke = mutation({
  args: { code: v.string() },
  handler: async (ctx, a) => {
    const lic = await ctx.db
      .query("licenses")
      .withIndex("by_code", (q) => q.eq("code", a.code))
      .first();
    if (lic) await ctx.db.patch(lic._id, { active: false });
  },
});
