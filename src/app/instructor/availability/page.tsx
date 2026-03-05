import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AvailabilityManager from "@/components/instructor/availability-manager";

export default async function AvailabilityPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/sign-in");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      availabilityRules: {
        orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
      },
      availabilityExceptions: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!profile) redirect("/dashboard");

  const rules = profile.availabilityRules.map((r) => ({
    id: r.id,
    dayOfWeek: r.dayOfWeek,
    startHour: r.startHour,
    endHour: r.endHour,
  }));

  const exceptions = profile.availabilityExceptions.map((e) => ({
    id: e.id,
    date: e.date.toISOString(),
    isBlocked: e.isBlocked,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Manage Availability
        </h1>
        <p className="text-slate-500 mt-1">
          Set your weekly schedule and block specific dates
        </p>
      </div>

      <AvailabilityManager
        instructorId={profile.id}
        initialRules={rules}
        initialExceptions={exceptions}
      />
    </div>
  );
}
