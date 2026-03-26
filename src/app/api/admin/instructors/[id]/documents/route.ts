import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedReadUrl } from "@/lib/s3";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const documents = await prisma.instructorDocument.findMany({
    where: { instructorId: id },
    orderBy: { uploadedAt: "asc" },
  });

  // Generate short-lived signed URLs for each document
  const withUrls = await Promise.all(
    documents.map(async (doc) => ({
      type: doc.type,
      fileName: doc.fileName,
      uploadedAt: doc.uploadedAt,
      url: await getSignedReadUrl(doc.fileKey, 900), // 15 min
    })),
  );

  return NextResponse.json(withUrls);
}
