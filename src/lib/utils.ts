import type { Settings, StockStatus } from "./types";

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(n: number | null | undefined, currency = "Rs.") {
  if (n === null || n === undefined) return "";
  return `${currency} ${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export const STOCK_LABELS: Record<StockStatus, { label: string; cls: string }> = {
  in_stock: { label: "In Stock", cls: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30" },
  low_stock: { label: "Low Stock", cls: "bg-amber-500/15 text-amber-400 ring-amber-500/30" },
  out_of_stock: { label: "Out of Stock", cls: "bg-red-500/15 text-red-400 ring-red-500/30" },
  pre_order: { label: "Pre-Order", cls: "bg-sky-500/15 text-sky-400 ring-sky-500/30" },
};

export function whatsappLink(settings: Settings | null, text?: string) {
  const num = (settings?.whatsapp || "").replace(/\D/g, "");
  if (!num) return null;
  return `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
