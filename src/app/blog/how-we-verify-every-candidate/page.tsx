import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/og/how-we-verify-every-candidate.png`;
const datePublished = "2026-06-07";
const dateModified = "2026-06-07";

export const metadata: Metadata = {
  title: "Cara Kami Memverifikasi Setiap Kandidat Sebelum Anda Bertemu",
  description:
    "Tanpa profil palsu, tanpa masa lalu yang disembunyikan. Setiap kandidat Jodohmu diverifikasi identitasnya, diwawancarai langsung, dan dipastikan serius ingin menikah sebelum diperkenalkan.",
  openGraph: {
    title: "Cara Kami Memverifikasi Setiap Kandidat Sebelum Anda Bertemu",
    description:
      "Proses verifikasi lengkap kami — apa saja yang diperiksa, mengapa penting, dan bagaimana ini melindungi Anda.",
    url: `${siteUrl}/blog/how-we-verify-every-candidate`,
    type: "article",
    images: [{ url: ogImage, alt: "Cara Jodohmu memverifikasi setiap kandidat", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Cara Kami Memverifikasi Setiap Kandidat Sebelum Anda Bertemu",
    description: "Tanpa profil palsu. Setiap orang yang Anda temui sudah dinilai langsung oleh tim kami.",
    images: [{ url: ogImage, alt: "Cara Jodohmu memverifikasi setiap kandidat" }],
  },
  alternates: {
    canonical: `${siteUrl}/blog/how-we-verify-every-candidate`,
  },
};

export default function Page() {
  return (
    <ArticleDetail
      articleKey="blogArticle.howWeVerifyEveryCandidate"
      slug="/blog/how-we-verify-every-candidate"
      ogImage={ogImage}
      datePublished={datePublished}
      dateModified={dateModified}
    />
  );
}
