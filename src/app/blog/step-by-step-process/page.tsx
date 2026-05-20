import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";
const ogImage = `${siteUrl}/og/step-by-step-process.svg`;
const datePublished = "2024-11-20";
const dateModified = "2025-01-20";

export const metadata: Metadata = {
  title: "Alur Ta'aruf Offline Langkah demi Langkah — Panduan Jodohmu",
  description:
    "Dari intake hingga lamaran: kandidat terkurasi, pre-call, pertemuan terverifikasi, fasilitator, dan tindak lanjut transparan—offline dan fokus nikah.",
  openGraph: {
    title: "Alur Ta'aruf Offline Langkah demi Langkah — Panduan Jodohmu",
    description:
      "Kandidat terkurasi, pre-call, pertemuan terverifikasi, fasilitator, dan tindak lanjut transparan—offline dan fokus nikah.",
    url: `${siteUrl}/blog/step-by-step-process`,
    type: "article",
    images: [{ url: ogImage, alt: "Alur ta'aruf langkah demi langkah - Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Alur Ta'aruf Offline — Jodohmu",
    description:
      "Dari intake hingga lamaran: panduan lengkap ta'aruf offline dari Jodohmu.",
    images: [{ url: ogImage, alt: "Alur ta'aruf langkah demi langkah - Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/step-by-step-process`,
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.stepByStepProcess"
      slug="/blog/step-by-step-process"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
