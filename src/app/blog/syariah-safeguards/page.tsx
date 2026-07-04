import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/og/syariah-safeguards.png`;
const datePublished = "2024-11-22";
const dateModified = "2025-01-20";

export const metadata: Metadata = {
  title: "Penjagaan Syariah dalam Ta'aruf Offline — Cara Jodohmu Jaga Batasan",
  description:
    "Pendamping, fasilitator, venue terpilih, dan agenda terstruktur untuk menjaga syariah sambil bergerak menuju pernikahan.",
  openGraph: {
    title: "Penjagaan Syariah dalam Ta'aruf Offline — Jodohmu",
    description:
      "Pendamping, fasilitator, venue terpilih, dan agenda terstruktur untuk menjaga syariah sambil bergerak menuju pernikahan.",
    url: `${siteUrl}/blog/syariah-safeguards`,
    type: "article",
    images: [{ url: ogImage, alt: "Penjagaan syariah ta'aruf - Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Penjagaan Syariah Ta'aruf — Jodohmu",
    description:
      "Fasilitator dan agenda terstruktur untuk menjaga syariah dalam ta'aruf offline.",
    images: [{ url: ogImage, alt: "Penjagaan syariah ta'aruf - Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/syariah-safeguards`,
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.syariahSafeguards"
      slug="/blog/syariah-safeguards"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
