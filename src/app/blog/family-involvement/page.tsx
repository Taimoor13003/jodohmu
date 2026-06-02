import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/og/family-involvement.svg`;
const datePublished = "2024-11-25";
const dateModified = "2025-01-20";

export const metadata: Metadata = {
  title: "Pelibatan Keluarga di Ta'aruf — Cara Jodohmu Selaraskan Orang Tua",
  description:
    "Kami sambut orang tua/pembimbing lebih awal. Lihat cara format undangan, venue santun, dan fasilitator menjaga ketenangan dan fokus komitmen.",
  openGraph: {
    title: "Pelibatan Keluarga di Ta'aruf — Cara Jodohmu Selaraskan Orang Tua",
    description:
      "Kami sambut orang tua/pembimbing lebih awal. Format undangan, venue santun, dan fasilitator menjaga fokus komitmen.",
    url: `${siteUrl}/blog/family-involvement`,
    type: "article",
    images: [{ url: ogImage, alt: "Pelibatan keluarga di ta'aruf - Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Pelibatan Keluarga di Ta'aruf — Jodohmu",
    description:
      "Cara Jodohmu selaraskan orang tua sejak awal dalam proses ta'aruf.",
    images: [{ url: ogImage, alt: "Pelibatan keluarga di ta'aruf - Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/family-involvement`,
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
