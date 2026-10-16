import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  requireServerAuth,
  hashPassword,
  verifyPassword,
  randomHex,
  sha256Hex,
  totpVerify,
  base32Encode,
  encryptTotpSecret,
  decryptTotpSecret,
  type ServerAuth,
} from "./crypto";

/**
 * Auth portale clienti — TUTTE le function richiedono firma HMAC server-side
 * (vedi lib/adminSign.ts). Vengono chiamate SOLO dalle API route Next
 * (app/api/auth/*), mai direttamente dal browser: alcune ritornano segreti
 * monouso (OTP, token reset, challenge 2FA) destinati al server.
 *
 * Soggetto firmato per ogni action (deve combaciare col server):
 *  register/verifyEmail/login/requestPasswordReset → { email }
 *  verifyTotpLogin/loginBackupCode → { challenge }
 *  logout/me/totpSetup/totpEnable → { tokenHash }
 *  totpDisable → { tokenHash }
 *  resetPassword → { token }
 */

const authArg = v.object({ action: v.string(), exp: v.number(), sig: v.string() });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254);
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function publicUser(u: {
  _id: string;
  email: string;
  emailVerified: boolean;
  role: string;
  totpEnabled: boolean;
}) {
  return { id: u._id, email: u.email, emailVerified: u.emailVerified, role: u.role, totpEnabled: u.totpEnabled };
}

async function newSession(ctx: any, userId: string, meta: { ip?: string; ua?: string }) {
  const raw = randomHex(32);
  const tokenHash = await sha256Hex(raw);
  await ctx.db.insert("sessions", {
    tokenHash,
    userId,
    expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
    createdAt: Date.now(),
    ...meta,
  });
  return raw;
}

/** Registrazione: crea utente non verificato + OTP email (restituito al server che lo invia). */
export const register = mutation({
  args: { email: v.string(), password: v.string(), _auth: authArg },
  handler: async (ctx, a) => {
    const email = normEmail(a.email);
    await requireServerAuth({ email }, a._auth as ServerAuth, "auth.register");
    if (!EMAIL_RE.test(email)) throw new Error("Email non valida");
    if (a.password.length < 12 || a.password.length > 128) throw new Error("Password non valida");
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first();
    if (existing) throw new Error("Email già registrata");
    const passwordHash = await hashPassword(a.password);
    const role = adminEmails().includes(email) ? "admin" : "user";
    const userId = await ctx.db.insert("users", {
      email,
      emailVerified: false,
      passwordHash,
      role,
      totpEnabled: false,
      backupCodesHash: [],
      createdAt: new Date().toISOString(),
    });
    // OTP a 6 cifre, 15 min, tentativi limitati
    const otp = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    const olds = await ctx.db.query("emailOtps").withIndex("by_email", (q) => q.eq("email", email)).collect();
    for (const o of olds) await ctx.db.delete(o._id);
    await ctx.db.insert("emailOtps", {
      email,
      codeHash: await sha256Hex(otp),
      purpose: "verify",
      expiresAt: Date.now() + 15 * 60 * 1000,
      attempts: 0,
    });
    return { userId, otp };
  },
});

/** Verifica email con OTP. */
export const verifyEmail = mutation({
  args: { email: v.string(), code: v.string(), _auth: authArg },
  handler: async (ctx, a) => {
    const email = normEmail(a.email);
    await requireServerAuth({ email }, a._auth as ServerAuth, "auth.verifyEmail");
    const rec = await ctx.db
      .query("emailOtps")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .first();
    if (!rec || rec.purpose !== "verify") throw new Error("Codice non valido");
    if (rec.expiresAt <= Date.now()) {
      await ctx.db.delete(rec._id);
      throw new Error("Codice scaduto");
    }
    if (rec.attempts >= 5) {
      await ctx.db.delete(rec._id);
      throw new Error("Troppi tentativi");
    }
    if ((await sha256Hex(a.code.trim())) !== rec.codeHash) {
      await ctx.db.patch(rec._id, { attempts: rec.attempts + 1 });
      throw new Error("Codice non valido");
    }
    const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first();
    if (!user) throw new Error("Utente non trovato");
    await ctx.db.patch(user._id, { emailVerified: true });
    const all = await ctx.db.query("emailOtps").withIndex("by_email", (q) => q.eq("email", email)).collect();
    for (const o of all) await ctx.db.delete(o._id);
    return { verified: true };
  },
});

