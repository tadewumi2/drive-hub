import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendEmail, getBookingPaidEmailHtml } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      await prisma.paymentTransaction.update({
        where: { stripeSessionId: session.id },
        data: {
          status: "paid",
          stripePaymentIntent: session.payment_intent as string,
        },
      });

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });

      // Notify instructor
      try {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            instructor: {
              include: { user: { select: { name: true, email: true } } },
            },
            student: { select: { name: true, email: true, phone: true } },
          },
        });

        if (booking?.instructor.user.email) {
          const dateStr = booking.date.toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
          });
          sendEmail({
            to: booking.instructor.user.email,
            subject: "Payment Received — Lesson Confirmed",
            html: getBookingPaidEmailHtml({
              instructorName: booking.instructor.user.name || "Instructor",
              studentName: booking.student.name || "Student",
              studentEmail: booking.student.email || "",
              studentPhone: booking.student.phone || "",
              date: dateStr,
              startHour: booking.startHour,
              pickupAddress: booking.pickupAddress,
              roadTestCenter: booking.roadTestCenter,
              hourlyRate: booking.instructor.hourlyRate,
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/instructor/bookings`,
            }),
          });
        }
      } catch (emailErr) {
        console.error("Failed to send payment notification email:", emailErr);
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
