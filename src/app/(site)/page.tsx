import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlider } from "@/components/site/HeroSlider";
import { ProductCard } from "@/components/site/ProductCard";
import { getBanners, getBrands, getCategories, getProducts, getSettings } from "@/lib/data";

export default async function HomePage() {
  const [settings, banners, featured, categories, brands] = await Promise.all([
    getSettings(),
    getBanners(),
    getProducts({ featured: true, limit: 8 }),
    getCategories(),
    getBrands(),
  ]);
  const currency = settings?.currency || "";

  return (
    <>
      <HeroSlider banners={banners} />

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-10">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            <Link href="/products" className="btn-ghost shrink-0 rounded-full">All Phones</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/products?category=${c.slug}`} className="btn-ghost shrink-0 rounded-full">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{settings?.featured_title}</h2>
          <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-violet-400 hover:text-violet-300">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} currency={currency} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">No featured products yet.</p>
        )}
      </section>

      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14">
          <h2 className="mb-5 text-2xl font-bold tracking-tight sm:text-3xl">Shop by Brand</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${b.slug}`}
                className="card flex aspect-[3/2] items-center justify-center p-4 text-center font-semibold transition hover:border-violet-500/40 hover:bg-white/[0.06]"
              >
                {b.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logo_url} alt={b.name} className="max-h-10 w-auto object-contain" />
                ) : (
                  b.name
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
