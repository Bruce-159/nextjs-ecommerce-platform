import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import { categoryLabel } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

function stockStatus(stock: number) {
  if (stock === 0) {
    return {
      label: "缺貨",
      className: "bg-rose-50 text-rose-600",
    };
  }
  if (stock < 5) {
    return {
      label: "即將售完",
      className: "bg-amber-50 text-amber-600",
    };
  }
  return {
    label: "有貨",
    className: "bg-emerald-50 text-emerald-600",
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  const stock = stockStatus(product.stock);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-8 inline-block text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-indigo-600"
      >
        ← 返回商品列表
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-sm">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>

        <div className="flex flex-col">
          <span className="badge w-fit bg-gray-100 text-gray-600">
            {categoryLabel(product.category)}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            NT$ {Number(product.price).toLocaleString()}
          </p>
          <p className="mt-6 leading-relaxed text-slate-600">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm text-slate-500">庫存狀態</span>
            <span className={`badge ${stock.className}`}>{stock.label}</span>
            {product.stock > 0 ? (
              <span className="text-sm text-slate-500">
                （剩餘 {product.stock} 件）
              </span>
            ) : null}
          </div>

          <AddToCartButton
            productId={product.id}
            stock={product.stock}
            disabled={product.stock === 0}
          />
        </div>
      </div>
    </div>
  );
}
