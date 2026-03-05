import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedDownloadUrl } from "@/lib/s3";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.uploadedDocument.findUnique({
      where: { id },
      include: {
        booking: {
          include: { instructor: true },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // Check access: student who uploaded, the instructor, or admin
    const isStudent = document.booking.studentId === session.user.id;
    const isInstructor = document.booking.instructor.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isStudent && !isInstructor && !isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const url = await getSignedDownloadUrl(document.s3Key);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Document fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load document" },
      { status: 500 },
    );
  }
}
