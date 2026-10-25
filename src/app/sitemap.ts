// INVARIANT: see /SEO.md before changing anything in this file. URLs may be added, never removed
// (except a URL that now 301s; it leaves when its blogPosts entry goes, see SEO.md rule 6).
import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { toEnglishPath } from "@/lib/i18n-routes";

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

  const absolute = (path: string) => (path === "/" ? siteUrl : `${siteUrl}${path}`);

  // Each page with an English twin is listed in both languages, and both entries
  // carry the same hreflang set (Google wants it reciprocal).
  return [...staticRoutes, ...articleRoutes].flatMap(
    ({ path, priority = 0.6, changeFrequency = "monthly", lastModified = now }) => {
      const enPath = toEnglishPath(path);
      const alternates = enPath
        ? { languages: { id: absolute(path), en: absolute(enPath), "x-default": absolute(path) } }
        : undefined;
      const entry = { lastModified, changeFrequency, priority, alternates };
      return enPath
        ? [{ url: absolute(path), ...entry }, { url: absolute(enPath), ...entry }]
        : [{ url: absolute(path), ...entry }];
    }
  );
}
