import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { instructorId, dayOfWeek, startHour, endHour } = await req.json();

    // Verify ownership
    const profile = await prisma.instructorProfile.findUnique({
      where: { id: instructorId },
    });

    if (!profile || profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Create individual 1-hour slots
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        instructorId,
        dayOfWeek,
        startHour: hour,
        endHour: hour + 1,
      });
    }

    // Use skipDuplicates to avoid errors on existing slots
    await prisma.availabilityRule.createMany({
      data: slots,
      skipDuplicates: true,
    });

    const rules = await prisma.availabilityRule.findMany({
      where: { instructorId },
      orderBy: [{ dayOfWeek: "asc" }, { startHour: "asc" }],
    });

    return NextResponse.json({ rules }, { status: 200 });
  } catch (error) {
    console.error("Add availability error:", error);
    return NextResponse.json(
      { error: "Failed to add availability" },
      { status: 500 },
    );
  }
}
