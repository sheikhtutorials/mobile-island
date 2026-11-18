import type { Metadata } from "next";
import { CartView } from "@/components/site/CartView";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Cart" };

export default async function CartPage() {
  const settings = await getSettings();
  return <CartView settings={settings} />;
}
