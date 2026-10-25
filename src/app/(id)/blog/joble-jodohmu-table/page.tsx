import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import jobleArticle from "@/content/blog/joble-jodohmu-table.json";
import { languageAlternates } from "@/lib/i18n-routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const ogImage = `${siteUrl}/images/blog/joble-hero.png`;
const datePublished = "2026-08-01";
const dateModified = "2026-08-01";
const articleUrl = `${siteUrl}/blog/joble-jodohmu-table`;

export const metadata: Metadata = {
  title: "Joble: Pertemuan Terencana untuk Menikah",
  description: "Cara kerja Joble: pertemuan privat menuju pernikahan dengan format, tamu, fasilitator, dan hidangan yang disesuaikan dengan paket Jodohmu Anda.",
  openGraph: {
    title: "Joble: Pertemuan Terencana untuk Menikah | Jodohmu",
    description: "Cara yang jelas dan privat untuk bertemu seseorang dengan niat menikah. Terbuka untuk semua agama.",
    url: `${siteUrl}/blog/joble-jodohmu-table`,
    type: "article",
    images: [{ url: ogImage, alt: "Pertemuan Joble yang terencana oleh Jodohmu", width: 1200, height: 630 }],
    publishedTime: datePublished,
    modifiedTime: dateModified,
  },
  twitter: {
    card: "summary_large_image",
    title: "Joble: Pertemuan Terencana untuk Menikah | Jodohmu",
    description: "Cara yang jelas dan privat untuk bertemu seseorang dengan niat menikah.",
    images: [ogImage],
  },
  alternates: languageAlternates("/blog/joble-jodohmu-table", "id"),
};

export default function Page() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: jobleArticle.id.title,
    description: jobleArticle.id.summary,
    inLanguage: "id",
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
      { "@type": "ListItem", position: 3, name: jobleArticle.id.title, item: articleUrl },
    ],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} /><MarkdownArticle content={jobleArticle} relatedSlug="/blog/joble-jodohmu-table" /></>;
}
