import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InstructorProfileEditor from "@/components/instructor/profile-editor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Profile — DriveHub Instructor" };

export default async function InstructorProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!profile) redirect("/instructor");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">
          Update your public profile that students see when browsing instructors.
        </p>
      </div>

      <InstructorProfileEditor
        initial={{
          name: profile.user.name || "",
          email: profile.user.email || "",
          bio: profile.bio || "",
          carType: profile.carType,
          location: profile.location,
          hourlyRate: profile.hourlyRate,
          image: profile.image,
        }}
      />
    </div>
  );
}
