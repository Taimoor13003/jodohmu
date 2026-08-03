'use client';

import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock3, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { getRelatedPosts } from "@/lib/blog-posts";

type ArticleSection = { heading: string; paragraphs: string[]; list?: string[]; image?: string; imageAlt?: string };
type ArticleContent = { tag: string; title: string; summary: string; author: string; date: string; readTime: string; heroImage?: string; heroImageAlt?: string; sections: ArticleSection[]; ctaTitle: string; ctaBody: string };
type MarkdownArticleProps = { content: Record<"id" | "en", ArticleContent>; relatedSlug?: string };
const whatsappHref = "https://wa.me/6281122210303?text=" + encodeURIComponent("Halo Jodohmu, saya ingin memahami Joble dan paket yang cocok untuk saya.");
const defaultHeroImage = "/images/blog/default-article-hero.png";

function renderInlineText(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index} className="font-bold text-[#263b6b]">{part.slice(2, -2)}</strong>
      : part,
  );
}

export function MarkdownArticle({ content, relatedSlug }: MarkdownArticleProps) {
  const { lang, t } = useLanguage();
  const article = content[lang];
  const relatedPosts = relatedSlug ? getRelatedPosts(relatedSlug, 3) : [];
  const heroImage = article.heroImage ?? defaultHeroImage;
  const tableOfContentsLabel = lang === "id" ? "Daftar Isi" : "Table of Contents";

  return <main className="bg-[#fffdfd] pb-24 text-[#263452]">
    <header className="border-b border-[#e3eaf5] bg-[linear-gradient(135deg,#fff3f6_0%,#ffffff_48%,#eff6ff_100%)]"><div className="container max-w-4xl px-5 py-12 sm:py-20">
      <nav className="flex items-center gap-2 text-sm font-semibold text-[#607091]"><Link href="/" className="hover:text-[#c52d5a]">{t("blogArticle.breadcrumb.home")}</Link><span>/</span><Link href="/blog" className="hover:text-[#c52d5a]">{t("blogArticle.breadcrumb.blog")}</Link></nav>
      <p className="mt-12 text-xs font-extrabold uppercase tracking-[.22em] text-[#c52d5a]">{article.tag}</p><h1 className="mt-5 max-w-3xl font-serif text-5xl font-bold leading-[1.02] tracking-[-.04em] text-[#11275b] sm:text-6xl">{article.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#596682]">{article.summary}</p>
      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#607091]"><span>{article.author}</span><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#c52d5a]" />{article.date}</span><span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#c52d5a]" />{article.readTime}</span></div>
      <Image src={heroImage} alt={article.heroImageAlt ?? article.title} width={1672} height={941} priority sizes="(max-width: 896px) 100vw, 896px" className="mt-10 aspect-[16/9] w-full rounded-3xl object-cover shadow-[0_20px_55px_rgba(27,52,107,.16)]" />
    </div></header>
    <article className="container max-w-6xl px-5 pt-14 sm:pt-20">
      <div className="grid gap-12 lg:grid-cols-[220px,minmax(0,1fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label={tableOfContentsLabel} className="rounded-2xl border border-[#dce5f2] bg-[#f8faff] p-6">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#c52d5a]">{tableOfContentsLabel}</p>
            <ol className="mt-4 space-y-2">
              {article.sections.map((section, index) => <li key={section.heading}><a href={`#section-${index + 1}`} className="flex items-center gap-3 rounded-lg px-2 py-1 text-sm font-semibold text-[#2457ad] hover:bg-white hover:text-[#c52d5a]"><span className="text-[#c52d5a]">0{index + 1}</span>{renderInlineText(section.heading)}</a></li>)}
            </ol>
          </nav>
        </aside>
        <div>
          <div className="space-y-16">{article.sections.map((section, index) => <section id={`section-${index + 1}`} key={section.heading} className="scroll-mt-24"><h2 className="font-serif text-3xl font-bold leading-tight text-[#11275b] sm:text-4xl">{renderInlineText(section.heading)}</h2><div className="mt-6 space-y-5 text-base leading-8 text-[#53617d] sm:text-lg">{section.paragraphs.map((paragraph) => <p key={paragraph}>{renderInlineText(paragraph)}</p>)}</div>{section.list && <ul className="mt-7 space-y-3 border-l-2 border-[#f1a0ba] pl-5 text-base leading-7 text-[#43516d]">{section.list.map((item) => <li key={item}>{renderInlineText(item)}</li>)}</ul>}{section.image && <Image src={section.image} alt={section.imageAlt ?? ""} width={1536} height={1024} sizes="(max-width: 768px) 100vw, 768px" className="mt-10 aspect-[3/2] w-full rounded-3xl object-cover shadow-[0_18px_50px_rgba(27,52,107,.12)]" />}</section>)}</div>
          <section className="mt-20 rounded-3xl bg-[linear-gradient(120deg,#11275b,#285aaa_55%,#cf3466)] p-8 text-white shadow-[0_20px_55px_rgba(35,73,151,.2)] sm:p-10"><h2 className="font-serif text-3xl font-bold">{article.ctaTitle}</h2><p className="mt-4 max-w-xl leading-7 text-white/85">{article.ctaBody}</p><Button asChild className="mt-7 h-12 rounded-full bg-white px-6 font-extrabold text-[#153778] hover:bg-[#fff1f5]"><Link href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" />{lang === "id" ? "Mulai via WhatsApp" : "Start on WhatsApp"}</Link></Button></section>
          {relatedPosts.length > 0 && <section className="mt-20"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#c52d5a]">{lang === "id" ? "Baca Selanjutnya" : "Read Next"}</p><h2 className="mt-3 font-serif text-3xl font-bold text-[#11275b]">{lang === "id" ? "Artikel terkait" : "Related articles"}</h2><div className="mt-7 grid gap-4 md:grid-cols-3">{relatedPosts.map((post) => <Link key={post.slug} href={post.slug} className="rounded-2xl border border-[#dce5f2] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#c52d5a]">{t(`${post.articleKey}.tag`)}</p><h3 className="mt-3 font-serif text-lg font-bold leading-snug text-[#11275b]">{t(`${post.articleKey}.title`)}</h3><span className="mt-5 block text-sm font-bold text-[#2457ad]">{lang === "id" ? "Baca artikel" : "Read article"} →</span></Link>)}</div></section>}
        </div>
      </div>
    </article>
  </main>;
}
