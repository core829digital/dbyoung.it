import { sendMail, ok } from "@/lib/mail";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  if (!email.includes("@")) return ok({ error: "Email non valida" });

  // TODO: salvare su Convex (newsletter) + doppio opt-in
  await sendMail({
    to: email,
    subject: "Benvenuto nel mondo DBYoung 🎺",
    html: `<h1>Benvenuto!</h1><p>Grazie per l'iscrizione — il tuo beat free arriva presto. Resta sintonizzato su dbyoung.it</p>`,
  });

  return ok({ subscribed: true });
}
