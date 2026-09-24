import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/data";
import { cloudVerifyLicense } from "@/lib/backend";

/** Verifica pubblica di un codice licenza — restituisce solo dati sicuri (niente file/percorsi). */
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  if (!code.trim()) return NextResponse.json({ valid: false });
  const lic = await cloudVerifyLicense(code);
  if (!lic) return NextResponse.json({ valid: false });
  const product = PRODUCTS.find((p) => p.slug === lic.productSlug);
  if (!product) return NextResponse.json({ valid: false });
  return NextResponse.json({
    valid: true,
    product: {
      slug: product.slug,
      title: product.title,
      type: product.type,
      cover: product.cover,
      preview: product.preview,
    },
  });
}
