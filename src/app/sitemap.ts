import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; priority?: number; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
    { path: "/blog", changeFrequency: "weekly" },
    { path: "/blog/family-involvement" },
    { path: "/blog/how-meetings-are-supervised" },
    { path: "/blog/is-jodohmu-only-for-muslims" },
    { path: "/blog/step-by-step-process" },
    { path: "/blog/syariah-safeguards" },
    { path: "/blog/why-dating-apps-fail" },
    { path: "/faq" },
    { path: "/contact" },
    { path: "/privacy" },
    { path: "/terms" },
  ];

  const lastModified = new Date();

  return routes.map(({ path, priority = 0.6, changeFrequency = "monthly" }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
