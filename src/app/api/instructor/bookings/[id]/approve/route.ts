import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
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
      include: { instructor: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if user is the instructor or admin
    if (
      booking.instructor.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (booking.status !== "PENDING_VERIFICATION") {
      return NextResponse.json(
        { error: "Booking cannot be approved in its current state" },
        { status: 400 },
      );
    }

    await prisma.booking.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    return NextResponse.json({ message: "Booking approved" }, { status: 200 });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json(
      { error: "Failed to approve booking" },
      { status: 500 },
    );
  }
}
