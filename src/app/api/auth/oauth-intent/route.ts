import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "oauth_intent";
const MAX_AGE = 60 * 10; // 10 minutes

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const intent = body?.intent === "register" ? "register" : "login";

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, intent, {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
  });

  return NextResponse.json({ ok: true, intent });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
