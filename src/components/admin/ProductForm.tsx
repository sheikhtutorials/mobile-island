"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Brand, Category, Spec, StockStatus } from "@/lib/types";
import { slugify, STOCK_LABELS } from "@/lib/utils";
import { MultiImageField } from "./ImageField";
import { Toast } from "./Toast";

type Form = {
  id?: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  short_description: string;
  description: string;
  price: number | "";
  compare_price: number | "" | null;
  stock_status: StockStatus;
  is_featured: boolean;
  is_active: boolean;
  images: string[];
  specs: Spec[];
  sort_order: number;
};

const EMPTY: Form = {
  name: "",
  slug: "",
  brand_id: null,
  category_id: null,
  short_description: "",
  description: "",
  price: "",
  compare_price: "",
  stock_status: "in_stock",
  is_featured: false,
  is_active: true,
  images: [],
  specs: [
    { label: "Display", value: "" },
    { label: "Processor", value: "" },
    { label: "RAM / Storage", value: "" },
    { label: "Camera", value: "" },
    { label: "Battery", value: "" },
  ],
  sort_order: 0,
};

export function ProductForm({ id }: { id: string }) {
  const isNew = id === "new";
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState<Form | null>(isNew ? EMPTY : null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" }>({ msg: "", type: "ok" });
  const clearToast = useCallback(() => setToast({ msg: "", type: "ok" }), []);

  useEffect(() => {
    supabase.from("brands").select("*").order("sort_order").then(({ data }) => setBrands((data as Brand[]) || []));
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCategories((data as Category[]) || []));
    if (!isNew)
      supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) return router.replace("/admin/products");
          setForm({ ...EMPTY, ...data, compare_price: data.compare_price ?? "", specs: data.specs || [], images: data.images || [] });
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!form) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f!, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      price: Number(form.price) || 0,
      compare_price: form.compare_price === "" || form.compare_price === null ? null : Number(form.compare_price),
      specs: form.specs.filter((s) => s.label.trim() && s.value.trim()),
      updated_at: new Date().toISOString(),
    };
    delete (payload as Partial<Form>).id;
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", id);
    setSaving(false);
    if (error) return setToast({ msg: error.message, type: "err" });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="max-w-4xl pb-24">
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
        <ChevronLeft className="h-4 w-4" /> Products
      </Link>
      <h1 className="text-2xl font-bold">{isNew ? "Add product" : "Edit product"}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card space-y-4 p-5">
            <div>
              <label className="label">Name *</label>
              <input
                className="input"
                required
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
              />
            </div>
            <div>
              <label className="label">URL slug</label>
              <input className="input" value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
            </div>
            <div>
              <label className="label">Short description</label>
              <input className="input" value={form.short_description} onChange={(e) => set("short_description", e.target.value)} />
            </div>
            <div>
              <label className="label">Full description</label>
              <textarea className="input min-h-32" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 font-semibold">Images</h2>
            <MultiImageField value={form.images} onChange={(v) => set("images", v)} folder="products" />
          </section>

          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Specifications</h2>
              <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => set("specs", [...form.specs, { label: "", value: "" }])}>
                <Plus className="h-3.5 w-3.5" /> Add row
              </button>
            </div>
            <div className="space-y-2">
              {form.specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input w-2/5"
                    placeholder="Label"
                    value={s.label}
                    onChange={(e) => set("specs", form.specs.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)))}
                  />
                  <input
                    className="input flex-1"
                    placeholder="Value"
                    value={s.value}
                    onChange={(e) => set("specs", form.specs.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)))}
                  />
                  <button type="button" className="rounded-lg p-2 text-red-400 hover:bg-red-500/10" onClick={() => set("specs", form.specs.filter((_, k) => k !== i))} aria-label="Remove row">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <h2 className="font-semibold">Pricing &amp; stock</h2>
            <div>
              <label className="label">Price *</label>
              <input className="input" type="number" min={0} required value={form.price} onChange={(e) => set("price", e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Compare-at price</label>
              <input className="input" type="number" min={0} value={form.compare_price ?? ""} onChange={(e) => set("compare_price", e.target.value === "" ? "" : Number(e.target.value))} />
              <p className="mt-1 text-xs text-zinc-500">Shown crossed-out if higher than price</p>
            </div>
            <div>
              <label className="label">Stock status</label>
              <select className="input" value={form.stock_status} onChange={(e) => set("stock_status", e.target.value as StockStatus)}>
                {Object.entries(STOCK_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="font-semibold">Organization</h2>
            <div>
              <label className="label">Brand</label>
              <select className="input" value={form.brand_id ?? ""} onChange={(e) => set("brand_id", e.target.value || null)}>
                <option value="">— None —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category_id ?? ""} onChange={(e) => set("category_id", e.target.value || null)}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sort order</label>
              <input className="input" type="number" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value) || 0)} />
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" className="h-5 w-5 accent-violet-600" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} />
              <span className="text-sm">Featured on homepage</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" className="h-5 w-5 accent-violet-600" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
              <span className="text-sm">Visible on website</span>
            </label>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#08080c]/90 p-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-4xl justify-end gap-2">
          <Link href="/admin/products" className="btn-ghost">Cancel</Link>
          <button className="btn-primary" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save product
          </button>
        </div>
      </div>
      <Toast msg={toast.msg} type={toast.type} onDone={clearToast} />
    </form>
  );
}
