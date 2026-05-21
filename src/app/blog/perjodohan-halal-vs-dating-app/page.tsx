import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";
const ogImage = `${siteUrl}/og/perjodohan-halal-vs-dating-app.svg`;
const datePublished = "2025-05-20";
const dateModified = "2025-05-20";

export const metadata: Metadata = {
  title: "Perjodohan Halal vs Dating App — Mana yang Lebih Efektif?",
  description:
    "Perbandingan lengkap perjodohan halal offline vs dating app. Kenapa perjodohan offline Jodohmu lebih efektif untuk lajang yang serius nikah di Indonesia.",
  openGraph: {
    title: "Perjodohan Halal vs Dating App — Jodohmu",
    description:
      "Kenapa perjodohan halal offline lebih efektif dibanding dating app untuk lajang serius nikah.",
    url: `${siteUrl}/blog/perjodohan-halal-vs-dating-app`,
    type: "article",
    images: [{ url: ogImage, alt: "Perjodohan halal vs dating app - Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Perjodohan Halal vs Dating App — Jodohmu",
    description:
      "Perbandingan perjodohan halal offline vs dating app untuk yang serius nikah.",
    images: [{ url: ogImage, alt: "Perjodohan halal vs dating app - Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/perjodohan-halal-vs-dating-app`,
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.perjodohanHalalVsDatingApp"
      slug="/blog/perjodohan-halal-vs-dating-app"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
