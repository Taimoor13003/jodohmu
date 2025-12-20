'use client';

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

const whatsappHref = "https://wa.me/6281122210303";

const guideKeys = [
  "blogPage.sections.guides.items.0",
  "blogPage.sections.guides.items.1",
  "blogPage.sections.guides.items.2",
  "blogPage.sections.guides.items.3",
  "blogPage.sections.guides.items.4",
  "blogPage.sections.guides.items.5",
];

export function BlogPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-12 pb-20 pt-16">
      <section className="container space-y-4 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#9B2242]">
          {t("header.blog")}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("blogPage.hero.title")}
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
          {t("blogPage.hero.subtitle")}
        </p>
      </section>

      <section className="container space-y-8">
        <h2 className="text-2xl font-semibold text-[#0b3a86]">{t("blogPage.sections.guides.title")}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guideKeys.map((key) => {
            const title = t(`${key}.title`);
            const desc = t(`${key}.desc`);
            return (
            <article key={title} className="rounded-2xl border border-[#e6eaf5] bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-semibold text-[#0b3a86]">{title}</h3>
              <p className="mt-2 text-sm text-[#4a4f63] leading-relaxed">{desc}</p>
            </article>
            );
          })}
        </div>
      </section>

      <section className="container flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-r from-[#9B2242] to-[#0b3a86] px-8 py-10 text-center text-white shadow-lg">
        <h3 className="text-2xl font-semibold">{t("blogPage.sections.cta.title")}</h3>
        <p className="max-w-2xl text-white/85">{t("blogPage.sections.cta.subtitle")}</p>
        <Button asChild size="lg" className="bg-white text-[#9B2242] hover:bg-white/90">
          <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
            {t("blogPage.sections.cta.button")}
          </Link>
        </Button>
      </section>
    </div>
  );
}
