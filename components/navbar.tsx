"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV, type NavKey } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useLang, LangToggle, PHOTOS } from "@/lib/i18n";

/**
 * Header stile Prisma: pill centrata, incollata alla parte superiore,
 * con angoli inferiori arrotondati (rounded-b-2xl/3xl).
 */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  if (pathname?.startsWith("/admin")) return null;

  const label = (key: NavKey) => t.nav[key];

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col items-center">
      <div className="flex items-center gap-2 rounded-b-2xl border border-t-0 border-white/10 bg-black/85 px-3 py-2 shadow-card backdrop-blur-md sm:gap-3 sm:px-4 md:gap-5 md:rounded-b-3xl md:px-6">
        <Link href="/" className="group flex items-center" aria-label="DBYoung — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PHOTOS.logo} alt="DBYoung logo" className="h-9 w-9 rounded-full object-cover shadow-fire transition-transform group-hover:scale-110 group-hover:rotate-6 md:h-10 md:w-10" />
        </Link>

        <nav className="hidden items-center gap-3 md:gap-5 lg:flex">
          {NAV.filter((n) => n.key !== "home").map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "link-fire text-xs transition-colors xl:text-sm",
                pathname === n.href ? "text-fire-hot" : "hover:text-white"
              )}
              style={pathname === n.href ? undefined : { color: "rgba(255,255,255,0.8)" }}
            >
              {label(n.key)}
            </Link>
          ))}
        </nav>

        <LangToggle compact />

        <Link
          href="/shop"
          className="btn-fire hidden rounded-full px-4 py-1.5 text-xs font-semibold sm:block md:text-sm"
        >
          {t.nav.shopCta}
        </Link>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <nav className="mt-2 w-[calc(100%-1.5rem)] max-w-md rounded-2xl border border-white/10 bg-black/95 p-3 shadow-card backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-base transition-colors",
                  pathname === n.href
                    ? "bg-fire/15 text-fire-ember"
                    : "text-white/80 hover:bg-fire/10 hover:text-fire-ember"
                )}
              >
                {label(n.key)}
              </Link>
            ))}
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="btn-fire mt-2 rounded-full px-5 py-3 text-center font-semibold"
            >
              {t.nav.toShop}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
