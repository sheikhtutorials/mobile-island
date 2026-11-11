import { SimpleCrud } from "@/components/admin/SimpleCrud";

export default function BrandsAdmin() {
  return (
    <SimpleCrud
      table="brands"
      title="Brands"
      folder="brands"
      slugFrom="name"
      defaults={{ name: "", slug: "", logo_url: "", sort_order: 0 }}
      columns={[{ key: "logo_url", label: "Logo", type: "image" }, { key: "name", label: "Name" }]}
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "slug", label: "URL slug", type: "text", help: "Leave empty to generate from the name" },
        { key: "logo_url", label: "Logo (optional)", type: "image" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}
