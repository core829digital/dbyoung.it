import { sendMail, ok } from "@/lib/mail";
import { cloudCreateBooking } from "@/lib/backend";

const ADMIN = process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const date = String(form.get("date") ?? "");
  const city = String(form.get("city") ?? "");
  const message = String(form.get("message") ?? "");

  // Persistenza su Convex (bookings) + notifica cron reminder alla connessione backend — intanto backup in inbox admin via client
  cloudCreateBooking({ name, email, date, city, message });
  const sentAdmin = await sendMail({
    to: ADMIN,
    subject: `Nuova richiesta evento — ${name} (${date || "data da definire"})`,
    html: `<p><strong>${name}</strong> (${email}) — ${city} — ${date}</p><p>${message}</p>`,
  });
  await sendMail({
    to: email,
    subject: "Richiesta evento ricevuta — DBYoung",
    html: `<p>Ciao ${name}, abbiamo ricevuto la tua richiesta. Ti ricontattiamo entro 24–48h.</p>`,
  });

  return ok({ received: true, mailed: !(sentAdmin as { mocked?: boolean })?.mocked });
}
