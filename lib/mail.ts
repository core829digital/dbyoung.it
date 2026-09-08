import { NextResponse } from "next/server";

/** Invia email via Resend se configurato, altrimenti logga (mock dev). */
export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "DBYoung <noreply@dbyoung.it>";
  if (!key) {
    console.log("[mock-email]", { to, subject });
    return { mocked: true };
  }
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  return resend.emails.send({ from, to, subject, html });
}

export function ok(data: unknown = {}) {
  return NextResponse.json({ ok: true, ...((data as object) ?? {}) });
}
