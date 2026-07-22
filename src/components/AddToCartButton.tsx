"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart, type CartView } from "@/components/CartProvider";

type AddToCartButtonProps = {
  productId: string;
  stock: number;
  disabled?: boolean;
};

export default function AddToCartButton({
  productId,
  stock,
  disabled = false,
}: AddToCartButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const { setCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleAddToCart() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        setToast("加入購物車失敗");
        return;
      }

      const cart = (await response.json()) as CartView;
      setCart(cart);
      setToast("已加入購物車");
    } catch {
      setToast("加入購物車失敗");
    } finally {
      setLoading(false);
    }
  }

  const maxQty = Math.max(stock, 1);

  return (
    <>
      <div className="mt-6 flex w-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">數量</span>
          <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300">
            <button
              type="button"
              disabled={quantity <= 1 || disabled}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center text-slate-700 transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="減少數量"
            >
              −
            </button>
            <span className="flex h-11 w-12 items-center justify-center border-x border-gray-300 text-sm font-medium text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= maxQty || disabled}
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="flex h-11 w-11 items-center justify-center text-slate-700 transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="增加數量"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled || loading || stock === 0}
          onClick={handleAddToCart}
          className="btn-primary w-full"
        >
          {stock === 0 ? "缺貨" : loading ? "加入中..." : "加入購物車"}
        </button>
      </div>

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
