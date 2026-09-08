import { internalAction } from "./_generated/server";

// TODO: inviare via Resend (RESEND_API_KEY) — scheletro pronto per cron
export const bookingReminder = internalAction({
  args: {},
  handler: async () => {
    console.log("[cron] booking reminder — TODO: query bookings + Resend");
  },
});

export const weeklyReport = internalAction({
  args: {},
  handler: async () => {
    console.log("[cron] weekly revenue report — TODO: query orders/stats + Resend a superadmin");
  },
});
