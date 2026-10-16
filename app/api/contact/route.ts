import { sendMail, ok, fail, escapeHtml } from "@/lib/mail";
import { contactSchema, zodErrors } from "@/lib/validation";
import { sanitizeText, sanitizeMultiline, sanitizeEmail } from "@/lib/sanitize";
import { verifyTurnstile } from "@/lib/turnstile";
import { clientIpFromHeaders } from "@/lib/ipAllowlist";
import { signedMutation } from "@/lib/serverConvex";
import { api } from "@/convex/_generated/api";

const ADMIN = process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const parsed = contactSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      subject: String(form.get("subject") ?? "Nuovo messaggio"),
      message: form.get("message"),
      turnstile: form.get("turnstile"),
    });
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const t = await verifyTurnstile(parsed.data.turnstile, clientIpFromHeaders(req.headers));
    if (!t.ok) return fail("Verifica anti-bot fallita, riprova.", 403);

    const name = sanitizeText(parsed.data.name, 100);
    const email = sanitizeEmail(parsed.data.email);
    const subject = sanitizeText(parsed.data.subject || "Nuovo messaggio", 150) || "Nuovo messaggio";
    const message = sanitizeMultiline(parsed.data.message, 5000);

    // Persistenza firmata su Convex (best-effort: l'email parte comunque)
    await signedMutation(api.messages.create, "messages.create", { email }, { name, email, subject, body: message });
    const sent = await sendMail({
      to: ADMIN,
      subject: `[dbyoung.it] ${escapeHtml(subject)} — ${escapeHtml(name)}`,
      html: `<p>Da: ${escapeHtml(name)} (${escapeHtml(email)})</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });

    return ok({ received: true, mailed: !(sent as { mocked?: boolean })?.mocked });
  } catch {
    return fail("Errore interno, riprova più tardi.", 500);
  }
}
