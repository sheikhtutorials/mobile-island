"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartLink({ className = "", label }: { className?: string; label?: string }) {
  const { count } = useCart();
  return (
    <Link href="/cart" aria-label={`Cart (${count} items)`} className={`relative ${className}`}>
      <span className="relative">
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-2.5 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      {label}
    </Link>
  );
}
