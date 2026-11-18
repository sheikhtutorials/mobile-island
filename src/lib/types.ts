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
  mission_title: string | null;
  mission_content: string | null;
  vision_title: string | null;
  vision_content: string | null;
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

export type CartItem = { id: string; slug: string; name: string; price: number; image: string | null; qty: number };

export type OrderStatus = "new" | "confirmed" | "delivered" | "cancelled";
export type Order = {
  id: string;
  order_no: number;
  customer_name: string;
  phone: string;
  city: string | null;
  address: string;
  notes: string | null;
  items: { product_id: string; name: string; price: number; qty: number; image: string | null }[];
  total: number;
  status: OrderStatus;
  created_at: string;
};
