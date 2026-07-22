import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("Forbidden");
  }

  return session;
}
