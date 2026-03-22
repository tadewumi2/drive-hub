import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import InstructorProfileView from "@/components/instructors/instructor-profile";
import Link from "next/link";
import { Car } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InstructorProfilePage({ params }: PageProps) {
  const { id } = await params;

  const instructor = await prisma.instructorProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true },
      },
      availabilityRules: {
        orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
      },
      availabilityExceptions: true,
      bookings: {
        where: {
          status: {
            in: ["PENDING_PAYMENT", "PENDING_APPROVAL", "CONFIRMED"],
          },
        },
        select: {
          date: true,
          startHour: true,
        },
      },
    },
  });

  if (!instructor || !instructor.isActive) {
    notFound();
  }

  const session = await auth();

  const formattedInstructor = {
    id: instructor.id,
    name: instructor.user.name || "Unnamed Instructor",
    bio: instructor.bio || "",
    carType: instructor.carType,
    location: instructor.location,
    hourlyRate: instructor.hourlyRate,
    image: instructor.image,
    availability: instructor.availabilityRules.map((rule) => ({
      dayOfWeek: rule.dayOfWeek,
      startHour: rule.startHour,
      endHour: rule.endHour,
    })),
    exceptions: instructor.availabilityExceptions.map((ex) => ({
      date: ex.date.toISOString(),
      isBlocked: ex.isBlocked,
    })),
    bookedSlots: instructor.bookings.map((b) => ({
      date: b.date.toISOString(),
      startHour: b.startHour,
    })),
  };

  return (
    <div className="min-h-screen bg-[var(--blue-softer)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--gold)] rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--navy)]">
              DriveHub
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <a
              href="/instructors"
              className="text-sm font-medium text-[var(--navy)] hover:text-[var(--gold)] transition-colors"
            >
              All Instructors
            </a>
            {session?.user ? (
              <a
                href="/dashboard"
                className="text-sm font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white px-5 py-2 rounded-full transition-colors"
              >
                Dashboard
              </a>
            ) : (
              <a
                href="/auth/sign-in"
                className="text-sm font-semibold border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white px-5 py-2 rounded-full transition-all"
              >
                Log In
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 lg:px-8">
        <InstructorProfileView
          instructor={formattedInstructor}
          isLoggedIn={!!session?.user}
        />
      </main>
    </div>
  );
}
