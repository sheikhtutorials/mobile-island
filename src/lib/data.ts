import { createClient } from "./supabase/server";
import type { Banner, Brand, Category, Product, Settings } from "./types";

export async function getSettings(): Promise<Settings | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return data as Settings | null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  return (data as Category[]) || [];
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").order("sort_order").order("name");
  return (data as Brand[]) || [];
}

export async function getBanners(): Promise<Banner[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data as Banner[]) || [];
}

const PRODUCT_SELECT = "*, brand:brands(*), category:categories(*)";

export async function getProducts(opts: {
  q?: string;
  category?: string;
  brand?: string;
  featured?: boolean;
  limit?: number;
} = {}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);

  if (opts.featured) query = query.eq("is_featured", true);
  if (opts.category) {
    const { data: c } = await supabase.from("categories").select("id").eq("slug", opts.category).maybeSingle();
    if (!c) return [];
    query = query.eq("category_id", c.id);
  }
  if (opts.brand) {
    const { data: b } = await supabase.from("brands").select("id").eq("slug", opts.brand).maybeSingle();
    if (!b) return [];
    query = query.eq("brand_id", b.id);
  }
  if (opts.q) {
    const term = opts.q.replace(/[%,()]/g, " ").trim();
    if (term) query = query.or(`name.ilike.%${term}%,short_description.ilike.%${term}%`);
  }
  query = query.order("sort_order").order("created_at", { ascending: false });
  if (opts.limit) query = query.limit(opts.limit);

  const { data } = await query;
  return (data as Product[]) || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data as Product | null;
}
