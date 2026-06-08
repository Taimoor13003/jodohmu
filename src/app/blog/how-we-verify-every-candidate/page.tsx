import type { Metadata } from "next";
import { ArticleDetail } from "@/components/blog/article-is-jodohmu";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/og/how-we-verify-every-candidate.svg`;
const datePublished = "2026-06-07";
const dateModified = "2026-06-07";

export const metadata: Metadata = {
  title: "How We Verify Every Candidate Before You Meet Them | Jodohmu",
  description:
    "No fake profiles. No hidden pasts. Every candidate on Jodohmu is personally screened, ID-verified, and vetted for serious intent before any introduction is made.",
  openGraph: {
    title: "How We Verify Every Candidate Before You Meet Them",
    description:
      "Our full verification process — what we check, why we check it, and how it protects you.",
    url: `${siteUrl}/blog/how-we-verify-every-candidate`,
    type: "article",
    images: [{ url: ogImage, alt: "How Jodohmu verifies every candidate", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary",
    title: "How We Verify Every Candidate Before You Meet Them",
    description: "No fake profiles. Every person you meet has been personally assessed by our team.",
    images: [{ url: ogImage, alt: "Jodohmu candidate verification" }],
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
