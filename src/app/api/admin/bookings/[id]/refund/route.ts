import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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
      include: { payment: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.payment || booking.payment.status !== "paid") {
      return NextResponse.json(
        { error: "No payment found for this booking" },
        { status: 400 },
      );
    }

    if (!booking.payment.stripePaymentIntent) {
      return NextResponse.json(
        { error: "No payment intent found" },
        { status: 400 },
      );
    }

    // Process refund through Stripe
    await stripe.refunds.create({
      payment_intent: booking.payment.stripePaymentIntent,
    });

    // Update records
    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: booking.payment.id },
        data: { status: "refunded" },
      }),
      prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED" },
      }),
    ]);

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
