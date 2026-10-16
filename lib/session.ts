import { cookies } from "next/headers";

/** Cookie di sessione httpOnly — SOLO server-side (route handler). */

export const SESSION_COOKIE = "dby_session";
export const SESSION_MAX_AGE = 30 * 24 * 3600; // 30 giorni, come la scadenza Convex

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function readSessionToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value;
}