/** Login: password → sessione, oppure challenge 2FA se TOTP attivo. */
export const login = mutation({
  args: { email: v.string(), password: v.string(), ip: v.optional(v.string()), ua: v.optional(v.string()), _auth: authArg },
  handler: async (ctx, a) => {
    const email = normEmail(a.email);
    await requireServerAuth({ email }, a._auth as ServerAuth, "auth.login");
    const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first();
    const fail = new Error("Credenziali non valide");
    if (!user) throw fail;
    if (!(await verifyPassword(a.password, user.passwordHash))) throw fail;
    if (!user.emailVerified) {
      const err = new Error("Email non verificata") as Error & { code?: string };
      err.code = "unverified";
      throw err;
    }
    await ctx.db.patch(user._id, { lastLoginAt: new Date().toISOString() });
    if (user.totpEnabled) {
      const challenge = randomHex(32);
      await ctx.db.insert("totpChallenges", {
        tokenHash: await sha256Hex(challenge),
        userId: user._id,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      return { need2fa: true as const, challenge };
    }
    const session = await newSession(ctx, user._id, { ip: a.ip, ua: a.ua });
    return { need2fa: false as const, session, user: publicUser({ ...user, role: user.role }) };
  },
});

/** Completa il login 2FA con codice TOTP. */
export const verifyTotpLogin = mutation({
  args: { challenge: v.string(), code: v.string(), ip: v.optional(v.string()), ua: v.optional(v.string()), _auth: authArg },
  handler: async (ctx, a) => {
    const tokenHash = await sha256Hex(a.challenge);
    await requireServerAuth({ challenge: tokenHash }, a._auth as ServerAuth, "auth.verifyTotpLogin");
    const ch = await ctx.db.query("totpChallenges").withIndex("by_token", (q) => q.eq("tokenHash", tokenHash)).first();
    if (!ch || ch.expiresAt <= Date.now()) throw new Error("Sessione 2FA scaduta");
    const user = await ctx.db.get(ch.userId);
    if (!user || !user.totpEnabled || !user.totpSecretEnc) throw new Error("2FA non attiva");
    const secret = await decryptTotpSecret(user.totpSecretEnc);
    if (!(await totpVerify(secret, a.code.trim()))) throw new Error("Codice non valido");
    await ctx.db.delete(ch._id);
    const session = await newSession(ctx, user._id, { ip: a.ip, ua: a.ua });
    return { session, user: publicUser({ ...user, role: user.role }) };
  },
});

/** Login con codice di recupero (monouso). */
export const loginBackupCode = mutation({
  args: { challenge: v.string(), code: v.string(), ip: v.optional(v.string()), ua: v.optional(v.string()), _auth: authArg },
  handler: async (ctx, a) => {
    const tokenHash = await sha256Hex(a.challenge);
    await requireServerAuth({ challenge: tokenHash }, a._auth as ServerAuth, "auth.loginBackupCode");
    const ch = await ctx.db.query("totpChallenges").withIndex("by_token", (q) => q.eq("tokenHash", tokenHash)).first();
    if (!ch || ch.expiresAt <= Date.now()) throw new Error("Sessione 2FA scaduta");
    const user = await ctx.db.get(ch.userId);
    if (!user) throw new Error("Utente non trovato");
    const codeHash = await sha256Hex(a.code.trim().toUpperCase());
    const idx = user.backupCodesHash.indexOf(codeHash);
    if (idx < 0) throw new Error("Codice di recupero non valido");
    const remaining = [...user.backupCodesHash];
    remaining.splice(idx, 1);
    await ctx.db.patch(user._id, { backupCodesHash: remaining });
    await ctx.db.delete(ch._id);
    const session = await newSession(ctx, user._id, { ip: a.ip, ua: a.ua });
    return { session, user: publicUser({ ...user, role: user.role }), backupLeft: remaining.length };
  },
});

/** Logout: revoca la sessione. */
export const logout = mutation({
  args: { tokenHash: v.string(), _auth: authArg },
  handler: async (ctx, a) => {
    await requireServerAuth({ tokenHash: a.tokenHash }, a._auth as ServerAuth, "auth.logout");
    const s = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("tokenHash", a.tokenHash)).first();
    if (s) await ctx.db.delete(s._id);
    return { ok: true };
  },
});

/** Profilo dalla sessione (usato da /api/auth/me e dalle route admin). */
export const me = query({
  args: { tokenHash: v.string(), _auth: authArg },
  handler: async (ctx, a) => {
    await requireServerAuth({ tokenHash: a.tokenHash }, a._auth as ServerAuth, "auth.me");
    const s = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("tokenHash", a.tokenHash)).first();
    if (!s || s.expiresAt <= Date.now()) return null;
    const user = await ctx.db.get(s.userId);
    if (!user) return null;
    return { ...publicUser({ ...user, role: user.role }), isAdmin: user.role === "admin" };
  },
});

