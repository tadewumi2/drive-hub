import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { BookingStatus } from "@prisma/client";

export default async function InstructorDashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/sign-in");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/dashboard");

  const today = new Date(new Date().toDateString());

  const [totalBookings, pendingVerification, upcoming, todayBookings] =
    await Promise.all([
      prisma.booking.count({
        where: { instructorId: profile.id },
      }),
      prisma.booking.count({
        where: {
          instructorId: profile.id,
          status: BookingStatus.PENDING_APPROVAL,
        },
      }),
      prisma.booking.count({
        where: {
          instructorId: profile.id,
          date: { gte: today },
          status: BookingStatus.CONFIRMED,
        },
      }),
      prisma.booking.findMany({
        where: {
          instructorId: profile.id,
          date: today,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_PAYMENT] },
        },
        include: {
          student: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { startHour: "asc" },
      }),
    ]);

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}:00 ${period}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {session.user.name?.split(" ")[0] || "Instructor"}!
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s your overview for today
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalBookings}</p>
          <p className="text-sm text-slate-500">Total Bookings</p>
        </div>

        <Link href="/instructor/bookings?filter=pending" className="block">
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {pendingVerification}
            </p>
            <p className="text-sm text-slate-500">Needs Approval</p>
          </div>
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{upcoming}</p>
          <p className="text-sm text-slate-500">Upcoming Lessons</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-violet-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {todayBookings.length}
          </p>
          <p className="text-sm text-slate-500">Today&apos;s Lessons</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Today&apos;s Schedule
        </h2>

        {todayBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No lessons scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center bg-white rounded-lg border border-slate-200 px-3 py-2 min-w-[80px]">
                    <p className="text-sm font-bold text-[var(--navy)]">
                      {formatHour(b.startHour)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {b.student.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {b.student.email} • {b.student.phone || "No phone"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    b.status === BookingStatus.CONFIRMED
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {b.status === BookingStatus.CONFIRMED ? "Confirmed" : "Awaiting Payment"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/instructor/availability"
          className="bg-[var(--navy)] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[var(--navy-light)] transition-colors"
        >
          Manage Availability
        </Link>
        <Link
          href="/instructor/bookings"
          className="border-2 border-[var(--navy)] text-[var(--navy)] text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[var(--navy)] hover:text-white transition-all"
        >
          View All Bookings
        </Link>
      </div>
    </div>
  );
}
