import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getExpiryState } from "@/lib/booking-expiry";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking || booking.studentId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "PENDING_APPROVAL") {
      return NextResponse.json({ error: "Booking is not awaiting approval" }, { status: 400 });
    }

    const state = getExpiryState(booking);

    if (state === "ok") {
      return NextResponse.json(
        { error: "The instructor still has time to approve. Extension not needed yet." },
        { status: 400 },
      );
    }

    if (state === "final_expired") {
      return NextResponse.json(
        { error: "Booking has already expired and will be cancelled." },
        { status: 400 },
      );
    }

    if (booking.approvalExtendedAt) {
      return NextResponse.json(
        { error: "You have already extended this booking once." },
        { status: 400 },
      );
    }

    // Grant 30 more minutes from now
    const now = new Date();
    const newDeadline = new Date(now.getTime() + 30 * 60 * 1000);

    await prisma.booking.update({
      where: { id },
      data: { approvalExtendedAt: now, approvalDeadline: newDeadline },
    });

    return NextResponse.json({
      message: "Extended by 30 minutes",
      newDeadline: newDeadline.toISOString(),
    });
  } catch (error) {
    console.error("Extend error:", error);
    return NextResponse.json({ error: "Failed to extend booking" }, { status: 500 });
  }
}
