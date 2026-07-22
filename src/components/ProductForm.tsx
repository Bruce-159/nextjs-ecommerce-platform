"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type ProductFormValues = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: string;
  category: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  initialValues?: ProductFormValues;
};

const defaultValues: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  stock: "0",
  category: "electronics",
};

export default function ProductForm({
  mode,
  productId,
  initialValues = defaultValues,
}: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      imageUrl: values.imageUrl,
      stock: Number(values.stock),
      category: values.category,
    };

    try {
      const response = await fetch(
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${productId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "儲存失敗");
        setLoading(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("儲存失敗，請稍後再試");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-xl flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        商品名稱
        <input
          required
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          className="input-field"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        描述
        <textarea
          required
          rows={4}
          value={values.description}
          onChange={(e) =>
            setValues({ ...values, description: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-slate-900 outline-none transition-shadow duration-200 focus:ring-2 focus:ring-indigo-500"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        價格
        <input
          required
          type="number"
          min="0"
          step="1"
          value={values.price}
          onChange={(e) => setValues({ ...values, price: e.target.value })}
          className="input-field"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        圖片網址
        <input
          required
          type="url"
          value={values.imageUrl}
          onChange={(e) => setValues({ ...values, imageUrl: e.target.value })}
          className="input-field"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        庫存
        <input
          required
          type="number"
          min="0"
          step="1"
          value={values.stock}
          onChange={(e) => setValues({ ...values, stock: e.target.value })}
          className="input-field"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
        分類
        <select
          required
          value={values.category}
          onChange={(e) => setValues({ ...values, category: e.target.value })}
          className="input-field"
        >
          <option value="electronics">電子產品</option>
          <option value="clothing">服飾</option>
          <option value="accessories">配件</option>
        </select>
      </label>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "儲存中..." : mode === "create" ? "新增商品" : "更新商品"}
        </button>
        <Link href="/admin/products" className="btn-secondary">
          取消
        </Link>
      </div>
    </form>
  );
}
