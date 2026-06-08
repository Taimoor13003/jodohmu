import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/og/what-makes-taaruf-different-from-dating.svg`;
const datePublished = "2026-06-07";
const dateModified = "2026-06-07";

export const metadata: Metadata = {
  title: "What Makes Ta'aruf Different From Dating? | Jodohmu",
  description:
    "Ta'aruf isn't dating with rules. It's a completely different approach to meeting a potential spouse — structured, purposeful, and dignified. Here's how it works.",
  openGraph: {
    title: "What Makes Ta'aruf Different From Dating?",
    description:
      "Ta'aruf and dating look similar from the outside. Inside, they're completely different — and that difference matters.",
    url: `${siteUrl}/blog/what-makes-taaruf-different-from-dating`,
    type: "article",
    images: [{ url: ogImage, alt: "What makes ta'aruf different from dating", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "What Makes Ta'aruf Different From Dating?",
    description: "Not dating with more rules — a fundamentally different way of finding a life partner.",
    images: [{ url: ogImage, alt: "What makes ta'aruf different" }],
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
