import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    title: v.string(),
    slug: v.string(),
    type: v.union(v.literal("beat"), v.literal("sample-pack"), v.literal("offerta")),
    price: v.number(),
    oldPrice: v.optional(v.number()),
    bpm: v.optional(v.number()),
    musicalKey: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    audioPreviewUrl: v.optional(v.string()),
    stripeLink: v.string(),
    tags: v.array(v.string()),
    featured: v.boolean(),
    description: v.string(),
    active: v.boolean(),
  }).index("by_slug", ["slug"]),

  orders: defineTable({
    productId: v.id("products"),
    email: v.string(),
    amount: v.number(),
    stripeSessionId: v.optional(v.string()),
    status: v.string(),
  }),

  bookings: defineTable({
    name: v.string(),
    email: v.string(),
    date: v.string(),
    city: v.optional(v.string()),
    message: v.string(),
    status: v.string(),
  }),

  messages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    body: v.string(),
    read: v.boolean(),
  }),

  chatMessages: defineTable({
    sessionId: v.string(),
    from: v.union(v.literal("visitor"), v.literal("admin")),
    text: v.string(),
  }).index("by_session", ["sessionId"]),

  newsletter: defineTable({ email: v.string(), confirmed: v.boolean() }).index("by_email", ["email"]),

  pageViews: defineTable({
    path: v.string(),
    day: v.string(), // YYYY-MM-DD
    count: v.number(),
  }).index("by_path_day", ["path", "day"]),
});
