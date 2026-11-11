import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, Phone } from "lucide-react";
import { ProductGallery } from "@/components/site/ProductGallery";
import { ProductCard } from "@/components/site/ProductCard";
import { WhatsAppIcon } from "@/components/site/Icons";
import { getProductBySlug, getProducts, getSettings } from "@/lib/data";
import { formatPrice, STOCK_LABELS, whatsappLink } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  return p ? { title: p.name, description: p.short_description || undefined } : {};
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();

  const currency = settings?.currency || "";
  const stock = STOCK_LABELS[product.stock_status];
  const price = formatPrice(product.price, currency);
  const template = settings?.whatsapp_message || "Hi! I want to order: {product} ({price})";
  const msg = template.replace("{product}", product.name).replace("{price}", price);
  const wa = whatsappLink(settings, msg);
  const soldOut = product.stock_status === "out_of_stock";

  const related = product.category_id
    ? (await getProducts({ category: product.category?.slug, limit: 5 })).filter((p) => p.id !== product.id).slice(0, 4)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <Link href="/products" className="mb-5 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={product.images || []} name={product.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {product.brand && <span className="font-semibold uppercase tracking-wider text-violet-400">{product.brand.name}</span>}
            {product.category && <span className="rounded-md bg-white/5 px-2 py-0.5 text-zinc-400">{product.category.name}</span>}
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</h1>
          {product.short_description && <p className="mt-2 text-zinc-400">{product.short_description}</p>}

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-bold">{price}</p>
            {product.compare_price && product.compare_price > product.price && (
              <p className="pb-1 text-lg text-zinc-500 line-through">{formatPrice(product.compare_price, currency)}</p>
            )}
          </div>
          <span className={`mt-3 inline-block rounded-md px-2.5 py-1 text-xs font-medium ring-1 ${stock.cls}`}>{stock.label}</span>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn flex-1 bg-emerald-500 py-3.5 text-base text-white hover:bg-emerald-600 ${soldOut ? "pointer-events-none opacity-50" : ""}`}
                aria-disabled={soldOut}
              >
                <WhatsAppIcon /> {soldOut ? "Out of Stock" : "Order on WhatsApp"}
              </a>
            )}
            {settings?.phone && (
              <a href={`tel:${settings.phone}`} className="btn-ghost py-3.5 text-base">
                <Phone className="h-5 w-5" /> Call
              </a>
            )}
          </div>

          {product.description && (
            <div className="mt-8">
              <h2 className="mb-2 text-lg font-semibold">Overview</h2>
              <p className="whitespace-pre-line leading-relaxed text-zinc-300">{product.description}</p>
            </div>
          )}

          {product.specs?.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Specifications</h2>
              <dl className="card divide-y divide-white/5 overflow-hidden">
                {product.specs.map((s, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-3 text-sm">
                    <dt className="text-zinc-400">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-2xl font-bold tracking-tight">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} currency={currency} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
