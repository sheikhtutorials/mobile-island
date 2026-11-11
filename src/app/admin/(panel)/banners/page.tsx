import { SimpleCrud } from "@/components/admin/SimpleCrud";

export default function BannersAdmin() {
  return (
    <SimpleCrud
      table="banners"
      title="Homepage Banners"
      folder="banners"
      defaults={{ title: "", subtitle: "", image_url: "", cta_text: "Shop Now", cta_link: "/products", sort_order: 0, is_active: true }}
      columns={[
        { key: "image_url", label: "Image", type: "image" },
        { key: "title", label: "Title" },
        { key: "is_active", label: "Active", type: "bool" },
      ]}
      fields={[
        { key: "image_url", label: "Banner image (wide, e.g. 1600×700)", type: "image" },
        { key: "title", label: "Heading", type: "text" },
        { key: "subtitle", label: "Sub-heading", type: "textarea" },
        { key: "cta_text", label: "Button text", type: "text" },
        { key: "cta_link", label: "Button link", type: "text", placeholder: "/products?brand=apple" },
        { key: "sort_order", label: "Sort order", type: "number" },
        { key: "is_active", label: "Show on homepage", type: "checkbox" },
      ]}
    />
  );
}
