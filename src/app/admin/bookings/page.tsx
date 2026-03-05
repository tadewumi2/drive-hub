import { prisma } from "@/lib/prisma";
import AdminBookingsList from "@/components/admin/bookings-list";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      student: { select: { name: true, email: true, phone: true } },
      instructor: {
        include: { user: { select: { name: true } } },
      },
      uploadedDocument: true,
      paymentTransaction: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedBookings = bookings.map((b) => ({
    id: b.id,
    studentName: b.student.name || "Unknown",
    studentEmail: b.student.email || "",
    studentPhone: b.student.phone || "",
    instructorName: b.instructor.user.name || "Unknown",
    date: b.date.toISOString(),
    startHour: b.startHour,
    status: b.status,
    notes: b.notes,
    hasDocument: !!b.uploadedDocument,
    documentId: b.uploadedDocument?.id || null,
    documentName: b.uploadedDocument?.fileName || null,
    hourlyRate: b.instructor.hourlyRate,
    paymentStatus: b.paymentTransaction?.status || null,
    stripePaymentIntent: b.paymentTransaction?.stripePaymentIntent || null,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Bookings</h1>
        <p className="text-slate-500 mt-1">
          Manage, verify, and refund bookings across the platform
        </p>
      </div>

      <AdminBookingsList bookings={formattedBookings} />
    </div>
  );
}
