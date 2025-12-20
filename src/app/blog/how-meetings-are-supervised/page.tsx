import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

const titleEn = "How Jodohmu supervises offline meetings | Safety, respect, and clarity";
const titleId = "Cara Jodohmu mengawasi pertemuan offline | Aman, hormat, dan jelas";
const descEn =
  "See the supervision model: facilitators/chaperones, vetted venues, agendas, and post-meeting summaries to keep you safe and decisive.";
const descId =
  "Model supervisi kami: fasilitator/pendamping, venue terkurasi, agenda, dan ringkasan pasca pertemuan agar Anda aman dan tegas.";
const mergedDescription = `${descEn} ${descId}`;

export const metadata: Metadata = {
  title: `${titleEn} | ${titleId}`,
  description: mergedDescription,
  openGraph: {
    title: titleEn,
    description: mergedDescription,
    url: `${siteUrl}/blog/how-meetings-are-supervised`,
    type: "article",
  },
  twitter: {
    card: "summary",
    title: titleEn,
    description: mergedDescription,
  },
  alternates: {
    canonical: `${siteUrl}/blog/how-meetings-are-supervised`,
    languages: {
      en: `${siteUrl}/blog/how-meetings-are-supervised`,
      id: `${siteUrl}/blog/how-meetings-are-supervised`,
    },
  },
};

export default function Page() {
  return <ArticleDetail articleKey="blogArticle.howMeetingsAreSupervised" slug="/blog/how-meetings-are-supervised" />;
}
