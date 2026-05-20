import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";
const ogImage = `${siteUrl}/og/how-meetings-are-supervised.svg`;
const datePublished = "2024-11-28";
const dateModified = "2025-01-20";

export const metadata: Metadata = {
  title: "Cara Jodohmu Mengawasi Pertemuan Offline — Aman, Hormat & Jelas",
  description:
    "Model supervisi kami: fasilitator/pendamping, venue terkurasi, agenda, dan ringkasan pasca pertemuan agar Anda aman dan tegas.",
  openGraph: {
    title: "Cara Jodohmu Mengawasi Pertemuan Offline — Aman & Hormat",
    description:
      "Fasilitator/pendamping, venue terkurasi, agenda, dan ringkasan pasca pertemuan agar Anda aman dan tegas.",
    url: `${siteUrl}/blog/how-meetings-are-supervised`,
    type: "article",
    images: [{ url: ogImage, alt: "Pengawasan pertemuan offline Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Pengawasan Pertemuan Offline — Jodohmu",
    description:
      "Fasilitator, venue terkurasi, dan agenda terstruktur untuk pertemuan ta'aruf yang aman.",
    images: [{ url: ogImage, alt: "Pengawasan pertemuan offline Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/how-meetings-are-supervised`,
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.howMeetingsAreSupervised"
      slug="/blog/how-meetings-are-supervised"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
