import { ok, fail } from "@/lib/mail";
import { z } from "zod";
import { passwordSchema, zodErrors } from "@/lib/validation";
import { rateLimit, limitKey, maybeCleanupRateLimits } from "@/lib/rateLimit";
import { clientIpFromHeaders } from "@/lib/ipAllowlist";
import { signedMutation, hashToken } from "@/lib/serverConvex";
import { api } from "@/convex/_generated/api";

const schema = z.object({
  token: z.string().min(10).max(256),
  password: passwordSchema,
});

export async function POST(req: Request) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(limitKey(ip, "auth-reset"), 5, 60_000);
    if (!rl.allowed) return fail("Troppe richieste, riprova tra poco.", 429);

    const parsed = schema.safeParse((await req.json()) as Record<string, unknown>);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const tokenHash = hashToken(parsed.data.token);
    const { ok: done } = await signedMutation(
      api.auth.resetPassword,
      "auth.resetPassword",
      { token: tokenHash },
      { token: parsed.data.token, newPassword: parsed.data.password }
    );
    if (!done) return fail("Link non valido o scaduto.", 400);
    return ok({ reset: true });
  } catch {
    return fail("Link non valido o scaduto.", 400);
  }
}
