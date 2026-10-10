import { sendMail, ok, fail, escapeHtml, isValidEmail } from "@/lib/mail";
import { cloudCreateBooking } from "@/lib/backend";

const ADMIN = process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim().slice(0, 100);
    const email = String(form.get("email") ?? "").trim().slice(0, 254);
    const date = String(form.get("date") ?? "").trim().slice(0, 20);
    const city = String(form.get("city") ?? "").trim().slice(0, 100);
    const message = String(form.get("message") ?? "").trim().slice(0, 5000);

    if (name.length < 2) return fail("Nome non valido.", 400);
    if (!isValidEmail(email)) return fail("Email non valida.", 400);
    if (message.length < 3) return fail("Messaggio troppo corto.", 400);
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("Data non valida.", 400);

    // Persistenza su Convex (bookings) + notifica cron reminder alla connessione backend — intanto backup in inbox admin via client
    cloudCreateBooking({ name, email, date, city, message });
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
