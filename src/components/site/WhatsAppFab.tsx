import type { Settings } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";
import { WhatsAppIcon } from "./Icons";

export function WhatsAppFab({ settings }: { settings: Settings | null }) {
  const href = whatsappLink(settings, `Hi ${settings?.site_name ?? ""}!`);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
