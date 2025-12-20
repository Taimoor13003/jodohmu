import type { Metadata } from "next";
import { BlogPage } from "@/components/blog/blog-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export const generateMetadata = (): Metadata => {
  const titleId = "Blog Jodohmu | Panduan Ta'aruf & Perjodohan Offline";
  const titleEn = "Jodohmu Blog | Offline Ta'aruf & Marriage Matching Guides";
  const descriptionId =
    "Artikel siap nikah tentang ta'aruf halal, perjodohan offline, kandidat terverifikasi, dan pertemuan ramah keluarga di Indonesia.";
  const descriptionEn =
    "Marriage-ready articles on halal ta'aruf, offline matchmaking, vetted candidates, and family-inclusive meetings across Indonesia.";

  const mergedDescription = `${descriptionId} ${descriptionEn}`;

  return {
    title: `${titleId} | ${titleEn}`,
    description: mergedDescription,
    openGraph: {
      title: titleId,
      description: mergedDescription,
      url: `${siteUrl}/id/blog`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: titleId,
      description: mergedDescription,
    },
    alternates: {
      canonical: `${siteUrl}/id/blog`,
      languages: {
        en: `${siteUrl}/blog`,
        id: `${siteUrl}/id/blog`,
      },
    },
  };
};

export default function Page() {
  return <BlogPage />;
}
