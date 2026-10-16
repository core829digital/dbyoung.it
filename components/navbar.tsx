"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { NAV, type NavKey } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useLang, LangToggle, PHOTOS } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

/**
 * Header stile Prisma: pill centrata, incollata alla parte superiore,
 * con angoli inferiori arrotondati (rounded-b-2xl/3xl).
 */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  const { count } = useCart();
  if (pathname?.startsWith("/admin")) return null;

  const label = (key: NavKey) => t.nav[key];

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col items-center">
      <div className="flex items-center gap-2 rounded-b-2xl border border-t-0 border-white/10 bg-black/85 px-3 py-2 shadow-card backdrop-blur-md sm:gap-3 sm:px-4 md:gap-5 md:rounded-b-3xl md:px-6">
        <Link href="/" className="group flex items-center" aria-label="DBYoung — home">
          <Image src={PHOTOS.logo} alt="DBYoung logo" width={80} height={80} className="h-9 w-9 rounded-full object-cover shadow-fire transition-transform group-hover:scale-110 group-hover:rotate-6 md:h-10 md:w-10" />
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

        <Link href="/checkout" aria-label="Carrello" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-fire/60">
          <ShoppingCart className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-fire px-1 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </Link>
        <Link href="/account" aria-label="Account" className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-fire/60 sm:flex">
          <User className="h-4 w-4" />
        </Link>

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
