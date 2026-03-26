import { prisma } from "@/lib/prisma";
import AuditLogClient from "@/components/admin/audit-log";

export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const formatted = logs.map((l) => ({
    id: l.id,
    userId: l.userId ?? null,
    userEmail: l.userEmail ?? null,
    action: l.action,
    details: l.details ?? null,
    ipAddress: l.ipAddress ?? null,
    createdAt: l.createdAt.toISOString(),
  }));

  return <AuditLogClient logs={formatted} />;
}
