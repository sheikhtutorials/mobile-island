import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  return <ProductForm id={id} />;
}
