import { sendMail, ok, fail, escapeHtml } from "@/lib/mail";
import { bookingSchema, zodErrors } from "@/lib/validation";
import { sanitizeText, sanitizeMultiline, sanitizeEmail } from "@/lib/sanitize";
import { verifyTurnstile } from "@/lib/turnstile";
import { clientIpFromHeaders } from "@/lib/ipAllowlist";
import { signedMutation } from "@/lib/serverConvex";
import { api } from "@/convex/_generated/api";

const ADMIN = process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const parsed = bookingSchema.safeParse({
      name: form.get("name"),
      email: form.get("email"),
      date: String(form.get("date") ?? ""),
      city: String(form.get("city") ?? ""),
      message: form.get("message"),
      turnstile: form.get("turnstile"),
    });
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const t = await verifyTurnstile(parsed.data.turnstile, clientIpFromHeaders(req.headers));
    if (!t.ok) return fail("Verifica anti-bot fallita, riprova.", 403);

    const name = sanitizeText(parsed.data.name, 100);
    const email = sanitizeEmail(parsed.data.email);
    const date = parsed.data.date;
    const city = sanitizeText(parsed.data.city ?? "", 100);
    const message = sanitizeMultiline(parsed.data.message, 5000);

    await signedMutation(api.bookings.create, "bookings.create", { email }, { name, email, date, city, message });
    const sentAdmin = await sendMail({
      to: ADMIN,
      subject: `Nuova richiesta evento — ${escapeHtml(name)} (${escapeHtml(date) || "data da definire"})`,
      html: `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) — ${escapeHtml(city)} — ${escapeHtml(date)}</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    });
    await sendMail({
      to: email,
      subject: "Richiesta evento ricevuta — DBYoung",
      html: `<p>Ciao ${escapeHtml(name)}, abbiamo ricevuto la tua richiesta. Ti ricontattiamo entro 24–48h.</p>`,
    });

    return ok({ received: true, mailed: !(sentAdmin as { mocked?: boolean })?.mocked });
  } catch {
    return fail("Errore interno, riprova più tardi.", 500);
  }
}
