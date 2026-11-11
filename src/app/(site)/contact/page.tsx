import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SocialLinks } from "@/components/site/SocialLinks";
import { WhatsAppIcon } from "@/components/site/Icons";
import { getSettings } from "@/lib/data";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSettings();
  const wa = whatsappLink(s, `Hi ${s?.site_name ?? ""}!`);
  const rows = [
    s?.address && { Icon: MapPin, label: "Address", value: s.address },
    s?.phone && { Icon: Phone, label: "Phone", value: s.phone, href: `tel:${s.phone}` },
    s?.email && { Icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    s?.opening_hours && { Icon: Clock, label: "Hours", value: s.opening_hours },
  ].filter(Boolean) as { Icon: typeof MapPin; label: string; value: string; href?: string }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
      <p className="mt-2 text-zinc-400">Visit our shop or message us — we reply fast.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn w-full bg-emerald-500 py-4 text-base text-white hover:bg-emerald-600">
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
          )}
          <div className="card divide-y divide-white/5">
            {rows.map(({ Icon, label, value, href }) => (
              <div key={label} className="flex gap-3 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600/15 text-violet-400">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
                  {href ? (
                    <a href={href} className="break-words font-medium hover:text-violet-300">{value}</a>
                  ) : (
                    <p className="break-words font-medium">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="card p-4">
            <p className="mb-3 text-xs uppercase tracking-wide text-zinc-500">Follow us</p>
            <SocialLinks settings={s} size="lg" />
          </div>
        </div>

        <div className="card min-h-[320px] overflow-hidden lg:col-span-3">
          {s?.map_embed_url ? (
            <iframe
              src={s.map_embed_url}
              title="Shop location"
              className="h-full min-h-[320px] w-full border-0 grayscale-[30%] invert-[90%] hue-rotate-180"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="grid h-full min-h-[320px] place-items-center text-zinc-500">Map not set</div>
          )}
        </div>
      </div>
    </div>
  );
}
