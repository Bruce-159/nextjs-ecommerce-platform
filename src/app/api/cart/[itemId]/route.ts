import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCartByUserId, serializeCart } from "@/lib/cart";

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

async function getOwnedCartItem(userId: string, itemId: string) {
  return prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cart: { userId },
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await context.params;
  const body = await request.json();
  const quantity = Number(body.quantity);

  if (!Number.isFinite(quantity)) {
    return NextResponse.json(
      { error: "quantity is required" },
      { status: 400 },
    );
  }

  const item = await getOwnedCartItem(session.user.id, itemId);

  if (!item) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  const cart = await getCartByUserId(session.user.id);
  return NextResponse.json(serializeCart(cart));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await context.params;
  const item = await getOwnedCartItem(session.user.id, itemId);

  if (!item) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  const cart = await getCartByUserId(session.user.id);
  return NextResponse.json(serializeCart(cart));
}
