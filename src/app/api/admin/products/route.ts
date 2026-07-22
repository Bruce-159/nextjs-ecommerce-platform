import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function parseProductBody(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const imageUrl = String(body.imageUrl ?? "").trim();
  const category = String(body.category ?? "").trim();
  const price = Number(body.price);
  const stock = Number(body.stock);

  if (!name || !description || !imageUrl || !category) {
    return { error: "Missing required fields" };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { error: "Invalid price" };
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "Invalid stock" };
  }

  const allowedCategories = ["electronics", "clothing", "accessories"];
  if (!allowedCategories.includes(category)) {
    return { error: "Invalid category" };
  }

  return {
    data: { name, description, imageUrl, category, price, stock },
  };
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = parseProductBody(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: parsed.data!,
  });

  return NextResponse.json({
    ...product,
    price: Number(product.price),
  });
}
