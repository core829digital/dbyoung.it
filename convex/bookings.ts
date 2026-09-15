import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    date: v.string(),
    city: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, a) => ctx.db.insert("bookings", { ...a, status: "new" }),
});
