export const CATEGORY_LABELS: Record<string, string> = {
  electronics: "電子產品",
  clothing: "服飾",
  accessories: "配件",
};

export function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] ?? category;
}
