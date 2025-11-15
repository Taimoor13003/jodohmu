"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, FileText, Shield, Info, Heart, MessageCircle } from "lucide-react";
import LogoIcon from "@/assets/jodohmu-logo.png";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#fde4ec] via-[#f9c7d7] to-[#f2a5c3] text-[#0b3a86]">
      <div className="h-1 w-full bg-gradient-to-r from-[#9B2242] via-[#f18aa7] to-[#0b3a86]" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-white/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-[#f18aa7]/30 blur-[140px]" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      </div>
      <div className="container relative z-10 py-16 sm:py-20">
        <div className="grid gap-12 xl:gap-16 lg:grid-cols-[1.45fr_1fr] items-start">
          <div className="flex flex-col gap-8 rounded-[32px] border border-white/50 bg-white/65 p-8 md:p-10 shadow-2xl shadow-[#f18aa7]/25 backdrop-blur-2xl">
            <div className="flex flex-col items-center md:items-start gap-6">
              <Image src={LogoIcon} alt="Jodohmu" className="h-[80px] sm:h-[75px] w-auto drop-shadow-2xl" />
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-semibold leading-tight">
                  {t("footer.hero.tagline")}
                </h2>
                <p className="text-base md:text-lg font-medium leading-relaxed text-[#0b3a86]/80">
                  {t("footer.hero.description")}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 text-center shadow-sm shadow-[#f18aa7]/20">
                <Heart className="mx-auto h-6 w-6 text-[#9B2242]" />
                <p className="mt-3 text-sm font-semibold">{t("footer.badges.community")}</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 text-center shadow-sm shadow-[#f18aa7]/20">
                <Shield className="mx-auto h-6 w-6 text-[#0b3a86]" />
                <p className="mt-3 text-sm font-semibold">{t("footer.badges.safety")}</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/75 p-4 text-center shadow-sm shadow-[#f18aa7]/20">
                <Info className="mx-auto h-6 w-6 text-[#9B2242]" />
                <p className="mt-3 text-sm font-semibold">{t("footer.badges.support")}</p>
              </div>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center justify-center self-center md:self-start rounded-full bg-gradient-to-r from-[#9B2242] via-[#c9365d] to-[#0b3a86] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0b3a86]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3a86]/40 focus-visible:ring-offset-2"
            >
              {t("footer.hero.cta")}
            </Link>
          </div>
          <div className="grid gap-6">
            <div className="rounded-3xl border border-white/55 bg-white/70 p-6 md:p-8 shadow-xl shadow-[#f18aa7]/15 backdrop-blur-xl">
              <h3 className="text-xl font-semibold">{t("footer.quickLinks.title")}</h3>
              <div className="mt-5 grid grid-cols-1 gap-3 text-base font-medium">
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[#0b3a86] transition-all duration-200 hover:bg-white hover:shadow-sm"
                >
                  <Info className="h-4 w-4" />
                  {t("footer.quickLinks.about")}
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[#0b3a86] transition-all duration-200 hover:bg-white hover:shadow-sm"
                >
                  <Heart className="h-4 w-4 text-[#9B2242]" />
                  {t("footer.quickLinks.howItWorks")}
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[#0b3a86] transition-all duration-200 hover:bg-white hover:shadow-sm"
                >
                  <Info className="h-4 w-4" />
                  {t("footer.quickLinks.pricing")}
                </Link>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[#0b3a86] transition-all duration-200 hover:bg-white hover:shadow-sm"
                >
                  <Shield className="h-4 w-4" />
                  {t("footer.quickLinks.privacy")}
                </Link>
                <Link
                  href="/terms"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[#0b3a86] transition-all duration-200 hover:bg-white hover:shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  {t("footer.quickLinks.terms")}
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-white/55 bg-white/70 p-6 md:p-8 shadow-xl shadow-[#f18aa7]/15 backdrop-blur-xl">
              <h3 className="text-xl font-semibold">{t("footer.connect.title")}</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[#0b3a86]/75">
                {t("footer.connect.description")}
              </p>
              <div className="mt-5 flex items-center justify-start gap-4">
                <Link
                  href="#"
                  className="group inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/75 shadow-sm shadow-[#f18aa7]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#9B2242] hover:to-[#0b3a86]"
                >
                  <Facebook className="h-5 w-5 text-[#0b3a86] transition-colors group-hover:text-white" />
                </Link>
                <Link
                  href="#"
                  className="group inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/75 shadow-sm shadow-[#f18aa7]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#9B2242] hover:to-[#0b3a86]"
                >
                  <Instagram className="h-5 w-5 text-[#0b3a86] transition-colors group-hover:text-white" />
                </Link>
                <Link
                  href="#"
                  className="group inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/75 shadow-sm shadow-[#f18aa7]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#9B2242] hover:to-[#0b3a86]"
                >
                  <Twitter className="h-5 w-5 text-[#0b3a86] transition-colors group-hover:text-white" />
                </Link>
                <Link
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 bg-white/75 shadow-sm shadow-[#f18aa7]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-[#9B2242] hover:to-[#0b3a86]"
                >
                  <MessageCircle className="h-5 w-5 text-[#0b3a86] transition-colors group-hover:text-white" />
                </Link>
              </div>
              <div className="mt-6 space-y-2 text-sm font-semibold text-[#0b3a86]/80">
                <p>
                  {t("footer.connect.email")}: <a className="underline decoration-[#9B2242]/40 underline-offset-4 hover:text-[#9B2242]" href="mailto:info@jodohmu.id">info@jodohmu.id</a>
                </p>
                <p>
                  {t("footer.connect.phone")}: <a className="underline decoration-[#9B2242]/40 underline-offset-4 hover:text-[#9B2242]" href="tel:+6281234567890">+62 812-3456-7890</a>
                </p>
                <p>
                  {t("footer.connect.whatsapp")}: <a className="underline decoration-[#9B2242]/40 underline-offset-4 hover:text-[#9B2242]" href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">+62 812-3456-7890</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/60 bg-white/25 backdrop-blur-xl">
        <div className="container flex flex-col items-center justify-between gap-2 py-3 text-xs font-medium text-[#0b3a86]/85 sm:flex-row sm:text-sm">
          <p className="flex items-center gap-2">
            <span>{t("footer.subfooter.copyright", { year })}</span>
            <span>•</span>
            <span>{t("footer.subfooter.rights")}</span>
          </p>
          <p className="flex items-center gap-1">
            <span>{t("footer.subfooter.crafted")}</span>
            <Heart className="h-4 w-4 text-[#9B2242]" />
            <span>{t("footer.subfooter.andFaith")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
