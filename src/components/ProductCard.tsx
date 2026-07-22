"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart, type CartView } from "@/components/CartProvider";
import { categoryLabel } from "@/lib/categories";

export type ProductCardData = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category: string;
};

type ProductCardProps = {
  product: ProductCardData;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { status } = useSession();
  const router = useRouter();
  const { setCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleAddToCart(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (product.stock === 0) return;

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (!response.ok) {
        setToast("加入失敗");
        return;
      }

      const cart = (await response.json()) as CartView;
      setCart(cart);
      setToast("已加入購物車");
    } catch {
      setToast("加入失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Link
        href={`/products/${product.id}`}
        className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <span className="badge w-fit bg-gray-100 text-gray-600">
            {categoryLabel(product.category)}
          </span>
          <h2 className="line-clamp-2 font-medium text-slate-900">
            {product.name}
          </h2>
          <p className="text-lg font-bold text-slate-900">
            NT$ {product.price.toLocaleString()}
          </p>
          <button
            type="button"
            disabled={product.stock === 0 || loading}
            onClick={handleAddToCart}
            className="btn-primary-sm mt-auto w-full"
          >
            {product.stock === 0
              ? "缺貨"
              : loading
                ? "加入中..."
                : "加入購物車"}
          </button>
        </div>
      </Link>

      {toast ? (
        <div
          className={`animate-toast-in fixed right-4 top-20 z-[60] rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.includes("失敗") ? "bg-rose-600" : "bg-emerald-600"
          }`}
          role="status"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
