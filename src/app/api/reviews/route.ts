import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, getIp } from "@/lib/audit";

export async function POST(req: Request) {
  const ip = getIp(req);
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId, rating, comment } = await req.json();

  if (!bookingId || !rating) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  if (comment && comment.length > 600) {
    return NextResponse.json({ error: "Comment must be under 600 characters" }, { status: 400 });
  }

  // Verify the booking belongs to this student, is CONFIRMED, and is in the past
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { studentId: true, instructorId: true, status: true, date: true, review: true },
  });

  if (!booking || booking.studentId !== session.user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "You can only review completed lessons" }, { status: 400 });
  }

  if (new Date(booking.date) >= new Date(new Date().toDateString())) {
    return NextResponse.json({ error: "You can only review past lessons" }, { status: 400 });
  }

  if (booking.review) {
    return NextResponse.json({ error: "You have already reviewed this lesson" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: {
      bookingId,
      studentId: session.user.id,
      instructorId: booking.instructorId,
      rating,
      comment: comment?.trim() || null,
    },
  });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    action: "REVIEW_SUBMITTED",
    details: { bookingId, rating, instructorId: booking.instructorId },
    ipAddress: ip,
  });

  return NextResponse.json({ success: true, reviewId: review.id }, { status: 201 });
}
