import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, STOCK_LABELS } from "@/lib/utils";

export function ProductCard({ product, currency }: { product: Product; currency: string }) {
  const stock = STOCK_LABELS[product.stock_status];
  const img = product.images?.[0];
  const off =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-900">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-zinc-600">No image</div>
        )}
        {off > 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-lg bg-violet-600 px-2 py-1 text-[11px] font-bold">-{off}%</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.brand && <p className="text-[11px] font-medium uppercase tracking-wider text-violet-400">{product.brand.name}</p>}
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug sm:text-base">{product.name}</h3>
        <div className="mt-auto pt-3">
          <p className="text-base font-bold sm:text-lg">{formatPrice(product.price, currency)}</p>
          {off > 0 && <p className="text-xs text-zinc-500 line-through">{formatPrice(product.compare_price, currency)}</p>}
          <span className={`mt-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${stock.cls}`}>{stock.label}</span>
        </div>
      </div>
    </Link>
  );
}
