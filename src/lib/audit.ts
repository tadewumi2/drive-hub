import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "USER_SIGNED_UP"
  | "BOOKING_CREATED"
  | "BOOKING_CANCELLED"
  | "BOOKING_APPROVED"
  | "BOOKING_REJECTED"
  | "CHECKOUT_INITIATED"
  | "PAYMENT_COMPLETED"
  | "ADMIN_BOOKING_CANCELLED"
  | "ADMIN_REFUND_ISSUED"
  | "ADMIN_IMPERSONATED_USER"
  | "ADMIN_IMPERSONATION_EXITED";

interface AuditParams {
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit({ userId, userEmail, action, details, ipAddress }: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        userEmail,
        action,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
      },
    });
  } catch {
    // Non-blocking — never let audit logging break the main flow
  }
}

export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
