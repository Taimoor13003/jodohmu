'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const whatsappHref = "https://wa.me/6281122210303";
const pointKeys = ["0", "1", "2", "3"];
const stepKeys = ["0", "1", "2", "3", "4"];
const handleKeys = ["0", "1", "2", "3"];
const benefitKeys = ["0", "1", "2"];

type ArticleDetailProps = {
  articleKey: string;
};

export function ArticleDetail({ articleKey }: ArticleDetailProps) {
  const { t } = useLanguage();

  return (
    <div className="pb-24 pt-16">
      <section className="container max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-[#e6eaf5] bg-gradient-to-br from-[#fef6f9] via-white to-[#eaf1ff] px-8 py-12 shadow-sm sm:px-12">
          <div className="absolute inset-0 pointer-events-none" aria-hidden />
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#ffe4ed] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#9B2242]">
                {t(`${articleKey}.tag`)} • {t(`${articleKey}.heroBadge`)}
              </div>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-[#0b3a86] sm:text-5xl">
                {t(`${articleKey}.title`)}
              </h1>
              <p className="text-lg text-[#3d425a]">{t(`${articleKey}.subtitle`)}</p>
              <p className="text-base text-[#2d3150]">{t(`${articleKey}.heroLead`)}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild size="lg" className="bg-[#0b3a86] text-white hover:bg-[#0a357a]">
                  <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    {t(`${articleKey}.ctaPrimary`)}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-[#9B2242] text-[#9B2242] hover:bg-[#9B2242]/5">
                  <Link href="/blog">{t(`${articleKey}.ctaSecondary`)}</Link>
                </Button>
              </div>
            </div>
            <div className="relative w-full max-w-sm">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-[#0b3a86] via-[#9B2242] to-[#fbcfe8] shadow-lg ring-4 ring-white/50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.35),transparent_45%)]" />
              </div>
              <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-white/80 blur-xl" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto mt-12 max-w-5xl space-y-8">
        <div className="rounded-2xl border border-[#e6eaf5] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#0b3a86]">{t(`${articleKey}.whyTitle`)}</h2>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-[#9B2242]">
            {t(`${articleKey}.heroBadge`)}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {pointKeys.map((idx) => (
              <div key={idx} className="rounded-xl border border-[#eef1fa] bg-[#f9fbff] px-4 py-3 text-[#3d425a] shadow-[0_6px_18px_-10px_rgba(11,58,134,0.35)]">
                {t(`${articleKey}.points.${idx}`)}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e6eaf5] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#0b3a86]">{t(`${articleKey}.flowTitle`)}</h2>
              <p className="mt-1 text-[#4a4f63]">{t(`${articleKey}.flowIntro`)}</p>
            </div>
            <span className="rounded-full bg-[#e9f0ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#0b3a86]">
              {t(`${articleKey}.heroBadge`)}
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {stepKeys.map((idx, i) => (
              <div
                key={idx}
                className="flex gap-4 rounded-xl border border-[#eef1fa] bg-[#fdfdff] p-4 shadow-[0_6px_18px_-12px_rgba(0,0,0,0.3)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b3a86] text-lg font-semibold text-white">
                  {i + 1}
                </div>
                <p className="flex-1 text-[#3d425a] leading-relaxed">{t(`${articleKey}.steps.${idx}`)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[2fr,1fr]">
            <p className="rounded-2xl bg-[#0b3a86] px-5 py-4 text-white shadow-lg">{t(`${articleKey}.scenario`)}</p>
            <div className="relative h-full min-h-[200px] overflow-hidden rounded-2xl border border-[#e6eaf5] bg-gradient-to-br from-[#fef3f8] via-white to-[#eaf1ff]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(155,34,66,0.08),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(11,58,134,0.1),transparent_50%)]" />
              <div className="absolute inset-4 rounded-xl border border-white/60 bg-white/70 shadow-inner backdrop-blur">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,58,134,0.15),rgba(155,34,66,0.15))]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-2xl border border-[#e6eaf5] bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#0b3a86]">{t(`${articleKey}.whatWeHandleTitle`)}</h2>
            <div className="mt-5 space-y-3">
              {handleKeys.map((idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-[#eef1fa] bg-[#f9fbff] px-4 py-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-[#9B2242]" />
                  <p className="text-[#3d425a] leading-relaxed">{t(`${articleKey}.whatWeHandle.${idx}`)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#0b3a86]/10 bg-gradient-to-br from-[#0b3a86] via-[#113f8f] to-[#9B2242] p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold">{t(`${articleKey}.facilitationTitle`)}</h3>
            <p className="mt-3 text-white/90 leading-relaxed">{t(`${articleKey}.facilitationBody`)}</p>
            <div className="mt-6 h-px w-full bg-white/20" />
            <h3 className="mt-4 text-lg font-semibold">{t(`${articleKey}.pricingTitle`)}</h3>
            <p className="mt-3 text-white/90 leading-relaxed">{t(`${articleKey}.pricingBody`)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e6eaf5] bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#0b3a86]">{t(`${articleKey}.benefitsTitle`)}</h2>
              <p className="text-[#4a4f63]">{t(`${articleKey}.heroLead`)}</p>
            </div>
            <div className="rounded-full bg-[#ffe4ed] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9B2242]">
              Guided & family-ready
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {benefitKeys.map((idx) => (
              <div key={idx} className="h-full rounded-xl border border-[#eef1fa] bg-[#fdfdff] p-4 shadow-[0_6px_18px_-12px_rgba(0,0,0,0.25)]">
                <h4 className="text-lg font-semibold text-[#0b3a86]">{t(`${articleKey}.benefits.${idx}.title`)}</h4>
                <p className="mt-2 text-sm text-[#3d425a] leading-relaxed">{t(`${articleKey}.benefits.${idx}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#e6eaf5] bg-gradient-to-r from-[#0b3a86] to-[#9B2242] px-8 py-10 text-white shadow-lg">
          <div className="flex flex-col gap-4 text-left md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">{t(`${articleKey}.tag`)}</p>
              <h2 className="text-3xl font-semibold">{t(`${articleKey}.ctaTitle`)}</h2>
              <p className="text-white/85 leading-relaxed">{t(`${articleKey}.ctaBody`)}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-[#0b3a86] hover:bg-white/90">
                <Link href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  {t(`${articleKey}.ctaPrimary`)}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white bg-white text-[#0b3a86] hover:bg-white/90"
              >
                <Link href="/blog">{t(`${articleKey}.ctaSecondary`)}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
