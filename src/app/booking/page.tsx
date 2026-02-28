import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/booking/booking-form";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    instructor?: string;
    date?: string;
    hour?: string;
  }>;
}

export default async function BookingPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    const params = await searchParams;
    const callbackUrl = `/booking?instructor=${params.instructor}&date=${params.date}&hour=${params.hour}`;
    redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const params = await searchParams;
  const { instructor: instructorId, date, hour } = params;

  if (!instructorId || !date || !hour) {
    redirect("/instructors");
  }

  const instructor = await prisma.instructorProfile.findUnique({
    where: { id: instructorId },
    include: {
      user: { select: { name: true } },
    },
  });

  if (!instructor || !instructor.isActive) {
    redirect("/instructors");
  }

  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  // Check if slot is still available
  const existingBooking = await prisma.booking.findUnique({
    where: {
      instructorId_date_startHour: {
        instructorId,
        date: new Date(date),
        startHour: parseInt(hour),
      },
    },
  });

  if (existingBooking) {
    redirect(`/instructors/${instructorId}?error=slot-taken`);
  }

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}:00 ${period}`;
  };

  const bookingDetails = {
    instructorId: instructor.id,
    instructorName: instructor.user.name || "Instructor",
    instructorImage: instructor.image,
    location: instructor.location,
    carType: instructor.carType,
    date,
    hour: parseInt(hour),
    hourFormatted: formatHour(parseInt(hour)),
    hourlyRate: instructor.hourlyRate,
  };

  const studentInfo = {
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
  };

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
                <path d="M7 17m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />
                <path d="M17 17m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" />
                <path d="M5 17H3v-6l2-5h9l4 5h3v6h-2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[var(--navy)]">
              DriveHub
            </span>
          </Link>

          <a
            href="/dashboard"
            className="text-sm font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white px-5 py-2 rounded-full transition-colors"
          >
            Dashboard
          </a>
        </div>
      </header>

      <main className="pt-28 pb-20 max-w-3xl mx-auto px-6 lg:px-8">
        <BookingForm booking={bookingDetails} student={studentInfo} />
      </main>
    </div>
  );
}
