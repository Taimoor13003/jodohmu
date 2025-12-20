'use client';

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

const whatsappHref = "https://wa.me/6281122210303";

const faqKeys = [
  "faqPage.items.0",
  "faqPage.items.1",
  "faqPage.items.2",
  "faqPage.items.3",
  "faqPage.items.4",
  "faqPage.items.5",
  "faqPage.items.6",
];

export function FaqPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-12 pb-20 pt-16">
      <section className="container space-y-4 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#9B2242]">{t("header.faq")}</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("faqPage.hero.title")}</h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground">{t("faqPage.hero.subtitle")}</p>
      </section>

      <section className="container space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {faqKeys.map((key) => {
            const q = t(`${key}.q`);
            const a = t(`${key}.a`);
            return (
              <article key={q} className="rounded-2xl border border-[#e6eaf5] bg-white p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="text-base font-semibold text-[#0b3a86]">{q}</h3>
                <p className="mt-2 text-sm text-[#4a4f63] leading-relaxed">{a}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-r from-[#9B2242] to-[#0b3a86] px-8 py-10 text-center text-white shadow-lg">
        <h3 className="text-2xl font-semibold">{t("faqPage.cta.title")}</h3>
        <p className="max-w-2xl text-white/85">{t("faqPage.cta.subtitle")}</p>
        <Button asChild size="lg" className="bg-white text-[#9B2242] hover:bg-white/90">
          <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
            {t("faqPage.cta.button")}
          </Link>
        </Button>
      </section>
    </div>
  );
}
