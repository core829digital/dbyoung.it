import { sendMail, ok, fail, escapeHtml, isValidEmail } from "@/lib/mail";
import { cloudCreateMessage } from "@/lib/backend";

const ADMIN = process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim().slice(0, 100);
    const email = String(form.get("email") ?? "").trim().slice(0, 254);
    const subject = String(form.get("subject") ?? "Nuovo messaggio").trim().slice(0, 150) || "Nuovo messaggio";
    const message = String(form.get("message") ?? "").trim().slice(0, 5000);

    if (name.length < 2) return fail("Nome non valido.", 400);
    if (!isValidEmail(email)) return fail("Email non valida.", 400);
    if (message.length < 3) return fail("Messaggio troppo corto.", 400);

    // Persistenza best-effort (non blocca la risposta)
    cloudCreateMessage({ name, email, subject, body: message });
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
