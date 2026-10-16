import { ok, fail } from "@/lib/mail";
import { z } from "zod";
import { totpCodeSchema, zodErrors } from "@/lib/validation";
import { signedMutation, hashToken } from "@/lib/serverConvex";
import { readSessionToken } from "@/lib/session";
import { api } from "@/convex/_generated/api";

const schema = z.object({ code: totpCodeSchema });

export async function POST(req: Request) {
  try {
    const token = await readSessionToken();
    if (!token) return fail("Non autenticato.", 401);
    const parsed = schema.safeParse((await req.json()) as Record<string, unknown>);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const tokenHash = hashToken(token);
    const { ok: done, value } = await signedMutation<{ enabled: boolean; backupCodes: string[] }>(
      api.auth.totpEnable,
      "auth.totpEnable",
      { tokenHash },
      { tokenHash, code: parsed.data.code }
    );
    if (!done || !value) return fail("Codice non valido.", 400);
    // Codici mostrati UNA sola volta: il client deve invitare a salvarli subito
    return ok({ enabled: true, backupCodes: value.backupCodes });
  } catch {
    return fail("Codice non valido.", 400);
  }
}
