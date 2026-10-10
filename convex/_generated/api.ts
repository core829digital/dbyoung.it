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
  stats: {
    track: m("stats:track"),
    overview: q("stats:overview"),
  },
  chat: {
    history: q("chat:history"),
    send: m("chat:send"),
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
  },
};

export const internal = {
  reports: {
    bookingReminder: a("reports:bookingReminder"),
    weeklyReport: a("reports:weeklyReport"),
  },
};
