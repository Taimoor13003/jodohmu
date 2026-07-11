'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { analytics } from "@/lib/analytics";

const contactFormHref = "/register";
const whatsappHref = "https://wa.me/6281122210303";

const packageWhatsappHref = (name: string) =>
  `${whatsappHref}?text=${encodeURIComponent(`Halo, saya tertarik dengan paket ${name} dari Jodohmu. Boleh info lebih lanjut?`)}`;

type PkgConfig = {
  key: "awal" | "serius" | "istimewa";
  featuresCount: number;
  months: number;
  popular?: boolean;
  discount?: boolean;
};

const gemImage: Record<string, string> = {
  awal: "/pearl.png",
  serius: "/ruby.png",
  istimewa: "/diamond.png",
};

const packages: PkgConfig[] = [
  { key: "awal",      featuresCount: 7,  months: 3 },
  { key: "serius",    featuresCount: 11, months: 6,  popular: true },
  { key: "istimewa",  featuresCount: 13, months: 12 },
];


export function PricingPage() {
  const { t } = useLanguage();

  return (
    <div className="pb-24">

      {/* ══════════════════════════════════════
          MAY 50% DISCOUNT BANNER — UNMISSABLE
      ══════════════════════════════════════ */}
      <div className="w-full shadow-lg" style={{ background: '#19173A' }}>
        <div className="container flex flex-col items-center justify-between gap-2 py-2.5 sm:flex-row sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden shrink-0 rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white sm:inline-flex">
              {t("pricingPage.discount.badge")}
            </span>
            <p className="text-center text-xs font-bold leading-snug text-white sm:text-left sm:text-sm sm:font-extrabold">
              {t("pricingPage.discount.headline")}
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#9B2242] shadow-md hover:bg-white/90 sm:px-5 sm:text-sm">
            <Link href={contactFormHref} onClick={() => analytics.ctaClick('discount_banner', 'pricing')}>
              {t("pricingPage.discount.cta")}
            </Link>
          </Button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          HERO  (2-col: left text  |  right reg card)
      ══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden pt-14 pb-16"
        style={{
          backgroundImage: 'url(/pricing-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >

        <div className="container relative max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_420px]">

            {/* ── LEFT ── */}
            <div className="space-y-7">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8b4c0] bg-white/80 px-4 py-2 text-sm font-semibold text-[#9B2242]">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#9B2242]">
                  <path d="M10 3.22l-.61 2.034A9 9 0 006 6.22l-2.034-.61-.61 2.034 1.63 1.224a9.043 9.043 0 000 2.264L3.356 12.356l.61 2.034L6 13.78a9 9 0 003.39 1.566l.61 2.034h2l.61-2.034A9 9 0 0016 13.78l2.034.61.61-2.034-1.63-1.224a9.043 9.043 0 000-2.264l1.63-1.224-.61-2.034L16 6.22a9 9 0 00-3.39-1.566L12 2.61l-2 .61z"/>
                </svg>
                {t("pricingPage.hero.badge")}
              </span>

              {/* Title */}
              <div className="relative">
                {/* Sparkle */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="absolute -top-4 right-12 h-7 w-7 text-[#c9a06a] lg:right-0" style={{ filter: 'drop-shadow(0 0 4px rgba(201,160,106,0.5))' }}>
                  <path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/>
                </svg>
                <h1 className="font-serif text-5xl font-bold leading-tight text-[#0b1a3b] sm:text-6xl">
                  {t("pricingPage.hero.titleLine1")}
                </h1>
                <h1 className="font-serif text-5xl font-bold italic leading-tight text-[#c0566b] sm:text-6xl">
                  {t("pricingPage.hero.titleLine2")}
                </h1>
              </div>

              {/* Subtitle */}
              <div className="space-y-1 text-base text-[#3d3450] sm:text-lg">
                <p>{t("pricingPage.hero.subtitleLine1")}</p>
                <p>
                  {t("pricingPage.hero.subtitleLine2")}{" "}
                  <span className="font-semibold text-[#c0566b]">{t("pricingPage.hero.subtitleWords")}</span>
                </p>
              </div>

              {/* Trust indicators */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {([
                  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#9B2242]"><path d="M12 2l7 4v6c0 4.4-3.1 8.5-7 9.9C8.1 20.5 5 16.4 5 12V6l7-4z"/></svg>, titleKey: "pricingPage.hero.trust.0.title", descKey: "pricingPage.hero.trust.0.desc" },
                  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#9B2242]"><circle cx="12" cy="8" r="4"/><path d="M4 20v-1a8 8 0 0116 0v1"/></svg>, titleKey: "pricingPage.hero.trust.1.title", descKey: "pricingPage.hero.trust.1.desc" },
                  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-[#9B2242]"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>, titleKey: "pricingPage.hero.trust.2.title", descKey: "pricingPage.hero.trust.2.desc" },
                ] as const).map(({ icon, titleKey, descKey }, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-3 shadow-md">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fce8ed]">
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0b1a3b]">{t(titleKey)}</p>
                      <p className="text-xs text-[#6b6070]">{t(descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#e8a0b4]/50 bg-[#fce8ed]/60 px-5 py-4 shadow-sm w-fit">
                {/* Stacked avatar circles */}
                <div className="flex -space-x-2">
                  {["#f4c2c2","#c2d4f4","#c2f4d4","#f4e2c2"].map((c, i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white" style={{ background: c, zIndex: 4 - i }} />
                  ))}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#9B2242] text-[10px] font-bold text-white" style={{ zIndex: 0 }}>
                    {t("pricingPage.hero.socialCount")}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[#0b1a3b]">{t("pricingPage.hero.socialCount")} {t("pricingPage.hero.socialTitle")}</p>
                  <p className="text-xs text-[#6b6070]">{t("pricingPage.hero.socialDesc")}</p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Registration Fee card ── */}
            <div className="w-full">
              {/* Thin gradient border */}
              <div
                  className="reg-card-gradient-border px-9 py-10"
                >
                  {/* Icon */}
                  <Image src="/registration_icon_hero.png" alt="" width={52} height={52} className="mx-auto mb-4 h-13 w-13 object-contain" style={{ mixBlendMode: 'multiply' }} />

                  {/* Title */}
                  <h2 className="text-center font-serif text-[2rem] font-bold leading-tight text-[#0b1535]">
                    {t("pricingPage.registration.title")}
                  </h2>

                  {/* Heart ornament */}
                  <div className="my-3 flex items-center justify-center gap-3">
                    <span className="h-px w-8 bg-[#b85470]/60" />
                    <svg viewBox="0 0 20 18" fill="none" stroke="#b85470" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M10 17S1 11 1 5.5A4.5 4.5 0 0110 2a4.5 4.5 0 019 3.5C19 11 10 17 10 17z"/>
                    </svg>
                    <span className="h-px w-8 bg-[#b85470]/60" />
                  </div>

                  {/* Subtitle */}
                  <p className="text-center text-sm text-[#2e2a3a]">
                    {t("pricingPage.registration.cardSubtitle")}{" "}
                    <span className="font-semibold text-[#b85470]">{t("pricingPage.registration.cardSubtitleHighlight")}</span>
                  </p>

                  {/* Price */}
                  <div className="my-6 flex items-baseline justify-center gap-2">
                    <span className="font-serif text-[1.6rem] font-bold text-[#0b1535]">Rp</span>
                    <span className="font-serif text-[5.5rem] font-extrabold leading-none tracking-tight text-[#b85470]">500k</span>
                  </div>

                  {/* Features */}
                  <ul className="mb-8 divide-y divide-[#0b1535]/8">
                    {Array.from({ length: 5 }, (_, i) => (
                      <li key={i} className="flex items-center gap-3 py-3">
                        <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px] shrink-0">
                          <circle cx="12" cy="12" r="10" stroke="#b85470" strokeWidth="1.4"/>
                          <path d="M7.5 12l3 3 5-5" stroke="#b85470" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[15px] font-medium text-[#0b1535]">{t(`pricingPage.registration.cardFeatures.${i}`)}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <Button
                    asChild
                    className="w-full rounded-full py-[22px] text-[17px] font-serif font-bold tracking-wide text-white hover:opacity-95"
                    style={{ background: 'linear-gradient(90deg, #0b1535 0%, #1a1050 100%)', boxShadow: '0 4px 24px rgba(11,21,53,0.35)' }}
                  >
                    <Link href={contactFormHref} onClick={() => analytics.ctaClick('hero_reg_card', 'pricing')}>
                      <span className="flex w-full items-center px-1">
                        <span className="flex-1 text-center">{t("pricingPage.registration.cardCta")}</span>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#d4849c]/60 bg-[#b85470]">
                          <svg viewBox="0 0 20 18" fill="white" className="h-4 w-4">
                            <path d="M10 17S1 11 1 5.5A4.5 4.5 0 0110 2a4.5 4.5 0 019 3.5C19 11 10 17 10 17z"/>
                          </svg>
                        </span>
                      </span>
                    </Link>
                  </Button>

                  {/* Footer */}
                  <p className="mt-5 flex items-center justify-center gap-2 text-center text-[13px] text-[#2e2a3a]/60">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
                    </svg>
                    {t("pricingPage.registration.cardFooter")}
                  </p>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════
          PACKAGES
      ══════════════════ */}
      <section
        className="relative mt-16 overflow-hidden w-full py-16"
        style={{ backgroundImage: 'url(/Gemini_Generated_Image_unhb78unhb78unhb.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >

        <div className="relative container mx-auto max-w-7xl px-6 sm:px-10">
          {/* Header */}
          <div className="mb-12 text-center">
            <h2 className="font-serif text-4xl font-bold text-[#0b3a86] sm:text-5xl">
              {(() => {
                const title = t("pricingPage.packages.title");
                const highlight = t("pricingPage.packages.titleHighlight");
                const parts = title.split(highlight);
                return <>{parts[0]}<em className="italic text-[#9B2242] not-italic">{highlight}</em>{parts[1]}</>;
              })()}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#6b5060] whitespace-pre-line sm:text-base">
              {t("pricingPage.packages.subtitle")}
            </p>
          </div>

          {/* Cards — pt-6 so the floating badge on Ruby isn't clipped */}
          <div className="grid gap-6 pt-6 md:gap-4 md:grid-cols-3 md:items-stretch">
            {packages.map((pkg) => {
              const { popular, discount } = pkg;

              return (
                <div
                  key={pkg.key}
                  className={`relative flex flex-col rounded-2xl transition-all duration-300 ${
                    popular
                      ? "border-2 border-[#e8b4c0]/80 p-8"
                      : "border border-[#e8d4da]/80 bg-white shadow-lg hover:-translate-y-1 p-7"
                  }`}
                  style={popular ? {
                    background: 'radial-gradient(ellipse at 50% 30%, #ffffff 15%, #fff5f8 55%, #fde8ef 100%)',
                    outline: '1px solid rgba(232,180,192,0.55)',
                    outlineOffset: '4px',
                    boxShadow: '0 8px 32px rgba(181,98,122,0.18), 0 2px 8px rgba(181,98,122,0.10)',
                  } : undefined}
                >
                  {/* Most Popular badge — floating above top border */}
                  {popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#b5627a] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-md whitespace-nowrap">
                        <svg viewBox="0 0 18 14" fill="currentColor" className="h-3 w-3.5 shrink-0">
                          <path d="M1 14L3.5 5L7.5 9.5L9 1L10.5 9.5L14.5 5L17 14H1Z" />
                        </svg>
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Gem image */}
                  <div className={`mx-auto mb-5 mt-4 flex h-24 w-24 items-center justify-center rounded-full shadow-sm ${
                    popular ? "bg-[#fce8ed]" : "bg-[#f0ede8]"
                  }`}>
                    <Image
                      src={gemImage[pkg.key]}
                      alt={t(`pricingPage.packages.items.${pkg.key}.name`)}
                      width={68}
                      height={68}
                      className="h-16 w-16 object-contain drop-shadow-lg"
                    />
                  </div>

                  {/* Name */}
                  <h3 className={`text-center font-serif text-[2rem] font-bold ${popular ? "italic text-[#8b3a52]" : "text-[#1a0a14]"}`}>
                    {t(`pricingPage.packages.items.${pkg.key}.name`)}
                  </h3>

                  {/* Tagline */}
                  {t(`pricingPage.packages.items.${pkg.key}.tagline`) && (
                    <p className="mt-1 text-center text-[13px] italic text-[#b85470]/80">
                      {t(`pricingPage.packages.items.${pkg.key}.tagline`)}
                    </p>
                  )}

                  {/* Duration pill */}
                  <div className="mt-2 flex justify-center">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                      popular
                        ? "bg-[#f5d0d8] text-[#8b3a52]"
                        : "bg-[#eee9e4] text-[#6b5a4e]"
                    }`}>
                      {pkg.months} months
                    </span>
                  </div>

                  {/* Gold divider */}
                  <div className="my-3 flex items-center justify-center gap-2">
                    <span className="h-px w-10 bg-[#c9a227]/45" />
                    <span className="text-[#c9a227] text-xs">⚘</span>
                    <span className="h-px w-10 bg-[#c9a227]/45" />
                  </div>

                  {/* Price */}
                  <div className="mb-2 text-center">
                    <div className={`text-[2.5rem] font-extrabold leading-none sm:text-5xl ${popular ? "italic text-[#8b3a52]" : "text-[#1a0a14]"}`}>
                      {discount ? t(`pricingPage.packages.items.${pkg.key}.discountedPrice`) : t(`pricingPage.packages.items.${pkg.key}.price`)}
                    </div>
                    {discount && (
                      <div className="mt-1.5 text-sm text-gray-400 line-through">
                        {t(`pricingPage.packages.items.${pkg.key}.price`)}
                      </div>
                    )}
                  </div>

                  {/* Dashed divider */}
                  <div className={`mb-6 mt-4 border-b border-dashed ${popular ? "border-[#e8b4c0]/60" : "border-[#e0c8cc]/70"}`} />

                  {/* Features */}
                  <ul className="flex-1 space-y-2.5 mb-7">
                    {Array.from({ length: pkg.featuresCount }, (_, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold border ${
                          popular
                            ? "border-[#b5627a] text-[#b5627a]"
                            : "border-[#9B2242] text-[#9B2242]"
                        }`}>
                          ✓
                        </span>
                        <span className="text-sm text-[#4a3545] leading-relaxed">
                          {t(`pricingPage.packages.items.${pkg.key}.features.${i}`)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    asChild
                    className={`w-full rounded-full py-6 font-bold text-base transition-all hover:opacity-90 ${
                      popular
                        ? "text-white"
                        : "bg-[#0b3a86] text-white shadow-md hover:bg-[#0a357a]"
                    }`}
                    style={popular ? {
                      background: 'linear-gradient(180deg, #c97888 0%, #a85a6a 100%)',
                      boxShadow: '0 6px 20px rgba(168,90,106,0.38)',
                    } : undefined}
                  >
                    <Link
                      href={packageWhatsappHref(t(`pricingPage.packages.items.${pkg.key}.name`))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => analytics.whatsappClick(`package_${pkg.key}`)}
                    >
                      {discount ? t("pricingPage.discount.cta") : t("pricingPage.discount.ctaNoDiscount")}
                    </Link>
                  </Button>

                </div>
              );
            })}
          </div>

          {/* ══════════════════════════
              SPECIAL PROMOS — same bg
          ══════════════════════════ */}
          <div className="mt-14 mx-auto max-w-5xl">
            {/* Single card — 3-column: item | title | item */}
            <div className="rounded-3xl border border-[#e8d4da]/80 bg-white shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[#e8d4da]/60">

                {/* Student */}
                <div className="flex items-center gap-5 p-8">
                  <div className="shrink-0 flex h-20 w-20 items-center justify-center rounded-full bg-[#f9e8ed]">
                    <Image src="/hat-icon.png" alt="" width={64} height={64} className="h-16 w-16 object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a0a14] mb-1.5">{t("pricingPage.special.student.title")}</h3>
                    <p className="text-sm text-[#4a4f63] leading-relaxed">
                      {t("pricingPage.special.student.desc").split("10%").map((part, i, arr) =>
                        i < arr.length - 1
                          ? <span key={i}>{part}<span className="font-bold text-[#9B2242]">10%</span></span>
                          : <span key={i}>{part}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Center title */}
                <div className="flex flex-col items-center justify-center gap-1 px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[#9B2242]/50 text-sm">→</span>
                    <span className="font-serif text-xl font-bold text-[#9B2242] whitespace-nowrap">{t("pricingPage.special.title")}</span>
                    <span className="text-[#9B2242]/50 text-sm">←</span>
                  </div>
                  <span className="text-[#c9a06a] text-xs">♥</span>
                </div>

                {/* Re-marriage */}
                <div className="flex items-center gap-5 p-8">
                  <div className="shrink-0 flex h-20 w-20 items-center justify-center rounded-full bg-[#f9e8ed]">
                    <Image src="/remary-icon.png" alt="" width={64} height={64} className="h-16 w-16 object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a0a14] mb-1.5">{t("pricingPage.special.widow.title")}</h3>
                    <p className="text-sm text-[#4a4f63] leading-relaxed">
                      {t("pricingPage.special.widow.desc").split("10%").map((part, i, arr) =>
                        i < arr.length - 1
                          ? <span key={i}>{part}<span className="font-bold text-[#9B2242]">10%</span></span>
                          : <span key={i}>{part}</span>
                      )}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer note */}
            <p className="mt-6 text-center text-xs font-medium text-[#5a4f56]">
              {t("pricingPage.packages.footerNote")}
            </p>

            {/* International callout */}
            <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#1630a0]/20 bg-[#0b1535]/5 px-7 py-5 sm:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0b1535] text-white text-lg">
                  ✈️
                </div>
                <div>
                  <p className="font-bold text-[#0b1535]">Based outside Indonesia?</p>
                  <p className="text-sm text-[#5a4f56]">We have dedicated international packages in English — Safar & Amanah — for Muslims abroad seeking an Indonesian spouse.</p>
                </div>
              </div>
              <Link
                href="/pricing/international"
                className="shrink-0 rounded-full bg-[#0b1535] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1630a0]"
              >
                View International Pricing →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════
          HIKMAH — WHY WE PRICE
      ══════════════════════ */}
      <section
        className="relative overflow-hidden py-20"
        style={{ backgroundColor: '#faf6f0' }}
      >
        <div className="container relative max-w-7xl">
          {/* Header */}
          <div className="mb-14 text-center">
            <h2 className="font-serif text-4xl font-bold text-[#1a1612] sm:text-5xl">
              {t("pricingPage.hikmah.title")}
            </h2>
            {/* Ornamental divider */}
            <div className="my-4 flex items-center justify-center gap-3">
              <span className="h-px w-14 bg-[#c9a06a]/50" />
              <svg viewBox="0 0 14 14" fill="currentColor" className="h-3 w-3 text-[#c9a06a]">
                <path d="M7 0l1.5 5.5L14 7l-5.5 1.5L7 14l-1.5-5.5L0 7l5.5-1.5z"/>
              </svg>
              <span className="h-px w-14 bg-[#c9a06a]/50" />
            </div>
            <p className="text-sm text-[#6b6050] sm:text-base">{t("pricingPage.hikmah.subtitle")}</p>
          </div>

          {/* Cards */}
          <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
            {[
              "/dignity_icon.png",
              "/transparency_icon.png",
              "/human_led_icon.png",
            ].map((iconSrc, i) => (
              <div
                key={i}
                className="relative flex flex-col overflow-hidden rounded-2xl border border-[#e8ddd2] bg-white shadow-md"
              >
                {/* Watermark number */}
                <div
                  className="absolute top-0 right-4 select-none pointer-events-none font-serif font-extrabold leading-none"
                  style={{ fontSize: '130px', color: 'rgba(201,160,106,0.11)', lineHeight: 1 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                {/* Card content */}
                <div className="relative flex flex-col flex-1 p-16">
                  {/* Icon circle */}
                  <div className="relative z-10 mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0ebe4] border border-[#e0d5c8]">
                    <Image src={iconSrc} alt="" width={52} height={52} className="h-13 w-13 object-contain" />
                  </div>
                  {/* Gold divider */}
                  <div className="mb-8 h-px w-full bg-[#c9a06a]/40" />
                  {/* Title */}
                  <h3 className="mb-5 font-serif text-[1.65rem] font-bold leading-snug text-[#1a1612]">
                    {t(`pricingPage.hikmah.items.${i}.title`)}
                  </h3>
                  {/* Desc */}
                  <p className="text-base leading-relaxed text-[#6b6050]">
                    {t(`pricingPage.hikmah.items.${i}.desc`)}
                  </p>
                </div>
              </div>
            ))}
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
                <Link href={contactFormHref} onClick={() => analytics.ctaClick('bottom_cta', 'pricing')}>
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
