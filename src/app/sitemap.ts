// INVARIANT: see /SEO.md before changing anything in this file. URLs may be added, never removed.
import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

type Route = {
  path: string;
  priority?: number;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified?: string | Date;
};

export default function sitemap(): MetadataRoute.Sitemap {
  // Real last-change dates. Update a page's date when its content changes;
  // stamping every page with "now" teaches Google to ignore lastmod.
  const now = new Date();
  const latestPost = blogPosts.reduce((latest, post) => (post.dateModified > latest ? post.dateModified : latest), "2026-06-02");

  const staticRoutes: Route[] = [
    { path: "/", priority: 1, changeFrequency: "weekly", lastModified: "2026-09-18" },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly", lastModified: "2026-09-18" },
    { path: "/pricing/international", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-09-18" },
    { path: "/plan-your-jodohmu-way", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-08-16" },
    { path: "/careers", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-07-04" },
    { path: "/mitra", priority: 0.6, changeFrequency: "monthly", lastModified: "2026-10-01" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly", lastModified: latestPost },
    { path: "/faq", priority: 0.7, lastModified: "2026-09-18" },
    { path: "/contact", priority: 0.7, lastModified: "2026-09-18" },
    { path: "/privacy", lastModified: "2026-09-18" },
    { path: "/terms", lastModified: "2026-09-18" },
  ];

  const articleRoutes: Route[] = blogPosts.map((post) => ({
    path: post.slug,
    priority: 0.8,
    changeFrequency: "monthly",
    lastModified: new Date(post.dateModified),
  }));

  return [...staticRoutes, ...articleRoutes].map(
    ({ path, priority = 0.6, changeFrequency = "monthly", lastModified = now }) => ({
      url: `${siteUrl}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })
  );
}
