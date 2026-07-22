import { prisma } from "@/lib/prisma";

export const cartInclude = {
  items: {
    include: {
      product: true,
    },
    orderBy: {
      id: "asc" as const,
    },
  },
};

export async function getCartByUserId(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });
}

export async function getOrCreateCart(userId: string) {
  const existing = await getCartByUserId(userId);
  if (existing) return existing;

  return prisma.cart.create({
    data: { userId },
    include: cartInclude,
  });
}

export function serializeCart(
  cart: Awaited<ReturnType<typeof getCartByUserId>>,
) {
  if (!cart) {
    return { id: null, items: [], itemCount: 0, total: 0 };
  }

  const items = cart.items.map((item) => {
    const price = Number(item.product.price);
    return {
      id: item.id,
      quantity: item.quantity,
      productId: item.productId,
      product: {
        id: item.product.id,
        name: item.product.name,
        price,
        imageUrl: item.product.imageUrl,
        stock: item.product.stock,
      },
      subtotal: price * item.quantity,
    };
  });

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
}
