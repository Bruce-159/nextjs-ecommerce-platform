import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCheckMacValue } from "@/lib/ecpay";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};

    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    if (!verifyCheckMacValue(params)) {
      return new NextResponse("0|CheckMacValueError", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const merchantTradeNo = params.MerchantTradeNo;
    const rtnCode = params.RtnCode;

    if (merchantTradeNo && rtnCode === "1") {
      await prisma.order.updateMany({
        where: { merchantTradeNo },
        data: { status: "paid" },
      });
    }

    return new NextResponse("1|OK", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new NextResponse("0|Error", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
