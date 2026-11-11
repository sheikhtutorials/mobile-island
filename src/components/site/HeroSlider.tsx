"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Banner } from "@/lib/types";

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  }, [i]);

  if (!banners.length) return null;

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-4 sm:pt-6">
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-3xl"
        onScroll={(e) => {
          const el = e.currentTarget;
          const idx = Math.round(el.scrollLeft / el.clientWidth);
          if (idx !== i) setI(idx);
        }}
      >
        {banners.map((b) => (
          <div key={b.id} className="relative w-full shrink-0 snap-center">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-zinc-900 sm:aspect-[16/7]">
              {b.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image_url} alt={b.title || ""} className="absolute inset-0 h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent sm:bg-gradient-to-r sm:from-black/75 sm:via-black/30" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:inset-y-0 sm:flex sm:max-w-xl sm:flex-col sm:justify-center sm:p-12">
                {b.title && <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{b.title}</h1>}
                {b.subtitle && <p className="mt-3 text-sm text-zinc-200 sm:text-lg">{b.subtitle}</p>}
                {b.cta_text && b.cta_link && (
                  <Link href={b.cta_link} className="btn mt-6 w-fit bg-white px-6 py-3 text-black hover:bg-zinc-200">
                    {b.cta_text}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-7 bg-violet-500" : "w-2 bg-white/25"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
