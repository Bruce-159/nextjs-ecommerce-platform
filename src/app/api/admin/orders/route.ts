import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where =
    status === "pending"
      ? { status: "pending" }
      : status === "paid"
        ? { status: "paid" }
        : status === "shipped"
          ? { shippingStatus: "shipped" }
          : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    orders.map((order) => ({
      id: order.id,
      merchantTradeNo: order.merchantTradeNo,
      totalAmount: order.totalAmount,
      status: order.status,
      shippingStatus: order.shippingStatus,
      createdAt: order.createdAt.toISOString(),
      user: order.user,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        productId: item.productId,
      })),
    })),
  );
}
