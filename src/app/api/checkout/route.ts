import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { BookingStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        instructor: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!booking || booking.studentId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      return NextResponse.json(
        { error: "This booking is not ready for payment" },
        { status: 400 },
      );
    }

    const formatHour = (h: number) => {
      const period = h >= 12 ? "PM" : "AM";
      const hr = h % 12 || 12;
      return `${hr}:00 ${period}`;
    };

    const dateStr = booking.date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      phone_number_collection: { enabled: false },
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "cad",
            product_data: {
              name: `Driving Lesson with ${booking.instructor.user.name}`,
              description: `${dateStr} at ${formatHour(booking.startHour)} (1 hour)`,
            },
            unit_amount: Math.round(booking.instructor.hourlyRate * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/payment?id=${booking.id}`,
    });

    // Save payment record
    await prisma.paymentTransaction.create({
      data: {
        bookingId: booking.id,
        stripeSessionId: checkoutSession.id,
        amount: booking.instructor.hourlyRate,
        currency: "cad",
        status: "pending",
      },
    });

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
