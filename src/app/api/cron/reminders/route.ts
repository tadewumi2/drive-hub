import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, getStudentReminderEmailHtml, getInstructorReminderEmailHtml } from "@/lib/email";

// Vercel Cron calls this with the Authorization header containing CRON_SECRET.
// Locally you can test by calling: GET /api/cron/reminders
// with header Authorization: Bearer <CRON_SECRET>

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this automatically; we also check for local testing)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  // Target: lessons happening tomorrow (in UTC date terms)
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  tomorrowStart.setUTCHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setUTCDate(tomorrowEnd.getUTCDate() + 1);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      reminderSentAt: null,
      date: {
        gte: tomorrowStart,
        lt: tomorrowEnd,
      },
    },
    include: {
      student: { select: { name: true, email: true, phone: true } },
      instructor: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const booking of bookings) {
    const dateStr = formatDate(booking.date);
    const studentDashboard = `${appUrl}/dashboard/bookings`;
    const instructorDashboard = `${appUrl}/instructor/bookings`;

    // Send to student
    const studentResult = await sendEmail({
      to: booking.student.email!,
      subject: `Reminder: Your driving lesson is tomorrow at ${formatHour(booking.startHour)}`,
      html: getStudentReminderEmailHtml({
        studentName: booking.student.name ?? "there",
        instructorName: booking.instructor.user.name ?? "your instructor",
        date: dateStr,
        startHour: booking.startHour,
        location: booking.instructor.location,
        carType: booking.instructor.carType,
        pickupAddress: booking.pickupAddress,
        dashboardUrl: studentDashboard,
      }),
    });

    // Send to instructor
    const instructorResult = await sendEmail({
      to: booking.instructor.user.email!,
      subject: `Reminder: Lesson with ${booking.student.name ?? "a student"} tomorrow at ${formatHour(booking.startHour)}`,
      html: getInstructorReminderEmailHtml({
        instructorName: booking.instructor.user.name ?? "there",
        studentName: booking.student.name ?? "Student",
        studentPhone: booking.student.phone,
        date: dateStr,
        startHour: booking.startHour,
        pickupAddress: booking.pickupAddress,
        roadTestCenter: booking.roadTestCenter,
        notes: booking.notes,
        dashboardUrl: instructorDashboard,
      }),
    });

    if (studentResult.success && instructorResult.success) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSentAt: new Date() },
      });
      sent++;
    } else {
      console.error(`Reminder failed for booking ${booking.id}`);
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    processed: bookings.length,
    sent,
    failed,
    window: { from: tomorrowStart.toISOString(), to: tomorrowEnd.toISOString() },
  });
}

function formatHour(h: number) {
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:00 ${period}`;
}
