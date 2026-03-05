import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, phone, password, bio, carType, location, hourlyRate } =
      await req.json();

    if (!name || !email || !password || !carType || !location || !hourlyRate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || null,
        role: "INSTRUCTOR",
        emailVerified: new Date(),
      },
    });

    await prisma.instructorProfile.create({
      data: {
        userId: user.id,
        bio: bio || null,
        carType,
        location,
        hourlyRate,
        isActive: true,
      },
    });

    return NextResponse.json(
      { message: "Instructor created" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create instructor error:", error);
    return NextResponse.json(
      { error: "Failed to create instructor" },
      { status: 500 },
    );
  }
}
