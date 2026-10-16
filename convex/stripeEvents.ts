import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { serverAuthArg, mustServerAuth } from "./guards";
import type { ServerAuth } from "./crypto";

/**
 * Idempotenza webhook: il primo che registra l'eventId vince.
 * Transazione atomica (check+insert nella stessa mutation).
 */
export const claim = mutation({
  args: { eventId: v.string(), type: v.string(), _auth: serverAuthArg },
  handler: async (ctx, a) => {
    const eventId = a.eventId.trim().slice(0, 100);
    await mustServerAuth({ eventId }, a._auth as ServerAuth, "stripeEvents.claim");
    if (!eventId) throw new Error("eventId mancante");
    const existing = await ctx.db
      .query("stripeEvents")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .first();
    if (existing) return { claimed: false };
    await ctx.db.insert("stripeEvents", { eventId, type: a.type.slice(0, 60), createdAt: new Date().toISOString() });
    return { claimed: true };
  },
});
