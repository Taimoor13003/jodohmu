'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const contactFormHref = "https://forms.gle/WUSTC71ZrpbvSXso6";

const packages = [
  {
    key: "basic",
    durationKey: "basic",
    featuresCount: 5,
    missingCount: 4,
    badge: null,
    gradient: "from-[#f0f4ff] to-[#fafbff]",
    border: "border-[#d0d9f0]",
    priceBg: "bg-[#0b3a86]",
  },
  {
    key: "standard",
    durationKey: "standard",
    featuresCount: 7,
    missingCount: 2,
    badge: "popular",
    gradient: "from-[#fff4f7] to-[#fff9fb]",
    border: "border-[#9B2242]/40",
    priceBg: "bg-[#9B2242]",
  },
  {
    key: "silver",
    durationKey: "silver",
    featuresCount: 9,
    missingCount: 1,
    badge: "vipSilver",
    gradient: "from-[#f5f8ff] to-[#fafcff]",
    border: "border-[#0b3a86]/30",
    priceBg: "bg-gradient-to-br from-[#0b3a86] to-[#1a4fa0]",
  },
  {
    key: "gold",
    durationKey: "gold",
    featuresCount: 10,
    missingCount: 0,
    badge: "vipGold",
    gradient: "from-[#1a0a00] to-[#2d1400]",
    border: "border-[#c8860a]/30",
    priceBg: "bg-gradient-to-br from-[#b7791f] to-[#c8860a]",
    dark: true,
  },
] as const;

const hikmahCount = 3;
const upgradePaths = [
  { from: "Basic", to: "Standard" },
  { from: "Standard", to: "VIP Silver" },
];

