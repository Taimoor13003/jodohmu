import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/international-marriage-facilitation.json";
import { languageAlternates } from "@/lib/i18n-routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = `${siteUrl}/blog/international-marriage-facilitation`;
const image = `${siteUrl}/images/blog/international-marriage-indonesia-hero.png`;
const datePublished = "2026-08-18";

export const metadata: Metadata = {
  title: "Perjodohan Internasional: Menikah dengan Pasangan Indonesia",
  description: "Layanan perjodohan internasional Jodohmu bagi WNA yang serius menikah dengan pasangan Indonesia: konsultasi awal, paket Safar dan Amanah, verifikasi, perkenalan terpandu, dan pertemuan di Indonesia.",
  keywords: ["menikah dengan WNA", "perjodohan internasional", "jodoh WNA", "taaruf internasional", "pernikahan lintas negara", "Jodohmu internasional"],
  alternates: languageAlternates("/blog/international-marriage-facilitation", "id"),
  openGraph: { title: "Menikah Lintas Negara Bersama Jodohmu", description: "Jalan yang personal dan terarah dari perkenalan hingga bertemu di Indonesia bersama keluarga.", url: articleUrl, type: "article", images: [{ url: image, alt: "Pendampingan pernikahan lintas negara oleh Jodohmu", width: 1200, height: 630 }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: "Pernikahan Lintas Negara Bersama Jodohmu", description: "Cara Jodohmu mendampingi perkenalan lintas negara menuju pernikahan.", images: [image] },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: "id", datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.id.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={article} relatedSlug="/blog/international-marriage-facilitation" /></>;
}
