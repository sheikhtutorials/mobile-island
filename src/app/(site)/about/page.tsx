import type { Metadata } from "next";
import { Eye, Target } from "lucide-react";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const s = await getSettings();
  const blocks = [
    { Icon: Target, title: s?.mission_title, text: s?.mission_content },
    { Icon: Eye, title: s?.vision_title, text: s?.vision_content },
  ].filter((b) => b.title && b.text);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-400">{s?.site_name}</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{s?.about_title}</h1>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-zinc-300">{s?.about_content}</p>
        </div>
        <div className="card aspect-square overflow-hidden bg-gradient-to-br from-navy to-brand-800/40">
          {s?.about_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.about_image_url} alt={s.about_title || ""} className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/brand/logo-full-light.png" alt={s?.site_name || ""} className="h-full w-full object-contain p-10" />
          )}
        </div>
      </div>

      {blocks.length > 0 && (
        <div className="mt-12 grid gap-4 sm:mt-16 sm:gap-6 md:grid-cols-2">
          {blocks.map(({ Icon, title, text }) => (
            <section key={title} className="card p-6 sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight">{title}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-zinc-300">{text}</p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
