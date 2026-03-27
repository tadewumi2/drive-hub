import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type RefundReason =
  | "pending_approval"   // booking never confirmed — always 100%
  | "auto_expire"        // instructor timed out — always 100%
  | "instructor_reject"  // instructor declined — always 100%
  | "student_cancel"     // student cancelled — depends on lesson time
  | "admin_cancel";      // admin cancelled — depends on lesson time

export async function processRefund(
  bookingId: string,
  reason: RefundReason,
): Promise<{ refundedAmount: number; percent: number }> {
  const payment = await prisma.paymentTransaction.findUnique({
    where: { bookingId },
    include: { booking: { select: { date: true, startHour: true } } },
  });

  if (!payment || !payment.stripePaymentIntent) {
    throw new Error("No payment found for this booking");
  }

  let percent = 100;

  if (reason === "student_cancel" || reason === "admin_cancel") {
    const lessonDate = new Date(payment.booking.date);
    lessonDate.setHours(payment.booking.startHour, 0, 0, 0);
    const hoursUntilLesson = (lessonDate.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilLesson < 24) {
      percent = 80;
    }
  }

  const refundedAmount = Math.round(payment.amount * (percent / 100) * 100); // in cents

  await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntent,
    amount: refundedAmount,
  });

  await prisma.paymentTransaction.update({
    where: { bookingId },
    data: { status: "refunded" },
  });

  return { refundedAmount: refundedAmount / 100, percent };
}
