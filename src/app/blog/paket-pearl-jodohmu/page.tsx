import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import pearlArticle from "@/content/blog/paket-pearl-jodohmu.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = `${siteUrl}/blog/paket-pearl-jodohmu`;
const ogImage = `${siteUrl}/images/blog/pearl-joble-hero.png`;
const datePublished = "2026-08-04";

export const metadata: Metadata = {
  title: "Paket Pearl Jodohmu | Pendampingan Pencarian Pasangan",
  description: "Kenali Paket Pearl Jodohmu: pendampingan tiga bulan, profil dibantu tim, verifikasi, pembaruan mingguan, dan satu Pearl Joble.",
  keywords: ["paket pearl jodohmu", "jodohmu pearl", "jodohmu Bandung", "taaruf Bandung", "cari pasangan hidup", "perjodohan offline Indonesia", "Pearl Joble", "Jodohmu Table"],
  openGraph: { title: "Paket Pearl Jodohmu: Langkah Penuh Niat Menuju Pernikahan", description: "Pendampingan yang lebih manusiawi, jelas, dan terarah selama tiga bulan.", url: articleUrl, type: "article", images: [{ url: ogImage, alt: "Pertemuan Pearl Joble yang hangat dan terencana oleh Jodohmu", width: 1200, height: 630 }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: "Paket Pearl Jodohmu", description: "Langkah serius yang lebih jelas menuju pernikahan.", images: [ogImage] },
  alternates: { canonical: articleUrl },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: pearlArticle.id.title, description: pearlArticle.id.summary, inLanguage: ["id", "en"], datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [ogImage], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/jodohmu-logo.png` } } };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` }, { "@type": "ListItem", position: 3, name: pearlArticle.id.title, item: articleUrl }] };
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
    { "@type": "Question", name: "Kapan tiga bulan Pearl dimulai?", acceptedAnswer: { "@type": "Answer", text: "Tiga bulan dimulai saat Jodohmu mulai mengirimkan perkenalan yang relevan, bukan saat pembayaran, intake, atau persiapan profil." } },
    { "@type": "Question", name: "Apakah saya harus menerima setiap perkenalan?", acceptedAnswer: { "@type": "Answer", text: "Tidak. Anda selalu memiliki pilihan untuk mempertimbangkan atau tidak melanjutkan sebuah perkenalan." } },
    { "@type": "Question", name: "Siapa yang boleh saya bawa ke Pearl Joble?", acceptedAnswer: { "@type": "Answer", text: "Anda dapat membawa satu pendamping tepercaya. Setiap orang juga dapat memilih satu fasilitator sesuai kenyamanan dan persetujuan kedua pihak." } },
    { "@type": "Question", name: "Apa yang terjadi setelah Pearl Joble?", acceptedAnswer: { "@type": "Answer", text: "Kedua pihak diberi ruang untuk berpikir dan memberi respons secara pribadi. Langkah berikutnya hanya diatur jika keduanya ingin melanjutkan." } },
    { "@type": "Question", name: "Apakah Pearl menjamin saya menikah?", acceptedAnswer: { "@type": "Answer", text: "Tidak. Pearl memberi Anda proses yang lebih jelas, manusiawi, dan terarah untuk membuka kemungkinan bertemu pasangan yang tepat." } },
  ] };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><MarkdownArticle content={pearlArticle} relatedSlug="/blog/paket-pearl-jodohmu" /></>;
}
