import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("products").filter((q) => q.eq(q.field("active"), true)).collect(),
});

export const create = mutation({
  args: {
    title: v.string(),
    type: v.union(v.literal("beat"), v.literal("sample-pack"), v.literal("offerta")),
    price: v.number(),
    stripeLink: v.string(),
    description: v.string(),
  },
  handler: async (ctx, a) => {
    const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return ctx.db.insert("products", { ...a, slug, tags: [], featured: false, active: true });
  },
});
