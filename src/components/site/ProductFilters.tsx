"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import type { Brand, Category } from "@/lib/types";

export function ProductFilters({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [pending, start] = useTransition();

  function update(key: string, value: string | null) {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    start(() => router.push(`/products${sp.toString() ? `?${sp}` : ""}`, { scroll: false }));
  }

  const cat = params.get("category");
  const brand = params.get("brand");

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ring-1 ${
      active ? "bg-violet-600 text-white ring-violet-500" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"
    }`;

  return (
    <div className={`space-y-4 transition ${pending ? "opacity-70" : ""}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update("q", q.trim() || null);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search phones..."
          className="input py-3 pl-11 pr-10 text-base"
          type="search"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); update("q", null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" aria-label="Clear search">
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      <div>
        <p className="label">Category</p>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <button className={chip(!cat)} onClick={() => update("category", null)}>All</button>
          {categories.map((c) => (
            <button key={c.id} className={chip(cat === c.slug)} onClick={() => update("category", cat === c.slug ? null : c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="label">Brand</p>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <button className={chip(!brand)} onClick={() => update("brand", null)}>All</button>
          {brands.map((b) => (
            <button key={b.id} className={chip(brand === b.slug)} onClick={() => update("brand", brand === b.slug ? null : b.slug)}>
              {b.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
