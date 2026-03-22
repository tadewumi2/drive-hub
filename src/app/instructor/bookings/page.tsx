import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InstructorBookingsList from "@/components/instructor/bookings-list";
import { checkAndExpireBooking } from "@/lib/booking-expiry";

export default async function InstructorBookingsPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/sign-in");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/dashboard");

  const bookings = await prisma.booking.findMany({
    where: { instructorId: profile.id },
    include: {
      student: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Lazy-expire / auto-extend PENDING_APPROVAL bookings
  await Promise.all(
    bookings
      .filter((b) => b.status === "PENDING_APPROVAL")
      .map((b) => checkAndExpireBooking(b.id)),
  );

  // Re-fetch with fresh statuses and deadlines
  const fresh = await prisma.booking.findMany({
    where: { instructorId: profile.id },
    include: {
      student: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = fresh.map((b) => ({
    id: b.id,
    studentName: b.student.name || "Unknown",
    studentEmail: b.student.email || "",
    studentPhone: b.student.phone || "",
    date: b.date.toISOString(),
    startHour: b.startHour,
    status: b.status,
    notes: b.notes,
    pickupAddress: b.pickupAddress,
    roadTestCenter: b.roadTestCenter,
    approvalDeadline: b.approvalDeadline?.toISOString() ?? null,
    approvalExtendedAt: b.approvalExtendedAt?.toISOString() ?? null,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
        <p className="text-slate-500 mt-1">
          Manage and review all your student bookings
        </p>
      </div>

      <InstructorBookingsList bookings={formatted} />
    </div>
  );
}
