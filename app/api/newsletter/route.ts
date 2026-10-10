import { sendMail, ok, fail, isValidEmail } from "@/lib/mail";
import { cloudSubscribeNewsletter } from "@/lib/backend";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 254);
    if (!isValidEmail(email)) return fail("Email non valida.", 400);

    // Persistenza su Convex (newsletter) + doppio opt-in alla connessione backend — intanto backup in inbox admin via client
    cloudSubscribeNewsletter(email);
    const sent = await sendMail({
      to: email,
      subject: "Benvenuto nel mondo DBYoung",
      html: `<h1>Benvenuto!</h1><p>Grazie per l'iscrizione — il tuo beat free arriva presto. Resta sintonizzato su dbyoung.it</p>`,
    });

    return ok({ subscribed: true, mailed: !(sent as { mocked?: boolean })?.mocked });
  } catch {
    return fail("Errore interno, riprova più tardi.", 500);
  }
}
