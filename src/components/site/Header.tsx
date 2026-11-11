"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import type { Settings } from "@/lib/types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({ settings }: { settings: Settings | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const name = settings?.site_name || "";

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#08080c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          {settings?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt={name} className="h-9 w-auto max-w-[140px] object-contain" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-black">
              {name.slice(0, 1)}
            </span>
          )}
          <span className="text-lg font-bold tracking-tight">{name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  active ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/products" aria-label="Search products" className="rounded-lg p-2 text-zinc-300 hover:bg-white/10">
            <Search className="h-5 w-5" />
          </Link>
          <button
            className="rounded-lg p-2 text-zinc-300 hover:bg-white/10 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/5 px-4 pb-4 pt-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-base font-medium text-zinc-200 hover:bg-white/5"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
