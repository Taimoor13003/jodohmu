'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
  const [openKey, setOpenKey] = useState<string | null>(faqKeys[0]);

  const items = useMemo(
    () =>
      faqKeys.map((key, idx) => ({
        key,
        q: t(`${key}.q`),
        a: t(`${key}.a`),
        badge: idx < 3 ? "Halal & Safety" : idx < 5 ? "Process" : "Support",
      })),
    [t]
  );

  const toggle = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex flex-col gap-12 pb-20 pt-16">
      <section className="container max-w-4xl space-y-5 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#ffe4ed] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#9B2242]">
          {t("header.faq")}
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("faqPage.hero.title")}</h1>
        <p className="mx-auto max-w-3xl text-lg text-[#3d425a]">{t("faqPage.hero.subtitle")}</p>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold text-[#0b3a86]">
          <span className="rounded-full bg-[#e9f0ff] px-3 py-1">Offline & halal</span>
          <span className="rounded-full bg-[#e9f0ff] px-3 py-1">Facilitated meetings</span>
          <span className="rounded-full bg-[#e9f0ff] px-3 py-1">Family-ready</span>
        </div>
      </section>

      <section className="container max-w-5xl grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-3">
          {items.map((item) => {
            const isOpen = openKey === item.key;
            return (
              <div
                key={item.key}
                className="overflow-hidden rounded-2xl border border-[#e6eaf5] bg-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.key)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B2242]">
                    {item.badge}
                  </span>
                  <span className="flex-1 text-base font-semibold text-[#0b3a86]">{item.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#0b3a86] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-[#3d425a]">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-[#e6eaf5] bg-gradient-to-br from-[#0b3a86] via-[#113f8f] to-[#9B2242] p-6 text-white shadow-lg">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">{t("header.faq")}</p>
            <h3 className="text-2xl font-semibold leading-tight">
              {t("faqPage.cta.title")}
            </h3>
            <p className="text-white/85 leading-relaxed">{t("faqPage.cta.subtitle")}</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/90">
            <p className="font-semibold">Why Jodohmu is best:</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>Offline, halal-first meetings with vetted candidates.</li>
              <li>Facilitators/chaperones (imam/pastor) on request.</li>
              <li>Family-friendly venues and structured agendas.</li>
              <li>Transparent packages—no surprise fees.</li>
            </ul>
          </div>
          <Button asChild size="lg" className="bg-white text-[#0b3a86] hover:bg-white/90">
            <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
              {t("faqPage.cta.button")}
            </Link>
          </Button>
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/85">
            <p className="font-semibold">Need a call?</p>
            <p>Share your city, timeline, and whether you want a facilitator; we’ll tailor the plan.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
