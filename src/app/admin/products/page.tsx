import Link from "next/link";
import AdminProductsTable from "@/components/AdminProductsTable";
import { prisma } from "@/lib/prisma";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = products.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    stock: product.stock,
    imageUrl: product.imageUrl,
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          商品管理
        </h1>
        <Link href="/admin/products/new" className="btn-primary">
          新增商品
        </Link>
      </div>
      <AdminProductsTable products={rows} />
    </div>
  );
}
