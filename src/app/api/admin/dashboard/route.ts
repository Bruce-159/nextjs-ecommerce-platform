import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function formatDateKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const paidOrders = await prisma.order.findMany({
    where: { status: "paid" },
    select: {
      totalAmount: true,
      createdAt: true,
      shippingStatus: true,
    },
  });

  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const totalOrders = await prisma.order.count();
  const pendingShipments = await prisma.order.count({
    where: { status: "paid", shippingStatus: "pending" },
  });
  const totalUsers = await prisma.user.count();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyRevenue = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      date: formatDateKey(date),
      revenue: 0,
    };
  });

  const revenueMap = new Map(dailyRevenue.map((item) => [item.date, item]));

  for (const order of paidOrders) {
    const key = formatDateKey(order.createdAt);
    const bucket = revenueMap.get(key);
    if (bucket) {
      bucket.revenue += order.totalAmount;
    }
  }

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    pendingShipments,
    totalUsers,
    dailyRevenue,
  });
}
