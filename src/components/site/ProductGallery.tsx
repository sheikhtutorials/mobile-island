"use client";

import { useRef, useState } from "react";

/** Swipeable on touch (scroll-snap), thumbnails + dots stay in sync. */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  if (!images.length) return <div className="card grid aspect-square place-items-center text-zinc-600">No image</div>;

  function go(i: number) {
    const el = track.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
    setActive(i);
  }

  return (
    <div>
      <div className="card relative overflow-hidden bg-zinc-900">
        <div
          ref={track}
          className="no-scrollbar flex aspect-square snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
        >
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src + i} src={src} alt={`${name} ${i + 1}`} className="h-full w-full shrink-0 snap-center object-cover" />
          ))}
        </div>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar mt-3 hidden gap-2 overflow-x-auto sm:flex">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => go(i)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition ${
                i === active ? "ring-brand-500" : "ring-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
