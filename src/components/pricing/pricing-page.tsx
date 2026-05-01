'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const contactFormHref = "https://forms.gle/WUSTC71ZrpbvSXso6";
const whatsappHref = "https://wa.me/6281327054561";

type PkgConfig = {
  key: string;
  durationKey: string;
  featuresCount: number;
  missingCount: number;
  badge: string | null;
  dark?: boolean;
};

const packages: PkgConfig[] = [
  { key: "basic",    durationKey: "basic",    featuresCount: 5,  missingCount: 4, badge: null },
  { key: "standard", durationKey: "standard", featuresCount: 7,  missingCount: 2, badge: "popular" },
  { key: "silver",   durationKey: "silver",   featuresCount: 9,  missingCount: 1, badge: "vipSilver" },
  { key: "gold",     durationKey: "gold",     featuresCount: 10, missingCount: 0, badge: "vipGold", dark: true },
];

const hikmahCount = 3;
const upgradePathsCount = 2;
const trustKeys = ["couples", "location", "supervised", "human"] as const;

export function PricingPage() {
  const { t } = useLanguage();

  return (
    <div className="pb-24">

      {/* ══════════════════════════════════════
          MAY 50% DISCOUNT BANNER — UNMISSABLE
      ══════════════════════════════════════ */}
      <div className="sticky top-20 z-40 w-full bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 shadow-lg shadow-red-500/30">
        <div className="container flex flex-col items-center justify-between gap-2 py-3 sm:flex-row sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="shrink-0 rounded-full bg-white/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              {t("pricingPage.discount.badge")}
            </span>
            <p className="text-center text-base font-extrabold text-white sm:text-left sm:text-lg">
              🔥 {t("pricingPage.discount.headline")}
              <span className="ml-2 hidden font-semibold text-white sm:inline">— {t("pricingPage.discount.sub")}</span>
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 rounded-full bg-white px-5 font-bold text-red-600 shadow-md hover:bg-white/90">
            <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
              {t("pricingPage.discount.cta")}
            </Link>
          </Button>
        </div>
        <p className="pb-1.5 text-center text-xs font-semibold text-white sm:hidden">
          {t("pricingPage.discount.sub")}
        </p>
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
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[#3d425a]">
            {t("pricingPage.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full bg-[#9B2242] px-8 py-6 text-base font-bold text-white shadow-lg shadow-[#9B2242]/30 hover:bg-[#8a1e3b]">
              <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
                {t("pricingPage.hero.cta")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-[#0b3a86]/30 px-8 py-6 text-base font-semibold text-[#0b3a86] hover:bg-[#0b3a86]/5">
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
          <div className="bg-white px-8 py-8 sm:px-12">
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

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((pkg) => {
            const isStandard = pkg.key === "standard";
            const isGold = pkg.key === "gold";
            const isDark = isGold;

            return (
              <div
                key={pkg.key}
                className={`relative flex flex-col rounded-3xl transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl
                  ${isStandard ? "border-2 border-[#9B2242] bg-gradient-to-br from-[#fff4f7] to-white shadow-lg shadow-[#9B2242]/15 xl:-translate-y-3 xl:scale-105" : ""}
                  ${isGold ? "border border-[#c8860a]/40 bg-gradient-to-br from-[#1a0a00] to-[#2d1400] shadow-lg" : ""}
                  ${pkg.key === "basic" ? "border border-[#d0d9f0] bg-gradient-to-br from-[#f0f4ff] to-white shadow-sm" : ""}
                  ${pkg.key === "silver" ? "border border-[#0b3a86]/25 bg-gradient-to-br from-[#f0f4ff] to-white shadow-sm" : ""}
                  p-6`}
              >
                {/* Popular / VIP badge */}
                {pkg.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-md
                      ${isStandard ? "bg-[#9B2242]" : pkg.key === "silver" ? "bg-[#0b3a86]" : "bg-gradient-to-r from-[#b7791f] to-[#c8860a]"}`}>
                      {t(`pricingPage.packages.${pkg.badge}`)}
                    </span>
                  </div>
                )}

                <div className={`mt-${pkg.badge ? "4" : "0"} mb-3`}>
                  <h3 className={`text-2xl font-extrabold ${isDark ? "text-[#ffd97a]" : "text-[#0b3a86]"}`}>
                    {t(`pricingPage.packages.items.${pkg.key}.name`)}
                  </h3>
                  <p className={`mt-1 text-xs font-semibold ${isDark ? "text-white/55" : "text-[#4a4f63]"}`}>
                    {t(`pricingPage.packages.duration.${pkg.durationKey}`)}
                  </p>
                  {isGold && (
                    <p className="mt-1 text-xs font-bold text-[#c8860a]">{t("pricingPage.packages.goldNote")}</p>
                  )}
                </div>

                {/* Discounted price block */}
                <div className={`rounded-2xl mb-5 px-4 py-5 text-center
                  ${isStandard ? "bg-[#9B2242]" : isGold ? "bg-gradient-to-br from-[#b7791f] to-[#c8860a]" : pkg.key === "silver" ? "bg-gradient-to-br from-[#0b3a86] to-[#1a4fa0]" : "bg-[#0b3a86]"}`}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">May Price</p>
                  <p className="text-4xl font-extrabold tracking-tight text-white">
                    {t(`pricingPage.packages.items.${pkg.key}.discountedPrice`)}
                  </p>
                  <p className="mt-1 text-sm text-white/60 line-through">
                    {t(`pricingPage.packages.items.${pkg.key}.price`)}
                  </p>
                  {t(`pricingPage.packages.items.${pkg.key}.afterReg`) && (
                    <p className="mt-1.5 rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium text-white/85">
                      + {t(`pricingPage.packages.items.${pkg.key}.afterReg`)} {t("pricingPage.packages.afterReg")}
                    </p>
                  )}
                </div>

                {/* Features list */}
                <ul className="flex-1 space-y-2.5 mb-5">
                  {Array.from({ length: pkg.featuresCount }, (_, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                      <span className={`text-sm leading-snug ${isDark ? "text-white/85" : "text-[#2d3150]"}`}>
                        {t(`pricingPage.packages.items.${pkg.key}.features.${i}`)}
                      </span>
                    </li>
                  ))}
                  {Array.from({ length: pkg.missingCount }, (_, i) => (
                    <li key={`x-${i}`} className="flex items-start gap-2.5 opacity-35">
                      <span className="mt-0.5 shrink-0 text-[#9B2242]">✗</span>
                      <span className={`text-sm leading-snug line-through ${isDark ? "text-white/50" : "text-[#4a4f63]"}`}>
                        {t(`pricingPage.packages.items.${pkg.key}.missing.${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full rounded-full py-5 font-bold text-sm
                    ${isStandard ? "bg-[#9B2242] text-white shadow-md hover:bg-[#8a1e3b]" : ""}
                    ${isGold ? "bg-gradient-to-r from-[#b7791f] to-[#c8860a] text-white hover:opacity-90" : ""}
                    ${pkg.key === "basic" || pkg.key === "silver" ? "bg-[#0b3a86] text-white hover:bg-[#0a357a]" : ""}
                  `}
                >
                  <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
                    {t("pricingPage.discount.cta")}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════
          UPGRADE PATHS
      ══════════════════ */}
      <section className="container mt-20 max-w-5xl">
        <div className="rounded-3xl border border-[#0b3a86]/10 bg-gradient-to-br from-[#f5f8ff] to-white p-8 shadow-sm sm:p-10">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0b3a86]">{t("pricingPage.upgrade.title")}</h2>
              <p className="mt-1 text-[#4a4f63]">{t("pricingPage.upgrade.subtitle")}</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#0b3a86]/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#0b3a86]">
              Upgrade
            </span>
          </div>
          <div className="space-y-3">
            {Array.from({ length: upgradePathsCount }, (_, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-[#0b3a86]/10 bg-white px-5 py-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  <span className="rounded-full bg-[#0b3a86]/10 px-3 py-1 text-[#0b3a86]">
                    {t(`pricingPage.upgrade.paths.${i}.from`)}
                  </span>
                  <span className="text-[#9B2242] font-bold">→</span>
                  <span className="rounded-full bg-[#9B2242]/10 px-3 py-1 text-[#9B2242]">
                    {t(`pricingPage.upgrade.paths.${i}.to`)}
                  </span>
                </div>
                <span className="text-xl font-extrabold text-[#9B2242]">
                  {t(`pricingPage.upgrade.paths.${i}.diff`)}
                </span>
              </div>
            ))}
          </div>
          <blockquote className="mt-5 border-l-4 border-[#9B2242] bg-[#9B2242]/5 pl-4 pr-4 py-3 text-sm italic text-[#9B2242] rounded-r-xl">
            {t("pricingPage.upgrade.hikmah")}
          </blockquote>
        </div>
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b3a86] via-[#1e2e6b] to-[#9B2242] px-8 py-20 text-center text-white shadow-2xl shadow-[#0b3a86]/20 sm:px-16 sm:py-24">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative space-y-5">
            <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white/90">
              🔥 {t("pricingPage.discount.badge")}
            </span>
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">{t("pricingPage.cta.title")}</h2>
            <p className="mx-auto max-w-xl text-white/85 text-lg leading-relaxed">{t("pricingPage.cta.subtitle")}</p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button asChild size="lg" className="rounded-full bg-white px-10 py-6 text-base font-extrabold text-[#9B2242] hover:bg-white/90 shadow-xl shadow-black/20">
                <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
                  {t("pricingPage.cta.button")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-2 border-white bg-white/10 px-8 py-6 text-base font-semibold text-white hover:bg-white/20">
                <Link href="/faq">FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
