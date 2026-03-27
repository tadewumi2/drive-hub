import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://drivehub.ca";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/instructors", "/instructors/", "/policies/"],
        disallow: [
          "/dashboard/",
          "/instructor/",
          "/admin/",
          "/api/",
          "/auth/",
          "/booking/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
