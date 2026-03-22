import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const { id: bookingId } = await searchParams;
  if (!bookingId) redirect("/dashboard/bookings");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { paymentTransaction: true },
  });

  if (!booking || booking.studentId !== session.user.id) {
    redirect("/dashboard/bookings");
  }

  // Already confirmed — nothing to do
  if (booking.status === "CONFIRMED") {
    redirect("/dashboard/bookings");
  }

  // Verify payment status directly with Stripe
  if (booking.paymentTransaction?.stripeSessionId) {
    const stripeSession = await stripe.checkout.sessions.retrieve(
      booking.paymentTransaction.stripeSessionId,
    );

    if (stripeSession.payment_status === "paid") {
      await prisma.$transaction([
        prisma.paymentTransaction.update({
          where: { bookingId },
          data: {
            status: "paid",
            stripePaymentIntent: stripeSession.payment_intent as string,
          },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" },
        }),
      ]);
    }
  }

  redirect("/dashboard/bookings");
}
