import { NextResponse, type NextRequest } from "next/server";
import { parseAllowlist, isIpAllowed, clientIpFromHeaders } from "./lib/ipAllowlist";

/**
 * Difesa-in-profondità: /admin e /api/admin/* richiedono IP in allowlist
 * quando ADMIN_IP_ALLOWLIST è configurata. Non è l'unico controllo:
 * le API admin richiedono anche sessione admin + le mutation Convex
 * richiedono firma HMAC server-side (vedi lib/adminSign.ts).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsCheck = pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");
  if (!needsCheck) return NextResponse.next();

  const allowlist = parseAllowlist(process.env.ADMIN_IP_ALLOWLIST);
  if (allowlist.length === 0) return NextResponse.next();

  const ip = clientIpFromHeaders(req.headers);
  if (!isIpAllowed(ip, allowlist)) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
