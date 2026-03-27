import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import InstructorsList from "@/components/instructors/instructors-list";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find a Driving Instructor Near You",
  description:
    "Browse certified driving instructors. Filter by location, availability, and car type. Read real student reviews and book instantly.",
  openGraph: {
    title: "Find a Driving Instructor Near You – DriveHub",
    description:
      "Browse certified driving instructors. Filter by location, availability, and car type. Read real student reviews and book instantly.",
  },
};

export default async function InstructorsPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const instructors = await prisma.instructorProfile.findMany({
    where: { isActive: true, verificationStatus: "APPROVED" },
    include: {
      user: { select: { name: true, email: true } },
      availabilityRules: true,
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute average rating per instructor
  const reviewAggregates = await prisma.review.groupBy({
    by: ["instructorId"],
    _avg: { rating: true },
    where: { instructorId: { in: instructors.map((i) => i.id) } },
  });
  const avgByInstructor = Object.fromEntries(
    reviewAggregates.map((r) => [r.instructorId, r._avg.rating ?? null]),
  );

  const formattedInstructors = instructors.map((inst) => ({
    id: inst.id,
    userId: inst.userId,
    name: inst.user.name || "Unnamed Instructor",
    bio: inst.bio || "",
    carType: inst.carType,
    location: inst.location,
    hourlyRate: inst.hourlyRate,
    image: inst.image,
    averageRating: avgByInstructor[inst.id] ?? null,
    totalReviews: inst._count.reviews,
    availability: inst.availabilityRules.map((rule) => ({
      dayOfWeek: rule.dayOfWeek,
      startHour: rule.startHour,
      endHour: rule.endHour,
    })),
  }));

  return (
    <div className="min-h-screen bg-[var(--blue-softer)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--gold)] rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2-3H7L5 10H3c-.6 0-1 .4-1 1v5c0 .6.4 1 1 1h1" />
                <circle cx="7.5" cy="17.5" r="2.5" />
                <circle cx="16.5" cy="17.5" r="2.5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[var(--navy)]">
              DriveHub
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white px-5 py-2 rounded-full transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <a
                  href="/auth/sign-in"
                  className="text-sm font-medium text-[var(--navy)] hover:text-[var(--gold)] transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/auth/sign-up"
                  className="text-sm font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white px-5 py-2 rounded-full transition-colors"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--navy)]">
            Our Instructors
          </h1>
          <p className="mt-3 text-lg text-slate-500 max-w-xl mx-auto">
            Browse our qualified instructors and find the perfect match for your
            driving journey
          </p>
        </div>

        <Suspense fallback={<p className="text-center text-slate-500">Loading instructors...</p>}>
          <InstructorsList instructors={formattedInstructors} />
        </Suspense>
      </main>
    </div>
  );
}
