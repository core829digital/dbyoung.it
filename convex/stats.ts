import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Tracciamento visite aggregate (privacy-friendly: solo conteggi per path/giorno)
export const track = mutation({
  args: { path: v.string(), day: v.string() },
  handler: async (ctx, a) => {
    const existing = await ctx.db
      .query("pageViews")
      .withIndex("by_path_day", (q) => q.eq("path", a.path).eq("day", a.day))
      .first();
    if (existing) await ctx.db.patch(existing._id, { count: existing.count + 1 });
    else await ctx.db.insert("pageViews", { ...a, count: 1 });
  },
});

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const views = await ctx.db.query("pageViews").collect();
    const orders = await ctx.db.query("orders").collect();
    const revenue = orders.reduce((s, o) => s + o.amount, 0);
    return {
      totalViews: views.reduce((s, r) => s + r.count, 0),
      orders: orders.length,
      revenue,
    };
  },
});
