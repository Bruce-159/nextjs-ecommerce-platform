import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

function normalizeEmail(email: unknown) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "請填寫 Email 與密碼", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "密碼至少需要 6 個字元", code: "VALIDATION_ERROR" },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
      accounts: { select: { provider: true } },
    },
  });

  if (existingUser) {
    const hasGoogle = existingUser.accounts.some(
      (account) => account.provider === "google",
    );
    const hint = existingUser.password
      ? "此 Email 已註冊，請直接登入"
      : hasGoogle
        ? "此 Email 已透過 Google 註冊，請使用 Google 登入"
        : "此 Email 已註冊，請直接登入";

    return NextResponse.json(
      { error: hint, code: "EMAIL_EXISTS" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json(
    { message: "User created", userId: user.id },
    { status: 201 },
  );
}
