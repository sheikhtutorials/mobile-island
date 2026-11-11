import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductFilters } from "@/components/site/ProductFilters";
import { getBrands, getCategories, getProducts, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  const q = one(sp.q);
  const category = one(sp.category);
  const brand = one(sp.brand);

  const [settings, categories, brands, products] = await Promise.all([
    getSettings(),
    getCategories(),
    getBrands(),
    getProducts({ q, category, brand }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
      <p className="mt-1 text-sm text-zinc-400">
        {products.length} {products.length === 1 ? "phone" : "phones"} found
      </p>

      <div className="mt-6">
        <Suspense>
          <ProductFilters categories={categories} brands={brands} />
        </Suspense>
      </div>

      {products.length ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} currency={settings?.currency || ""} />
          ))}
        </div>
      ) : (
        <div className="card mt-8 p-10 text-center text-zinc-400">No phones match your filters.</div>
      )}
    </div>
  );
}
