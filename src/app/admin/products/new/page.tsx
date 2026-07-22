import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">
        新增商品
      </h1>
      <ProductForm mode="create" />
    </div>
  );
}
