"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Smartphone, ShoppingCart, MapPin } from "lucide-react";
import type { Settings } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";
import { WhatsAppIcon } from "./Icons";
import { CartLink } from "./CartLink";

const ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/products", label: "Phones", Icon: Smartphone },
  null, // WhatsApp slot
  { href: "/cart", label: "Cart", Icon: ShoppingCart },
  { href: "/contact", label: "Contact", Icon: MapPin },
];

/** App-style bottom bar, mobile only. Hidden on product detail (it has its own order bar). */
export function BottomNav({ settings }: { settings: Settings | null }) {
  const pathname = usePathname();
  if (/^\/products\/[^/]+/.test(pathname)) return null;
  const wa = whatsappLink(settings, `Hi ${settings?.site_name ?? ""}!`);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#050913]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid h-16 grid-cols-5">
        {ITEMS.map((item, i) => {
          if (!item)
            return (
              <div key="wa" className="flex justify-center">
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat on WhatsApp"
                    className="-mt-5 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-[#050913] active:scale-95"
                  >
                    <WhatsAppIcon className="h-7 w-7" />
                  </a>
                )}
              </div>
            );
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          if (item.href === "/cart")
            return (
              <CartLink
                key={i}
                label="Cart"
                className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition active:scale-95 ${
                  active ? "text-brand-400" : "text-zinc-400"
                }`}
              />
            );
          return (
            <Link
              key={i}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition active:scale-95 ${
                active ? "text-brand-400" : "text-zinc-400"
              }`}
            >
              <item.Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
