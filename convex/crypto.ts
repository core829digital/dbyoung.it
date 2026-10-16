/**
 * Primitive crittografiche SOLO su Web Crypto API (nessun import node:, nessun import convex).
 * Stesso file logico di lib/adminSign.ts (canonicalizzazione identica) ma verificabile
 * nel runtime Convex (isolate V8: crypto.subtle disponibile).
 * Testabile con vitest in Node (globalThis.crypto presente da Node 20+).
 */

const enc = new TextEncoder();

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2 !== 0) throw new Error("hex non valido");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/** Byte casuali sicuri, in hex. */
export function randomHex(bytes: number): string {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  return bytesToHex(b);
}

export async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const buf = typeof data === "string" ? enc.encode(data) : data;
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", buf)));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function hmacSha256Hex(secret: string, data: string | Uint8Array): Promise<string> {
  const key = await hmacKey(secret);
  const buf = typeof data === "string" ? enc.encode(data) : data;
  return bytesToHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, buf)));
}

/** Confronto a tempo costante su stringhe hex. */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** JSON canonico: chiavi ordinate ricorsivamente. DEVE combaciare con lib/adminSign.ts. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

export interface ServerAuth {
  action: string;
  exp: number;
  sig: string;
}

/**
 * Verifica firma HMAC server-side per le mutation privilegiate.
 * Lancia su: segreto mancante, action diversa, scadenza, firma invalida.
 */
export async function requireServerAuth(
  params: Record<string, unknown>,
  auth: ServerAuth,
  expectedAction: string
): Promise<void> {
  const secret = process.env.ADMIN_ACTION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Server auth non configurata");
  if (!auth || auth.action !== expectedAction) throw new Error("Azione non autorizzata");
  if (!Number.isFinite(auth.exp) || auth.exp <= Date.now()) throw new Error("Autorizzazione scaduta");
  const payload = `${expectedAction}.${auth.exp}.${canonicalJson(params)}`;
  const expected = await hmacSha256Hex(secret, payload);
  if (!timingSafeEqualHex(expected, auth.sig)) throw new Error("Firma non valida");
}

/* ---------- Password hashing: PBKDF2-SHA256 ---------- */

const PBKDF2_ITER = 210_000;

export async function hashPassword(password: string): Promise<{ salt: string; hash: string; iter: number }> {
  const saltBytes = new Uint8Array(16);
  crypto.getRandomValues(saltBytes);
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: PBKDF2_ITER, hash: "SHA-256" },
    key,
    256
  );
  return { salt: bytesToHex(saltBytes), hash: bytesToHex(new Uint8Array(bits)), iter: PBKDF2_ITER };
}

export async function verifyPassword(
  password: string,
  stored: { salt: string; hash: string; iter: number }
): Promise<boolean> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: hexToBytes(stored.salt), iterations: stored.iter, hash: "SHA-256" },
    key,
    256
  );
  return timingSafeEqualHex(bytesToHex(new Uint8Array(bits)), stored.hash);
}

/* ---------- TOTP RFC 6238 (SHA-1, 30s, 6 cifre, finestra ±1) ---------- */

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Decode(s: string): Uint8Array {
  const clean = s.trim().replace(/=+$/, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx < 0) throw new Error("base32 non valido");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

async function hotp(secret: Uint8Array, counter: number): Promise<string> {
  const msg = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    msg[i] = c & 0xff;
    c = Math.floor(c / 256);
  }
  const key = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const offset = mac[mac.length - 1] & 0x0f;
  const code =
    ((mac[offset] & 0x7f) << 24) | ((mac[offset + 1] & 0xff) << 16) | ((mac[offset + 2] & 0xff) << 8) | (mac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}

export async function totpVerify(secretB32: string, code: string, atMs = Date.now(), window = 1): Promise<boolean> {
  if (!/^\d{6}$/.test(code)) return false;
  const secret = base32Decode(secretB32);
  const counter = Math.floor(atMs / 1000 / 30);
  for (let d = -window; d <= window; d++) {
    if ((await hotp(secret, counter + d)) === code) return true;
  }
  return false;
}

/** Cifra il segreto TOTP con AES-GCM (chiave da env TOTP_ENCRYPTION_KEY, base64 32 byte). */
export async function encryptTotpSecret(secretB32: string): Promise<string> {
  const keyB64 = process.env.TOTP_ENCRYPTION_KEY ?? "";
  const raw = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  if (raw.length !== 32) throw new Error("TOTP_ENCRYPTION_KEY mancante o invalida (base64 di 32 byte)");
  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt"]);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(secretB32)));
  const packed = new Uint8Array(12 + ct.length);
  packed.set(iv);
  packed.set(ct, 12);
  return btoa(String.fromCharCode(...packed));
}

/** Decifra il segreto TOTP cifrato con encryptTotpSecret. */
export async function decryptTotpSecret(packedB64: string): Promise<string> {
  const keyB64 = process.env.TOTP_ENCRYPTION_KEY ?? "";
  const raw = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
  const packed = Uint8Array.from(atob(packedB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["decrypt"]);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: packed.slice(0, 12) }, key, packed.slice(12));
  return new TextDecoder().decode(pt);
}