export function PricingPage() {
  const { t } = useLanguage();

  return (
    <div className="pb-24 pt-16">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#9B2242]/10 blur-3xl" />
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-[#0b3a86]/10 blur-3xl" />
        </div>
        <div className="container relative max-w-4xl py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#9B2242]/20 bg-[#9B2242]/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#9B2242]">
            {t("pricingPage.hero.badge")}
          </span>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tighter text-[#0b3a86] sm:text-5xl md:text-6xl">
            {t("pricingPage.hero.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#3d425a]">
            {t("pricingPage.hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full bg-[#9B2242] px-8 text-white hover:bg-[#8a1e3b]">
              <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
                {t("pricingPage.hero.cta")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-[#0b3a86]/30 px-8 text-[#0b3a86] hover:bg-[#0b3a86]/5">
              <Link href="https://wa.me/6281327054561" target="_blank" rel="noopener noreferrer">
                {t("pricingPage.hero.ctaSecondary")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Registration Fee ── */}
      <section className="container max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-[#0b3a86]/15 bg-gradient-to-r from-[#0b3a86] to-[#9B2242] p-px shadow-xl">
          <div className="rounded-3xl bg-white px-8 py-8 sm:px-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full bg-[#0b3a86]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#0b3a86]">
                  {t("pricingPage.registration.badge")}
                </span>
                <h2 className="text-2xl font-bold text-[#0b3a86]">{t("pricingPage.registration.title")}</h2>
                <p className="text-sm text-[#4a4f63]">{t("pricingPage.registration.desc")}</p>
                <p className="mt-3 rounded-xl border border-[#9B2242]/20 bg-[#9B2242]/5 px-4 py-3 text-sm italic leading-relaxed text-[#9B2242]">
                  &ldquo;{t("pricingPage.registration.hikmah")}&rdquo;
                </p>
              </div>
              <div className="shrink-0 text-center sm:text-right">
                <p className="text-4xl font-extrabold tracking-tight text-[#0b3a86]">{t("pricingPage.registration.price")}</p>
                <p className="mt-1 text-xs font-medium text-[#4a4f63]">{t("pricingPage.registration.note")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="container mt-16 max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold text-[#0b3a86] sm:text-4xl">{t("pricingPage.packages.title")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#4a4f63]">{t("pricingPage.packages.subtitle")}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((pkg) => {
            const isDark = (pkg as { dark?: boolean }).dark;
            return (
              <div
                key={pkg.key}
                className={`relative flex flex-col rounded-3xl border ${pkg.border} bg-gradient-to-br ${pkg.gradient} p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg ${pkg.key === "standard" ? "ring-2 ring-[#9B2242]/30" : ""}`}
              >
                {/* Badge */}
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow ${pkg.key === "standard" ? "bg-[#9B2242]" : pkg.key === "silver" ? "bg-[#0b3a86]" : "bg-gradient-to-r from-[#b7791f] to-[#c8860a]"}`}>
                      {t(`pricingPage.packages.${pkg.badge}`)}
                    </span>
                  </div>
                )}

                {/* Name + Duration */}
                <div className="mb-4 mt-2">
                  <h3 className={`text-xl font-bold ${isDark ? "text-[#ffd97a]" : "text-[#0b3a86]"}`}>
                    {t(`pricingPage.packages.items.${pkg.key}.name`)}
                  </h3>
                  <p className={`mt-1 text-xs font-medium ${isDark ? "text-white/60" : "text-[#4a4f63]"}`}>
                    {t(`pricingPage.packages.duration.${pkg.durationKey}`)}
                  </p>
                  {pkg.key === "gold" && (
                    <p className="mt-1 text-xs font-semibold text-[#c8860a]">{t("pricingPage.packages.goldNote")}</p>
                  )}
                </div>

                {/* Price */}
                <div className={`rounded-2xl ${pkg.priceBg} px-4 py-4 text-center text-white mb-5`}>
                  <p className="text-3xl font-extrabold tracking-tight">
                    {t(`pricingPage.packages.items.${pkg.key}.price`)}
                  </p>
                  {t(`pricingPage.packages.items.${pkg.key}.afterReg`) && (
                    <p className="mt-1 text-xs text-white/80">
                      {t(`pricingPage.packages.items.${pkg.key}.afterReg`)} {t("pricingPage.packages.afterReg")}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2 mb-4">
                  {Array.from({ length: pkg.featuresCount }, (_, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-base text-emerald-500">✓</span>
                      <span className={`text-sm leading-snug ${isDark ? "text-white/85" : "text-[#2d3150]"}`}>
                        {t(`pricingPage.packages.items.${pkg.key}.features.${i}`)}
                      </span>
                    </li>
                  ))}
                  {Array.from({ length: pkg.missingCount }, (_, i) => (
                    <li key={`x-${i}`} className="flex items-start gap-2 opacity-40">
                      <span className="mt-0.5 shrink-0 text-base text-[#9B2242]">✗</span>
                      <span className={`text-sm leading-snug line-through ${isDark ? "text-white/60" : "text-[#4a4f63]"}`}>
                        {t(`pricingPage.packages.items.${pkg.key}.missing.${i}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full rounded-full font-semibold ${
                    pkg.key === "standard"
                      ? "bg-[#9B2242] text-white hover:bg-[#8a1e3b]"
                      : pkg.key === "gold"
                      ? "bg-gradient-to-r from-[#b7791f] to-[#c8860a] text-white hover:opacity-90"
                      : "bg-[#0b3a86] text-white hover:bg-[#0a357a]"
                  }`}
                >
                  <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
                    {t("pricingPage.hero.cta")}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Upgrade Paths ── */}
      <section className="container mt-16 max-w-5xl">
        <div className="rounded-3xl border border-[#0b3a86]/10 bg-gradient-to-br from-[#f5f8ff] to-white p-8 shadow-sm sm:p-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0b3a86]">{t("pricingPage.upgrade.title")}</h2>
              <p className="mt-1 text-[#4a4f63]">{t("pricingPage.upgrade.subtitle")}</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#0b3a86]/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#0b3a86]">
              Upgrade
            </span>
          </div>
          <div className="space-y-3">
            {upgradePaths.map((path, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-[#0b3a86]/10 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#0b3a86]">
                  <span className="rounded-full bg-[#0b3a86]/10 px-3 py-1">{path.from}</span>
                  <span className="text-[#9B2242]">→</span>
                  <span className="rounded-full bg-[#9B2242]/10 px-3 py-1 text-[#9B2242]">{path.to}</span>
                  <span className="hidden text-[#4a4f63] sm:inline">{t("pricingPage.upgrade.subtitle").split(".")[0]}</span>
                </div>
                <span className="text-lg font-extrabold text-[#9B2242]">
                  {t(`pricingPage.upgrade.paths.${i}.diff`)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl border border-[#9B2242]/15 bg-[#9B2242]/5 px-4 py-3 text-sm italic text-[#9B2242]">
            &ldquo;{t("pricingPage.upgrade.hikmah")}&rdquo;
          </p>
        </div>
      </section>

      {/* ── Hikmah / Why We Price This Way ── */}
      <section className="container mt-16 max-w-5xl">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-[#0b3a86] sm:text-4xl">{t("pricingPage.hikmah.title")}</h2>
          <p className="mt-2 text-[#4a4f63]">{t("pricingPage.hikmah.subtitle")}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: hikmahCount }, (_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#e6eaf5] bg-white p-6 shadow-sm"
            >
              <div className="mb-3 h-10 w-10 rounded-full bg-gradient-to-br from-[#0b3a86] to-[#9B2242] flex items-center justify-center text-white font-bold text-sm">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="text-lg font-semibold text-[#0b3a86]">{t(`pricingPage.hikmah.items.${i}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4a4f63]">{t(`pricingPage.hikmah.items.${i}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bonus Section ── */}
      <section className="container mt-10 max-w-5xl">
        <div className="flex flex-col gap-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
              {t("pricingPage.bonus.badge")}
            </span>
            <h2 className="text-2xl font-bold text-[#0b3a86]">{t("pricingPage.bonus.title")}</h2>
            <p className="text-sm text-[#4a4f63]">{t("pricingPage.bonus.desc")}</p>
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm italic text-emerald-700">
              &ldquo;{t("pricingPage.bonus.hikmah")}&rdquo;
            </p>
          </div>
          <div className="shrink-0 text-center sm:text-right">
            <p className="text-3xl font-extrabold tracking-tight text-emerald-600">{t("pricingPage.bonus.price")}</p>
            <p className="mt-1 text-xs font-medium text-[#4a4f63]">{t("pricingPage.bonus.note")}</p>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="container mt-16 max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b3a86] via-[#9B2242]/80 to-[#9B2242] px-8 py-12 text-center text-white shadow-2xl sm:px-12">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative space-y-4">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">{t("pricingPage.cta.title")}</h2>
            <p className="mx-auto max-w-xl text-white/85 text-lg leading-relaxed">{t("pricingPage.cta.subtitle")}</p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button asChild size="lg" className="rounded-full bg-white px-10 font-semibold text-[#9B2242] hover:bg-white/90 shadow-xl">
                <Link href={contactFormHref} target="_blank" rel="noopener noreferrer">
                  {t("pricingPage.cta.button")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/40 px-8 text-white hover:bg-white/10">
                <Link href="/faq">FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
