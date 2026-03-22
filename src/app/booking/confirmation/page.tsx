import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAndExpireBooking } from "@/lib/booking-expiry";
import ConfirmationActions from "@/components/booking/confirmation-actions";
import Link from "next/link";
import { Car } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function BookingConfirmationPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const params = await searchParams;
  const bookingId = params.id;
  if (!bookingId) redirect("/dashboard");

  // Auto-cancel if final window expired
  await checkAndExpireBooking(bookingId);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { instructor: { include: { user: { select: { name: true } } } } },
  });

  if (!booking || booking.studentId !== session.user.id) redirect("/dashboard");

  // Redirect to payment if still awaiting payment
  if (booking.status === "PENDING_PAYMENT") {
    redirect(`/booking/payment?id=${bookingId}`);
  }

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}:00 ${period}`;
  };

  const formattedDate = booking.date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const statusBadge: Record<string, { label: string; color: string }> = {
    PENDING_APPROVAL: { label: "Awaiting Instructor Approval", color: "bg-amber-100 text-amber-700" },
    CONFIRMED:        { label: "Confirmed",                    color: "bg-green-100 text-green-700" },
    CANCELLED:        { label: "Cancelled",                    color: "bg-slate-100 text-slate-600" },
  };

  const badge = statusBadge[booking.status] ?? { label: booking.status, color: "bg-slate-100 text-slate-600" };

  const bannerConfig: Record<string, { emoji: string; title: string; subtitle: string }> = {
    PENDING_APPROVAL: {
      emoji: "⏳",
      title: "Payment Received!",
      subtitle: "Waiting for your instructor to confirm the booking.",
    },
    CONFIRMED: {
      emoji: "✅",
      title: "Booking Confirmed!",
      subtitle: "Your lesson has been confirmed. See you there!",
    },
    CANCELLED: {
      emoji: "❌",
      title: "Booking Cancelled",
      subtitle: "This booking has been cancelled.",
    },
  };

  const banner = bannerConfig[booking.status] ?? bannerConfig.PENDING_APPROVAL;

  return (
    <div className="min-h-screen bg-[var(--blue-softer)]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--gold)] rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--navy)]">DriveHub</span>
          </Link>
          <a
            href="/dashboard"
            className="text-sm font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white px-5 py-2 rounded-full transition-colors"
          >
            Dashboard
          </a>
        </div>
      </header>

      <main className="pt-28 pb-20 max-w-xl mx-auto px-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="bg-slate-50 px-6 py-8 text-center border-b border-slate-100">
            <div className="text-5xl mb-4">{banner.emoji}</div>
            <h1 className="text-2xl font-bold text-[var(--navy)]">{banner.title}</h1>
            <p className="text-slate-500 mt-2 text-sm">{banner.subtitle}</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Instructor</span>
              <span className="text-sm font-medium text-[var(--navy)]">
                {booking.instructor.user.name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Date</span>
              <span className="text-sm font-medium text-[var(--navy)]">{formattedDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Time</span>
              <span className="text-sm font-medium text-[var(--navy)]">
                {formatHour(booking.startHour)} – {formatHour(booking.startHour + 1)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Pickup</span>
              <span className="text-sm font-medium text-[var(--navy)]">
                {booking.pickupAddress || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Test Centre</span>
              <span className="text-sm font-medium text-[var(--navy)]">
                {booking.roadTestCenter || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm font-semibold text-[var(--navy)]">Total Paid</span>
              <span className="text-lg font-bold text-[var(--navy)]">
                ${booking.instructor.hourlyRate.toFixed(2)}
              </span>
            </div>

            {booking.notes && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500 block mb-1">Notes</span>
                <p className="text-sm text-[var(--navy)]">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-3">
            <ConfirmationActions
              bookingId={booking.id}
              status={booking.status}
              approvalDeadline={booking.approvalDeadline?.toISOString() ?? null}
              approvalExtendedAt={booking.approvalExtendedAt?.toISOString() ?? null}
            />
            <a href="/dashboard/bookings">
              <button className="w-full border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white font-semibold py-3 rounded-full transition-all text-sm mt-2">
                View My Bookings
              </button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
