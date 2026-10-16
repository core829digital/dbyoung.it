import { ok, fail } from "@/lib/mail";
import { z } from "zod";
import { totpCodeSchema, zodErrors } from "@/lib/validation";
import { rateLimit, limitKey, maybeCleanupRateLimits } from "@/lib/rateLimit";
import { clientIpFromHeaders } from "@/lib/ipAllowlist";
import { signedMutation, hashToken } from "@/lib/serverConvex";
import { setSessionCookie } from "@/lib/session";
import { api } from "@/convex/_generated/api";

const schema = z.object({
  challenge: z.string().min(10).max(128),
  code: totpCodeSchema,
});

export async function POST(req: Request) {
  try {
    maybeCleanupRateLimits();
    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(limitKey(ip, "auth-2fa"), 10, 60_000);
    if (!rl.allowed) return fail("Troppe richieste, riprova tra poco.", 429);

    const parsed = schema.safeParse((await req.json()) as Record<string, unknown>);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const tokenHash = hashToken(parsed.data.challenge);
    const { ok: done, value } = await signedMutation<{ session: string; user: Record<string, unknown> }>(
      api.auth.verifyTotpLogin,
      "auth.verifyTotpLogin",
      { challenge: tokenHash },
      { challenge: parsed.data.challenge, code: parsed.data.code, ip, ua: req.headers.get("user-agent") ?? "" }
    );
    if (!done || !value) return fail("Codice non valido.", 401);
    await setSessionCookie(value.session);
    return ok({ user: value.user });
  } catch {
    return fail("Codice non valido.", 401);
  }
}
