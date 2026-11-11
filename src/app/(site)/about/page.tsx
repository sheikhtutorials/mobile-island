import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">{s?.site_name}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{s?.about_title}</h1>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-zinc-300">{s?.about_content}</p>
        </div>
        <div className="card aspect-square overflow-hidden bg-gradient-to-br from-violet-600/30 to-indigo-600/10">
          {s?.about_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.about_image_url} alt={s.about_title || ""} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-6xl font-black text-white/20">{s?.site_name}</div>
          )}
        </div>
      </div>
    </div>
  );
}
