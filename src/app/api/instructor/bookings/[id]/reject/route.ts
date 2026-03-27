import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { processRefund } from "@/lib/refund";
import { sendEmail } from "@/lib/email";
import { logAudit, getIp } from "@/lib/audit";
import { getExpiryState } from "@/lib/booking-expiry";

function formatHour(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:00 ${period}`;
}

function getRejectionEmailHtml(params: {
  studentName: string;
  instructorName: string;
  date: string;
  time: string;
  reason: string | null;
  browseUrl: string;
}) {
  const { studentName, instructorName, date, time, reason, browseUrl } = params;
  return `
    <div style="max-width:520px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:40px 20px;">
      <div style="text-align:center;margin-bottom:28px;">
        <h1 style="font-size:22px;font-weight:700;color:#0f172a;margin:0;">DriveHub</h1>
      </div>
      <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:6px;">Booking request declined</h2>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin-bottom:20px;">
        Hi ${studentName}, unfortunately <strong>${instructorName}</strong> was unable to accept your booking for:
      </p>
      <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${date}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#64748b;">${time}</p>
      </div>
      ${reason ? `<p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:20px;"><strong>Reason:</strong> ${reason}</p>` : ""}
      <p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:24px;">
        A <strong>full refund</strong> has been issued to your original payment method and should appear within 5–10 business days.
      </p>
      <a href="${browseUrl}" style="display:inline-block;background:#d97706;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
        Find Another Instructor
      </a>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px;text-align:center;">DriveHub &mdash; Your driving journey starts here.</p>
    </div>
  `;
}

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

    const body = await req.json().catch(() => ({}));
    const reason: string | null = body.reason?.trim() || null;

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        instructor: { include: { user: { select: { name: true } } } },
        student: { select: { name: true, email: true } },
        paymentTransaction: true,
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
        { error: "Only pending-approval bookings can be rejected" },
        { status: 400 },
      );
    }

    const state = getExpiryState(booking);
    if (state === "final_expired") {
      return NextResponse.json(
        { error: "Approval window has already expired" },
        { status: 409 },
      );
    }

    // Cancel the booking
    await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    // Full refund — student already paid to reach PENDING_APPROVAL
    let refundInfo = null;
    if (booking.paymentTransaction?.status === "paid") {
      refundInfo = await processRefund(id, "instructor_reject");
    }

    // Notify student
    if (booking.student.email) {
      const dateStr = booking.date.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
      sendEmail({
        to: booking.student.email,
        subject: "Your booking request was declined — full refund issued",
        html: getRejectionEmailHtml({
          studentName: booking.student.name ?? "there",
          instructorName: booking.instructor.user.name ?? "Your instructor",
          date: dateStr,
          time: `${formatHour(booking.startHour)} – ${formatHour(booking.startHour + 1)}`,
          reason,
          browseUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/instructors`,
        }),
      });
    }

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      action: "BOOKING_REJECTED",
      details: { bookingId: id, reason, refunded: !!refundInfo },
      ipAddress: ip,
    });

    return NextResponse.json({ message: "Booking rejected and student refunded" });
  } catch (error) {
    console.error("Reject error:", error);
    return NextResponse.json({ error: "Failed to reject booking" }, { status: 500 });
  }
}
