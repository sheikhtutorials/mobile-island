"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/lib/types";
import { formatPrice, whatsappLink } from "@/lib/utils";
import { useCart } from "./CartProvider";
import { WhatsAppIcon } from "./Icons";

type Done = { orderNo: number; total: number; waText: string };

export function CartView({ settings }: { settings: Settings | null }) {
  const { items, total, ready, setQty, remove, clear } = useCart();
  const cur = settings?.currency || "";
  const [form, setForm] = useState({ name: "", phone: "", city: "", address: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { data, error } = await createClient().rpc("place_order", {
      p_name: form.name,
      p_phone: form.phone,
      p_city: form.city,
      p_address: form.address,
      p_notes: form.notes,
      p_items: items.map((i) => ({ product_id: i.id, qty: i.qty })),
    });
    setBusy(false);
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) {
      setErr(error?.message || "Could not place the order. Please try again or order on WhatsApp.");
      return;
    }
    const lines = items.map((i) => `• ${i.name} × ${i.qty} = ${formatPrice(i.price * i.qty, cur)}`).join("\n");
    const waText =
      `Hi ${settings?.site_name ?? ""}! I just placed order #${row.out_order_no}.\n\n${lines}\n\n` +
      `Total: ${formatPrice(row.out_total, cur)}\nName: ${form.name}\nPhone: ${form.phone}\n` +
      `Address: ${form.address}${form.city ? `, ${form.city}` : ""}${form.notes ? `\nNotes: ${form.notes}` : ""}`;
    setDone({ orderNo: row.out_order_no, total: Number(row.out_total), waText });
    clear();
    window.scrollTo({ top: 0 });
  }

  if (done) {
    const wa = whatsappLink(settings, done.waText);
    return (
      <div className="mx-auto max-w-md px-4 py-14 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Order placed!</h1>
        <p className="mt-2 text-zinc-400">
          Your order number is <b className="text-white">#{done.orderNo}</b> — total {formatPrice(done.total, cur)}.
          We will call you shortly to confirm.
        </p>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn mt-6 w-full bg-emerald-500 py-3.5 text-base text-white hover:bg-emerald-600">
            <WhatsAppIcon /> Send order on WhatsApp (faster)
          </a>
        )}
        <Link href="/products" className="btn-ghost mt-3 w-full py-3.5">Continue shopping</Link>
      </div>
    );
  }

  if (!ready) return <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>;

  if (!items.length)
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingCart className="mx-auto h-14 w-14 text-zinc-600" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-zinc-400">Add a phone to get started.</p>
        <Link href="/products" className="btn-primary mt-6">Browse phones</Link>
      </div>
    );

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Your Cart</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          {items.map((i) => (
            <div key={i.id} className="card flex gap-3 p-3">
              <Link href={`/products/${i.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {i.image && <img src={i.image} alt={i.name} className="h-full w-full object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${i.slug}`} className="line-clamp-2 font-semibold leading-snug">{i.name}</Link>
                  <button onClick={() => remove(i.id)} aria-label="Remove" className="-mr-1 -mt-1 rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center rounded-xl border border-white/10">
                    <button onClick={() => setQty(i.id, i.qty - 1)} className="p-2 text-zinc-300 disabled:opacity-30" disabled={i.qty <= 1} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                    <span className="w-7 text-center text-sm font-semibold">{i.qty}</span>
                    <button onClick={() => setQty(i.id, i.qty + 1)} className="p-2 text-zinc-300" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                  </div>
                  <p className="font-bold">{formatPrice(i.price * i.qty, cur)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={placeOrder} className="card h-fit space-y-4 p-5 lg:sticky lg:top-24 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-zinc-400">Total</span>
            <span className="text-2xl font-bold">{formatPrice(total, cur)}</span>
          </div>
          <h2 className="font-semibold">Delivery details</h2>
          <div>
            <label className="label">Full name *</label>
            <input className="input" required maxLength={100} value={form.name} onChange={set("name")} autoComplete="name" />
          </div>
          <div>
            <label className="label">Phone / WhatsApp *</label>
            <input className="input" required maxLength={30} type="tel" inputMode="tel" placeholder="03xx xxxxxxx" value={form.phone} onChange={set("phone")} autoComplete="tel" />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" maxLength={100} value={form.city} onChange={set("city")} autoComplete="address-level2" />
          </div>
          <div>
            <label className="label">Address *</label>
            <textarea className="input min-h-20" required maxLength={500} value={form.address} onChange={set("address")} autoComplete="street-address" />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" maxLength={1000} placeholder="Colour, storage, delivery time…" value={form.notes} onChange={set("notes")} />
          </div>
          {err && <p className="rounded-lg bg-red-500/10 p-2.5 text-sm text-red-400">{err}</p>}
          <button className="btn-primary w-full py-3.5 text-base" disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Place order · {formatPrice(total, cur)}
          </button>
          <p className="text-center text-xs text-zinc-500">Cash on delivery. We will call you to confirm before dispatch.</p>
        </form>
      </div>
    </div>
  );
}
