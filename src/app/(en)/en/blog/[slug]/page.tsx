import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/blog/markdown-article";
import { blogPosts } from "@/lib/blog-posts";
import { absoluteUrl, languageAlternates, siteUrl } from "@/lib/i18n-routes";
import apaItuJodohmu from "@/content/blog/apa-itu-jodohmu.json";
import apakahBiroJodoh from "@/content/blog/apakah-biro-jodoh-menjamin-jodoh.json";
import caraKerjaJodohmu from "@/content/blog/cara-kerja-jodohmu.json";
import datingAppVsBiroJodoh from "@/content/blog/dating-app-vs-biro-jodoh.json";
import howToFindALifePartner from "@/content/blog/how-to-find-a-life-partner.json";
import internationalMarriage from "@/content/blog/international-marriage-facilitation.json";
import joble from "@/content/blog/joble-jodohmu-table.json";
import keuanganMuslim from "@/content/blog/keuangan-muslim-amanah-rezeki.json";
import paketDiamond from "@/content/blog/paket-diamond-jodohmu.json";
import paketPearl from "@/content/blog/paket-pearl-jodohmu.json";
import paketRuby from "@/content/blog/paket-ruby-jodohmu.json";
import perkenalanPertama from "@/content/blog/perkenalan-pertama-dan-keluarga.json";
import registrasi from "@/content/blog/registrasi-jodohmu.json";
import stigmaJanda from "@/content/blog/stigma-janda-di-indonesia.json";
import trenWna from "@/content/blog/tren-menikah-dengan-wna.json";

// English twins of the Indonesian posts, keyed by Indonesian slug. The URL comes
// from enSlug in blog-posts.ts; title and description are the search snippet.
type ArticleJson = typeof apaItuJodohmu;
type EnglishPost = { content: ArticleJson; title: string; description: string; keywords?: string[] };

