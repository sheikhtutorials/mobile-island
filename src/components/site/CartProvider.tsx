"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";

const KEY = "mi-cart-v1";
const MAX_QTY = 20;

type Ctx = {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.id === item.id);
      if (found) return cur.map((i) => (i.id === item.id ? { ...i, ...item, qty: Math.min(i.qty + qty, MAX_QTY) } : i));
      return [...cur, { ...item, qty }];
    });
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, MAX_QTY)) } : i)));
  }, []);
  const remove = useCallback((id: string) => setItems((cur) => cur.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.qty * i.price, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, ready, add, setQty, remove, clear]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
