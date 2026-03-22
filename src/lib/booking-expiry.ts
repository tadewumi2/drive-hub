import { prisma } from "@/lib/prisma";
import { processRefund } from "@/lib/refund";

const APPROVAL_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

export type ExpiryState =
  | "ok"               // within approval window
  | "first_expired"    // first 30-min window expired, student can extend or cancel
  | "final_expired";   // second window also expired — auto-cancel triggered

export function getExpiryState(booking: {
  status: string;
  approvalDeadline: Date | null;
  approvalExtendedAt: Date | null;
}): ExpiryState {
  if (booking.status !== "PENDING_APPROVAL") return "ok";
  if (!booking.approvalDeadline) return "ok";

  const now = Date.now();

  if (booking.approvalExtendedAt) {
    const secondDeadline =
      booking.approvalExtendedAt.getTime() + APPROVAL_WINDOW_MS;
    if (now > secondDeadline) return "final_expired";
    return "ok"; // within extended window
  }

  if (now > booking.approvalDeadline.getTime()) return "first_expired";
  return "ok";
}

/** Call this before reading any PENDING_APPROVAL booking. Auto-cancels if final window passed. */
export async function checkAndExpireBooking(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      status: true,
      approvalDeadline: true,
      approvalExtendedAt: true,
      paymentTransaction: { select: { id: true } },
    },
  });

  if (!booking) return;

  const state = getExpiryState(booking);
  if (state !== "final_expired") return;

  // Auto-cancel and refund
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  if (booking.paymentTransaction) {
    try {
      await processRefund(bookingId, "auto_expire");
    } catch {
      // Payment may not exist or already refunded — log but don't throw
      console.error("Auto-expire refund failed for booking", bookingId);
    }
  }
}

export function msUntilDeadline(booking: {
  approvalDeadline: Date | null;
  approvalExtendedAt: Date | null;
}): number {
  if (!booking.approvalDeadline) return 0;
  if (booking.approvalExtendedAt) {
    return (
      booking.approvalExtendedAt.getTime() + APPROVAL_WINDOW_MS - Date.now()
    );
  }
  return booking.approvalDeadline.getTime() - Date.now();
}
