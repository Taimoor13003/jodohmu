import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/stigma-janda-di-indonesia.json";
import { languageAlternates } from "@/lib/i18n-routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = siteUrl + "/blog/stigma-janda-di-indonesia";
const image = siteUrl + "/images/blog/stigma-janda-hero.png";
const datePublished = "2026-10-18";

export const metadata: Metadata = {
  title: "Stigma Janda di Indonesia dan Jalan Menikah Lagi",
  description: "Mengapa kata janda begitu berat di Indonesia, mengapa banyak janda enggan menikah lagi, apa kata Al-Qur'an, Alkitab, dan sejarah, dan bagaimana kita menghidupkan kembali budaya menikah.",
  keywords: ["stigma janda", "janda", "arti janda", "janda kembang", "janda menikah lagi", "menikah lagi setelah cerai", "ibu tunggal", "janda dalam Islam", "janda dalam Alkitab"],
  alternates: languageAlternates("/blog/stigma-janda-di-indonesia", "id"),
  openGraph: { title: "Janda Bukan Aib: Tentang Luka, Stigma, dan Jalan untuk Menikah Lagi", description: "Di balik satu kata yang sering dijadikan lelucon, ada perempuan yang memikul semuanya sendirian.", url: articleUrl, type: "article", images: [{ url: image, alt: "Seorang ibu tunggal berhijab mengantar anaknya ke sekolah sementara tetangga berbisik di warung", width: 1672, height: 941 }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: "Janda Bukan Aib", description: "Status pernikahan bukan ukuran nilai seseorang.", images: [image] },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: "id", datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.id.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={article} relatedSlug="/blog/stigma-janda-di-indonesia" /></>;
}
