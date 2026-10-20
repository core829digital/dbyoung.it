import { ok, fail, escapeHtml, sendMail } from "@/lib/mail";
import { z } from "zod";
import { zodErrors } from "@/lib/validation";
import { sanitizeEmail } from "@/lib/sanitize";
import { verifyTurnstile } from "@/lib/turnstile";
import { clientIpFromHeaders } from "@/lib/ipAllowlist";
import { rateLimit, limitKey, maybeCleanupRateLimits } from "@/lib/rateLimit";
import { signedMutation } from "@/lib/serverConvex";
import { api } from "@/convex/_generated/api";

const schema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(254),
  turnstile: z.string().min(1).max(2000),
});

export async function POST(req: Request) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(limitKey(ip, "auth-reset"), 5, 60_000);
    if (!rl.allowed) return fail("Troppe richieste, riprova tra poco.", 429);

    const parsed = schema.safeParse((await req.json()) as Record<string, unknown>);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const t = await verifyTurnstile(String(parsed.data.turnstile), ip);
    if (!t.ok) return fail("Verifica anti-bot fallita, riprova.", 403);

    const email = sanitizeEmail(parsed.data.email);
    const { value } = await signedMutation<{ token: string | null }>(
      api.auth.requestPasswordReset,
      "auth.requestPasswordReset",
      { email },
      { email }
    );
    // Risposta identica che l'account esista o no (anti-enumeration)
    if (value?.token) {
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dbyoung.it";
      const link = `${base}/account/reset?token=${encodeURIComponent(value.token)}`;
      await sendMail({
        to: email,
        subject: "Reimposta la password — DBYoung",
        html: `<p>Hai richiesto il reset della password. <a href="${escapeHtml(link)}">Clicca qui (scade tra 1 ora)</a>.</p><p>Se non sei stato tu, ignora questa email.</p>`,
      });
    }
    return ok({ sent: true });
  } catch {
    return fail("Errore interno.", 500);
  }
}
