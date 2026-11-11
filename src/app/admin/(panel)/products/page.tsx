"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product, StockStatus } from "@/lib/types";
import { formatPrice, STOCK_LABELS } from "@/lib/utils";
import { Toast } from "@/components/admin/Toast";

export default function ProductsAdmin() {
  const supabase = createClient();
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" }>({ msg: "", type: "ok" });
  const clearToast = useCallback(() => setToast({ msg: "", type: "ok" }), []);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(name), category:categories(name)")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) setToast({ msg: error.message, type: "err" });
    setRows((data as Product[]) || []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return rows.filter((r) => !t || r.name.toLowerCase().includes(t) || r.brand?.name?.toLowerCase().includes(t));
  }, [rows, q]);

  async function patch(id: string, values: Partial<Product>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...values } : r)));
    const { error } = await supabase.from("products").update(values).eq("id", id);
    if (error) {
      setToast({ msg: error.message, type: "err" });
      load();
    } else setToast({ msg: "Updated", type: "ok" });
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return setToast({ msg: error.message, type: "err" });
    setRows((rs) => rs.filter((r) => r.id !== id));
    setToast({ msg: "Deleted", type: "ok" });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary"><Plus className="h-4 w-4" /> Add product</Link>
      </div>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input className="input pl-9" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-zinc-400">No products.</div>
      ) : (
        <div className="card divide-y divide-white/5 overflow-hidden">
          {filtered.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:p-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {p.name} {!p.is_active && <span className="ml-1 rounded bg-zinc-700 px-1.5 text-[10px] uppercase">Hidden</span>}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {[p.brand?.name, p.category?.name].filter(Boolean).join(" · ")} · {formatPrice(p.price, "")}
                </p>
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <select
                  className="input w-auto flex-1 py-1.5 text-xs sm:flex-none"
                  value={p.stock_status}
                  onChange={(e) => patch(p.id, { stock_status: e.target.value as StockStatus })}
                >
                  {Object.entries(STOCK_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <button
                  onClick={() => patch(p.id, { is_featured: !p.is_featured })}
                  className={`rounded-lg p-2 hover:bg-white/10 ${p.is_featured ? "text-amber-400" : "text-zinc-600"}`}
                  aria-label="Toggle featured"
                  title="Featured on homepage"
                >
                  <Star className="h-4 w-4" fill={p.is_featured ? "currentColor" : "none"} />
                </button>
                <Link href={`/admin/products/${p.id}`} className="rounded-lg p-2 hover:bg-white/10" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
                <button onClick={() => remove(p.id)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Toast msg={toast.msg} type={toast.type} onDone={clearToast} />
    </div>
  );
}
