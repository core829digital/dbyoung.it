import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    body: v.string(),
  },
  handler: async (ctx, a) => {
    if (a.name.trim().length < 2 || a.name.length > 100) throw new Error("Nome non valido");
    if (a.body.trim().length < 3 || a.body.length > 5000) throw new Error("Messaggio non valido");
    if (a.subject.length > 150) throw new Error("Oggetto troppo lungo");
    return ctx.db.insert("messages", { ...a, read: false });
  },
});

export const list = query({
  args: {},
  // TODO: restringere a ruolo admin quando si attiva Convex Auth
  handler: async (ctx) => ctx.db.query("messages").order("desc").take(200),
});
