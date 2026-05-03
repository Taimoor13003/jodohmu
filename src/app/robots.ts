import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/profiles",
          "/profile",
          "/admin",
          "/api",
          "/login",
          "/register",
          "/en/dashboard",
          "/en/dashboard/",
          "/en/profiles",
          "/en/profile",
          "/en/admin",
          "/en/login",
          "/en/register",
          "/id/dashboard",
          "/id/dashboard/",
          "/id/profiles",
          "/id/profile",
          "/id/admin",
          "/id/api",
          "/id/login",
          "/id/register",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
