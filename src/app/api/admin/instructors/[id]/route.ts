import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Toggle active status
    if (body.toggleActive !== undefined) {
      await prisma.instructorProfile.update({
        where: { id },
        data: { isActive: body.toggleActive },
      });
      return NextResponse.json({ message: "Status updated" }, { status: 200 });
    }

    // Full update
    const { name, phone, bio, carType, location, hourlyRate } = body;

    const profile = await prisma.instructorProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 },
      );
    }

    await prisma.user.update({
      where: { id: profile.userId },
      data: { name, phone: phone || null },
    });

    await prisma.instructorProfile.update({
      where: { id },
      data: {
        bio: bio || null,
        carType,
        location,
        hourlyRate,
      },
    });

    return NextResponse.json(
      { message: "Instructor updated" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update instructor error:", error);
    return NextResponse.json(
      { error: "Failed to update instructor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const profile = await prisma.instructorProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Instructor not found" },
        { status: 404 },
      );
    }

    // Delete the user (cascades to profile and bookings)
    await prisma.user.delete({
      where: { id: profile.userId },
    });

    return NextResponse.json(
      { message: "Instructor removed" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete instructor error:", error);
    return NextResponse.json(
      { error: "Failed to remove instructor" },
      { status: 500 },
    );
  }
}