const englishPosts: Record<string, EnglishPost> = {
  "/blog/dating-app-vs-biro-jodoh": {
    content: datingAppVsBiroJodoh as ArticleJson,
    title: "Dating Apps vs Matchmaking: Which Leads to Marriage?",
    description: "An honest comparison of dating apps, searching on your own and human-guided matchmaking for people who want to marry, and how a serious introduction differs from dating.",
    keywords: ["dating apps vs matchmaking", "matchmaker vs dating app", "matchmaking for marriage", "find a serious partner", "Indonesian matchmaker"],
  },
  "/blog/cara-kerja-jodohmu": {
    content: caraKerjaJodohmu as ArticleJson,
    title: "How Jodohmu Works: Verification, Meetings and Safeguards",
    description: "The Jodohmu process step by step: first conversation, candidate verification, private introductions, supported Joble meetings and the privacy safeguards at every stage.",
    keywords: ["how matchmaking works", "matchmaker verification", "Jodohmu process", "Indonesian matchmaking service", "verified introductions"],
  },
  "/blog/perkenalan-pertama-dan-keluarga": {
    content: perkenalanPertama as ArticleJson,
    title: "First Introductions and Family: A Preparation Guide",
    description: "How to prepare for a first introduction: questions worth asking, mistakes to avoid and how to involve parents without making things tense.",
    keywords: ["first introduction for marriage", "meeting a potential spouse", "involving parents in marriage", "questions to ask a potential spouse"],
  },
  "/blog/apakah-biro-jodoh-menjamin-jodoh": {
    content: apakahBiroJodoh as ArticleJson,
    title: "Does a Matchmaker Guarantee a Match? Honest Expectations",
    description: "What a matchmaker can and can't promise, the warning signs of marriage guarantees, questions to ask before signing up and how to judge whether a service is worth it.",
    keywords: ["does a matchmaker guarantee a match", "matchmaker guarantee", "matchmaking agency red flags", "is a matchmaker worth it"],
  },
  "/blog/tren-menikah-dengan-wna": {
    content: trenWna as ArticleJson,
    title: "Indonesian Women Marrying Foreigners: What the Data Shows",
    description: "Are more Indonesian women marrying foreigners? The official data, the most common partner nationalities, the reasons, the stigma, and how to prepare before marrying across borders.",
    keywords: ["marry an Indonesian woman", "Indonesian women marrying foreigners", "mixed marriage Indonesia", "marriage to a foreigner in Indonesia"],
  },
  "/blog/cara-mencari-pasangan-hidup": {
    content: howToFindALifePartner as ArticleJson,
    title: "How to Find a Life Partner for Marriage: A Practical Guide",
    description: "A practical guide for anyone of any faith who wants to marry: where to search, how to tell who is serious, how to avoid romance scams, and what to know about finding a partner from Indonesia.",
    keywords: ["how to find a life partner", "how to find a partner for marriage", "find a wife", "find a husband", "matchmaking service", "marry an Indonesian", "Indonesian matchmaker"],
  },
  "/blog/stigma-janda-di-indonesia": {
    content: stigmaJanda as ArticleJson,
    title: "Widows and Divorcees in Indonesia: Stigma and Remarriage",
    description: "Why the word janda (a widowed or divorced woman) weighs so heavily in Indonesia, why so many hesitate to marry again, and how we can treat them with honour.",
    keywords: ["janda Indonesia", "remarriage Indonesia", "divorced women Indonesia", "widow remarriage"],
  },
  "/blog/keuangan-muslim-amanah-rezeki": {
    content: keuanganMuslim as ArticleJson,
    title: "Muslim Finances: Wealth as Amanah and Rizq",
    description: "A reflection on lawful effort, simple living and stewardship of wealth in Islam, and how couples preparing for marriage can talk about money honestly.",
    keywords: ["Muslim finances", "amanah wealth Islam", "rizq", "money before marriage Islam"],
  },
  "/blog/international-marriage-facilitation": {
    content: internationalMarriage as ArticleJson,
    title: "How to Marry an Indonesian Partner | International Matchmaking",
    description: "Jodohmu's personal international matchmaking service for foreign nationals seeking an Indonesian spouse: discovery call, Safar and Amanah packages, verification, guided introductions and meetings in Indonesia.",
    keywords: ["international matchmaking Indonesia", "marry an Indonesian", "Indonesian spouse", "cross-border marriage", "Safar package", "Amanah package"],
  },
  "/blog/registrasi-jodohmu": {
    content: registrasi as ArticleJson,
    title: "Jodohmu Registration: Join the Private Introduction Pool",
    description: "A simple first step from Rp500k: register with Jodohmu and stay open to a suitable introduction through the private pool, without an active support service.",
  },
  "/blog/apa-itu-jodohmu": {
    content: apaItuJodohmu as ArticleJson,
    title: "What Is Jodohmu? A Personal Matchmaking Service in Indonesia",
    description: "How Jodohmu works: human matchmakers, verified candidates, family involvement and planned meetings for people of every faith who want to marry.",
    keywords: ["Jodohmu", "matchmaking Indonesia", "Indonesian matchmaker", "marriage matchmaking service"],
  },
  "/blog/paket-diamond-jodohmu": {
    content: paketDiamond as ArticleJson,
    title: "Jodohmu Diamond Package: Private Matchmaking for Marriage",
    description: "The Diamond package: a private search strategy with a senior matchmaker, a personal concierge, three Diamond Joble meetings and twelve months of support.",
  },
  "/blog/paket-ruby-jodohmu": {
    content: paketRuby as ArticleJson,
    title: "Jodohmu Ruby Package: A Deeper Matchmaking Process",
    description: "The Ruby package: six months of guidance, deeper verification, two Ruby Joble meetings and help arranging family meetings.",
  },
  "/blog/paket-pearl-jodohmu": {
    content: paketPearl as ArticleJson,
    title: "Jodohmu Pearl Package: A Clear First Step Toward Marriage",
    description: "The Pearl package: three months of guidance, a profile built with our team, verification, weekly updates and one Pearl Joble meeting.",
  },
  "/blog/joble-jodohmu-table": {
    content: joble as ArticleJson,
    title: "Joble: A Planned Meeting for Marriage",
    description: "How a Joble works: a private, marriage-focused meeting with a format, guests, facilitator and food that fit your Jodohmu package. Open to every faith.",
  },
};

const findPost = (slug: string) => blogPosts.find((post) => post.enSlug === `/en/blog/${slug}`);

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.filter((post) => post.enSlug && englishPosts[post.slug]).map((post) => ({ slug: post.enSlug!.replace("/en/blog/", "") }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = findPost(params.slug);
  const english = post && englishPosts[post.slug];
  if (!post || !english) return {};
  const url = absoluteUrl(post.enSlug!);
  const image = post.heroImage ? absoluteUrl(post.heroImage) : `${siteUrl}/jodohmu-logo.png`;
  return {
    title: english.title,
    description: english.description,
    keywords: english.keywords,
    alternates: languageAlternates(post.slug, "en"),
    openGraph: {
      title: english.content.en.title,
      description: english.description,
      url,
      type: "article",
      locale: "en_US",
      images: [{ url: image, alt: english.content.en.heroImageAlt ?? english.content.en.title }],
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
    },
    twitter: { card: "summary_large_image", title: english.title, description: english.description, images: [image] },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const post = findPost(params.slug);
  const english = post && englishPosts[post.slug];
  if (!post || !english) notFound();
  const article = english.content.en;
  const url = absoluteUrl(post.enSlug!);
  const image = post.heroImage ? absoluteUrl(post.heroImage) : `${siteUrl}/jodohmu-logo.png`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.summary,
    inLanguage: "en",
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: [image],
    author: { "@type": "Organization", name: "Jodohmu", url: siteUrl },
    publisher: { "@type": "Organization", name: "Jodohmu", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/jodohmu-logo.png` } },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/en` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/en/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };
  const faqs = "faqs" in article && Array.isArray(article.faqs) ? (article.faqs as { question: string; answer: string }[]) : [];
  const faqSchema = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <MarkdownArticle content={english.content} relatedSlug={post.slug} />
    </>
  );
}
