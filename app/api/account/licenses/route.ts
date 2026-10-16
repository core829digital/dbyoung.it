import { NextResponse } from "next/server";
import { signedQuery, getSessionUser } from "@/lib/serverConvex";
import { readSessionToken } from "@/lib/session";
import { PRODUCTS } from "@/lib/data";
import { api } from "@/convex/_generated/api";

/** Licenze dell'utente loggato, arricchite col catalogo (per /account e /libreria). */
export async function GET() {
  const user = await getSessionUser(await readSessionToken());
  if (!user) return NextResponse.json({ ok: false, error: "Non autenticato." }, { status: 401 });

  const licenses = await signedQuery<Array<{ code: string; productSlug: string; active: boolean; createdAt: string }>>(
    api.licenses.listByUser,
    "licenses.listByUser",
    { userId: user.id },
    { userId: user.id }
  );
  const out = (licenses ?? []).map((l) => {
    const p = PRODUCTS.find((x) => x.slug === l.productSlug);
    return {
      code: l.code,
      slug: l.productSlug,
      active: l.active,
      createdAt: l.createdAt,
      title: p?.title ?? l.productSlug,
      type: p?.type ?? "beat",
      cover: p?.cover ?? "",
      preview: p?.preview ?? "",
    };
  });
  return NextResponse.json({ ok: true, licenses: out });
}
