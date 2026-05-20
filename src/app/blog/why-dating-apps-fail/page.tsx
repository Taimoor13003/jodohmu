import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";
const ogImage = `${siteUrl}/og/why-dating-apps-fail.svg`;
const datePublished = "2024-12-01";
const dateModified = "2025-01-20";

export const metadata: Metadata = {
  title: "Kenapa Dating App Gagal untuk yang Serius Nikah — Alternatif Offline",
  description:
    "Aplikasi mengejar swipe, bukan nikah. Lihat bagaimana Jodohmu mengganti chat tanpa akhir dengan pertemuan offline terkurasi dan difasilitasi.",
  openGraph: {
    title: "Kenapa Dating App Gagal untuk yang Serius Nikah — Jodohmu",
    description:
      "Jodohmu mengganti chat tanpa akhir dengan pertemuan offline terkurasi dan difasilitasi.",
    url: `${siteUrl}/blog/why-dating-apps-fail`,
    type: "article",
    images: [{ url: ogImage, alt: "Kenapa dating app gagal - Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Kenapa Dating App Gagal — Jodohmu",
    description:
      "Aplikasi mengejar swipe, bukan nikah. Jodohmu punya alternatif offline yang lebih efektif.",
    images: [{ url: ogImage, alt: "Kenapa dating app gagal - Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/why-dating-apps-fail`,
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.whyDatingAppsFail"
      slug="/blog/why-dating-apps-fail"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
