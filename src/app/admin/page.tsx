import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Calendar, AlertCircle, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalStudents,
    totalInstructors,
    totalBookings,
    pendingVerification,
    confirmedBookings,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING_VERIFICATION" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { name: true, email: true } },
        instructor: {
          include: { user: { select: { name: true } } },
        },
      },
    }),
  ]);

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}:00 ${period}`;
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING_UPLOAD: {
      label: "Awaiting Upload",
      color: "bg-slate-100 text-slate-600",
    },
    PENDING_VERIFICATION: {
      label: "Needs Review",
      color: "bg-amber-100 text-amber-700",
    },
    APPROVED: { label: "Approved", color: "bg-emerald-100 text-emerald-700" },
    CONFIRMED: { label: "Confirmed", color: "bg-green-100 text-green-700" },
    REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700" },
    CANCELLED: { label: "Cancelled", color: "bg-slate-100 text-slate-500" },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Users className="w-5 h-5 text-blue-600 mb-3" />
          <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
          <p className="text-sm text-slate-500">Students</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Users className="w-5 h-5 text-violet-600 mb-3" />
          <p className="text-2xl font-bold text-slate-900">
            {totalInstructors}
          </p>
          <p className="text-sm text-slate-500">Instructors</p>
        </div>
        <Link href="/admin/bookings?filter=pending">
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <AlertCircle className="w-5 h-5 text-amber-600 mb-3" />
            <p className="text-2xl font-bold text-slate-900">
              {pendingVerification}
            </p>
            <p className="text-sm text-slate-500">Needs Review</p>
          </div>
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <Calendar className="w-5 h-5 text-green-600 mb-3" />
          <p className="text-2xl font-bold text-slate-900">{totalBookings}</p>
          <p className="text-sm text-slate-500">Total Bookings</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
          <Link
            href="/admin/bookings"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No bookings yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">
                    Student
                  </th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">
                    Instructor
                  </th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">
                    Date
                  </th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">
                    Time
                  </th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => {
                  const status =
                    statusConfig[b.status] || statusConfig.PENDING_UPLOAD;
                  return (
                    <tr key={b.id} className="border-b border-slate-50">
                      <td className="py-3 px-2">
                        <p className="font-medium text-slate-900">
                          {b.student.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {b.student.email}
                        </p>
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {b.instructor.user.name}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {b.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {formatHour(b.startHour)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
