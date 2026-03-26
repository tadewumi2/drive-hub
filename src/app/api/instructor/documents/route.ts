import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";
import { sendEmail, getVerificationSubmittedEmailHtml } from "@/lib/email";
import { logAudit, getIp } from "@/lib/audit";

const REQUIRED_DOCS: DocumentType[] = [
  "DRIVING_LICENSE",
  "INSTRUCTOR_CERTIFICATE",
  "VEHICLE_INSURANCE",
  "PROFILE_PHOTO",
];

export async function POST(req: Request) {
  const ip = getIp(req);
  const session = await auth();
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, fileKey, fileName } = body;

  if (!type || !fileKey || !fileName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!REQUIRED_DOCS.includes(type as DocumentType)) {
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  }

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Instructor profile not found" }, { status: 404 });
  }

  // Upsert the document (replace if re-uploading same type)
  await prisma.instructorDocument.upsert({
    where: { instructorId_type: { instructorId: profile.id, type: type as DocumentType } },
    create: { instructorId: profile.id, type: type as DocumentType, fileKey, fileName },
    update: { fileKey, fileName, uploadedAt: new Date() },
  });

  // Check if all required docs are now uploaded
  const uploaded = await prisma.instructorDocument.findMany({
    where: { instructorId: profile.id },
    select: { type: true },
  });

  const uploadedTypes = uploaded.map((d) => d.type);
  const allUploaded = REQUIRED_DOCS.every((t) => uploadedTypes.includes(t));

  // If all docs uploaded and still UNVERIFIED, move to PENDING_REVIEW
  if (allUploaded && profile.verificationStatus === "UNVERIFIED") {
    await prisma.instructorProfile.update({
      where: { id: profile.id },
      data: { verificationStatus: "PENDING_REVIEW" },
    });

    logAudit({
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      action: "INSTRUCTOR_SUBMITTED_VERIFICATION",
      details: { instructorId: profile.id },
      ipAddress: ip,
    });

    // Notify admin
    const adminUsers = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { email: true },
    });

    for (const admin of adminUsers) {
      if (admin.email) {
        sendEmail({
          to: admin.email,
          subject: "New Instructor Verification Request",
          html: getVerificationSubmittedEmailHtml({
            instructorName: session.user.name || "An instructor",
            instructorEmail: session.user.email || "",
            reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/instructors/${profile.id}/verify`,
          }),
        });
      }
    }
  }

  return NextResponse.json({ success: true, allUploaded });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    include: { documents: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    verificationStatus: profile.verificationStatus,
    rejectionReason: profile.rejectionReason,
    documents: profile.documents.map((d) => ({
      type: d.type,
      fileName: d.fileName,
      uploadedAt: d.uploadedAt,
    })),
  });
}
