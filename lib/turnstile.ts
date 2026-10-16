/**
 * Verifica server-side del token Cloudflare Turnstile.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, remoteIp?: string): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Senza secret configurato: accetta SOLO in sviluppo (mai in produzione).
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, reason: "turnstile-not-configured" };
    }
    return { ok: true, reason: "dev-bypass" };
  }
  if (!token || token.length > 2000) return { ok: false, reason: "missing-token" };
  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(remoteIp && remoteIp !== "unknown" ? { remoteip: remoteIp } : {}),
      }),
    });
    const data = (await res.json()) as { success?: boolean; ["error-codes"]?: string[] };
    if (data.success) return { ok: true };
    return { ok: false, reason: data["error-codes"]?.join(",") ?? "verification-failed" };
  } catch {
    return { ok: false, reason: "network-error" };
  }
}
