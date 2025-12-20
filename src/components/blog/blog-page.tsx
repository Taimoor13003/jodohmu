'use client';

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

const whatsappHref = "https://wa.me/6281122210303";

const articles = [
  { key: "stepByStepProcess", href: "/blog/step-by-step-process" },
  { key: "whyDatingAppsFail", href: "/blog/why-dating-apps-fail" },
  { key: "familyInvolvement", href: "/blog/family-involvement" },
  { key: "syariahSafeguards", href: "/blog/syariah-safeguards" },
  { key: "howMeetingsAreSupervised", href: "/blog/how-meetings-are-supervised" },
];

export function BlogPage() {
  const { t } = useLanguage();

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
          {articles.map((article) => (
            <article
              key={article.key}
              className="flex h-full flex-col justify-between rounded-2xl border border-[#e6eaf5] bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B2242]">
                  {t(`blogArticle.${article.key}.tag`)}
                </p>
                <h2 className="text-xl font-semibold leading-tight text-[#0b3a86]">
                  {t(`blogArticle.${article.key}.title`)}
                </h2>
                <p className="text-sm leading-relaxed text-[#4a4f63]">
                  {t(`blogArticle.${article.key}.subtitle`)}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild size="sm" className="bg-[#0b3a86] text-white hover:bg-[#0a357a]">
                  <Link href={article.href}>{t("blogPage.sections.article.cta")}</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-[#9B2242] text-[#9B2242] hover:bg-[#9B2242]/5"
                >
                  <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    {t("blogPage.sections.article.secondaryCta")}
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
