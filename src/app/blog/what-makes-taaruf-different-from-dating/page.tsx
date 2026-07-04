import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/og/what-makes-taaruf-different-from-dating.png`;
const datePublished = "2026-06-07";
const dateModified = "2026-06-07";

export const metadata: Metadata = {
  title: "Apa Bedanya Ta'aruf dengan Pacaran?",
  description:
    "Ta'aruf bukan pacaran yang diberi aturan tambahan, melainkan jalan yang berbeda untuk mengenal calon pasangan hidup — terarah, bertujuan, dan menjaga kehormatan. Begini prosesnya.",
  openGraph: {
    title: "Apa Bedanya Ta'aruf dengan Pacaran?",
    description:
      "Dari luar, ta'aruf dan pacaran terlihat mirip. Di dalamnya, keduanya sangat berbeda — dan perbedaan itulah yang menentukan.",
    url: `${siteUrl}/blog/what-makes-taaruf-different-from-dating`,
    type: "article",
    images: [{ url: ogImage, alt: "Apa bedanya ta'aruf dengan pacaran", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Apa Bedanya Ta'aruf dengan Pacaran?",
    description: "Bukan pacaran dengan aturan lebih banyak — cara yang sungguh berbeda untuk menemukan pasangan hidup.",
    images: [{ url: ogImage, alt: "Apa bedanya ta'aruf dengan pacaran" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/what-makes-taaruf-different-from-dating`,
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.whatMakesTaarufDifferent"
      slug="/blog/what-makes-taaruf-different-from-dating"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
