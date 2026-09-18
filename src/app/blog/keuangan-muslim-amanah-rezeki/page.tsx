import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/keuangan-muslim-amanah-rezeki.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = siteUrl + "/blog/keuangan-muslim-amanah-rezeki";
const image = siteUrl + "/images/blog/muslim-finance-hero-v1.png";
const datePublished = "2026-08-27";

export const metadata: Metadata = {
  title: "Keuangan Muslim: Rezeki, Kekayaan, dan Amanah | Jodohmu",
  description: "Apakah Muslim harus mengejar kekayaan atau memilih hidup sederhana? Panduan reflektif tentang rezeki, usaha halal, kedermawanan, dan amanah harta.",
  keywords: ["keuangan Muslim", "rezeki", "harta dalam Islam", "usaha halal", "zakat", "sedekah", "keuangan keluarga Muslim"],
  alternates: { canonical: articleUrl },
  openGraph: { title: "Keuangan Muslim: Menjadi Jalan bagi Kebaikan", description: "Islam tidak meminta kita memilih antara ibadah dan usaha. Yang ditanya adalah dari mana harta datang, ke mana ia pergi, dan siapa yang dibantu olehnya.", url: articleUrl, type: "article", images: [{ url: image, alt: "Refleksi tentang keuangan Muslim dan amanah harta", width: 1200, height: 630 }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: "Keuangan Muslim: Rezeki, Kekayaan, dan Amanah", description: "Harta sebagai amanah, bukan tujuan akhir.", images: [image] },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: ["id", "en"], datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: article.id.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={article} relatedSlug="/blog/keuangan-muslim-amanah-rezeki" /></>;
}
