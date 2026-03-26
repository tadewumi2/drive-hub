import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedReadUrl } from "@/lib/s3";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, bio, carType, location, hourlyRate, photoKey } = await req.json();

  if (!carType?.trim() || !location?.trim() || !hourlyRate) {
    return NextResponse.json({ error: "Car type, location and hourly rate are required" }, { status: 400 });
  }

  if (hourlyRate < 1) {
    return NextResponse.json({ error: "Hourly rate must be at least $1" }, { status: 400 });
  }

  if (bio && bio.length > 500) {
    return NextResponse.json({ error: "Bio must be under 500 characters" }, { status: 400 });
  }

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Update user name if provided
  if (name?.trim()) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    });
  }

  // If a new photo key was provided, generate a presigned URL to store
  let imageValue = profile.image;
  if (photoKey) {
    imageValue = await getSignedReadUrl(photoKey, 60 * 60 * 24 * 30); // 30 days
  }

  await prisma.instructorProfile.update({
    where: { id: profile.id },
    data: {
      bio: bio?.trim() || null,
      carType: carType.trim(),
      location: location.trim(),
      hourlyRate: Number(hourlyRate),
      image: imageValue,
    },
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: profile.user.name || "",
    email: profile.user.email || "",
    bio: profile.bio || "",
    carType: profile.carType,
    location: profile.location,
    hourlyRate: profile.hourlyRate,
    image: profile.image,
  });
}
