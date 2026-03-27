import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://drivehub.ca";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                          lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/instructors`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/auth/sign-in`,        lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/auth/sign-up`,        lastModified: new Date(), changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE_URL}/auth/sign-up/instructor`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/policies/cancellation`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/policies/terms`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/policies/privacy`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // Dynamic instructor profile pages (only approved, active instructors)
  const instructors = await prisma.instructorProfile.findMany({
    where: { isActive: true, verificationStatus: "APPROVED" },
    select: { id: true, updatedAt: true },
  });

  const instructorRoutes: MetadataRoute.Sitemap = instructors.map((inst) => ({
    url: `${BASE_URL}/instructors/${inst.id}`,
    lastModified: inst.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...instructorRoutes];
}
