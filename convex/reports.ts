import { internalAction } from "./_generated/server";

// Invio via Resend (RESEND_API_KEY) — da implementare: query bookings/orders + invio report.
// Cron disattivati di fatto (no-op) finché non si configura Resend + Convex Auth.
export const bookingReminder = internalAction({
  args: {},
  handler: async () => {
    return { ok: true, skipped: "not-configured" };
  },
});

export const weeklyReport = internalAction({
  args: {},
  handler: async () => {
    return { ok: true, skipped: "not-configured" };
  },
});
