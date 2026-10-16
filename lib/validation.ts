import { z } from "zod";

/**
 * Schemi di validazione condivisi client + server.
 * Ogni API route valida con questi schemi PRIMA di sanitizzare ed eseguire.
 */

const email = z.string().trim().toLowerCase().min(3).max(254).regex(
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  "Email non valida"
);

const name = z.string().trim().min(2, "Nome non valido").max(100);

const messageBody = z.string().trim().min(3, "Messaggio troppo corto").max(5000);

export const contactSchema = z.object({
  name,
  email,
  subject: z.string().trim().max(150).default("Nuovo messaggio"),
  message: messageBody,
  turnstile: z.string().min(1, "Verifica anti-bot mancante").max(2000),
});

export const bookingSchema = z.object({
  name,
  email,
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data non valida")
    .refine((d) => d >= new Date().toISOString().slice(0, 10), "La data deve essere futura")
    .or(z.literal("")),
  city: z.string().trim().max(100).default(""),
  message: messageBody,
  turnstile: z.string().min(1, "Verifica anti-bot mancante").max(2000),
});

export const newsletterSchema = z.object({
  email,
  turnstile: z.string().min(1, "Verifica anti-bot mancante").max(2000),
});

export const licenseCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^DBY-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Formato codice non valido");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug non valido");

export const productPublishSchema = z.object({
  title: z.string().trim().min(2).max(120),
  type: z.enum(["beat", "sample-pack", "soundtrack", "offerta"]),
  price: z.number().finite().min(0).max(100000),
  stripeLink: z.string().trim().max(500).default(""),
  description: z.string().trim().max(5000).default(""),
  filePath: z.string().trim().max(300).default(""),
});

export const licenseIssueSchema = z.object({
  productSlug: slugSchema,
  email,
});

export const passwordSchema = z
  .string()
  .min(12, "Password minima 12 caratteri")
  .max(128, "Password troppo lunga");

export const registerSchema = z.object({
  email,
  password: passwordSchema,
  turnstile: z.string().min(1, "Verifica anti-bot mancante").max(2000),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
  turnstile: z.string().min(1, "Verifica anti-bot mancante").max(2000),
});

export const totpCodeSchema = z.string().trim().regex(/^\d{6}$/, "Codice a 6 cifre");

export const licenseTierSchema = z.enum(["base", "premium", "esclusiva"]);

export const cartItemSchema = z.object({
  slug: slugSchema,
  tier: licenseTierSchema.default("base"),
});

export const checkoutSchema = z.object({
  email,
  items: z.array(cartItemSchema).min(1, "Carrello vuoto").max(20),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Devi accettare i termini" }) }),
  turnstile: z.string().min(1, "Verifica anti-bot mancante").max(2000),
});

/** Estrae i messaggi d'errore zod in forma leggibile per le API. */
export function zodErrors(error: z.ZodError): string[] {
  return error.issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`);
}
