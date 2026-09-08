import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Esempio: reminder giornaliero booking + report settimanale ricavi (TODO: definire internal actions con Resend)
crons.daily("booking-reminder", { hourUTC: 7, minuteUTC: 0 }, internal.reports.bookingReminder as any);
crons.weekly("weekly-report", { dayOfWeek: "monday", hourUTC: 7, minuteUTC: 30 }, internal.reports.weeklyReport as any);

export default crons;
