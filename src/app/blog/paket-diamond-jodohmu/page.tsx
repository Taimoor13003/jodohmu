import type { Metadata } from "next";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import article from "@/content/blog/paket-diamond-jodohmu.json";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";
const articleUrl = `${siteUrl}/blog/paket-diamond-jodohmu`;
const image = `${siteUrl}/images/blog/diamond-joble-hero.png`;

export const metadata: Metadata = { title: "Paket Diamond Jodohmu | Pendampingan Privat untuk Pernikahan", description: "Kenali Paket Diamond Jodohmu: strategi privat bersama founder, concierge pribadi, tiga Diamond Joble, dan dukungan selama dua belas bulan.", keywords: ["paket diamond jodohmu", "jodohmu diamond", "Diamond Joble", "taaruf privat", "perjodohan premium Indonesia", "pencarian pasangan privat"], alternates: { canonical: articleUrl }, openGraph: { title: "Paket Diamond Jodohmu: Pendampingan Privat yang Dibangun di Sekitar Anda", description: "Dukungan paling personal dan diskret untuk perjalanan Anda.", url: articleUrl, type: "article", images: [{ url: image, alt: "Diamond Joble privat oleh Jodohmu", width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", title: "Paket Diamond Jodohmu", images: [image] } };

export default function Page() {
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.id.title, description: article.id.summary, inLanguage: ["id", "en"], mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl }, url: articleUrl, image: [image], author: { "@type": "Organization", name: "Jodohmu", url: siteUrl }, publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><MarkdownArticle content={article} relatedSlug="/blog/paket-diamond-jodohmu" /></>;
}
