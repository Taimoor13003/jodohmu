import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import registrationArticle from "@/content/blog/registrasi-jodohmu.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = `${siteUrl}/blog/registrasi-jodohmu`;
const image = `${siteUrl}/images/blog/registrasi-jodohmu-hero-v5.png`;
const datePublished = "2026-08-06";

export const metadata: Metadata = {
  title: "Registrasi Jodohmu Rp500 Ribu | Pool Perkenalan Privat",
  description: "Pahami Registrasi Jodohmu: masuk ke pool perkenalan privat mulai Rp500 ribu, dengan pertukaran kontak hanya atas persetujuan kedua pihak.",
  keywords: ["registrasi jodohmu", "jodohmu 500 ribu", "pool perkenalan privat", "cari pasangan hidup Indonesia", "perkenalan privat"],
  alternates: { canonical: articleUrl },
  openGraph: { title: "Registrasi Jodohmu: Mulai dari Rp500 ribu", description: "Masuk ke pool perkenalan privat Jodohmu dengan proses berbasis persetujuan bersama.", url: articleUrl, type: "article", images: [{ url: image, alt: "Tangan pasangan menikah di perayaan hangat", width: 1200, height: 630 }], publishedTime: datePublished, modifiedTime: datePublished },
  twitter: { card: "summary_large_image", title: "Registrasi Jodohmu", description: "Masuk ke pool perkenalan privat mulai Rp500 ribu.", images: [image] },
};

export default function Page() {
  const articleSchema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: registrationArticle.id.title, description: registrationArticle.id.summary, inLanguage: ["id", "en"], datePublished, dateModified: datePublished, mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><MarkdownArticle content={registrationArticle} relatedSlug="/blog/registrasi-jodohmu" /></>;
}
