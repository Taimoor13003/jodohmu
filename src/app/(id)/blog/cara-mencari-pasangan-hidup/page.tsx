import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/cara-mencari-pasangan-hidup.json";
import { languageAlternates } from "@/lib/i18n-routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = siteUrl + "/blog/cara-mencari-pasangan-hidup";
const image = siteUrl + "/images/blog/default-article-hero.png";
const datePublished = "2026-10-20";

export const metadata: Metadata = {
  title: "Cara Mencari Pasangan Hidup yang Serius untuk Semua Keyakinan",
  description: "Panduan jujur mencari pasangan hidup untuk menikah, untuk semua agama, di Indonesia maupun luar negeri: kenali diri, pilih jalan pencarian, jaga keamanan, dan libatkan keluarga.",
  keywords: ["cara mencari pasangan hidup", "cara mencari jodoh", "mencari pasangan serius", "cari jodoh serius", "jasa perjodohan", "mencari jodoh non muslim", "mencari jodoh kristen", "cari pasangan untuk menikah", "biro jodoh"],
  alternates: languageAlternates("/blog/cara-mencari-pasangan-hidup", "id"),
  openGraph: { title: "Cara Mencari Pasangan Hidup yang Serius", description: "Panduan untuk semua keyakinan, di Indonesia maupun luar negeri.", url: articleUrl, type: "article", images: [{ url: image, alt: "Mencari pasangan hidup yang serius", width: 1672, height: 941 }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: "Cara Mencari Pasangan Hidup yang Serius", description: "Panduan untuk semua keyakinan, di Indonesia maupun luar negeri.", images: [image] },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: "id", datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.id.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={article} relatedSlug="/blog/cara-mencari-pasangan-hidup" /></>;
}
