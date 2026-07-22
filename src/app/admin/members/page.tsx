import AdminMembersTable from "@/components/AdminMembersTable";
import { prisma } from "@/lib/prisma";

export default async function AdminMembersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      createdAt: true,
      accounts: {
        select: { provider: true },
      },
      _count: {
        select: { orders: true },
      },
    },
  });

  const members = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    providers: user.accounts.map((account) => account.provider),
    hasPassword: Boolean(user.password),
    orderCount: user._count.orders,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          會員管理
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          目前共 {members.length} 位會員
        </p>
      </div>
      <AdminMembersTable members={members} />
    </div>
  );
}
