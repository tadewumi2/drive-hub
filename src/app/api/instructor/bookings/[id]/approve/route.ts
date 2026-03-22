import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { sendEmail, getBookingApprovedEmailHtml } from "@/lib/email";
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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        instructor: {
          include: { user: { select: { name: true } } },
        },
        student: { select: { name: true, email: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (
      booking.instructor.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (booking.status !== BookingStatus.PENDING_APPROVAL) {
      return NextResponse.json(
        { error: "Booking cannot be approved in its current state" },
        { status: 400 },
      );
    }

    const state = getExpiryState(booking);
    if (state === "final_expired") {
      return NextResponse.json(
        { error: "Approval window has expired. The booking will be auto-cancelled." },
        { status: 409 },
      );
    }

    await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.PENDING_PAYMENT },
    });

    // Notify student
    if (booking.student.email) {
      const dateStr = booking.date.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
      sendEmail({
        to: booking.student.email,
        subject: "Your Booking Was Approved — Complete Payment to Confirm",
        html: getBookingApprovedEmailHtml({
          studentName: booking.student.name || "Student",
          instructorName: booking.instructor.user.name || "Your instructor",
          date: dateStr,
          startHour: booking.startHour,
          pickupAddress: booking.pickupAddress,
          roadTestCenter: booking.roadTestCenter,
          hourlyRate: booking.instructor.hourlyRate,
          paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/payment?id=${id}`,
        }),
      });
    }

    return NextResponse.json({ message: "Booking approved — student can now pay" }, { status: 200 });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json(
      { error: "Failed to approve booking" },
      { status: 500 },
    );
  }
}
