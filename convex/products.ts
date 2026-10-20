import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { serverAuthArg, mustServerAuth } from "./guards";
import type { ServerAuth } from "./crypto";

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
  args: { _auth: serverAuthArg },
  handler: async (ctx, a) => {
    await mustServerAuth({}, a._auth as ServerAuth, "products.listAdmin");
    return ctx.db.query("products").collect();
  },
});

function checkStripeLink(link: string): void {
  if (!link || link === "#") return;
  try {
    const u = new URL(link);
    if (u.protocol !== "https:" || !["buy.stripe.com", "checkout.stripe.com"].includes(u.hostname)) {
      throw new Error("Link Stripe non valido");
    }
  } catch {
    throw new Error("Link Stripe non valido");
  }
}

export const create = mutation({
  args: {
    title: v.string(),
    type: productType,
    price: v.number(),
    stripeLink: v.string(),
    description: v.string(),
    /** Slug catalogo (se assente viene generato dal titolo). */
    slug: v.optional(v.string()),
    filePath: v.optional(v.string()),
    _auth: serverAuthArg,
  },
  handler: async (ctx, a) => {
    const title = a.title.trim();
    await mustServerAuth({ title }, a._auth as ServerAuth, "products.create");
    if (title.length < 2 || title.length > 120) throw new Error("Titolo non valido");
    if (!Number.isFinite(a.price) || a.price < 0 || a.price > 100000) throw new Error("Prezzo non valido");
    if (a.description.length > 5000) throw new Error("Descrizione troppo lunga");
    if (a.stripeLink.length > 500) throw new Error("Link troppo lungo");
    checkStripeLink(a.stripeLink.trim());
    if (a.filePath && (a.filePath.includes("..") || a.filePath.length > 300)) throw new Error("Percorso file non valido");
    const provided = a.slug?.trim();
    if (provided && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(provided)) throw new Error("Slug non valido");
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "prodotto";
    const slug = provided || `${slugBase}-${Date.now().toString(36)}`;
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) return existing._id;
    return ctx.db.insert("products", {
      title,
      type: a.type,
      price: a.price,
      stripeLink: a.stripeLink.trim(),
      description: a.description,
      filePath: a.filePath,
      slug,
      tags: [],
      featured: false,
      active: true,
    });
  },
});

export const setActive = mutation({
  args: { id: v.id("products"), active: v.boolean(), _auth: serverAuthArg },
  handler: async (ctx, a) => {
    await mustServerAuth({ id: a.id }, a._auth as ServerAuth, "products.setActive");
    await ctx.db.patch(a.id, { active: a.active });
  },
});

export const remove = mutation({
  args: { id: v.id("products"), _auth: serverAuthArg },
  handler: async (ctx, a) => {
    await mustServerAuth({ id: a.id }, a._auth as ServerAuth, "products.remove");
    await ctx.db.delete(a.id);
  },
});
