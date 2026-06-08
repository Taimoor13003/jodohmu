import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/og/does-jodohmu-guarantee-a-match.svg`;
const datePublished = "2026-06-07";
const dateModified = "2026-06-07";

export const metadata: Metadata = {
  title: "Does Jodohmu Guarantee a Match? | Honest Expectations",
  description:
    "What Jodohmu actually commits to — and what no matchmaker in the world can promise. An honest answer to the question every serious client asks.",
  openGraph: {
    title: "Does Jodohmu Guarantee a Match?",
    description:
      "An honest, warm answer to the question every serious client asks before signing up.",
    url: `${siteUrl}/blog/does-jodohmu-guarantee-a-match`,
    type: "article",
    images: [{ url: ogImage, alt: "Does Jodohmu guarantee a match", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "Does Jodohmu Guarantee a Match?",
    description: "Honest expectations from a matchmaking service that puts trust first.",
    images: [{ url: ogImage, alt: "Does Jodohmu guarantee a match" }],
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
