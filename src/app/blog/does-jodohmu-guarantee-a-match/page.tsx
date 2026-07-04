import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/og/does-jodohmu-guarantee-a-match.png`;
const datePublished = "2026-06-07";
const dateModified = "2026-06-07";

export const metadata: Metadata = {
  title: "Apakah Jodohmu Menjamin Pasti Dapat Jodoh? Jawaban Jujur Kami",
  description:
    "Apa yang benar-benar kami janjikan — dan apa yang tidak bisa dijanjikan biro jodoh mana pun. Jawaban jujur untuk pertanyaan yang paling sering muncul sebelum mendaftar ta'aruf.",
  openGraph: {
    title: "Apakah Jodohmu Menjamin Pasti Dapat Jodoh?",
    description:
      "Jawaban yang jujur dan hangat untuk pertanyaan yang selalu ditanyakan calon klien serius sebelum mendaftar.",
    url: `${siteUrl}/blog/does-jodohmu-guarantee-a-match`,
    type: "article",
    images: [{ url: ogImage, alt: "Apakah Jodohmu menjamin pasti dapat jodoh", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Apakah Jodohmu Menjamin Pasti Dapat Jodoh?",
    description: "Ekspektasi yang jujur dari layanan perjodohan yang mengutamakan kepercayaan.",
    images: [{ url: ogImage, alt: "Apakah Jodohmu menjamin pasti dapat jodoh" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/does-jodohmu-guarantee-a-match`,
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.doesJodohmuGuaranteeMatch"
      slug="/blog/does-jodohmu-guarantee-a-match"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
