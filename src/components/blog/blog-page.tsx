'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { blogPosts } from "@/lib/blog-posts";

const defaultHeroImage = "/images/blog/default-article-hero.png";

export function BlogPage() {
  const { t, lang } = useLanguage();
  const locale = lang === "id" ? "id-ID" : "en-US";
  const formatDate = (date: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`));
  const readTimeLabel = (minutes: number) => (lang === "id" ? `${minutes} menit baca` : `${minutes} min read`);

  return (
    <div className="flex flex-col gap-12 pb-20 pt-16">
      <section className="container max-w-3xl space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9B2242]">
          {t("header.blog")}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("blogPage.hero.title")}
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
          {t("blogPage.hero.subtitle")}
        </p>
      </section>

      <section className="container">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((article) => (
            <article
              key={article.slug}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#e0e7f3] bg-white shadow-[0_10px_30px_rgba(20,48,104,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(20,48,104,.14)]"
            >
              <Link href={article.slug} className="flex flex-1 flex-col focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e48aa7]/40">
                <div className="overflow-hidden">
                  <Image
                    src={article.heroImage ?? defaultHeroImage}
                    alt={t(`${article.articleKey}.title`)}
                    width={1200}
                    height={630}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B2242]">
                    {t(`${article.articleKey}.tag`)}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight text-[#0b3a86] group-hover:text-[#9B2242]">
                    {t(`${article.articleKey}.title`)}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#4a4f63]">
                    {t(`${article.articleKey}.subtitle`)}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-5 text-xs font-semibold text-[#687590]">
                    <time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time>
                    <span>{readTimeLabel(article.readTime)}</span>
                  </div>
                </div>
              </Link>
              <div className="px-6 pb-6">
                <Link href={article.slug} className="flex items-center justify-center gap-2 rounded-xl bg-[#0b3a86] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#9B2242] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#e48aa7]/40">
                  {t("blogPage.readArticle")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
