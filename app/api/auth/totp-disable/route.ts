import { ok, fail } from "@/lib/mail";
import { z } from "zod";
import { zodErrors } from "@/lib/validation";
import { signedMutation, hashToken } from "@/lib/serverConvex";
import { readSessionToken } from "@/lib/session";
import { api } from "@/convex/_generated/api";

const schema = z.object({ password: z.string().min(1).max(128) });

export async function POST(req: Request) {
  try {
    const token = await readSessionToken();
    if (!token) return fail("Non autenticato.", 401);
    const parsed = schema.safeParse((await req.json()) as Record<string, unknown>);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const tokenHash = hashToken(token);
    const { ok: done } = await signedMutation(
      api.auth.totpDisable,
      "auth.totpDisable",
      { tokenHash },
      { tokenHash, password: parsed.data.password }
    );
    if (!done) return fail("Password errata.", 401);
    return ok({ disabled: true });
  } catch {
    return fail("Operazione non riuscita.", 400);
  }
}
