import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { serverAuthArg, mustServerAuth } from "./guards";
import type { ServerAuth } from "./crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    date: v.string(),
    city: v.optional(v.string()),
    message: v.string(),
    _auth: serverAuthArg,
  },
  handler: async (ctx, a) => {
    const email = a.email.trim().toLowerCase();
    await mustServerAuth({ email }, a._auth as ServerAuth, "bookings.create");
    const name = a.name.trim();
    if (name.length < 2 || name.length > 100) throw new Error("Nome non valido");
    if (!EMAIL_RE.test(email)) throw new Error("Email non valida");
    if (a.date && !/^\d{4}-\d{2}-\d{2}$/.test(a.date)) throw new Error("Data non valida");
    if ((a.city ?? "").length > 100) throw new Error("Città troppo lunga");
    const message = a.message.trim();
    if (message.length < 3 || message.length > 5000) throw new Error("Messaggio non valido");
    return ctx.db.insert("bookings", { name, email, date: a.date, city: a.city, message, status: "new" });
  },
});

export const list = query({
  args: { _auth: serverAuthArg },
  handler: async (ctx, a) => {
    await mustServerAuth({}, a._auth as ServerAuth, "bookings.list");
    return ctx.db.query("bookings").order("desc").take(200);
  },
});
