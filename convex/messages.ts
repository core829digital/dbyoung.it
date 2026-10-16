import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { serverAuthArg, mustServerAuth } from "./guards";
import type { ServerAuth } from "./crypto";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    body: v.string(),
    _auth: serverAuthArg,
  },
  handler: async (ctx, a) => {
    const email = a.email.trim().toLowerCase();
    await mustServerAuth({ email }, a._auth as ServerAuth, "messages.create");
    const name = a.name.trim();
    if (name.length < 2 || name.length > 100) throw new Error("Nome non valido");
    if (!EMAIL_RE.test(email)) throw new Error("Email non valida");
    if (a.subject.length > 150) throw new Error("Oggetto troppo lungo");
    const body = a.body.trim();
    if (body.length < 3 || body.length > 5000) throw new Error("Messaggio non valido");
    return ctx.db.insert("messages", { name, email, subject: a.subject.trim(), body, read: false });
  },
});

export const list = query({
  args: { _auth: serverAuthArg },
  handler: async (ctx, a) => {
    await mustServerAuth({}, a._auth as ServerAuth, "messages.list");
    return ctx.db.query("messages").order("desc").take(200);
  },
});
