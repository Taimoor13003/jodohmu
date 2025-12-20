import type { Metadata } from "next";
import { FaqPage } from "@/components/faq/faq-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export const generateMetadata = (): Metadata => {
  const titleEn = "Jodohmu FAQ | Offline Marriage Matching & Ta'aruf";
  const titleId = "FAQ Jodohmu | Perjodohan Offline & Ta'aruf";
  const descriptionEn =
    "Answers about halal ta'aruf, offline introductions, family involvement, vetted candidates, and guided meetings across Indonesia.";
  const descriptionId =
    "Jawaban tentang ta'aruf halal, perkenalan offline, pelibatan keluarga, kandidat terverifikasi, dan pertemuan terarah di Indonesia.";

  const mergedDescription = `${descriptionEn} ${descriptionId}`;

  return {
    title: `${titleEn} | ${titleId}`,
    description: mergedDescription,
    openGraph: {
      title: titleEn,
      description: mergedDescription,
      url: `${siteUrl}/faq`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: titleEn,
      description: mergedDescription,
    },
    alternates: {
      canonical: `${siteUrl}/faq`,
      languages: {
        en: `${siteUrl}/faq`,
        id: `${siteUrl}/id/faq`,
      },
    },
  };
};

export default function Page() {
  return <FaqPage />;
}
