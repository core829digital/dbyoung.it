import { internalAction } from "./_generated/server";

// Invio via Resend (RESEND_API_KEY) — scheletro pronto per cron
export const bookingReminder = internalAction({
  args: {},
  handler: async () => {
    console.log("[cron] booking reminder — query bookings + Resend");
  },
});

export const weeklyReport = internalAction({
  args: {},
  handler: async () => {
    console.log("[cron] weekly revenue report — query orders/stats + Resend a superadmin");
  },
});
