import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { instructorId, date } = await req.json();

    const profile = await prisma.instructorProfile.findUnique({
      where: { id: instructorId },
    });

    if (!profile || profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await prisma.availabilityException.upsert({
      where: {
        instructorId_date: {
          instructorId,
          date: new Date(date),
        },
      },
      update: { isBlocked: true },
      create: {
        instructorId,
        date: new Date(date),
        isBlocked: true,
      },
    });

    const exceptions = await prisma.availabilityException.findMany({
      where: { instructorId },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ exceptions }, { status: 200 });
  } catch (error) {
    console.error("Add exception error:", error);
    return NextResponse.json(
      { error: "Failed to block date" },
      { status: 500 },
    );
  }
}
