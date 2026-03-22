import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { instructorId, date, startHour, notes, phone, pickupAddress, roadTestCenter } = body;

    if (!instructorId || !date || startHour === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify instructor exists and is active
    const instructor = await prisma.instructorProfile.findUnique({
      where: { id: instructorId },
    });

    if (!instructor || !instructor.isActive) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 },
      );
    }

    const bookingDate = new Date(date);

    // Check for double booking
    const existingBooking = await prisma.booking.findUnique({
      where: {
        instructorId_date_startHour: {
          instructorId,
          date: bookingDate,
          startHour,
        },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          error:
            "This slot is no longer available. Please choose another time.",
        },
        { status: 409 },
      );
    }

    // Update phone if provided
    if (phone) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { phone },
      });
    }

    // Create booking — starts in PENDING_APPROVAL, instructor must confirm before payment
    const approvalDeadline = new Date(Date.now() + 30 * 60 * 1000);
    const booking = await prisma.booking.create({
      data: {
        studentId: session.user.id,
        instructorId,
        date: bookingDate,
        startHour,
        notes: notes || null,
        pickupAddress: pickupAddress || null,
        roadTestCenter: roadTestCenter || null,
        status: "PENDING_APPROVAL",
        approvalDeadline,
      },
    });

    return NextResponse.json(
      { bookingId: booking.id, message: "Booking created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
