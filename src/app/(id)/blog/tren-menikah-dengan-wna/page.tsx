import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/tren-menikah-dengan-wna.json";
import { languageAlternates } from "@/lib/i18n-routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = siteUrl + "/blog/tren-menikah-dengan-wna";
const image = siteUrl + "/images/blog/international-marriage-indonesia-hero.png";
const datePublished = "2026-10-23";

export const metadata: Metadata = {
  title: "Perempuan Indonesia Menikah dengan WNA: Data 2020–2025",
  description: "Benarkah makin banyak perempuan Indonesia menikah dengan WNA? Data Dukcapil Jakarta, negara asal pasangan terbanyak, alasan, stigma, dan hal hukum yang perlu disiapkan.",
  keywords: ["menikah dengan WNA", "perkawinan campuran", "tren menikah dengan bule", "perempuan Indonesia menikah dengan orang asing", "data perkawinan campuran", "nikah dengan WNA", "Indonesian women marrying foreigners", "mixed marriage Indonesia"],
  alternates: languageAlternates("/blog/tren-menikah-dengan-wna", "id"),
  openGraph: { title: "Makin Banyak Perempuan Indonesia Menikah dengan WNA? Ini Kata Datanya", description: "Perkawinan campuran di Jakarta naik sekitar 50% sejak 2020, sementara angka pernikahan nasional turun.", url: articleUrl, type: "article", images: [{ url: image, alt: "Pasangan internasional berbincang bersama keluarga dalam pertemuan menuju pernikahan di Indonesia" }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: "Makin Banyak Perempuan Indonesia Menikah dengan WNA?", description: "Data Dukcapil Jakarta 2020–2025, dibaca dengan jujur.", images: [image] },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: "id", datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.id.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={article} relatedSlug="/blog/tren-menikah-dengan-wna" /></>;
}
