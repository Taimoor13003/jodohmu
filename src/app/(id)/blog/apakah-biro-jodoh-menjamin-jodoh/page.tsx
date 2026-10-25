import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/apakah-biro-jodoh-menjamin-jodoh.json";
import { languageAlternates } from "@/lib/i18n-routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = siteUrl + "/blog/apakah-biro-jodoh-menjamin-jodoh";
const image = siteUrl + "/images/blog/apa-itu-jodohmu-hero-v2.png";
const datePublished = "2026-10-25";

export const metadata: Metadata = {
  title: "Apakah Biro Jodoh Menjamin Jodoh? Ekspektasi yang Jujur",
  description: "Apa yang bisa dan tidak bisa dijanjikan biro jodoh, tanda bahaya garansi menikah, pertanyaan sebelum mendaftar, dan cara menilai apakah layanan sepadan.",
  keywords: ["apakah biro jodoh menjamin jodoh", "garansi biro jodoh", "biro jodoh terpercaya", "biro jodoh penipu", "jasa perjodohan"],
  alternates: languageAlternates("/blog/apakah-biro-jodoh-menjamin-jodoh", "id"),
  openGraph: { title: article.id.title, description: "Apa yang bisa dan tidak bisa dijanjikan biro jodoh, tanda bahaya garansi menikah, pertanyaan sebelum mendaftar, dan cara menilai apakah layanan sepadan.", url: articleUrl, type: "article", images: [{ url: image, alt: article.id.heroImageAlt }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: article.id.title, description: "Apa yang bisa dan tidak bisa dijanjikan biro jodoh, tanda bahaya garansi menikah, pertanyaan sebelum mendaftar, dan cara menilai apakah layanan sepadan.", images: [image] },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: "id", datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Blog", item: siteUrl + "/blog" }, { "@type": "ListItem", position: 3, name: article.id.title, item: articleUrl }] };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.id.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={article} relatedSlug="/blog/apakah-biro-jodoh-menjamin-jodoh" /></>;
}
