import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/perkenalan-pertama-dan-keluarga.json";
import { languageAlternates } from "@/lib/i18n-routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = siteUrl + "/blog/perkenalan-pertama-dan-keluarga";
const image = siteUrl + "/images/blog/joble-hero.png";
const datePublished = "2026-10-25";

export const metadata: Metadata = {
  title: "Perkenalan Pertama dan Peran Keluarga: Panduan Persiapan",
  description: "Cara menyiapkan perkenalan pertama: pertanyaan yang layak diajukan, kesalahan yang perlu dihindari, dan cara melibatkan orang tua tanpa membuat suasana tegang.",
  keywords: ["perkenalan pertama", "tips taaruf pertama", "pertanyaan saat taaruf", "melibatkan orang tua", "bertemu calon pasangan", "restu orang tua"],
  alternates: languageAlternates("/blog/perkenalan-pertama-dan-keluarga", "id"),
  openGraph: { title: article.id.title, description: "Cara menyiapkan perkenalan pertama: pertanyaan yang layak diajukan, kesalahan yang perlu dihindari, dan cara melibatkan orang tua tanpa membuat suasana tegang.", url: articleUrl, type: "article", images: [{ url: image, alt: article.id.heroImageAlt }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: article.id.title, description: "Cara menyiapkan perkenalan pertama: pertanyaan yang layak diajukan, kesalahan yang perlu dihindari, dan cara melibatkan orang tua tanpa membuat suasana tegang.", images: [image] },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: "id", datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Beranda", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Blog", item: siteUrl + "/blog" }, { "@type": "ListItem", position: 3, name: article.id.title, item: articleUrl }] };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.id.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={article} relatedSlug="/blog/perkenalan-pertama-dan-keluarga" /></>;
}
