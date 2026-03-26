import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import VerificationForm from "@/components/instructor/verification-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verification — DriveHub Instructor" };

export default async function InstructorVerificationPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      documents: { select: { type: true, fileName: true } },
    },
  });

  if (!profile) redirect("/instructor");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Verification</h1>
        <p className="text-slate-500 mt-1">
          Submit your documents to be verified and go live on the platform.
        </p>
      </div>

      <VerificationForm
        initialStatus={profile.verificationStatus}
        initialDocs={profile.documents.map((d) => ({ type: d.type, fileName: d.fileName }))}
        rejectionReason={profile.rejectionReason}
      />
    </div>
  );
}
