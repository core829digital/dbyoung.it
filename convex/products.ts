import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const productType = v.union(
  v.literal("beat"),
  v.literal("sample-pack"),
  v.literal("soundtrack"),
  v.literal("offerta")
);

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query("products").filter((q) => q.eq(q.field("active"), true)).collect(),
});

export const listAdmin = query({
  args: {},
  // TODO: restringere a ruolo admin quando si attiva Convex Auth
  handler: async (ctx) => ctx.db.query("products").collect(),
});

export const create = mutation({
  args: {
    title: v.string(),
    type: productType,
    price: v.number(),
    stripeLink: v.string(),
    description: v.string(),
    filePath: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    if (a.title.trim().length < 2 || a.title.length > 120) throw new Error("Titolo non valido");
    if (!Number.isFinite(a.price) || a.price < 0 || a.price > 100000) throw new Error("Prezzo non valido");
    if (a.description.length > 5000) throw new Error("Descrizione troppo lunga");
    const slugBase = a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "prodotto";
    const slug = `${slugBase}-${Date.now().toString(36)}`;
    return ctx.db.insert("products", { ...a, title: a.title.trim(), slug, tags: [], featured: false, active: true });
  },
});

export const setActive = mutation({
  args: { id: v.id("products"), active: v.boolean() },
  // TODO: solo admin
  handler: async (ctx, a) => ctx.db.patch(a.id, { active: a.active }),
});

export const remove = mutation({
  args: { id: v.id("products") },
  // TODO: solo admin
  handler: async (ctx, a) => ctx.db.delete(a.id),
});
