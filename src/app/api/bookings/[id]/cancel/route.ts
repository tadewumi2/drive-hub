import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processRefund } from "@/lib/refund";
import { logAudit, getIp } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = getIp(req);
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { paymentTransaction: true },
    });

    if (!booking || booking.studentId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    if (!["PENDING_APPROVAL", "PENDING_PAYMENT", "CONFIRMED"].includes(booking.status)) {
      return NextResponse.json(
        { error: "This booking cannot be cancelled" },
        { status: 400 },
      );
    }

    await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });

    // Refund only if payment was actually made (CONFIRMED bookings)
    let refundInfo = null;
    if (booking.paymentTransaction?.status === "paid") {
      refundInfo = await processRefund(id, "student_cancel");
    }

    logAudit({ userId: session.user.id, userEmail: session.user.email ?? undefined, action: "BOOKING_CANCELLED", details: { bookingId: id, refunded: !!refundInfo }, ipAddress: ip });

    return NextResponse.json({
      message: "Booking cancelled",
      refund: refundInfo,
    });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
