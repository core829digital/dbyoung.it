import { randomBytes } from "node:crypto";

/**
 * Generazione codici licenza DBY-XXXX-XXXX — SOLO server-side.
 * Alfabeto senza ambiguità (niente 0/O, 1/I/L).
 */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateLicenseCode(): string {
  const pick = (n: number) => Array.from(randomBytes(n), (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `DBY-${pick(4)}-${pick(4)}`;
}
