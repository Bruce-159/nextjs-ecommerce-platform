import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = parseProductBody(body);

  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data!,
  });

  return NextResponse.json({
    ...product,
    price: Number(product.price),
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          cartItems: true,
          orderItems: true,
        },
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (existing._count.cartItems > 0 || existing._count.orderItems > 0) {
    return NextResponse.json(
      {
        error:
          "無法刪除：此商品仍有購物車或訂單關聯，請先清除相關資料後再試",
      },
      { status: 409 },
    );
  }

  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ message: "Product deleted" });
}
