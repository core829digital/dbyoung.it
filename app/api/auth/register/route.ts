import { ok, fail, escapeHtml, sendMail } from "@/lib/mail";
import { registerSchema, zodErrors } from "@/lib/validation";
import { sanitizeEmail } from "@/lib/sanitize";
import { verifyTurnstile } from "@/lib/turnstile";
import { clientIpFromHeaders } from "@/lib/ipAllowlist";
import { rateLimit, limitKey, maybeCleanupRateLimits } from "@/lib/rateLimit";
import { signedMutation } from "@/lib/serverConvex";
import { api } from "@/convex/_generated/api";

export async function POST(req: Request) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(limitKey(ip, "auth-register"), 10, 60_000);
    if (!rl.allowed) return fail("Troppe richieste, riprova tra poco.", 429);

    const body = (await req.json()) as Record<string, unknown>;
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const t = await verifyTurnstile(String(parsed.data.turnstile), ip);
    if (!t.ok) return fail("Verifica anti-bot fallita, riprova.", 403);

    const email = sanitizeEmail(parsed.data.email);
    const { ok: done, value } = await signedMutation<{ userId: string; otp: string }>(
      api.auth.register,
      "auth.register",
      { email },
      { email, password: parsed.data.password }
    );
    if (!done || !value) return fail("Registrazione non riuscita, riprova.", 500);

    await sendMail({
      to: email,
      subject: "Verifica la tua email — DBYoung",
      html: `<p>Ciao, il tuo codice di verifica è: <strong>${escapeHtml(value.otp)}</strong></p><p>Scade tra 15 minuti.</p>`,
    });
    return ok({ sent: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore interno";
    return fail(msg, /Email già registrata|non valida/i.test(msg) ? 400 : 500);
  }
}
