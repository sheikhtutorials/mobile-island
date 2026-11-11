"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FieldInput, type FieldDef } from "@/components/admin/SimpleCrud";
import { Toast } from "@/components/admin/Toast";

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Branding",
    fields: [
      { key: "site_name", label: "Shop name", type: "text", required: true },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "logo_url", label: "Logo", type: "image" },
      { key: "currency", label: "Currency symbol", type: "text", placeholder: "Rs." },
      { key: "featured_title", label: "Homepage featured section title", type: "text" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "phone", label: "Phone", type: "text" },
      { key: "whatsapp", label: "WhatsApp number", type: "text", help: "Country code + number, digits only, e.g. 923001234567" },
      { key: "whatsapp_message", label: "WhatsApp order message", type: "text", help: "Use {product} and {price} as placeholders" },
      { key: "email", label: "Email", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "opening_hours", label: "Opening hours", type: "text" },
      { key: "map_embed_url", label: "Google Maps embed URL", type: "text", help: "Google Maps → Share → Embed a map → copy only the src=\"…\" URL" },
    ],
  },
  {
    title: "Social links",
    fields: [
      { key: "instagram_url", label: "Instagram URL", type: "text" },
      { key: "facebook_url", label: "Facebook URL", type: "text" },
      { key: "tiktok_url", label: "TikTok URL", type: "text" },
    ],
  },
  {
    title: "About page",
    fields: [
      { key: "about_title", label: "Heading", type: "text" },
      { key: "about_content", label: "Content", type: "textarea" },
      { key: "about_image_url", label: "Image", type: "image" },
    ],
  },
  {
    title: "Footer",
    fields: [
      { key: "footer_text", label: "Footer text", type: "text" },
      { key: "footer_credit", label: "Developer credit", type: "text" },
    ],
  },
];

export default function SettingsAdmin() {
  const supabase = createClient();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" }>({ msg: "", type: "ok" });
  const clearToast = useCallback(() => setToast({ msg: "", type: "ok" }), []);

  useEffect(() => {
    supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => setData(data || { id: 1, site_name: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    const { error } = await supabase.from("settings").upsert({ ...data, id: 1, updated_at: new Date().toISOString() });
    setSaving(false);
    setToast(error ? { msg: error.message, type: "err" } : { msg: "Settings saved", type: "ok" });
  }

  if (!data) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>;

  return (
    <form onSubmit={save} className="max-w-3xl pb-24">
      <h1 className="text-2xl font-bold">Site Settings</h1>
      <p className="mt-1 text-sm text-zinc-400">These values appear across the whole website.</p>
      <div className="mt-6 space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card p-5">
            <h2 className="mb-4 font-semibold">{s.title}</h2>
            <div className="grid gap-4">
              {s.fields.map((f) => (
                <FieldInput key={f.key} field={f} value={data[f.key]} onChange={(v) => setData((p) => ({ ...p!, [f.key]: v }))} folder="settings" />
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#08080c]/90 p-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-3xl justify-end">
          <button className="btn-primary w-full sm:w-auto" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings
          </button>
        </div>
      </div>
      <Toast msg={toast.msg} type={toast.type} onDone={clearToast} />
    </form>
  );
}
