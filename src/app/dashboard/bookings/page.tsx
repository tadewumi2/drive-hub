import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { checkAndExpireBooking } from "@/lib/booking-expiry";
import ApprovalCountdown from "@/components/booking/approval-countdown";
import LeaveReview from "@/components/reviews/leave-review";
import { Navigation, Building2 } from "lucide-react";
import { BookingStatus } from "@prisma/client";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_APPROVAL: { label: "Awaiting Instructor Approval", color: "bg-amber-100 text-amber-700" },
  PENDING_PAYMENT:  { label: "Approved — Payment Required",  color: "bg-blue-100 text-blue-700"   },
  CONFIRMED:        { label: "Confirmed",                    color: "bg-green-100 text-green-700"  },
  CANCELLED:        { label: "Cancelled",                    color: "bg-slate-100 text-slate-500"  },
};

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:00 ${period}`;
}

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const bookings = await prisma.booking.findMany({
    where: { studentId: session.user.id },
    include: { instructor: { include: { user: { select: { name: true } } } } },
    orderBy: { date: "desc" },
  });

  // Lazy-expire any PENDING_APPROVAL bookings whose window has passed
  await Promise.all(
    bookings
      .filter((b) => b.status === BookingStatus.PENDING_APPROVAL)
      .map((b) => checkAndExpireBooking(b.id)),
  );

  // Re-fetch after potential status changes
  const fresh = await prisma.booking.findMany({
    where: { studentId: session.user.id },
    select: {
      id: true,
      date: true,
      startHour: true,
      status: true,
      notes: true,
      pickupAddress: true,
      roadTestCenter: true,
      approvalDeadline: true,
      approvalExtendedAt: true,
      review: { select: { id: true } },
      instructor: {
        select: {
          location: true,
          carType: true,
          hourlyRate: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const today = new Date(new Date().toDateString());

  const active = fresh.filter(
    (b) => b.status !== BookingStatus.CANCELLED && (
      b.status === BookingStatus.PENDING_APPROVAL ||
      b.status === BookingStatus.PENDING_PAYMENT ||
      new Date(b.date) >= today
    ),
  );

  const past = fresh.filter(
    (b) =>
      b.status === BookingStatus.CANCELLED ||
      (b.status === BookingStatus.CONFIRMED && new Date(b.date) < today),
  );

  function BookingRow({ b, dim }: { b: (typeof fresh)[0]; dim?: boolean }) {
    const st = statusConfig[b.status] ?? statusConfig.PENDING_APPROVAL;
    const dateStr = b.date.toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });

    return (
      <div className={`p-4 bg-slate-50 rounded-xl ${dim ? "opacity-60" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1">
            <p className="font-medium text-slate-900">{b.instructor.user.name}</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {dateStr} • {formatHour(b.startHour)} – {formatHour(b.startHour + 1)}
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              {b.instructor.location} • {b.instructor.carType}
            </p>
            {b.pickupAddress && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
                <Navigation className="w-3 h-3 shrink-0" /> {b.pickupAddress}
              </p>
            )}
            {b.roadTestCenter && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 shrink-0" /> {b.roadTestCenter}
              </p>
            )}

            {/* Countdown + actions for pending approval */}
            {b.status === "PENDING_APPROVAL" && (
              <ApprovalCountdown
                bookingId={b.id}
                approvalDeadline={b.approvalDeadline?.toISOString() ?? null}
                approvalExtendedAt={b.approvalExtendedAt?.toISOString() ?? null}
              />
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${st.color}`}>
              {st.label}
            </span>
            <span className="text-sm font-bold text-slate-900">
              ${b.instructor.hourlyRate.toFixed(2)}
            </span>

            {/* Pay Now button for approved bookings */}
            {b.status === "PENDING_PAYMENT" && (
              <Link href={`/booking/payment?id=${b.id}`}>
                <button className="text-xs font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white px-4 py-1.5 rounded-full transition-colors">
                  Pay Now
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Leave a review for past confirmed lessons */}
        {b.status === "CONFIRMED" && new Date(b.date) < new Date(new Date().toDateString()) && !b.review && (
          <LeaveReview bookingId={b.id} instructorName={b.instructor.user.name || "Instructor"} />
        )}
        {b.review && (
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">★ Review submitted</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 mt-1">View and manage all your driving lesson bookings</p>
      </div>

      {fresh.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-5xl mb-4">📅</p>
              <p className="text-slate-600 font-medium">No bookings yet</p>
              <p className="text-sm text-slate-400 mt-1">Browse instructors to book your first lesson</p>
              <Link href="/instructors">
                <button className="mt-4 bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-slate-800 transition-colors">
                  Browse Instructors
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {active.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Bookings</CardTitle>
                <CardDescription>Pending approval, payment, or upcoming lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {active.map((b) => <BookingRow key={b.id} b={b} />)}
                </div>
              </CardContent>
            </Card>
          )}

          {past.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Past Bookings</CardTitle>
                <CardDescription>Completed and cancelled lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {past.map((b) => <BookingRow key={b.id} b={b} dim />)}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
