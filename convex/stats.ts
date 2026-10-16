import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { serverAuthArg, mustServerAuth } from "./guards";
import type { ServerAuth } from "./crypto";

// Tracciamento visite aggregate (privacy-friendly: solo conteggi per path/giorno)
// Pubblico di proposito (solo contatori); path limitato per evitare abusi.
export const track = mutation({
  args: { path: v.string(), day: v.string() },
  handler: async (ctx, a) => {
    const path = a.path.slice(0, 120);
    if (!/^\/[a-z0-9\-/_?=&%]*$/i.test(path)) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.day)) return;
    const existing = await ctx.db
      .query("pageViews")
      .withIndex("by_path_day", (q) => q.eq("path", path).eq("day", a.day))
      .first();
    if (existing) await ctx.db.patch(existing._id, { count: existing.count + 1 });
    else await ctx.db.insert("pageViews", { path, day: a.day, count: 1 });
  },
});

export const overview = query({
  args: { _auth: serverAuthArg },
  handler: async (ctx, a) => {
    await mustServerAuth({}, a._auth as ServerAuth, "stats.overview");
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
