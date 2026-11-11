import Link from "next/link";
import { Smartphone, Tags, Award, Images, AlertTriangle, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const count = async (table: string, f?: (q: any) => any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (f) q = f(q);
    const { count } = await q;
    return count ?? 0;
  };
  const [products, categories, brands, banners, outOfStock, featured] = await Promise.all([
    count("products"),
    count("categories"),
    count("brands"),
    count("banners"),
    count("products", (q) => q.eq("stock_status", "out_of_stock")),
    count("products", (q) => q.eq("is_featured", true)),
  ]);

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
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {cards.map(({ label, value, href, Icon }) => (
          <Link key={label} href={href} className="card p-4 transition hover:border-violet-500/40 sm:p-5">
            <Icon className="h-5 w-5 text-violet-400" />
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
