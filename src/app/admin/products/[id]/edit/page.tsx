import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { prisma } from "@/lib/prisma";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">
        編輯商品
      </h1>
      <ProductForm
        mode="edit"
        productId={product.id}
        initialValues={{
          name: product.name,
          description: product.description,
          price: String(Number(product.price)),
          imageUrl: product.imageUrl,
          stock: String(product.stock),
          category: product.category,
        }}
      />
    </div>
  );
}
