import { NextResponse } from "next/server";

/** Escape HTML per interpolare input utente nelle email (anti-XSS). */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isValidEmail(email: string): boolean {
  const v = email.trim();
  if (v.length < 3 || v.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/** Invia email via Resend se configurato, altrimenti logga (mock dev). */
export async function sendMail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "DBYoung <noreply@dbyoung.it>";
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[mock-email]", { to, subject, attachments: attachments?.map((a) => a.filename) });
    }
    return { mocked: true };
  }
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  return resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(attachments && attachments.length > 0 ? { attachments } : {}),
  });
}

export function ok(data: unknown = {}) {
  const obj = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
  return NextResponse.json({ ok: true, ...obj });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}
