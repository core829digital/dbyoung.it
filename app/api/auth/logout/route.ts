import { ok, fail } from "@/lib/mail";
import { signedMutation, hashToken } from "@/lib/serverConvex";
import { readSessionToken, clearSessionCookie } from "@/lib/session";
import { api } from "@/convex/_generated/api";

export async function POST() {
  try {
    const token = await readSessionToken();
    if (token) {
      const tokenHash = hashToken(token);
      await signedMutation(api.auth.logout, "auth.logout", { tokenHash }, { tokenHash });
    }
    await clearSessionCookie();
    return ok({ out: true });
  } catch {
    await clearSessionCookie();
    return fail("Errore interno.", 500);
  }
}
