import { ok, fail } from "@/lib/mail";
import { z } from "zod";
import { zodErrors } from "@/lib/validation";
import { sanitizeEmail } from "@/lib/sanitize";
import { rateLimit, limitKey, maybeCleanupRateLimits } from "@/lib/rateLimit";
import { clientIpFromHeaders } from "@/lib/ipAllowlist";
import { signedMutation } from "@/lib/serverConvex";
import { api } from "@/convex/_generated/api";

const schema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(254),
  code: z.string().trim().regex(/^\d{6}$/, "Codice a 6 cifre"),
});

export async function POST(req: Request) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(limitKey(ip, "auth-verify"), 10, 60_000);
    if (!rl.allowed) return fail("Troppe richieste, riprova tra poco.", 429);

    const parsed = schema.safeParse((await req.json()) as Record<string, unknown>);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const email = sanitizeEmail(parsed.data.email);
    const { ok: done } = await signedMutation(
      api.auth.verifyEmail,
      "auth.verifyEmail",
      { email },
      { email, code: parsed.data.code }
    );
    if (!done) return fail("Verifica non riuscita.", 400);
    return ok({ verified: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore interno";
    return fail(msg, 400);
  }
}
