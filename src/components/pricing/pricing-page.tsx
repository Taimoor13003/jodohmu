'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const contactFormHref = "https://forms.gle/WUSTC71ZrpbvSXso6";
const whatsappHref = "https://wa.me/6281122210303";

type PkgConfig = {
  key: "awal" | "serius" | "istimewa";
  featuresCount: number;
  popular?: boolean;
  discount?: boolean;
  referralOnly?: boolean;
  dark?: boolean;
};

const packages: PkgConfig[] = [
  { key: "awal",      featuresCount: 6, discount: true },
  { key: "serius",    featuresCount: 8, popular: true },
  { key: "istimewa",  featuresCount: 9, referralOnly: true, dark: true },
];

const hikmahCount = 3;
const trustKeys = ["couples", "supervised", "human"] as const;

export function PricingPage() {
  const { t } = useLanguage();

  return (
    <div className="pb-24">

      {/* ══════════════════════════════════════
          MAY 50% DISCOUNT BANNER — UNMISSABLE
      ══════════════════════════════════════ */}
      <div className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 shadow-lg shadow-red-500/30">
        <div className="container flex flex-col items-center justify-between gap-2 py-2.5 sm:flex-row sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden shrink-0 rounded-full bg-white/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white sm:inline-flex">
              {t("pricingPage.discount.badge")}
            </span>
            <p className="text-center text-xs font-bold leading-snug text-white sm:text-left sm:text-sm sm:font-extrabold">
              {t("pricingPage.discount.headline")}
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-red-600 shadow-md hover:bg-white/90 sm:px-5 sm:text-sm">
            <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
              {t("pricingPage.discount.cta")}
            </Link>
          </Button>
        </div>
      </div>

      {/* ══════════════════
          HERO
      ══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f7ecf4] via-white to-[#e7f0ff] pt-14 pb-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#9B2242]/10 blur-3xl" />
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[#0b3a86]/10 blur-3xl" />
        </div>
        <div className="container relative max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#9B2242]/20 bg-[#9B2242]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#9B2242]">
            {t("pricingPage.hero.badge")}
          </span>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tighter text-[#0b3a86] sm:text-5xl md:text-6xl">
            {t("pricingPage.hero.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#3d425a] sm:text-lg">
            {t("pricingPage.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full bg-[#9B2242] px-6 py-5 text-sm font-bold text-white shadow-lg shadow-[#9B2242]/30 hover:bg-[#8a1e3b] sm:px-8 sm:py-6 sm:text-base">
              <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
                {t("pricingPage.hero.cta")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-[#0b3a86]/30 px-6 py-5 text-sm font-semibold text-[#0b3a86] hover:bg-[#0b3a86]/5 sm:px-8 sm:py-6 sm:text-base">
              <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
                {t("pricingPage.hero.ctaSecondary")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════
          TRUST BAR
      ══════════════════ */}
      <section className="border-y border-[#e6eaf5] bg-white py-5">
        <div className="container flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trustKeys.map((key) => (
            <div key={key} className="flex items-center gap-2 text-sm font-semibold text-[#0b3a86]">
              <span className="h-2 w-2 rounded-full bg-[#9B2242]" />
              {t(`pricingPage.trust.${key}`)}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════
          REGISTRATION FEE
      ══════════════════════ */}
      <section className="container mt-12 max-w-5xl">
        <div className="overflow-hidden rounded-3xl border-2 border-[#0b3a86]/15 shadow-xl">
          <div className="bg-gradient-to-r from-[#0b3a86] to-[#1a4fa0] px-8 py-4 sm:px-12">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-white/80">{t("pricingPage.registration.badge")}</span>
          </div>
          <div className="bg-white px-4 py-6 sm:px-8 sm:py-8 md:px-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-[#0b3a86]">{t("pricingPage.registration.title")}</h2>
                <p className="text-sm text-[#4a4f63]">{t("pricingPage.registration.desc")}</p>
                <blockquote className="rounded-xl border-l-4 border-[#9B2242] bg-[#9B2242]/5 pl-4 pr-4 py-3 text-sm italic leading-relaxed text-[#9B2242]">
                  {t("pricingPage.registration.hikmah")}
                </blockquote>
              </div>
              <div className="shrink-0 rounded-2xl bg-gradient-to-br from-[#0b3a86]/5 to-[#0b3a86]/10 px-8 py-6 text-center">
                <p className="text-5xl font-extrabold tracking-tight text-[#0b3a86]">{t("pricingPage.registration.price")}</p>
                <p className="mt-1 text-xs font-semibold text-[#4a4f63]">{t("pricingPage.registration.note")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════
          PACKAGES
      ══════════════════ */}
      <section className="container mt-20 max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold text-[#0b3a86] sm:text-4xl">{t("pricingPage.packages.title")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#4a4f63]">{t("pricingPage.packages.subtitle")}</p>
          <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
            🔥 {t("pricingPage.discount.urgency")}
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {packages.map((pkg) => {
            const { popular, discount, referralOnly, dark } = pkg;

            return (
              <div
                key={pkg.key}
                className={`relative flex flex-col rounded-3xl transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl p-5 sm:p-6
                  ${discount ? "border border-[#d0d9f0] bg-gradient-to-br from-[#f0f4ff] to-white shadow-sm" : ""}
                  ${popular ? "border-2 border-[#9B2242] bg-gradient-to-br from-[#fff4f7] to-white shadow-lg shadow-[#9B2242]/15 md:-translate-y-3 md:scale-105" : ""}
                  ${dark ? "border border-[#c8860a]/40 bg-gradient-to-br from-[#1a0a00] to-[#2d1400] shadow-lg" : ""}
                `}
              >
                {/* Top badge */}
                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center rounded-full bg-[#9B2242] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-md">
                      {t("pricingPage.packages.popular")}
                    </span>
                  </div>
                )}
                {discount && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-md">
                      🔥 50% OFF — Mei
                    </span>
                  </div>
                )}

                {/* Name + duration */}
                <div className="mb-4 mt-6">
                  <h3 className={`text-2xl font-extrabold ${dark ? "text-[#ffd97a]" : "text-[#0b3a86]"}`}>
                    {t(`pricingPage.packages.items.${pkg.key}.name`)}
                  </h3>
                  <p className={`mt-1 text-xs font-semibold ${dark ? "text-white/55" : "text-[#4a4f63]"}`}>
                    {t(`pricingPage.packages.items.${pkg.key}.duration`)}
                  </p>
                </div>

                {/* Price block */}
                <div className={`rounded-2xl mb-5 px-4 py-5 text-center
                  ${popular ? "bg-[#9B2242]" : dark ? "bg-gradient-to-br from-[#b7791f] to-[#c8860a]" : "bg-[#0b3a86]"}`}>
                  {discount ? (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Harga Mei</p>
                      <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        {t(`pricingPage.packages.items.${pkg.key}.discountedPrice`)}
                      </p>
                      <p className="mt-1 text-sm text-white/60 line-through">
                        {t(`pricingPage.packages.items.${pkg.key}.price`)}
                      </p>
                    </>
                  ) : (
                    <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      {t(`pricingPage.packages.items.${pkg.key}.price`)}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2.5 mb-6">
                  {Array.from({ length: pkg.featuresCount }, (_, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                      <span className={`text-sm leading-snug ${dark ? "text-white/85" : "text-[#2d3150]"}`}>
                        {t(`pricingPage.packages.items.${pkg.key}.features.${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA or Referral-only label */}
                {referralOnly ? (
                  <div className="rounded-2xl border border-[#c8860a]/40 bg-[#c8860a]/10 px-4 py-3 text-center">
                    <p className="text-sm font-bold text-[#c8860a]">
                      {t(`pricingPage.packages.items.${pkg.key}.referralOnly`)}
                    </p>
                  </div>
                ) : (
                  <Button
                    asChild
                    className={`w-full rounded-full py-5 font-bold text-sm
                      ${popular ? "bg-[#9B2242] text-white shadow-md hover:bg-[#8a1e3b]" : "bg-[#0b3a86] text-white hover:bg-[#0a357a]"}
                    `}
                  >
                    <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
                      {discount ? t("pricingPage.discount.cta") : t("pricingPage.cta.button")}
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════
          SPECIAL PROMOS
      ══════════════════════════ */}
      <section className="container mt-20 max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-[#0b3a86] sm:text-3xl">{t("pricingPage.special.title")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#4a4f63] sm:text-base">{t("pricingPage.special.subtitle")}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Student promo */}
          <div className="flex flex-col rounded-3xl border-2 border-[#0b3a86]/20 bg-gradient-to-br from-[#f0f4ff] to-white p-6 shadow-sm">
            <span className="mb-3 inline-flex w-fit items-center rounded-full bg-[#0b3a86] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              🎓 {t("pricingPage.special.student.badge")}
            </span>
            <div className="flex items-end gap-3 mb-3">
              <p className="text-5xl font-extrabold text-[#0b3a86]">{t("pricingPage.special.student.discount")}</p>
              <p className="mb-1.5 text-sm font-semibold text-[#4a4f63]">{t("pricingPage.special.student.title")}</p>
            </div>
            <p className="text-sm leading-relaxed text-[#2d3150]">{t("pricingPage.special.student.desc")}</p>
            <p className="mt-3 text-xs text-[#4a4f63]">{t("pricingPage.special.student.note")}</p>
            <Button asChild className="mt-5 w-full rounded-full bg-[#0b3a86] py-5 text-sm font-bold text-white hover:bg-[#0a357a]">
              <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
                {t("pricingPage.special.cta")}
              </Link>
            </Button>
          </div>
          {/* Widow/widower promo */}
          <div className="flex flex-col rounded-3xl border-2 border-[#9B2242]/20 bg-gradient-to-br from-[#fff4f7] to-white p-6 shadow-sm">
            <span className="mb-3 inline-flex w-fit items-center rounded-full bg-[#9B2242] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              🤍 {t("pricingPage.special.widow.badge")}
            </span>
            <div className="flex items-end gap-3 mb-3">
              <p className="text-5xl font-extrabold text-[#9B2242]">{t("pricingPage.special.widow.discount")}</p>
              <p className="mb-1.5 text-sm font-semibold text-[#4a4f63]">{t("pricingPage.special.widow.title")}</p>
            </div>
            <p className="text-sm leading-relaxed text-[#2d3150]">{t("pricingPage.special.widow.desc")}</p>
            <p className="mt-3 text-xs text-[#4a4f63]">{t("pricingPage.special.widow.note")}</p>
            <Button asChild className="mt-5 w-full rounded-full bg-[#9B2242] py-5 text-sm font-bold text-white hover:bg-[#8a1e3b]">
              <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
                {t("pricingPage.special.cta")}
              </Link>
            </Button>
          </div>
        </div>
        <blockquote className="mt-6 border-l-4 border-[#9B2242] bg-[#9B2242]/5 pl-4 pr-4 py-3 text-sm italic text-[#9B2242] rounded-r-xl">
          {t("pricingPage.special.hikmah")}
        </blockquote>
      </section>

      {/* ══════════════════════
          HIKMAH — WHY WE PRICE
      ══════════════════════ */}
      <section className="container mt-20 max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold text-[#0b3a86] sm:text-4xl">{t("pricingPage.hikmah.title")}</h2>
          <p className="mt-2 text-[#4a4f63]">{t("pricingPage.hikmah.subtitle")}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: hikmahCount }, (_, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl border border-[#e6eaf5] bg-white p-6 shadow-sm">
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br from-[#9B2242]/5 to-[#0b3a86]/5 blur-2xl" />
              <div className="relative">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0b3a86] to-[#9B2242] text-sm font-extrabold text-white">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-lg font-bold text-[#0b3a86]">{t(`pricingPage.hikmah.items.${i}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4a4f63]">{t(`pricingPage.hikmah.items.${i}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════
          BONUS
      ══════════════════ */}
      <section className="container mt-20 max-w-5xl">
        <div className="flex flex-col gap-6 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">
              {t("pricingPage.bonus.badge")}
            </span>
            <h2 className="text-2xl font-bold text-[#0b3a86]">{t("pricingPage.bonus.title")}</h2>
            <p className="text-sm text-[#4a4f63]">{t("pricingPage.bonus.desc")}</p>
            <blockquote className="border-l-4 border-emerald-400 bg-emerald-50 pl-4 pr-4 py-3 text-sm italic text-emerald-700 rounded-r-xl">
              {t("pricingPage.bonus.hikmah")}
            </blockquote>
          </div>
          <div className="shrink-0 rounded-2xl bg-emerald-100 px-8 py-6 text-center">
            <p className="text-4xl font-extrabold tracking-tight text-emerald-600">{t("pricingPage.bonus.price")}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-700">{t("pricingPage.bonus.note")}</p>
          </div>
        </div>
      </section>

      {/* ══════════════════
          BOTTOM CTA
      ══════════════════ */}
      <section className="container mt-20 max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b3a86] via-[#1e2e6b] to-[#9B2242] px-6 py-14 text-center text-white shadow-2xl shadow-[#0b3a86]/20 sm:px-12 sm:py-20 md:px-16 md:py-24">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative space-y-5">
            <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white/90">
              🔥 {t("pricingPage.discount.badge")}
            </span>
            <h2 className="font-serif text-2xl font-bold sm:text-3xl md:text-4xl">{t("pricingPage.cta.title")}</h2>
            <p className="mx-auto max-w-xl text-white/85 text-base leading-relaxed sm:text-lg">{t("pricingPage.cta.subtitle")}</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="rounded-full bg-white px-7 py-5 text-sm font-extrabold text-[#9B2242] hover:bg-white/90 shadow-xl shadow-black/20 sm:px-10 sm:py-6 sm:text-base">
                <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
                  {t("pricingPage.cta.button")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-white bg-white/10 px-6 py-5 text-sm font-semibold text-white hover:bg-white/20 sm:px-8 sm:py-6 sm:text-base">
                <Link href="/faq">FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
