import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PaymentFlow from "@/components/booking/payment-flow";
import { Car } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const params = await searchParams;
  const bookingId = params.id;

  if (!bookingId) {
    redirect("/dashboard");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      instructor: {
        include: { user: { select: { name: true } } },
      },
      uploadedDocument: true,
    },
  });

  if (!booking || booking.studentId !== session.user.id) {
    redirect("/dashboard");
  }

  if (booking.status !== "APPROVED") {
    redirect(`/booking/confirmation?id=${bookingId}`);
  }

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}:00 ${period}`;
  };

  const bookingData = {
    id: booking.id,
    instructorName: booking.instructor.user.name || "Instructor",
    instructorImage: booking.instructor.image,
    location: booking.instructor.location,
    carType: booking.instructor.carType,
    date: booking.date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: `${formatHour(booking.startHour)} – ${formatHour(booking.startHour + 1)}`,
    hourlyRate: booking.instructor.hourlyRate,
    hasDocument: !!booking.uploadedDocument,
    documentName: booking.uploadedDocument?.fileName || null,
  };

  return (
    <div className="min-h-screen bg-[var(--blue-softer)]">
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

          <a
            href="/dashboard"
            className="text-sm font-semibold bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-white px-5 py-2 rounded-full transition-colors"
          >
            Dashboard
          </a>
        </div>
      </header>

      <main className="pt-28 pb-20 max-w-3xl mx-auto px-6 lg:px-8">
        <PaymentFlow booking={bookingData} />
      </main>
    </div>
  );
}
