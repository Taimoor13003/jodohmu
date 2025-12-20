import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";
const ogImage = "https://placehold.co/1200x630/0b3a86/ffffff?text=Syariah+Safeguards+|+Jodohmu";

const titleEn = "Syariah safeguards in offline ta'aruf | How Jodohmu keeps boundaries";
const titleId = "Penjagaan syariah dalam ta'aruf offline | Cara Jodohmu jaga batasan";
const descEn =
  "Chaperones, facilitators, vetted venues, and structured agendas to honor syariah while moving toward marriage.";
const descId =
  "Pendamping, fasilitator, venue terpilih, dan agenda terstruktur untuk menjaga syariah sambil bergerak menuju pernikahan.";
const mergedDescription = `${descEn} ${descId}`;

export const metadata: Metadata = {
  title: `${titleEn} | ${titleId}`,
  description: mergedDescription,
  openGraph: {
    title: titleEn,
    description: mergedDescription,
    url: `${siteUrl}/blog/syariah-safeguards`,
    type: "article",
    images: [{ url: ogImage, alt: "Syariah safeguards in ta'aruf - Jodohmu", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary",
    title: titleEn,
    description: mergedDescription,
    images: [{ url: ogImage, alt: "Syariah safeguards in ta'aruf - Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/syariah-safeguards`,
    languages: {
      en: `${siteUrl}/blog/syariah-safeguards`,
      id: `${siteUrl}/blog/syariah-safeguards`,
    },
  },
};

export default function Page() {
  return <ArticleDetail articleKey="blogArticle.syariahSafeguards" slug="/blog/syariah-safeguards" />;
}
