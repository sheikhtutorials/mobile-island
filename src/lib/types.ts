export type Settings = {
  id: number;
  site_name: string;
  tagline: string | null;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  map_embed_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  opening_hours: string | null;
  currency: string | null;
  whatsapp_message: string | null;
  about_title: string | null;
  about_content: string | null;
  about_image_url: string | null;
  featured_title: string | null;
  footer_text: string | null;
  footer_credit: string | null;
};

export type Category = { id: string; name: string; slug: string; sort_order: number };
export type Brand = { id: string; name: string; slug: string; logo_url: string | null; sort_order: number };

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "pre_order";
export type Spec = { label: string; value: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_price: number | null;
  stock_status: StockStatus;
  is_featured: boolean;
  is_active: boolean;
  images: string[];
  specs: Spec[];
  sort_order: number;
  brand?: Brand | null;
  category?: Category | null;
};

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
};
