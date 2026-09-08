import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const history = query({
  args: { sessionId: v.string() },
  handler: async (ctx, a) =>
    ctx.db.query("chatMessages").withIndex("by_session", (q) => q.eq("sessionId", a.sessionId)).collect(),
});

export const send = mutation({
  args: { sessionId: v.string(), from: v.union(v.literal("visitor"), v.literal("admin")), text: v.string() },
  handler: async (ctx, a) => ctx.db.insert("chatMessages", a),
});
