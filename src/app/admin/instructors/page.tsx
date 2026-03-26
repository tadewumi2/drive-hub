import { prisma } from "@/lib/prisma";
import AdminInstructorsList from "@/components/admin/instructors-list";

export default async function AdminInstructorsPage() {
  const instructors = await prisma.instructorProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedInstructors = instructors.map((inst) => ({
    id: inst.id,
    userId: inst.user.id,
    name: inst.user.name || "",
    email: inst.user.email || "",
    phone: inst.user.phone || "",
    bio: inst.bio || "",
    carType: inst.carType,
    location: inst.location,
    hourlyRate: inst.hourlyRate,
    isActive: inst.isActive,
    totalBookings: inst._count.bookings,
    verificationStatus: inst.verificationStatus,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Instructors</h1>
          <p className="text-slate-500 mt-1">
            Manage instructor profiles and pricing
          </p>
        </div>
      </div>

      <AdminInstructorsList instructors={formattedInstructors} />
    </div>
  );
}
