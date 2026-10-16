import { ok, fail } from "@/lib/mail";
import { loginSchema, zodErrors } from "@/lib/validation";
import { sanitizeEmail } from "@/lib/sanitize";
import { verifyTurnstile } from "@/lib/turnstile";
import { clientIpFromHeaders } from "@/lib/ipAllowlist";
import { rateLimit, limitKey, maybeCleanupRateLimits } from "@/lib/rateLimit";
import { signedMutation } from "@/lib/serverConvex";
import { setSessionCookie } from "@/lib/session";
import { api } from "@/convex/_generated/api";

type LoginValue =
  | { need2fa: true; challenge: string }
  | { need2fa: false; session: string; user: Record<string, unknown> };

export async function POST(req: Request) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(limitKey(ip, "auth-login"), 10, 60_000);
    if (!rl.allowed) return fail("Troppe richieste, riprova tra poco.", 429);

    const parsed = loginSchema.safeParse((await req.json()) as Record<string, unknown>);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const t = await verifyTurnstile(String(parsed.data.turnstile), ip);
    if (!t.ok) return fail("Verifica anti-bot fallita, riprova.", 403);

    const email = sanitizeEmail(parsed.data.email);
    const { ok: done, value } = await signedMutation<LoginValue>(
      api.auth.login,
      "auth.login",
      { email },
      { email, password: parsed.data.password, ip, ua: req.headers.get("user-agent") ?? "" }
    );
    if (!done || !value) return fail("Credenziali non valide.", 401);

    if (value.need2fa) {
      // Challenge monouso da 10 min: il client lo riusa per il passo 2FA (mai come sessione)
      return ok({ need2fa: true, challenge: value.challenge });
    }
    await setSessionCookie(value.session);
    return ok({ user: value.user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore interno";
    if ((e as { code?: string }).code === "unverified" || msg === "Email non verificata") {
      return fail("Email non verificata. Controlla il codice ricevuto.", 403);
    }
    return fail(/non valide|non verificata/i.test(msg) ? msg : "Credenziali non valide.", 401);
  }
}
