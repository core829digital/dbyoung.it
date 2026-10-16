/**
 * Sanitizzazione input â€” solo testo semplice in tutto il sito (niente HTML utente).
 * Da applicare DOPO la validazione (zod), al confine API/Convex, prima di DB ed email.
 * Pure functions: importabile ovunque (client, server, test).
 */

// Control-char + DEL (esclude \t \n \r che sono gestiti a parte)
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Normalizza unicode (NFKC), rimuove control-char/null-byte, collassa spazi, trim. */
export function sanitizeText(input: string, maxLength: number): string {
  return input
    .normalize("NFKC")
    .replace(CONTROL_CHARS, "")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Testo multilinea (messaggi): come sanitizeText ma preserva gli a-capo. */
export function sanitizeMultiline(input: string, maxLength: number): string {
  return input
    .normalize("NFKC")
    .replace(CONTROL_CHARS, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

/** Email: trim + lowercase + controllo basilare (la validazione resta a zod). */
export function sanitizeEmail(input: string): string {
  return input.normalize("NFKC").replace(CONTROL_CHARS, "").trim().toLowerCase().slice(0, 254);
}

/** Slug: solo [a-z0-9-], minuscolo. */
export function sanitizeSlug(input: string): string {
  return input.normalize("NFKC").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

/**
 * URL https con host in allowlist. Ritorna "" se non valida.
 * Usata per stripeLink e redirect.
 */
export function sanitizeHttpsUrl(input: string, allowedHosts: string[], maxLength = 500): string {
  const v = input.normalize("NFKC").replace(CONTROL_CHARS, "").trim().slice(0, maxLength);
  if (!v) return "";
  try {
    const u = new URL(v);
    if (u.protocol !== "https:") return "";
    if (!allowedHosts.includes(u.hostname)) return "";
    return u.toString();
  } catch {
    return "";
  }
}

export const STRIPE_LINK_HOSTS = ["buy.stripe.com", "checkout.stripe.com"];

/**
 * Percorso file privato: niente traversal, niente assoluti, solo charset sicuro.
 * Ritorna "" se non valido.
 */
export function sanitizeFilePath(input: string): string {
  const v = input.normalize("NFKC").replace(CONTROL_CHARS, "").trim().slice(0, 300);
  if (!v || v.startsWith("/") || v.startsWith("\\")) return "";
  if (v.includes("..")) return "";
  if (!/^[\w .&'()+,\-/@[\]]+$/.test(v)) return "";
  return v;
}
