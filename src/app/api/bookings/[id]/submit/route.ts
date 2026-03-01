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
      include: { document: true },
    });

    if (!booking || booking.studentId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "PENDING_UPLOAD") {
      return NextResponse.json(
        { error: "Booking has already been submitted" },
        { status: 400 },
      );
    }

    if (!booking.document) {
      return NextResponse.json(
        { error: "Please upload your road test proof first" },
        { status: 400 },
      );
    }

    await prisma.booking.update({
      where: { id },
      data: { status: "PENDING_VERIFICATION" },
    });

    return NextResponse.json(
      { message: "Booking submitted for verification" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Submit booking error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
