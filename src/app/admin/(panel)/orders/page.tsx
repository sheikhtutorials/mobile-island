"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2, Phone, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/lib/types";
import { formatPrice, ORDER_STATUS } from "@/lib/utils";
import { Toast } from "@/components/admin/Toast";
import { WhatsAppIcon } from "@/components/site/Icons";

const FILTERS: (OrderStatus | "all")[] = ["all", "new", "confirmed", "delivered", "cancelled"];

function waNumber(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = "92" + d.slice(1); // Pakistani local → international
  return d;
}

export default function OrdersAdmin() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" }>({ msg: "", type: "ok" });
  const clearToast = useCallback(() => setToast({ msg: "", type: "ok" }), []);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) setToast({ msg: error.message, type: "err" });
    setOrders((data as Order[]) || []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    orders.forEach((o) => (c[o.status] = (c[o.status] || 0) + 1));
    return c;
  }, [orders]);
  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function setStatus(id: string, status: OrderStatus) {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      setToast({ msg: error.message, type: "err" });
      load();
    } else setToast({ msg: `Marked ${ORDER_STATUS[status].label}`, type: "ok" });
  }

  async function remove(id: string) {
    if (!confirm("Delete this order permanently?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return setToast({ msg: error.message, type: "err" });
    setOrders((os) => os.filter((o) => o.id !== id));
    setToast({ msg: "Order deleted", type: "ok" });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-zinc-400">Orders placed through the website cart.</p>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
              filter === f ? "bg-brand-600 text-white ring-brand-500" : "bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10"
            }`}
          >
            {f === "all" ? "All" : ORDER_STATUS[f].label} <span className="opacity-60">({counts[f] || 0})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
      ) : shown.length === 0 ? (
        <div className="card mt-5 p-10 text-center text-zinc-400">No orders here yet.</div>
      ) : (
        <div className="mt-5 space-y-3">
          {shown.map((o) => {
            const st = ORDER_STATUS[o.status];
            const isOpen = open === o.id;
            const qty = o.items.reduce((n, i) => n + i.qty, 0);
            return (
              <div key={o.id} className="card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : o.id)} className="flex w-full items-center gap-3 p-4 text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold">#{o.order_no}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-zinc-300">{o.customer_name} · {o.phone}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(o.created_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })} · {qty} item{qty === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold">{formatPrice(o.total, "Rs.")}</p>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-500 transition ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-white/5 p-4">
                    <div className="space-y-2">
                      {o.items.map((i, k) => (
                        <div key={k} className="flex items-center gap-3 text-sm">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <p className="min-w-0 flex-1 truncate">{i.name} <span className="text-zinc-500">× {i.qty}</span></p>
                          <p className="shrink-0">{formatPrice(i.price * i.qty, "Rs.")}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 text-sm">
                      <p><span className="text-zinc-500">Address:</span> {o.address}{o.city ? `, ${o.city}` : ""}</p>
                      {o.notes && <p className="mt-1"><span className="text-zinc-500">Notes:</span> {o.notes}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select className="input w-auto py-2 text-sm" value={o.status} onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}>
                        {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <a href={`tel:${o.phone.replace(/[^\d+]/g, "")}`} className="btn-ghost py-2"><Phone className="h-4 w-4" /> Call</a>
                      <a
                        href={`https://wa.me/${waNumber(o.phone)}?text=${encodeURIComponent(`Assalam o Alaikum ${o.customer_name}! Your order #${o.order_no} (${formatPrice(o.total, "Rs.")}) has been received.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn py-2 bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                      </a>
                      <button onClick={() => remove(o.id)} className="ml-auto rounded-lg p-2 text-red-400 hover:bg-red-500/10" aria-label="Delete order"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Toast msg={toast.msg} type={toast.type} onDone={clearToast} />
    </div>
  );
}
