import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { BottomNav } from "@/components/site/BottomNav";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <>
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      {/* spacer so the mobile bottom bar never covers the footer */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] md:hidden" />
      <WhatsAppFab settings={settings} />
      <BottomNav settings={settings} />
    </>
  );
}
