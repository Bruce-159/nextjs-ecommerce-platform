"use client";

import { useState } from "react";

type OrderItemView = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderView = {
  id: string;
  merchantTradeNo: string;
  totalAmount: number;
  status: string;
  shippingStatus: string;
  createdAt: string;
  items: OrderItemView[];
};

function statusBadge(status: string, shippingStatus: string) {
  if (shippingStatus === "shipped") {
    return { label: "已出貨", className: "bg-blue-50 text-blue-700" };
  }
  if (status === "paid") {
    return { label: "已付款", className: "bg-emerald-50 text-emerald-700" };
  }
  if (status === "pending") {
    return { label: "待付款", className: "bg-amber-50 text-amber-700" };
  }
  return { label: status, className: "bg-gray-100 text-gray-700" };
}

export default function OrdersList({ orders }: { orders: OrderView[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => {
        const open = expandedId === order.id;
        const badge = statusBadge(order.status, order.shippingStatus);

        return (
          <li
            key={order.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setExpandedId(open ? null : order.id)}
              className="flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors duration-200 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">
                  訂單編號：{order.merchantTradeNo}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleString("zh-TW")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`badge ${badge.className}`}>{badge.label}</span>
                <span className="text-base font-bold text-slate-900">
                  NT$ {order.totalAmount.toLocaleString()}
                </span>
                <span className="text-sm text-slate-400">
                  {open ? "收合 ▲" : "展開 ▼"}
                </span>
              </div>
            </button>

            {open ? (
              <div className="animate-fade-in border-t border-gray-100 bg-gray-50 px-5 py-4">
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-sm text-slate-700"
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        NT$ {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-sm font-semibold text-slate-900">
                  <span>總金額</span>
                  <span>NT$ {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
