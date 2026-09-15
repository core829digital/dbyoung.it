import { sendMail, ok } from "@/lib/mail";
import { cloudCreateMessage } from "@/lib/backend";

const ADMIN = process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const subject = String(form.get("subject") ?? "Nuovo messaggio");
  const message = String(form.get("message") ?? "");

  // Persistenza su Convex (messages) per inbox /admin alla connessione backend — intanto backup in inbox admin via client
  cloudCreateMessage({ name, email, subject, body: message });
  const sent = await sendMail({
    to: ADMIN,
    subject: `[dbyoung.it] ${subject} — ${name}`,
    html: `<p>Da: ${name} (${email})</p><p>${message}</p>`,
  });

  return ok({ received: true, mailed: !(sent as { mocked?: boolean })?.mocked });
}
