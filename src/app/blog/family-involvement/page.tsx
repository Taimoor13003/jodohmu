import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";
const ogImage = `${siteUrl}/og/family-involvement.svg`;
const datePublished = "2024-11-25";
const dateModified = "2025-01-20";

const titleEn = "Family involvement in ta'aruf | How Jodohmu aligns parents early";
const titleId = "Pelibatan keluarga di ta'aruf | Cara Jodohmu selaraskan orang tua sejak awal";
const descEn =
  "We welcome parents and advisors early. Learn how family input, respectful venues, and facilitators keep meetings calm and commitment-focused.";
const descId =
  "Kami sambut orang tua/pembimbing lebih awal. Lihat cara format undangan, venue santun, dan fasilitator menjaga ketenangan dan fokus komitmen.";
const mergedDescription = `${descEn} ${descId}`;

export const metadata: Metadata = {
  title: `${titleEn} | ${titleId}`,
  description: mergedDescription,
  openGraph: {
    title: titleEn,
    description: mergedDescription,
    url: `${siteUrl}/blog/family-involvement`,
    type: "article",
    images: [{ url: ogImage, alt: "Family involvement in ta'aruf - Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: titleEn,
    description: mergedDescription,
    images: [{ url: ogImage, alt: "Family involvement in ta'aruf - Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/family-involvement`,
    languages: {
      en: `${siteUrl}/blog/family-involvement`,
      id: `${siteUrl}/blog/family-involvement`,
    },
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.familyInvolvement"
      slug="/blog/family-involvement"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
