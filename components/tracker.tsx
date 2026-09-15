"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackView } from "@/lib/analytics";

/** Traccia visite aggregate (locale, privacy-friendly: solo conteggi). */
export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname && !pathname.startsWith("/admin")) trackView(pathname);
  }, [pathname]);
  return null;
}
