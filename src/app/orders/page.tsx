import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrdersList from "@/components/OrdersList";

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = orders.map((order) => ({
    id: order.id,
    merchantTradeNo: order.merchantTradeNo,
    totalAmount: order.totalAmount,
    status: order.status,
    shippingStatus: order.shippingStatus,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900">
        我的訂單
      </h1>

      {serialized.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="mb-6 text-slate-600">目前還沒有訂單。</p>
          <Link href="/products" className="btn-primary">
            去逛逛
          </Link>
        </div>
      ) : (
        <OrdersList orders={serialized} />
      )}
    </div>
  );
}
