import { SimpleCrud } from "@/components/admin/SimpleCrud";

export default function CategoriesAdmin() {
  return (
    <SimpleCrud
      table="categories"
      title="Categories"
      folder="categories"
      slugFrom="name"
      defaults={{ name: "", slug: "", sort_order: 0 }}
      columns={[{ key: "name", label: "Name" }]}
      fields={[
        { key: "name", label: "Name", type: "text", required: true },
        { key: "slug", label: "URL slug", type: "text", help: "Leave empty to generate from the name" },
        { key: "sort_order", label: "Sort order", type: "number" },
      ]}
    />
  );
}
