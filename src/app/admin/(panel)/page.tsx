import Link from "next/link";
import { Smartphone, Tags, Award, Images, AlertTriangle, Star, ShoppingBag, Bell, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { formatPrice, ORDER_STATUS } from "@/lib/utils";

export default async function Dashboard() {
  const supabase = await createClient();
  const count = async (table: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (f) q = f(q);
    const { count } = await q;
    return count ?? 0;
  };
  const [products, categories, brands, banners, outOfStock, featured, orderCount, newOrders, ordersRes] = await Promise.all([
    count("products"),
    count("categories"),
    count("brands"),
    count("banners"),
    count("products", (q) => q.eq("stock_status", "out_of_stock")),
    count("products", (q) => q.eq("is_featured", true)),
    count("orders"),
    count("orders", (q) => q.eq("status", "new")),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
  ]);
  const orders = (ordersRes.data as Order[]) || [];
  const sales = orders.filter((o) => o.status === "delivered").reduce((n, o) => n + Number(o.total), 0);
  const recent = orders.slice(0, 5);

  const orderCards = [
    { label: "New orders", value: newOrders, href: "/admin/orders", Icon: Bell, hl: newOrders > 0 },
    { label: "Total orders", value: orderCount, href: "/admin/orders", Icon: ShoppingBag },
    { label: "Sales (delivered)", value: formatPrice(sales, "Rs."), href: "/admin/orders", Icon: Wallet },
  ];
  const cards = [
    { label: "Products", value: products, href: "/admin/products", Icon: Smartphone },
    { label: "Featured", value: featured, href: "/admin/products", Icon: Star },
    { label: "Out of stock", value: outOfStock, href: "/admin/products", Icon: AlertTriangle },
    { label: "Categories", value: categories, href: "/admin/categories", Icon: Tags },
    { label: "Brands", value: brands, href: "/admin/brands", Icon: Award },
    { label: "Banners", value: banners, href: "/admin/banners", Icon: Images },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-400">Everything on your website is managed from here.</p>

      {ordersRes.error && (
        <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-300">
          Orders are not set up yet — run <code>supabase/update-orders.sql</code> in the Supabase SQL Editor.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {orderCards.map(({ label, value, href, Icon, hl }) => (
          <Link key={label} href={href} className={`card p-4 transition hover:border-brand-500/40 sm:p-5 ${hl ? "border-sky-500/40 bg-sky-500/5" : ""}`}>
            <Icon className={`h-5 w-5 ${hl ? "text-sky-400" : "text-brand-400"}`} />
            <p className="mt-3 text-2xl font-bold sm:text-3xl">{value}</p>
            <p className="text-sm text-zinc-400">{label}</p>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="card mt-6 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 p-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand-400 hover:text-brand-300">View all</Link>
          </div>
          <div className="divide-y divide-white/5">
            {recent.map((o) => (
              <Link key={o.id} href="/admin/orders" className="flex items-center gap-3 p-4 text-sm hover:bg-white/[0.03]">
                <span className="font-bold">#{o.order_no}</span>
                <span className="min-w-0 flex-1 truncate text-zinc-300">{o.customer_name}</span>
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${ORDER_STATUS[o.status].cls}`}>{ORDER_STATUS[o.status].label}</span>
                <span className="shrink-0 font-semibold">{formatPrice(o.total, "Rs.")}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map(({ label, value, href, Icon }) => (
          <Link key={label} href={href} className="card p-4 transition hover:border-brand-500/40 sm:p-5">
            <Icon className="h-5 w-5 text-brand-400" />
            <p className="mt-3 text-3xl font-bold">{value}</p>
            <p className="text-sm text-zinc-400">{label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/products/new" className="btn-primary">+ Add product</Link>
        <Link href="/admin/settings" className="btn-ghost">Edit site settings</Link>
      </div>
    </div>
  );
}
