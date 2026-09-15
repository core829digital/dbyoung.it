import { sendMail, ok } from "@/lib/mail";

const ADMIN = process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const subject = String(form.get("subject") ?? "Nuovo messaggio");
  const message = String(form.get("message") ?? "");

  // TODO: salvare su Convex (messages) per inbox /admin — intanto backup in inbox admin via client
  const sent = await sendMail({
    to: ADMIN,
    subject: `[dbyoung.it] ${subject} — ${name}`,
    html: `<p>Da: ${name} (${email})</p><p>${message}</p>`,
  });

  return ok({ received: true, mailed: !(sent as { mocked?: boolean })?.mocked });
}
