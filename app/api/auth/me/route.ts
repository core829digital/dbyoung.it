import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/serverConvex";
import { readSessionToken } from "@/lib/session";

export async function GET() {
  const token = await readSessionToken();
  const user = await getSessionUser(token);
  if (!user) return NextResponse.json({ ok: false, user: null }, { status: 401 });
  return NextResponse.json({ ok: true, user });
}
