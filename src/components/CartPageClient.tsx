"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart, type CartView } from "@/components/CartProvider";

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto h-16 w-16 text-gray-300"
      aria-hidden
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function QuantityControl({
  quantity,
  max,
  busy,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  max: number;
  busy: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300">
      <button
        type="button"
        disabled={busy}
        onClick={onDecrease}
        className="flex h-9 w-9 items-center justify-center text-slate-700 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50"
        aria-label="減少數量"
      >
        −
      </button>
      <span className="flex h-9 w-10 items-center justify-center border-x border-gray-300 text-sm font-medium text-slate-900">
        {quantity}
      </span>
      <button
        type="button"
        disabled={busy || quantity >= max}
        onClick={onIncrease}
        className="flex h-9 w-9 items-center justify-center text-slate-700 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50"
        aria-label="增加數量"
      >
        +
      </button>
    </div>
  );
}

export default function CartPageClient() {
  const { cart, loading, setCart } = useCart();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateQuantity(itemId: string, quantity: number) {
    setUpdatingId(itemId);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) return;

      const nextCart = (await response.json()) as CartView;
      setCart(nextCart);
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(itemId: string) {
    setUpdatingId(itemId);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) return;

      const nextCart = (await response.json()) as CartView;
      setCart(nextCart);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading && cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">
          購物車
        </h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <BagIcon />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">購物車是空的</h1>
        <p className="mt-2 text-slate-600">還沒有加入任何商品</p>
        <Link href="/products" className="btn-primary mt-8">
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">
        購物車
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">商品</th>
                  <th className="px-4 py-3 font-medium">單價</th>
                  <th className="px-4 py-3 font-medium">數量</th>
                  <th className="px-4 py-3 font-medium">小計</th>
                  <th className="px-4 py-3 font-medium">
                    <span className="sr-only">刪除</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => {
                  const busy = updatingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-gray-100 even:bg-gray-50/50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <Link
                            href={`/products/${item.product.id}`}
                            className="font-medium text-slate-900 transition-colors duration-200 hover:text-indigo-600"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        NT$ {item.product.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <QuantityControl
                          quantity={item.quantity}
                          max={item.product.stock}
                          busy={busy}
                          onDecrease={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          onIncrease={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        />
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        NT$ {item.subtotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 transition-colors duration-200 hover:text-rose-600 disabled:opacity-50"
                          aria-label="刪除"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="flex flex-col gap-4 md:hidden">
            {cart.items.map((item) => {
              const busy = updatingId === item.id;
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="font-medium text-slate-900"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeItem(item.id)}
                          className="shrink-0 text-slate-400 transition-colors duration-200 hover:text-rose-600"
                          aria-label="刪除"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        NT$ {item.product.price.toLocaleString()}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <QuantityControl
                          quantity={item.quantity}
                          max={item.product.stock}
                          busy={busy}
                          onDecrease={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          onIncrease={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        />
                        <p className="font-semibold text-slate-900">
                          NT$ {item.subtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">訂單摘要</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>小計</span>
                <span>NT$ {cart.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-slate-900">
                <span>總計</span>
                <span>NT$ {cart.total.toLocaleString()}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary mt-6 w-full">
              前往結帳
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
