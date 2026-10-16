import { ok, fail } from "@/lib/mail";
import { productPublishSchema, zodErrors } from "@/lib/validation";
import { sanitizeText, sanitizeHttpsUrl, sanitizeFilePath, STRIPE_LINK_HOSTS } from "@/lib/sanitize";
import { signedMutation } from "@/lib/serverConvex";
import { requireAdmin } from "@/lib/serverConvex";
import { readSessionToken } from "@/lib/session";
import { api } from "@/convex/_generated/api";

/** Pubblica prodotto su Convex (mirror cloud). Richiede sessione admin. */
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(await readSessionToken()).catch((e: { status?: number }) => {
      throw { status: e.status ?? 401 };
    });
    void admin;
    const parsed = productPublishSchema.safeParse((await req.json()) as Record<string, unknown>);
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const title = sanitizeText(parsed.data.title, 120);
    const description = sanitizeText(parsed.data.description || title, 5000) || title;
    const stripeLink = parsed.data.stripeLink
      ? sanitizeHttpsUrl(parsed.data.stripeLink, STRIPE_LINK_HOSTS)
      : "";
    if (parsed.data.stripeLink && !stripeLink) return fail("Stripe Link non valido (solo buy.stripe.com).", 400);
    const filePath = parsed.data.filePath ? sanitizeFilePath(parsed.data.filePath) : undefined;
    if (parsed.data.filePath && !filePath) return fail("Percorso file non valido.", 400);

    const { ok: done, value } = await signedMutation<string>(
      api.products.create,
      "products.create",
      { title },
      { title, type: parsed.data.type, price: parsed.data.price, stripeLink, description, filePath }
    );
    if (!done) return fail("Pubblicazione non riuscita.", 500);
    return ok({ id: value });
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 401) return fail("Non autenticato.", 401);
    if (status === 403) return fail("Accesso riservato.", 403);
    return fail("Errore interno.", 500);
  }
}
