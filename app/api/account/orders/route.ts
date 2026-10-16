import { NextResponse } from "next/server";
import { signedQuery, getSessionUser } from "@/lib/serverConvex";
import { readSessionToken } from "@/lib/session";
import { api } from "@/convex/_generated/api";

/** Ordini dell'utente loggato. */
export async function GET() {
  const user = await getSessionUser(await readSessionToken());
  if (!user) return NextResponse.json({ ok: false, error: "Non autenticato." }, { status: 401 });

  const orders = await signedQuery<Array<{ _id: string; productId: string; email: string; amount: number; status: string }>>(
    api.orders.listByUser,
    "orders.listByUser",
    { userId: user.id },
    { userId: user.id }
  );
  return NextResponse.json({ ok: true, orders: orders ?? [] });
}
