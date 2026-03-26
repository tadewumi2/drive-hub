import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, getVerificationApprovedEmailHtml } from "@/lib/email";
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

  const profile = await prisma.instructorProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
  }

  await prisma.instructorProfile.update({
    where: { id },
    data: { verificationStatus: "APPROVED", rejectionReason: null },
  });

  logAudit({
    userId: session.user.id,
    userEmail: session.user.email ?? undefined,
    action: "INSTRUCTOR_VERIFICATION_APPROVED",
    details: { instructorId: id, instructorEmail: profile.user.email },
    ipAddress: ip,
  });

  if (profile.user.email) {
    sendEmail({
      to: profile.user.email,
      subject: "Your DriveHub instructor account has been approved!",
      html: getVerificationApprovedEmailHtml({
        name: profile.user.name || "Instructor",
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/instructor`,
      }),
    });
  }

  return NextResponse.json({ success: true });
}
