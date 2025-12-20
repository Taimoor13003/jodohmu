import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

const titleEn = "Why dating apps fail for marriage seekers | Offline, vetted alternative";
const titleId = "Kenapa dating app gagal untuk yang serius nikah | Alternatif offline terkurasi";
const descEn =
  "Apps reward swipes, not marriage. See how Jodohmu replaces endless chatting with vetted, offline, facilitator-guided meetings.";
const descId =
  "Aplikasi mengejar swipe, bukan nikah. Lihat bagaimana Jodohmu mengganti chat tanpa akhir dengan pertemuan offline terkurasi dan difasilitasi.";
const mergedDescription = `${descEn} ${descId}`;

export const metadata: Metadata = {
  title: `${titleEn} | ${titleId}`,
  description: mergedDescription,
  openGraph: {
    title: titleEn,
    description: mergedDescription,
    url: `${siteUrl}/blog/why-dating-apps-fail`,
    type: "article",
  },
  twitter: {
    card: "summary",
    title: titleEn,
    description: mergedDescription,
  },
  alternates: {
    canonical: `${siteUrl}/blog/why-dating-apps-fail`,
    languages: {
      en: `${siteUrl}/blog/why-dating-apps-fail`,
      id: `${siteUrl}/blog/why-dating-apps-fail`,
    },
  },
};

export default function Page() {
  return <ArticleDetail articleKey="blogArticle.whyDatingAppsFail" slug="/blog/why-dating-apps-fail" />;
}
