import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    title: v.string(),
    slug: v.string(),
    type: v.union(
      v.literal("beat"),
      v.literal("sample-pack"),
      v.literal("soundtrack"),
      v.literal("offerta")
    ),
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
    /** Percorso file privato per /api/download (solo admin/webhook) */
    filePath: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  orders: defineTable({
    productId: v.id("products"),
    email: v.string(),
    amount: v.number(),
    stripeSessionId: v.optional(v.string()),
    stripeEventId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    status: v.string(),
  }).index("by_user", ["userId"]),

  stripeEvents: defineTable({
    eventId: v.string(),
    type: v.string(),
    createdAt: v.string(),
  }).index("by_event", ["eventId"]),

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

  newsletter: defineTable({ email: v.string(), confirmed: v.boolean() }).index("by_email", ["email"]),

  pageViews: defineTable({
    path: v.string(),
    day: v.string(), // YYYY-MM-DD
    count: v.number(),
  }).index("by_path_day", ["path", "day"]),

  licenses: defineTable({
    code: v.string(), // es. DBY-XXXX-XXXX
    productSlug: v.string(),
    email: v.string(),
    userId: v.optional(v.id("users")),
    stripeSessionId: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_code", ["code"])
    .index("by_session", ["stripeSessionId"]),

  /* ---------- Auth portale clienti (solo via API Next server-side) ---------- */
  users: defineTable({
    email: v.string(), // lowercase
    emailVerified: v.boolean(),
    passwordHash: v.object({ salt: v.string(), hash: v.string(), iter: v.number() }),
    role: v.union(v.literal("admin"), v.literal("user")),
    totpEnabled: v.boolean(),
    totpSecretEnc: v.optional(v.string()),
    backupCodesHash: v.array(v.string()),
    createdAt: v.string(),
    lastLoginAt: v.optional(v.string()),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    tokenHash: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
    createdAt: v.number(),
    ip: v.optional(v.string()),
    ua: v.optional(v.string()),
  }).index("by_token", ["tokenHash"]),

  passwordResets: defineTable({
    tokenHash: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
    used: v.boolean(),
  }).index("by_token", ["tokenHash"]),

  emailOtps: defineTable({
    email: v.string(),
    codeHash: v.string(),
    purpose: v.union(v.literal("verify"), v.literal("reset")),
    expiresAt: v.number(),
    attempts: v.number(),
  }).index("by_email", ["email"]),

  totpChallenges: defineTable({
    tokenHash: v.string(),
    userId: v.id("users"),
    expiresAt: v.number(),
  }).index("by_token", ["tokenHash"]),
});
