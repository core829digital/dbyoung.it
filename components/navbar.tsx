"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-obsidian/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fire to-fire-deep shadow-fire transition-transform group-hover:scale-110 group-hover:rotate-6">
            <Flame className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            DB<span className="text-fire-gradient">Young</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "link-fire text-sm transition-colors",
                pathname === n.href ? "text-fire-hot" : "text-white/70 hover:text-white"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/eventi"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition-all hover:border-fire/60 hover:text-fire-ember"
          >
            Prenota
          </Link>
          <Link href="/shop" className="btn-fire rounded-full px-5 py-2 text-sm font-semibold">
            Shop
          </Link>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-obsidian px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-base text-white/80 transition-colors hover:bg-fire/10 hover:text-fire-ember"
              >
                {n.label}
              </Link>
            ))}
            <Link href="/shop" onClick={() => setOpen(false)} className="btn-fire mt-2 rounded-full px-5 py-3 text-center font-semibold">
              Vai allo Shop
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
