"use client";

import { useMemo, useState } from "react";
import ProductCard, { type ProductCardData } from "@/components/ProductCard";
import { CATEGORY_LABELS } from "@/lib/categories";

const categories = [
  { key: "all", label: "全部" },
  { key: "electronics", label: CATEGORY_LABELS.electronics },
  { key: "clothing", label: CATEGORY_LABELS.clothing },
  { key: "accessories", label: CATEGORY_LABELS.accessories },
] as const;

type CategoryKey = (typeof categories)[number]["key"];

export default function ProductsFilter({
  products,
}: {
  products: ProductCardData[];
}) {
  const [category, setCategory] = useState<CategoryKey>("all");

  const filtered = useMemo(() => {
    if (category === "all") return products;
    return products.filter((product) => product.category === category);
  }, [category, products]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            商品列表
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            共 {filtered.length} 件商品
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setCategory(item.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                category === item.key
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 bg-white text-slate-700 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-slate-600">此分類目前沒有商品</p>
      ) : (
        <div
          key={category}
          className="animate-fade-in grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
