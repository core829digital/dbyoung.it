import { NextResponse } from "next/server";
import { signedQuery, requireAdmin } from "@/lib/serverConvex";
import { readSessionToken } from "@/lib/session";
import { api } from "@/convex/_generated/api";

/** Overview statistiche: solo admin (ricavi/ordini aggregati). */
export async function GET() {
  try {
    await requireAdmin(await readSessionToken());
  } catch (e) {
    const status = (e as { status?: number }).status ?? 401;
    return NextResponse.json({ ok: false, error: "Accesso riservato." }, { status });
  }
  const data = await signedQuery<{ totalViews: number; orders: number; revenue: number }>(
    api.stats.overview,
    "stats.overview",
    {}
  );
  if (!data) return NextResponse.json({ ok: false, error: "Backend non disponibile." }, { status: 502 });
  return NextResponse.json({ ok: true, ...data });
}
