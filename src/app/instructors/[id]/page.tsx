import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import InstructorProfileView from "@/components/instructors/instructor-profile";
import ReviewsList from "@/components/reviews/reviews-list";
import Link from "next/link";
import { Car } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const instructor = await prisma.instructorProfile.findUnique({
    where: { id },
    select: { bio: true, location: true, carType: true, hourlyRate: true, image: true, user: { select: { name: true } } },
  });

  if (!instructor) return { title: "Instructor Not Found" };

  const name = instructor.user.name ?? "Driving Instructor";
  const description = instructor.bio
    ? instructor.bio.slice(0, 155)
    : `Book a driving lesson with ${name} in ${instructor.location}. ${instructor.carType} vehicle — $${instructor.hourlyRate}/hr.`;

  return {
    title: `${name} – Driving Instructor in ${instructor.location}`,
    description,
    openGraph: {
      title: `${name} – Driving Instructor in ${instructor.location}`,
      description,
      images: instructor.image ? [{ url: instructor.image, alt: name }] : [],
    },
    twitter: {
      card: "summary",
      title: `${name} – Driving Instructor in ${instructor.location}`,
      description,
    },
  };
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

  const appUrl = process.env.NEXTAUTH_URL ?? "https://drivehub.ca";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Driving Lessons with ${formattedInstructor.name}`,
    description: formattedInstructor.bio || `Driving instruction in ${formattedInstructor.location}`,
    provider: {
      "@type": "Person",
      name: formattedInstructor.name,
      image: formattedInstructor.image ?? undefined,
    },
    areaServed: formattedInstructor.location,
    offers: {
      "@type": "Offer",
      price: formattedInstructor.hourlyRate,
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
    },
    url: `${appUrl}/instructors/${formattedInstructor.id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            <Link
              href="/instructors"
              className="text-sm font-medium text-[var(--navy)] hover:text-[var(--gold)] transition-colors"
            >
              All Instructors
            </Link>
            {session?.user ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white px-5 py-2 rounded-full transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/sign-in"
                className="text-sm font-semibold border-2 border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white px-5 py-2 rounded-full transition-all"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
        <InstructorProfileView
          instructor={formattedInstructor}
          isLoggedIn={!!session?.user}
        />

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Student Reviews</h2>
          <ReviewsList instructorId={instructor.id} />
        </div>
      </main>
    </div>
    </>
  );
}
