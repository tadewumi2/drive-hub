import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadToS3 } from "@/lib/s3";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bookingId = formData.get("bookingId") as string | null;

    if (!file || !bookingId) {
      return NextResponse.json(
        { error: "File and booking ID are required" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF, JPG, or PNG file." },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    // Verify booking belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.studentId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop();
    const key = `road-test-proofs/${bookingId}/${Date.now()}.${ext}`;

    await uploadToS3(buffer, key, file.type);

    // Save document record (upsert to allow re-uploads)
    const document = await prisma.uploadedDocument.upsert({
      where: { bookingId },
      update: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        s3Key: key,
        url: key,
      },
      create: {
        bookingId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        s3Key: key,
        url: key,
      },
    });

    return NextResponse.json(
      {
        message: "File uploaded successfully",
        document: {
          id: document.id,
          fileName: document.fileName,
          fileSize: document.fileSize,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
