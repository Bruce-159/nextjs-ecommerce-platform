"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { categoryLabel } from "@/lib/categories";

export type AdminProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
};

export default function AdminProductsTable({
  products: initialProducts,
}: {
  products: AdminProductRow[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(product: AdminProductRow) {
    const confirmed = window.confirm(`確定要刪除「${product.name}」嗎？`);
    if (!confirmed) return;

    setDeletingId(product.id);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "刪除失敗");
        return;
      }

      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      router.refresh();
    } catch {
      alert("刪除失敗，請稍後再試");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-slate-500">
            <th className="px-4 py-3 font-medium">圖片</th>
            <th className="px-4 py-3 font-medium">名稱</th>
            <th className="px-4 py-3 font-medium">分類</th>
            <th className="px-4 py-3 font-medium">價格</th>
            <th className="px-4 py-3 font-medium">庫存</th>
            <th className="px-4 py-3 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={product.id}
              className={`border-b border-gray-100 ${
                index % 2 === 1 ? "bg-gray-50/70" : "bg-white"
              }`}
            >
              <td className="px-4 py-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">
                {product.name}
              </td>
              <td className="px-4 py-3">
                <span className="badge bg-gray-100 text-gray-600">
                  {categoryLabel(product.category)}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-900">
                NT$ {product.price.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-slate-600">{product.stock}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="btn-secondary-sm"
                  >
                    編輯
                  </Link>
                  <button
                    type="button"
                    disabled={deletingId === product.id}
                    onClick={() => handleDelete(product)}
                    className="btn-danger-sm"
                  >
                    {deletingId === product.id ? "刪除中..." : "刪除"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                目前沒有商品
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
