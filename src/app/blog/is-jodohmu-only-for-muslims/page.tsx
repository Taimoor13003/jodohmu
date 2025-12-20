import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export const metadata: Metadata = {
  title:
    "Apakah Jodohmu hanya untuk Muslim? | Is Jodohmu only for Muslims? | Jawaban lengkap & guided meetings",
  description:
    "Tidak. Jodohmu mencocokkan niat dan nilai Anda; untuk klien Kristen kami dapat hadirkan pastor/fasilitator terhormat, venue tenang, dan langkah jelas menuju pernikahan. English: we match by intent and values, with optional priest/facilitator and calm venues to guide marriage-focused meetings.",
  openGraph: {
    title: "Apakah Jodohmu hanya untuk Muslim? | Is Jodohmu only for Muslims?",
    description:
      "Kami mencocokkan sesuai niat dan nilai—termasuk klien Kristen dengan pastor/fasilitator terhormat, venue tenang, dan alur jelas menuju pernikahan.",
    url: `${siteUrl}/blog/is-jodohmu-only-for-muslims`,
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Apakah Jodohmu hanya untuk Muslim? | Is Jodohmu only for Muslims?",
    description:
      "Tidak. Kami cocokkan berdasarkan niat & nilai; fasilitator/pastor tersedia untuk klien Kristen, dengan alur terarah menuju pernikahan.",
  },
  alternates: {
    canonical: `${siteUrl}/blog/is-jodohmu-only-for-muslims`,
    languages: {
      en: `${siteUrl}/blog/is-jodohmu-only-for-muslims`,
      id: `${siteUrl}/blog/is-jodohmu-only-for-muslims`,
    },
  },
};

export default function Page() {
  return <ArticleDetail articleKey="blogArticle.isJodohmuOnlyForMuslims" />;
}
