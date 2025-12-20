import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    "/privacy",
    "/terms",
    "/register",
    "/login",
    "/id",
    "/id/privacy",
    "/id/terms",
    "/id/register",
    "/id/login",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "/" || route === "/id" ? 1 : 0.6,
  }));
}
