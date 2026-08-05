import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/paket-ruby-jodohmu.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = `${siteUrl}/blog/paket-ruby-jodohmu`;
const image = `${siteUrl}/images/blog/ruby-joble-hero-v2.png`;

export const metadata: Metadata = { title: "Paket Ruby Jodohmu | Pendampingan yang Lebih Mendalam", description: "Kenali Paket Ruby Jodohmu: enam bulan pendampingan, verifikasi lebih mendalam, dua Ruby Joble, dan fasilitasi pertemuan keluarga.", keywords: ["paket ruby jodohmu", "jodohmu ruby", "Ruby Joble", "taaruf Bandung", "perjodohan offline Indonesia", "pencarian pasangan"], alternates: { canonical: articleUrl }, openGraph: { title: "Paket Ruby Jodohmu: Proses yang Lebih Mendalam", description: "Enam bulan dukungan, ruang untuk mengenal, dan koordinasi keluarga saat tepat.", url: articleUrl, type: "article", images: [{ url: image, alt: "Ruby Joble oleh Jodohmu", width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", title: "Paket Ruby Jodohmu", images: [image] } };

export default function Page() {
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: ["id", "en"], mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><MarkdownArticle content={article} relatedSlug="/blog/paket-ruby-jodohmu" /></>;
}
