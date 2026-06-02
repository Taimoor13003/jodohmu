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
  const now = new Date();

  const staticRoutes: Route[] = [
    { path: "/", priority: 1, changeFrequency: "weekly", lastModified: now },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly", lastModified: now },
    { path: "/careers", priority: 0.7, changeFrequency: "monthly", lastModified: now },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly", lastModified: now },
    { path: "/faq", priority: 0.7, lastModified: now },
    { path: "/contact", priority: 0.7, lastModified: now },
    { path: "/privacy", lastModified: now },
    { path: "/terms", lastModified: now },
    { path: "/id/blog", priority: 0.7, changeFrequency: "weekly", lastModified: now },
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
