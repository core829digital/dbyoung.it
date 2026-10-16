import { makeFunctionReference } from "convex/server";

/**
 * Riferimenti alle funzioni Convex — generati a mano per avviare subito il frontend.
 * Verranno sovrascritti automaticamente dal codegen ufficiale al primo `npx convex dev`.
 * Progetto: festive-ptarmigan-321
 */
const q = (name: string) => makeFunctionReference<"query">(name);
const m = (name: string) => makeFunctionReference<"mutation">(name);
const a = (name: string) => makeFunctionReference<"action">(name);

export const api = {
  products: {
    list: q("products:list"),
    listAdmin: q("products:listAdmin"),
    create: m("products:create"),
    setActive: m("products:setActive"),
    remove: m("products:remove"),
  },
  orders: {
    create: m("orders:create"),
    listByUser: q("orders:listByUser"),
  },
  stripeEvents: {
    claim: m("stripeEvents:claim"),
  },
  stats: {
    track: m("stats:track"),
    overview: q("stats:overview"),
  },
  bookings: {
    create: m("bookings:create"),
    list: q("bookings:list"),
  },
  messages: {
    create: m("messages:create"),
    list: q("messages:list"),
  },
  newsletter: {
    subscribe: m("newsletter:subscribe"),
    list: q("newsletter:list"),
  },
  licenses: {
    create: m("licenses:create"),
    getByCode: q("licenses:getByCode"),
    revoke: m("licenses:revoke"),
    revokeBySession: m("licenses:revokeBySession"),
    listByUser: q("licenses:listByUser"),
    listBySession: q("licenses:listBySession"),
  },
  auth: {
    register: m("auth:register"),
    verifyEmail: m("auth:verifyEmail"),
    login: m("auth:login"),
    verifyTotpLogin: m("auth:verifyTotpLogin"),
    loginBackupCode: m("auth:loginBackupCode"),
    logout: m("auth:logout"),
    me: q("auth:me"),
    requestPasswordReset: m("auth:requestPasswordReset"),
    resetPassword: m("auth:resetPassword"),
    totpSetup: m("auth:totpSetup"),
    totpEnable: m("auth:totpEnable"),
    totpDisable: m("auth:totpDisable"),
  },
};

export const internal = {
  reports: {
    bookingReminder: a("reports:bookingReminder"),
    weeklyReport: a("reports:weeklyReport"),
  },
};
