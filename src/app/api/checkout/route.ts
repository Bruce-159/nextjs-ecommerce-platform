import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCartByUserId } from "@/lib/cart";
import {
  createMerchantTradeNo,
  formatMerchantTradeDate,
  generateCheckMacValue,
} from "@/lib/ecpay";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await getCartByUserId(session.user.id);

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const orderItems = cart.items.map((item) => {
    const price = Math.round(Number(item.product.price));
    return {
      productId: item.productId,
      name: item.product.name,
      price,
      quantity: item.quantity,
    };
  });

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (totalAmount <= 0) {
    return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
  }

  const merchantTradeNo = createMerchantTradeNo();

  const userId = session.user.id;

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        userId,
        merchantTradeNo,
        totalAmount,
        status: "pending",
        items: {
          create: orderItems,
        },
      },
    });

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  });

  const itemName = orderItems
    .map((item) => `${item.name} x${item.quantity}`)
    .join("#");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const params: Record<string, string> = {
    MerchantID: process.env.ECPAY_MERCHANT_ID || "",
    MerchantTradeNo: merchantTradeNo,
    MerchantTradeDate: formatMerchantTradeDate(),
    PaymentType: "aio",
    TotalAmount: String(totalAmount),
    TradeDesc: "NookShop Order",
    ItemName: itemName,
    ReturnURL: `${baseUrl}/api/payment/notify`,
    ClientBackURL: `${baseUrl}/orders`,
    ChoosePayment: "ALL",
    EncryptType: "1",
  };

  const CheckMacValue = generateCheckMacValue(params);

  return NextResponse.json({
    action:
      process.env.ECPAY_API_URL ||
      "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5",
    params: {
      ...params,
      CheckMacValue,
    },
  });
}
