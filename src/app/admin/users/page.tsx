import { prisma } from "@/lib/prisma";
import AdminUsersClient from "@/components/admin/users-list";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      phone: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = users.map((u) => ({
    id: u.id,
    name: u.name ?? "—",
    email: u.email ?? "—",
    role: u.role,
    phone: u.phone ?? "—",
    createdAt: u.createdAt.toISOString(),
  }));

  return <AdminUsersClient users={formatted} />;
}
