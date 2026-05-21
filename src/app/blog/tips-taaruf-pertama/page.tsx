import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";
const ogImage = `${siteUrl}/og/tips-taaruf-pertama.svg`;
const datePublished = "2025-05-20";
const dateModified = "2025-05-20";

export const metadata: Metadata = {
  title: "Tips Ta'aruf Pertama Kali — Persiapan Lengkap dari Jodohmu",
  description:
    "Mau ta'aruf tapi bingung mulai dari mana? Tips lengkap persiapan ta'aruf pertama kali: apa yang ditanya, sikap, pakaian, dan ekspektasi realistis.",
  openGraph: {
    title: "Tips Ta'aruf Pertama Kali — Jodohmu",
    description:
      "Persiapan lengkap ta'aruf pertama kali: apa yang ditanya, sikap, pakaian, dan ekspektasi realistis.",
    url: `${siteUrl}/blog/tips-taaruf-pertama`,
    type: "article",
    images: [{ url: ogImage, alt: "Tips ta'aruf pertama kali - Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Tips Ta'aruf Pertama Kali — Jodohmu",
    description:
      "Persiapan lengkap sebelum ta'aruf pertama kali dari Jodohmu.",
    images: [{ url: ogImage, alt: "Tips ta'aruf pertama kali - Jodohmu" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/tips-taaruf-pertama`,
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.tipsTaarufPertama"
      slug="/blog/tips-taaruf-pertama"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
