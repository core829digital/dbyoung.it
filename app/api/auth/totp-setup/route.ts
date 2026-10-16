import { ok, fail } from "@/lib/mail";
import { signedMutation, hashToken } from "@/lib/serverConvex";
import { readSessionToken } from "@/lib/session";
import { api } from "@/convex/_generated/api";
import QRCode from "qrcode";

export async function POST() {
  try {
    const token = await readSessionToken();
    if (!token) return fail("Non autenticato.", 401);
    const tokenHash = hashToken(token);
    const { ok: done, value } = await signedMutation<{ otpauthUrl: string; manualKey: string }>(
      api.auth.totpSetup,
      "auth.totpSetup",
      { tokenHash },
      { tokenHash }
    );
    if (!done || !value) return fail("Setup 2FA non riuscito.", 500);
    const qr = await QRCode.toDataURL(value.otpauthUrl, { width: 240, margin: 1 });
    return ok({ qr, manualKey: value.manualKey });
  } catch {
    return fail("Setup 2FA non riuscito.", 500);
  }
}
