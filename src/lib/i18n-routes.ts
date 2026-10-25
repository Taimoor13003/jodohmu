// Indonesian pages live at the root, English pages under /en. Every pair is
// listed here once; the sitemap, hreflang tags, the language switcher and
// in-page links all read from it. See SEO.md before changing a path.
import type { Metadata } from "next";
import { blogPosts } from "@/lib/blog-posts";

export type Lang = "id" | "en";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

// Indonesian path -> English path for the non-blog pages
const PAGE_PAIRS: Record<string, string> = {
  "/": "/en",
  "/pricing": "/en/pricing",
  "/pricing/international": "/en/pricing/international",
  "/faq": "/en/faq",
  "/careers": "/en/careers",
  "/contact": "/en/contact",
  "/plan-your-jodohmu-way": "/en/plan-your-jodohmu-way",
  "/blog": "/en/blog",
  "/privacy": "/en/privacy",
  "/terms": "/en/terms",
};

const ID_TO_EN: Record<string, string> = { ...PAGE_PAIRS };
for (const post of blogPosts) if (post.enSlug) ID_TO_EN[post.slug] = post.enSlug;

const EN_TO_ID: Record<string, string> = Object.fromEntries(Object.entries(ID_TO_EN).map(([id, en]) => [en, id]));

export const localizedPairs = Object.entries(ID_TO_EN).map(([id, en]) => ({ id, en }));

export const isEnglishPath = (path: string) => path === "/en" || path.startsWith("/en/");

export const toEnglishPath = (idPath: string): string | undefined => ID_TO_EN[idPath];

export const toIndonesianPath = (enPath: string): string | undefined => EN_TO_ID[enPath];

export const absoluteUrl = (path: string) => (path === "/" ? siteUrl : `${siteUrl}${path}`);

// Where the language switcher sends the visitor
export function switchLanguagePath(pathname: string, target: Lang): string {
  if (target === "en") return isEnglishPath(pathname) ? pathname : toEnglishPath(pathname) ?? "/en";
  return isEnglishPath(pathname) ? toIndonesianPath(pathname) ?? "/" : pathname;
}

// Rewrites an internal link for English pages; leaves anything without an English twin alone
export function localizeHref(href: string, lang: Lang): string {
  if (lang !== "en" || !href.startsWith("/")) return href;
  const match = href.match(/^([^?#]*)(.*)$/);
  const path = match?.[1] ?? href;
  const rest = match?.[2] ?? "";
  const english = toEnglishPath(path);
  return english ? english + rest : href;
}

// Self-canonical plus reciprocal hreflang, for a page given by its Indonesian path
export function languageAlternates(idPath: string, lang: Lang): Metadata["alternates"] {
  const enPath = toEnglishPath(idPath);
  if (!enPath) return { canonical: absoluteUrl(idPath) };
  return {
    canonical: absoluteUrl(lang === "en" ? enPath : idPath),
    languages: {
      id: absoluteUrl(idPath),
      en: absoluteUrl(enPath),
      "x-default": absoluteUrl(idPath),
    },
  };
}
