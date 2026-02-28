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

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: {
    label: "Pending Payment",
    color: "bg-amber-100 text-amber-700",
  },
  PENDING_VERIFICATION: {
    label: "Pending Verification",
    color: "bg-blue-100 text-blue-700",
  },
  CONFIRMED: { label: "Confirmed", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Cancelled", color: "bg-slate-100 text-slate-700" },
};

function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:00 ${period}`;
}

export default async function BookingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const bookings = await prisma.booking.findMany({
    where: { studentId: session.user.id },
    include: {
      instructor: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const upcoming = bookings.filter(
    (b) =>
      new Date(b.date) >= new Date(new Date().toDateString()) &&
      !["CANCELLED", "REJECTED"].includes(b.status),
  );

  const past = bookings.filter(
    (b) =>
      new Date(b.date) < new Date(new Date().toDateString()) ||
      ["CANCELLED", "REJECTED"].includes(b.status),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 mt-1">
          View and manage all your driving lesson bookings
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-5xl mb-4">📅</p>
              <p className="text-slate-600 font-medium">No bookings yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Browse instructors to book your first lesson
              </p>
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
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Lessons</CardTitle>
                <CardDescription>
                  Your scheduled driving lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcoming.map((b) => {
                    const status =
                      statusConfig[b.status] ||
                      statusConfig.PENDING_VERIFICATION;
                    return (
                      <div
                        key={b.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {b.instructor.user.name}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {b.date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            • {formatHour(b.startHour)} –{" "}
                            {formatHour(b.startHour + 1)}
                          </p>
                          <p className="text-sm text-slate-400 mt-0.5">
                            {b.instructor.location} • {b.instructor.carType}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}
                          >
                            {status.label}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            ${b.instructor.hourlyRate.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Past */}
          {past.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Past Bookings</CardTitle>
                <CardDescription>
                  Your completed and previous lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {past.map((b) => {
                    const status =
                      statusConfig[b.status] ||
                      statusConfig.PENDING_VERIFICATION;
                    return (
                      <div
                        key={b.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl opacity-70"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {b.instructor.user.name}
                          </p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {b.date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            • {formatHour(b.startHour)} –{" "}
                            {formatHour(b.startHour + 1)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color}`}
                          >
                            {status.label}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            ${b.instructor.hourlyRate.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
