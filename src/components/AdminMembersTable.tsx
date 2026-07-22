export type AdminMemberRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  providers: string[];
  hasPassword: boolean;
  orderCount: number;
  createdAt: string;
};

function formatRole(role: string) {
  return role === "admin" ? "管理者" : "一般會員";
}

function formatLoginMethods(member: AdminMemberRow) {
  const methods: string[] = [];
  if (member.providers.includes("google")) methods.push("Google");
  if (member.hasPassword) methods.push("帳密");
  if (methods.length === 0) methods.push("—");
  return methods.join("、");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminMembersTable({
  members,
}: {
  members: AdminMemberRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-slate-500">
            <th className="px-4 py-3 font-medium">名稱</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">角色</th>
            <th className="px-4 py-3 font-medium">登入方式</th>
            <th className="px-4 py-3 font-medium">訂單數</th>
            <th className="px-4 py-3 font-medium">註冊時間</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr
              key={member.id}
              className={`border-b border-gray-100 ${
                index % 2 === 1 ? "bg-gray-50/70" : "bg-white"
              }`}
            >
              <td className="px-4 py-3 font-medium text-slate-900">
                {member.name || "—"}
              </td>
              <td className="px-4 py-3 text-slate-600">{member.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`badge ${
                    member.role === "admin"
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {formatRole(member.role)}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {formatLoginMethods(member)}
              </td>
              <td className="px-4 py-3 text-slate-600">{member.orderCount}</td>
              <td className="px-4 py-3 text-slate-600">
                {formatDate(member.createdAt)}
              </td>
            </tr>
          ))}
          {members.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                目前沒有會員
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
