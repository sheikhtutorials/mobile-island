import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { Settings } from "@/lib/types";
import { SocialLinks } from "./SocialLinks";

export function Footer({ settings }: { settings: Settings | null }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-white/5 bg-black/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-xl font-bold">{settings?.site_name}</p>
          {settings?.tagline && <p className="mt-2 max-w-sm text-sm text-zinc-400">{settings.tagline}</p>}
          <div className="mt-5">
            <SocialLinks settings={settings} />
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">Explore</p>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link href="/products" className="hover:text-white">All Products</Link></li>
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">Visit Us</p>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            {settings?.address && <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{settings.address}</li>}
            {settings?.phone && <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0" /><a href={`tel:${settings.phone}`} className="hover:text-white">{settings.phone}</a></li>}
            {settings?.email && <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0" /><a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a></li>}
            {settings?.opening_hours && <li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0" />{settings.opening_hours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-zinc-500 sm:flex-row sm:text-left">
          <p>© {year} {settings?.site_name}. {settings?.footer_text}</p>
          {settings?.footer_credit && (
            <p>
              Designed &amp; developed by <span className="font-medium text-zinc-300">{settings.footer_credit}</span>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
