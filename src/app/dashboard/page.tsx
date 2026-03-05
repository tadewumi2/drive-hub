import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - DriveHub",
  description: "View your upcoming lessons and manage your bookings",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/auth/sign-in");
  }

  const today = new Date(new Date().toDateString());

  const [upcoming, completed, pending] = await Promise.all([
    prisma.booking.count({
      where: {
        studentId: session.user.id,
        date: { gte: today },
        status: { in: ["CONFIRMED", "APPROVED", "PENDING_VERIFICATION"] },
      },
    }),
    prisma.booking.count({
      where: {
        studentId: session.user.id,
        date: { lt: today },
        status: "CONFIRMED",
      },
    }),
    prisma.booking.count({
      where: {
        studentId: session.user.id,
        status: { in: ["PENDING_UPLOAD", "PENDING_VERIFICATION"] },
      },
    }),
  ]);

  const isVerified = !!user.emailVerified;

  return (
    <div className="space-y-6">
      {!isVerified && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Your email is not verified. Please check your inbox for the
              verification link.
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s an overview of your driving lessons
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming Lessons</CardDescription>
            <CardTitle className="text-3xl">{upcoming}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {upcoming === 0 ? "No lessons scheduled" : "Lessons coming up"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Lessons</CardDescription>
            <CardTitle className="text-3xl">{completed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {completed === 0
                ? "Start booking to track progress"
                : "Lessons completed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Verification</CardDescription>
            <CardTitle className="text-3xl">{pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {pending === 0
                ? "All bookings verified"
                : "Awaiting verification"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with your driving journey
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/instructors">
            <Button>Browse Instructors</Button>
          </Link>
          <Link href="/dashboard/bookings">
            <Button variant="outline">View Bookings</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
