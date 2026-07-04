import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/og/cari-jodoh-serius.png`;
const datePublished = "2025-05-20";
const dateModified = "2025-05-20";

export const metadata: Metadata = {
  title: "Cara Cari Jodoh Serius di Indonesia — Panduan Lengkap",
  description:
    "Bingung cara cari jodoh serius? Panduan lengkap dari Jodohmu: perjodohan offline, ta'aruf terfasilitasi, dan proses terverifikasi untuk lajang siap nikah.",
  openGraph: {
    title: "Cara Cari Jodoh Serius di Indonesia — Jodohmu",
    description:
      "Panduan lengkap cari jodoh serius melalui perjodohan offline dan ta'aruf terfasilitasi dari Jodohmu.",
    url: `${siteUrl}/blog/cari-jodoh-serius`,
    type: "article",
    images: [{ url: ogImage, alt: "Cari jodoh serius - Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Cara Cari Jodoh Serius — Jodohmu",
    description:
      "Panduan lengkap cari jodoh serius melalui perjodohan offline di Indonesia.",
    images: [{ url: ogImage, alt: "Cari jodoh serius - Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/cari-jodoh-serius`,
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.cariJodohSerius"
      slug="/blog/cari-jodoh-serius"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
