import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";
const ogImage = `${siteUrl}/og/step-by-step-process.svg`;
const datePublished = "2024-11-20";
const dateModified = "2025-01-20";

const titleEn = "Offline ta'aruf step-by-step | How Jodohmu guides you to marriage";
const titleId = "Alur ta'aruf offline langkah demi langkah | Panduan Jodohmu menuju pernikahan";
const descEn =
  "From intake to proposal: curated candidates, pre-call, vetted meetings, facilitators, and transparent follow-ups—offline and marriage-focused.";
const descId =
  "Dari intake hingga lamaran: kandidat terkurasi, pre-call, pertemuan terverifikasi, fasilitator, dan tindak lanjut transparan—offline dan fokus nikah.";
const mergedDescription = `${descEn} ${descId}`;

export const metadata: Metadata = {
  title: `${titleEn} | ${titleId}`,
  description: mergedDescription,
  openGraph: {
    title: titleEn,
    description: mergedDescription,
    url: `${siteUrl}/blog/step-by-step-process`,
    type: "article",
    images: [{ url: ogImage, alt: "Step-by-step ta'aruf - Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: titleEn,
    description: mergedDescription,
    images: [{ url: ogImage, alt: "Step-by-step ta'aruf - Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/step-by-step-process`,
    languages: {
      en: `${siteUrl}/blog/step-by-step-process`,
      id: `${siteUrl}/blog/step-by-step-process`,
    },
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
