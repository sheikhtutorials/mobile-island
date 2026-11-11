"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Smartphone, Tags, Award, Images, Settings, LogOut, Menu, X, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Smartphone },
  { href: "/admin/categories", label: "Categories", Icon: Tags },
  { href: "/admin/brands", label: "Brands", Icon: Award },
  { href: "/admin/banners", label: "Banners", Icon: Images },
  { href: "/admin/settings", label: "Site Settings", Icon: Settings },
];

export function AdminNav({ email, siteName }: { email: string; siteName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {LINKS.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-violet-600/20 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5" /> {label}
          </Link>
        );
      })}
      <a href="/" target="_blank" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">
        <ExternalLink className="h-5 w-5" /> View site
      </a>
      <div className="mt-auto border-t border-white/5 pt-4">
        <p className="truncate px-3 text-xs text-zinc-500">{email}</p>
        <button onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
          <LogOut className="h-5 w-5" /> Log out
        </button>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 bg-[#08080c]/90 px-4 backdrop-blur lg:hidden">
        <p className="font-bold">{siteName} <span className="text-violet-400">Admin</span></p>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="flex h-full w-72 flex-col bg-zinc-950 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <p className="font-bold">{siteName} <span className="text-violet-400">Admin</span></p>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Close menu"><X className="h-5 w-5" /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-zinc-950/50 p-4 lg:flex">
        <p className="mb-8 px-3 text-lg font-bold">{siteName} <span className="text-violet-400">Admin</span></p>
        {nav}
      </aside>
    </>
  );
}
