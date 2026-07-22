"use client";

import { Fragment, useCallback, useEffect, useState } from "react";

type AdminOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type AdminOrder = {
  id: string;
  merchantTradeNo: string;
  totalAmount: number;
  status: string;
  shippingStatus: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  items: AdminOrderItem[];
};

type FilterKey = "all" | "pending" | "paid" | "shipped";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待付款" },
  { key: "paid", label: "已付款" },
  { key: "shipped", label: "已出貨" },
];

function paymentBadge(status: string) {
  if (status === "paid") {
    return { label: "已付款", className: "bg-emerald-50 text-emerald-700" };
  }
  if (status === "pending") {
    return { label: "待付款", className: "bg-amber-50 text-amber-700" };
  }
  return { label: status, className: "bg-gray-100 text-gray-700" };
}

function shippingBadge(status: string) {
  if (status === "shipped") {
    return { label: "已出貨", className: "bg-blue-50 text-blue-700" };
  }
  return { label: "待出貨", className: "bg-gray-100 text-gray-600" };
}

export default function AdminOrdersClient() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (nextFilter: FilterKey) => {
    setLoading(true);
    setError("");
    try {
      const query =
        nextFilter === "all" ? "" : `?status=${encodeURIComponent(nextFilter)}`;
      const response = await fetch(`/api/admin/orders${query}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "載入訂單失敗");
        setOrders([]);
        return;
      }
      setOrders(data);
    } catch {
      setError("載入訂單失敗");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders(filter);
  }, [filter, loadOrders]);

  async function markShipped(orderId: string) {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingStatus: "shipped" }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "更新失敗");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, shippingStatus: data.shippingStatus }
            : order,
        ),
      );
    } catch {
      alert("更新失敗，請稍後再試");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-slate-900">
        訂單管理
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              filter === item.key
                ? "bg-indigo-600 text-white"
                : "border border-gray-300 bg-white text-slate-700 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-slate-500">
                <th className="px-4 py-3 font-medium">訂單編號</th>
                <th className="px-4 py-3 font-medium">下單時間</th>
                <th className="px-4 py-3 font-medium">顧客</th>
                <th className="px-4 py-3 font-medium">總金額</th>
                <th className="px-4 py-3 font-medium">付款狀態</th>
                <th className="px-4 py-3 font-medium">出貨狀態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const open = expandedId === order.id;
                const pay = paymentBadge(order.status);
                const ship = shippingBadge(order.shippingStatus);
                return (
                  <Fragment key={order.id}>
                    <tr
                      className={`border-b border-gray-100 ${
                        index % 2 === 1 ? "bg-gray-50/70" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(open ? null : order.id)
                          }
                          className="font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700"
                        >
                          {order.merchantTradeNo}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(order.createdAt).toLocaleString("zh-TW")}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{order.user.name || "未命名"}</div>
                        <div className="text-xs text-slate-500">
                          {order.user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        NT$ {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${pay.className}`}>
                          {pay.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${ship.className}`}>
                          {ship.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.status === "paid" &&
                        order.shippingStatus !== "shipped" ? (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => markShipped(order.id)}
                            className="btn-secondary-sm"
                          >
                            {updatingId === order.id
                              ? "更新中..."
                              : "標記已出貨"}
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                    {open ? (
                      <tr className="bg-indigo-50/40">
                        <td colSpan={7} className="px-4 py-3">
                          <ul className="animate-fade-in space-y-1 text-sm text-slate-700">
                            {order.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex justify-between gap-4"
                              >
                                <span>
                                  {item.name} × {item.quantity}
                                </span>
                                <span>
                                  單價 NT$ {item.price.toLocaleString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    目前沒有符合條件的訂單
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
