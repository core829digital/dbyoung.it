import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, a) => {
    const existing = await ctx.db
      .query("newsletter")
      .withIndex("by_email", (q) => q.eq("email", a.email))
      .first();
    if (existing) return existing._id;
    return ctx.db.insert("newsletter", { email: a.email, confirmed: false });
  },
});
