import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

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
  },
  twitter: {
    card: "summary",
    title: titleEn,
    description: mergedDescription,
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
  return <ArticleDetail articleKey="blogArticle.stepByStepProcess" slug="/blog/step-by-step-process" />;
}
