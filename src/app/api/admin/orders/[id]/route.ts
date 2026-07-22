import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const shippingStatus = String(body.shippingStatus ?? "");

  if (shippingStatus !== "shipped" && shippingStatus !== "pending") {
    return NextResponse.json(
      { error: "Invalid shippingStatus" },
      { status: 400 },
    );
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (shippingStatus === "shipped" && existing.status !== "paid") {
    return NextResponse.json(
      { error: "Only paid orders can be marked as shipped" },
      { status: 400 },
    );
  }

  const order = await prisma.order.update({
    where: { id },
    data: { shippingStatus },
    include: {
      user: {
        select: { name: true, email: true },
      },
      items: true,
    },
  });

  return NextResponse.json({
    id: order.id,
    merchantTradeNo: order.merchantTradeNo,
    totalAmount: order.totalAmount,
    status: order.status,
    shippingStatus: order.shippingStatus,
    createdAt: order.createdAt.toISOString(),
    user: order.user,
    items: order.items,
  });
}
