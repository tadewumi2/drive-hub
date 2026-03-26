import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const reviews = await prisma.review.findMany({
    where: { instructorId: id },
    include: {
      student: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      studentName: r.student.name || "Anonymous",
      createdAt: r.createdAt.toISOString(),
    })),
    averageRating: avg ? Math.round(avg * 10) / 10 : null,
    totalReviews: reviews.length,
  });
}
