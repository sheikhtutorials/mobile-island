"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";

export function AddToCartButton({
  product,
  variant = "full",
}: {
  product: Pick<Product, "id" | "slug" | "name" | "price" | "images" | "stock_status">;
  variant?: "full" | "compact" | "icon";
}) {
  const { add, items } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock_status === "out_of_stock";
  const inCart = items.some((i) => i.id === product.id);

  function onAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    add({ id: product.id, slug: product.slug, name: product.name, price: Number(product.price), image: product.images?.[0] ?? null });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  if (variant === "icon")
    return (
      <button
        onClick={onAdd}
        disabled={soldOut}
        aria-label={`Add ${product.name} to cart`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-500 active:scale-90 disabled:opacity-30"
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      </button>
    );

  if (inCart && !added && variant === "full")
    return (
      <div className="flex gap-2">
        <button onClick={onAdd} className="btn-ghost flex-1 py-3.5 text-base">+1 more</button>
        <Link href="/cart" className="btn-primary flex-1 py-3.5 text-base"><ShoppingCart className="h-5 w-5" /> View cart</Link>
      </div>
    );

  return (
    <button
      onClick={onAdd}
      disabled={soldOut}
      className={`btn-primary ${variant === "full" ? "w-full py-3.5 text-base" : "h-12 px-4"} active:scale-95`}
    >
      {added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
      {soldOut ? "Sold out" : added ? "Added!" : variant === "full" ? "Add to Cart" : "Add"}
    </button>
  );
}
