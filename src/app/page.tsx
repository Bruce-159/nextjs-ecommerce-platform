import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const featuredProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const serialized = featuredProducts.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    stock: product.stock,
    category: product.category,
  }));

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.45), transparent 45%), radial-gradient(circle at 80% 10%, rgba(148,163,184,0.25), transparent 40%)",
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="text-3xl font-bold tracking-tight sm:text-4xl">
            NookShop
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            探索優質好物
          </h1>
          <p className="max-w-xl text-lg text-indigo-100 sm:text-xl">
            精選商品，安心購物
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-sm font-semibold text-slate-900 transition-colors duration-200 hover:bg-indigo-50"
            >
              瀏覽商品
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/40 px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
              >
                前往主控台
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                精選商品
              </h2>
              <p className="mt-2 text-slate-600">最新上架的好物推薦</p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700"
            >
              查看全部 →
            </Link>
          </div>

          {serialized.length === 0 ? (
            <p className="text-slate-600">目前尚無商品</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {serialized.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
