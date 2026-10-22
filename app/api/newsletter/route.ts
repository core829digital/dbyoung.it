import { sendMail, ok, fail } from "@/lib/mail";
import { newsletterSchema, zodErrors } from "@/lib/validation";
import { sanitizeEmail } from "@/lib/sanitize";
import { verifyTurnstile } from "@/lib/turnstile";
import { clientIpFromHeaders } from "@/lib/ipAllowlist";
import { signedMutation } from "@/lib/serverConvex";
import { api } from "@/convex/_generated/api";

export async function POST(req: Request) {
  try {
    if (!(req.headers.get("content-type") ?? "").includes("form")) {
      return fail("Formato richiesta non valido (atteso form-data).", 400);
    }
    const form = await req.formData();
    const parsed = newsletterSchema.safeParse({
      email: form.get("email"),
      turnstile: form.get("turnstile"),
    });
    if (!parsed.success) return fail(zodErrors(parsed.error).join("; "), 400);

    const t = await verifyTurnstile(parsed.data.turnstile, clientIpFromHeaders(req.headers));
    if (!t.ok) return fail("Verifica anti-bot fallita, riprova.", 403);

    const email = sanitizeEmail(parsed.data.email);
    await signedMutation(api.newsletter.subscribe, "newsletter.subscribe", { email }, { email });
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
