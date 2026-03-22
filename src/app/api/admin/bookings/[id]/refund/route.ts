import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processRefund } from "@/lib/refund";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { paymentTransaction: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.paymentTransaction || booking.paymentTransaction.status !== "paid") {
      return NextResponse.json(
        { error: "No payment found for this booking" },
        { status: 400 },
      );
    }

    await processRefund(booking, "admin_cancel");

    return NextResponse.json(
      { message: "Refund processed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 },
    );
  }
}
