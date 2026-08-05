import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/apa-itu-jodohmu.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = `${siteUrl}/blog/apa-itu-jodohmu`;
const image = `${siteUrl}/images/blog/apa-itu-jodohmu-hero-v4.png`;
const datePublished = "2026-08-05";

export const metadata: Metadata = {
  title: "Apa Itu Jodohmu? | Layanan Perkenalan Personal di Indonesia",
  description: "Kenali Jodohmu: layanan perkenalan personal yang membantu Anda mencari pasangan hidup dengan privasi, kejelasan, dan pendampingan nyata.",
  keywords: ["apa itu jodohmu", "jodohmu indonesia", "layanan perkenalan personal", "cari pasangan hidup", "perjodohan indonesia", "pendampingan mencari pasangan"],
  alternates: { canonical: articleUrl },
  openGraph: { title: "Apa Itu Jodohmu? Jalan yang Lebih Personal untuk Menemukan Pasangan Hidup", description: "Mengapa Jodohmu ada, masalah yang ingin kami jawab, dan cara kami mendampingi setiap langkah.", url: articleUrl, type: "article", images: [{ url: image, alt: "Perkenalan personal yang dipandu oleh Jodohmu", width: 1200, height: 630 }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: "Apa Itu Jodohmu?", description: "Jalan yang lebih personal untuk menemukan pasangan hidup.", images: [image] }
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: ["id", "en"], datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.id.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={article} relatedSlug="/blog/apa-itu-jodohmu" /></>;
}
