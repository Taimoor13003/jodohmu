'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const whatsappBase = "https://wa.me/6281122210303";

type TagColor = "green" | "red" | "blue" | "amber";

const tagColorClasses: Record<TagColor, string> = {
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-[#0b3a86]",
  amber: "bg-amber-100 text-amber-700",
};

const jobConfig: {
  tagColors: [TagColor, TagColor];
  waText: string;
  doCount: number;
  getCount: number;
  areCount: number;
}[] = [
  { tagColors: ["green", "red"], waText: "Appointment%20Setter",    doCount: 5, getCount: 5, areCount: 5 },
  { tagColors: ["blue",  "red"], waText: "Sales%20Consultant",       doCount: 5, getCount: 5, areCount: 5 },
  { tagColors: ["blue", "amber"], waText: "Operations%20Assistant",  doCount: 6, getCount: 5, areCount: 6 },
];

export function CareersPage() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="pb-24">

      {/* ══════════════
          HERO
      ══════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f7ecf4] via-white to-[#e7f0ff] pt-16 pb-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#9B2242]/8 blur-3xl" />
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[#0b3a86]/8 blur-3xl" />
        </div>
        <div className="container relative max-w-4xl">
          <span className="inline-flex items-center rounded-full border border-[#9B2242]/20 bg-[#9B2242]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#9B2242]">
            {t("careersPage.hero.eyebrow")}
          </span>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tighter text-[#0b3a86] sm:text-5xl md:text-6xl">
            {t("careersPage.hero.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#3d425a] sm:text-lg">
            {t("careersPage.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* ══════════════════
          VALUES STRIP
      ══════════════════ */}
      <section className="border-y border-[#e6eaf5] bg-white py-12">
        <div className="container max-w-5xl">
          <div className="grid gap-10 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9B2242]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-serif text-lg font-bold text-[#0b3a86]">
                  {t(`careersPage.values.${i}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-[#4a4f63]">
                  {t(`careersPage.values.${i}.text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════
          OPEN POSITIONS
      ══════════════════ */}
      <section className="container mt-16 max-w-3xl">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-[#0b3a86] sm:text-4xl">
            {t("careersPage.jobs.title")}
          </h2>
          <p className="mt-1 text-sm font-semibold text-[#9B2242]">
            {t("careersPage.jobs.subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          {jobConfig.map((cfg, i) => {
            const isOpen = openIndex === i;
            const waLink = `${whatsappBase}?text=Assalamualaikum%2C%20saya%20tertarik%20dengan%20posisi%20${cfg.waText}%20di%20Jodohmu`;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
                  isOpen
                    ? "border-[#0b3a86]/30 shadow-md"
                    : "border-[#e6eaf5] hover:border-[#0b3a86]/20 hover:shadow-sm"
                }`}
              >
                {/* Card header */}
                <button
                  className="flex w-full items-start gap-4 px-5 py-5 text-left sm:px-6"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                >
                  <span className="mt-0.5 shrink-0 text-xs font-bold uppercase tracking-widest text-[#9B2242]">
                    {String(i + 1).padStart(2, "0")} / 03
                  </span>
                  <div className="flex-1 space-y-2">
                    <p className="text-base font-bold leading-snug text-[#0b3a86] sm:text-lg">
                      {t(`careersPage.jobs.items.${i}.title`)}
                    </p>
                    <p className="text-sm italic text-[#4a4f63]">
                      {t(`careersPage.jobs.items.${i}.subtitle`)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cfg.tagColors.map((color, ti) => (
                        <span
                          key={ti}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tagColorClasses[color]}`}
                        >
                          {t(`careersPage.jobs.items.${i}.tags.${ti}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[#0b3a86] transition-transform duration-200 ${
                      isOpen ? "rotate-45 border-[#0b3a86]" : "border-[#0b3a86]/30"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>

                {/* Expanded body */}
                {isOpen && (
                  <div className="space-y-6 border-t border-[#e6eaf5] px-5 pb-7 pt-6 sm:px-6">
                    <p className="text-sm leading-relaxed text-[#2d3150]">
                      {t(`careersPage.jobs.items.${i}.desc`)}
                    </p>

                    <div className="grid gap-6 sm:grid-cols-3">
                      {/* What You Do */}
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0b3a86]">
                          {t("careersPage.jobs.whatYouDo")}
                        </p>
                        <ul className="space-y-2">
                          {Array.from({ length: cfg.doCount }, (_, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm leading-snug text-[#2d3150]">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9B2242]" />
                              {t(`careersPage.jobs.items.${i}.do.${j}`)}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* What You Get */}
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0b3a86]">
                          {t("careersPage.jobs.whatYouGet")}
                        </p>
                        <ul className="space-y-2">
                          {Array.from({ length: cfg.getCount }, (_, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm leading-snug text-[#2d3150]">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                              {t(`careersPage.jobs.items.${i}.get.${j}`)}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Who You Are */}
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0b3a86]">
                          {t("careersPage.jobs.whoYouAre")}
                        </p>
                        <ul className="space-y-2">
                          {Array.from({ length: cfg.areCount }, (_, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm leading-snug text-[#2d3150]">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0b3a86]" />
                              {t(`careersPage.jobs.items.${i}.are.${j}`)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="rounded-full bg-[#0b3a86] px-6 py-5 text-sm font-bold text-white hover:bg-[#0a357a]"
                    >
                      <Link href={waLink} target="_blank" rel="noopener noreferrer">
                        {t("careersPage.jobs.apply")}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
