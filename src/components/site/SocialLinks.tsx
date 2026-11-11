import type { Settings } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "./Icons";

export function SocialLinks({ settings, size = "md" }: { settings: Settings | null; size?: "md" | "lg" }) {
  const wa = whatsappLink(settings);
  const items = [
    wa && { href: wa, label: "WhatsApp", Icon: WhatsAppIcon, cls: "hover:bg-emerald-500" },
    settings?.instagram_url && { href: settings.instagram_url, label: "Instagram", Icon: InstagramIcon, cls: "hover:bg-pink-600" },
    settings?.facebook_url && { href: settings.facebook_url, label: "Facebook", Icon: FacebookIcon, cls: "hover:bg-blue-600" },
    settings?.tiktok_url && { href: settings.tiktok_url, label: "TikTok", Icon: TikTokIcon, cls: "hover:bg-zinc-700" },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof WhatsAppIcon; cls: string }[];

  const box = size === "lg" ? "h-12 w-12" : "h-10 w-10";
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ href, label, Icon, cls }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`grid ${box} place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition hover:text-white ${cls}`}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
