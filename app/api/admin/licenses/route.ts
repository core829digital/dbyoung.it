import { NextResponse } from "next/server";
import { ok, fail } from "@/lib/mail";
import { licenseIssueSchema, licenseCodeSchema, zodErrors } from "@/lib/validation";
import { sanitizeEmail } from "@/lib/sanitize";
import { signedMutation } from "@/lib/serverConvex";
import { requireAdmin } from "@/lib/serverConvex";
import { readSessionToken } from "@/lib/session";
import { generateLicenseCode } from "@/lib/licenseCode";
import { api } from "@/convex/_generated/api";

async function adminOrFail(): Promise<void> {
  await requireAdmin(await readSessionToken()).catch((e: { status?: number }) => {
    throw { status: e.status ?? 401 };
  });
}

/** Emette licenza: codice generato dal server, mai dal client. */
export async function POST(req: Request) {
  try {
    await adminOrFail();
    const parsed = licenseIssueSchema.safeParse((await req.json()) as Record<string, unknown>);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const email = sanitizeEmail(parsed.data.email);
    const code = generateLicenseCode();
    const { ok: done } = await signedMutation(
      api.licenses.create,
      "licenses.create",
      { code },
      { code, productSlug: parsed.data.productSlug, email }
    );
    if (!done) return fail("Emissione non riuscita.", 500);
    return ok({ code, productSlug: parsed.data.productSlug, email });
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 401) return fail("Non autenticato.", 401);
    if (status === 403) return fail("Accesso riservato.", 403);
    return fail("Errore interno.", 500);
  }
}

/** Revoca licenza (?code=DBY-XXXX-XXXX). */
export async function DELETE(req: Request) {
  try {
    await adminOrFail();
    const code = new URL(req.url).searchParams.get("code") ?? "";
    const parsed = licenseCodeSchema.safeParse(code);
    if (!parsed.success) return fail("Codice non valido.", 400);
    const { ok: done } = await signedMutation(
      api.licenses.revoke,
      "licenses.revoke",
      { code: parsed.data },
      { code: parsed.data }
    );
    if (!done) return fail("Revoca non riuscita.", 500);
    return ok({ revoked: true });
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 401) return fail("Non autenticato.", 401);
    if (status === 403) return fail("Accesso riservato.", 403);
    return fail("Errore interno.", 500);
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Usa POST per emettere, DELETE per revocare." }, { status: 405 });
}
