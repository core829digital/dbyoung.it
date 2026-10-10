import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    date: v.string(),
    city: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, a) => {
    if (a.name.trim().length < 2 || a.name.length > 100) throw new Error("Nome non valido");
    if (a.message.trim().length < 3 || a.message.length > 5000) throw new Error("Messaggio non valido");
    return ctx.db.insert("bookings", { ...a, status: "new" });
  },
});

export const list = query({
  args: {},
  // TODO: restringere a ruolo admin quando si attiva Convex Auth
  handler: async (ctx) => ctx.db.query("bookings").order("desc").take(200),
});
