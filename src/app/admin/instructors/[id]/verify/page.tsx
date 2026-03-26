import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import VerifyInstructorClient from "@/components/admin/verify-instructor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verify Instructor — Admin" };

export default async function VerifyInstructorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;

  const profile = await prisma.instructorProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true, createdAt: true } },
      documents: { select: { type: true, fileName: true, uploadedAt: true } },
    },
  });

  if (!profile) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verify Instructor</h1>
        <p className="text-slate-500 mt-1">Review submitted documents and approve or reject this application.</p>
      </div>

      <VerifyInstructorClient
        profileId={profile.id}
        instructor={{
          name: profile.user.name || "",
          email: profile.user.email || "",
          phone: profile.user.phone || "",
          location: profile.location,
          carType: profile.carType,
          hourlyRate: profile.hourlyRate,
          joinedAt: profile.user.createdAt.toISOString(),
          verificationStatus: profile.verificationStatus,
          rejectionReason: profile.rejectionReason,
        }}
        documents={profile.documents.map((d) => ({
          type: d.type,
          fileName: d.fileName,
          uploadedAt: d.uploadedAt.toISOString(),
        }))}
      />
    </div>
  );
}
