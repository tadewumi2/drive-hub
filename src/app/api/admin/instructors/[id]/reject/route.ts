import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, getVerificationRejectedEmailHtml } from "@/lib/email";
import { logAudit, getIp } from "@/lib/audit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = getIp(req);
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { reason } = await req.json();

  if (!reason?.trim()) {
    return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
  }

  const profile = await prisma.instructorProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
  }

  await prisma.instructorProfile.update({
    where: { id },
    data: {
      verificationStatus: "REJECTED",
      rejectionReason: reason.trim(),
    },
  });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    action: "INSTRUCTOR_VERIFICATION_REJECTED",
    details: { instructorId: id, reason: reason.trim() },
    ipAddress: ip,
  });

  if (profile.user.email) {
    sendEmail({
      to: profile.user.email,
      subject: "Update on your DriveHub instructor application",
      html: getVerificationRejectedEmailHtml({
        name: profile.user.name || "Instructor",
        reason: reason.trim(),
        resubmitUrl: `${process.env.NEXT_PUBLIC_APP_URL}/instructor/verification`,
      }),
    });
  }

  return NextResponse.json({ success: true });
}
