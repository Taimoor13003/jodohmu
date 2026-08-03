import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import jobleArticle from "@/content/blog/joble-jodohmu-table.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/images/blog/joble-hero.png`;
const datePublished = "2026-08-01";
const dateModified = "2026-08-01";
const articleUrl = `${siteUrl}/blog/joble-jodohmu-table`;

export const metadata: Metadata = {
  title: "Joble: A Planned Meeting for Marriage | Jodohmu",
  description: "Learn how a Joble works: a private, marriage-focused meeting with a format, guests, facilitator, and food that fit your Jodohmu package.",
  openGraph: {
    title: "Joble: A Planned Meeting for Marriage | Jodohmu",
    description: "A clear, private way to meet someone with marriage in mind. Open to every religion.",
    url: `${siteUrl}/blog/joble-jodohmu-table`,
    type: "article",
    images: [{ url: ogImage, alt: "A planned Joble meeting by Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary_large_image",
    title: "Joble: A Planned Meeting for Marriage | Jodohmu",
    description: "A clear, private way to meet someone with marriage in mind.",
    images: [ogImage],
  },
  alternates: { canonical: `${siteUrl}/blog/joble-jodohmu-table` },
};

export default function Page() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: jobleArticle.en.title,
    description: jobleArticle.en.summary,
    inLanguage: ["id", "en"],
    datePublished,
    dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    url: articleUrl,
    image: [ogImage],
    author: { "@type": "Organization", name: "Jodohmu", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "Jodohmu",
      url: siteUrl,
      logo: { "@type": "ImageObject", url: `${siteUrl}/jodohmu-logo.png` },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: jobleArticle.en.title, item: articleUrl },
    ],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} /><MarkdownArticle content={jobleArticle} relatedSlug="/blog/joble-jodohmu-table" /></>;
}
