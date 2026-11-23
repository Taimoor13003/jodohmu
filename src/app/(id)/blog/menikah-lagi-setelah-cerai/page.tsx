import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/menikah-lagi-setelah-cerai.json";
import { languageAlternates } from "@/lib/i18n-routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = siteUrl + "/blog/menikah-lagi-setelah-cerai";
const image = siteUrl + "/images/blog/menikah-lagi-hero.png";
const datePublished = "2026-11-23";

export const metadata: Metadata = {
  title: "Menikah Lagi Setelah Cerai: Syarat, Masa Iddah & Panduan",
  description: "Panduan menikah lagi setelah cerai: syarat dan dokumen KUA atau Dukcapil, masa iddah, hukum agama, anak, dan cara Jodohmu mendampingi janda dan duda.",
  keywords: ["menikah lagi setelah cerai", "syarat menikah lagi setelah cerai", "masa iddah janda", "hukum menikah lagi setelah cerai", "janda menikah lagi", "duda menikah lagi", "akta cerai untuk menikah lagi", "biro jodoh janda duda", "cari jodoh setelah cerai", "janda menikah dengan WNA"],
  alternates: languageAlternates("/blog/menikah-lagi-setelah-cerai", "id"),
  openGraph: { title: "Menikah Lagi Setelah Cerai: Panduan Lengkap untuk Memulai Kembali", description: "Syarat, masa iddah, dokumen, anak, dan restu keluarga—plus cara Jodohmu mendampingi janda dan duda yang ingin menikah lagi.", url: articleUrl, type: "article", images: [{ url: image, alt: article.id.heroImageAlt, width: 1672, height: 941 }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: "Menikah Lagi Setelah Cerai", description: "Panduan lengkap untuk janda dan duda yang ingin memulai kembali.", images: [image] },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: "id", datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.id.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={article} relatedSlug="/blog/menikah-lagi-setelah-cerai" /></>;
}
