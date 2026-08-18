import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/international-marriage-facilitation.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = `${siteUrl}/blog/international-marriage-facilitation`;
const image = `${siteUrl}/images/blog/default-article-hero.png`;
const datePublished = "2026-08-18";

export const metadata: Metadata = {
  title: "How to Marry an Indonesian Partner | International Matchmaking | Jodohmu",
  description: "Discover Jodohmu's personal international matchmaking service for foreign nationals seeking an Indonesian spouse: paid discovery, Safar and Amanah packages, verification, ta'aruf, and meetings in Indonesia.",
  keywords: ["international matchmaking Indonesia", "marry Indonesian", "international ta'aruf", "Safar package", "Amanah package", "cross-border marriage"],
  alternates: { canonical: articleUrl },
  openGraph: { title: "How to Marry an Indonesian Partner with Jodohmu", description: "A personal, structured path from discovery to ta'aruf and meeting in Indonesia.", url: articleUrl, type: "article", images: [{ url: image, alt: "International marriage facilitation by Jodohmu", width: 1200, height: 630 }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: "International Marriage Facilitation | Jodohmu", description: "How Jodohmu supports international clients toward marriage.", images: [image] },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.en.title, description: article.en.summary, inLanguage: ["id", "en"], datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.en.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={article} relatedSlug="/blog/international-marriage-facilitation" /></>;
}
