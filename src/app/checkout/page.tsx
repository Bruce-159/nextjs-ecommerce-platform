"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, type CartView } from "@/components/CartProvider";

export default function CheckoutPage() {
  const { cart, loading, refreshCart, setCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void refreshCart();
  }, [refreshCart]);

  async function handleCheckout() {
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "結帳失敗，請稍後再試");
        setSubmitting(false);
        return;
      }

      setCart({
        id: null,
        items: [],
        itemCount: 0,
        total: 0,
      } satisfies CartView);

      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.action;
      form.acceptCharset = "UTF-8";
      form.style.display = "none";
      form.target = "_self";

      Object.entries(data.params as Record<string, string>).forEach(
        ([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        },
      );

      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("結帳失敗，請稍後再試");
      setSubmitting(false);
    }
  }

  if (loading && cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">
          結帳
        </h1>
        <div className="h-48 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">無法結帳</h1>
        <p className="mt-2 text-slate-600">購物車是空的</p>
        <Link href="/products" className="btn-primary mt-8">
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">
        結帳
      </h1>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              訂單摘要
            </h2>
            <ul className="divide-y divide-gray-100">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      數量 × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-slate-900">
                    NT$ {item.subtotal.toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">付款資訊</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>小計</span>
                <span>NT$ {cart.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-slate-900">
                <span>總計</span>
                <span>NT$ {cart.total.toLocaleString()}</span>
              </div>
            </div>
            {error ? (
              <p className="mt-4 text-sm text-rose-600">{error}</p>
            ) : null}
            <button
              type="button"
              disabled={submitting}
              onClick={handleCheckout}
              className="btn-primary mt-6 w-full"
            >
              {submitting ? "導向付款頁面中..." : "確認付款"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