/** Richiede reset password: crea token monouso (il server lo invia via email). */
export const requestPasswordReset = mutation({
  args: { email: v.string(), _auth: authArg },
  handler: async (ctx, a) => {
    const email = normEmail(a.email);
    await requireServerAuth({ email }, a._auth as ServerAuth, "auth.requestPasswordReset");
    const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", email)).first();
    // Niente enumeration: risposta identica se l'utente non esiste
    if (!user) return { token: null as string | null };
    const token = randomHex(32);
    await ctx.db.insert("passwordResets", {
      tokenHash: await sha256Hex(token),
      userId: user._id,
      expiresAt: Date.now() + 3600 * 1000,
      used: false,
    });
    return { token };
  },
});

/** Applica reset password, invalida tutte le sessioni. */
export const resetPassword = mutation({
  args: { token: v.string(), newPassword: v.string(), _auth: authArg },
  handler: async (ctx, a) => {
    const tokenHash = await sha256Hex(a.token);
    await requireServerAuth({ token: tokenHash }, a._auth as ServerAuth, "auth.resetPassword");
    if (a.newPassword.length < 12 || a.newPassword.length > 128) throw new Error("Password non valida");
    const rec = await ctx.db.query("passwordResets").withIndex("by_token", (q) => q.eq("tokenHash", tokenHash)).first();
    if (!rec || rec.used || rec.expiresAt <= Date.now()) throw new Error("Link non valido o scaduto");
    await ctx.db.patch(rec._id, { used: true });
    await ctx.db.patch(rec.userId, { passwordHash: await hashPassword(a.newPassword) });
    const sessions = await ctx.db.query("sessions").filter((q) => q.eq(q.field("userId"), rec.userId)).collect();
    for (const s of sessions) await ctx.db.delete(s._id);
    return { ok: true };
  },
});

/** Inizia setup 2FA: genera segreto cifrato + URI otpauth (il server mostra il QR). */
export const totpSetup = mutation({
  args: { tokenHash: v.string(), _auth: authArg },
  handler: async (ctx, a) => {
    await requireServerAuth({ tokenHash: a.tokenHash }, a._auth as ServerAuth, "auth.totpSetup");
    const s = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("tokenHash", a.tokenHash)).first();
    if (!s || s.expiresAt <= Date.now()) throw new Error("Sessione non valida");
    const user = await ctx.db.get(s.userId);
    if (!user) throw new Error("Utente non trovato");
    const raw = new Uint8Array(20);
    crypto.getRandomValues(raw);
    const manualKey = base32Encode(raw);
    await ctx.db.patch(user._id, { totpSecretEnc: await encryptTotpSecret(manualKey) });
    const otpauthUrl = `otpauth://totp/DBYoung:${encodeURIComponent(user.email)}?secret=${manualKey}&issuer=DBYoung&algorithm=SHA1&digits=6&period=30`;
    return { otpauthUrl, manualKey };
  },
});

/** Attiva 2FA verificando un codice + genera codici di recupero (mostrati una volta). */
export const totpEnable = mutation({
  args: { tokenHash: v.string(), code: v.string(), _auth: authArg },
  handler: async (ctx, a) => {
    await requireServerAuth({ tokenHash: a.tokenHash }, a._auth as ServerAuth, "auth.totpEnable");
    const s = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("tokenHash", a.tokenHash)).first();
    if (!s || s.expiresAt <= Date.now()) throw new Error("Sessione non valida");
    const user = await ctx.db.get(s.userId);
    if (!user?.totpSecretEnc) throw new Error("Setup 2FA non iniziato");
    const secret = await decryptTotpSecret(user.totpSecretEnc);
    if (!(await totpVerify(secret, a.code.trim()))) throw new Error("Codice non valido");
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const codes: string[] = [];
    const rb = new Uint8Array(8);
    for (let i = 0; i < 10; i++) {
      crypto.getRandomValues(rb);
      codes.push(Array.from(rb, (b) => alphabet[b % alphabet.length]).join(""));
    }
    await ctx.db.patch(user._id, {
      totpEnabled: true,
      backupCodesHash: await Promise.all(codes.map((c) => sha256Hex(c))),
    });
    return { enabled: true, backupCodes: codes };
  },
});

/** Disattiva 2FA (richiede password). */
export const totpDisable = mutation({
  args: { tokenHash: v.string(), password: v.string(), _auth: authArg },
  handler: async (ctx, a) => {
    await requireServerAuth({ tokenHash: a.tokenHash }, a._auth as ServerAuth, "auth.totpDisable");
    const s = await ctx.db.query("sessions").withIndex("by_token", (q) => q.eq("tokenHash", a.tokenHash)).first();
    if (!s || s.expiresAt <= Date.now()) throw new Error("Sessione non valida");
    const user = await ctx.db.get(s.userId);
    if (!user) throw new Error("Utente non trovato");
    if (!(await verifyPassword(a.password, user.passwordHash))) throw new Error("Password errata");
    await ctx.db.patch(user._id, { totpEnabled: false, totpSecretEnc: undefined, backupCodesHash: [] });
    return { ok: true };
  },
});
