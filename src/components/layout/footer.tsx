"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, FileText, Shield, Info, Heart, MessageCircle } from "lucide-react";
import LogoIcon from "@/assets/jodohmu-icon-logo.png";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="w-full text-white">
      <div className="h-1 w-full" style={{ backgroundImage: "linear-gradient(to right, #9B2242, #0b3a86)" }} />
      <div className="bg-[#0b3a86]" style={{ backgroundImage: "linear-gradient(to bottom, rgba(11,58,134,0.96), rgba(11,58,134,0.86))" }}>
        <div className="container py-12">
          <div className="grid gap-10 lg:grid-cols-3 items-start">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Image src={LogoIcon} alt="Jodohmu" className="h-9 w-auto" />
                <div className="ml-2 flex items-baseline">
                  <span className="text-2xl font-bold">Jodoh</span>
                  <span className="text-2xl font-bold" style={{ color: "#ffd7e2" }}>mu</span>
                </div>
              </div>
              <p className="text-white/80 text-sm max-w-sm">
                {t("footer.hero.tagline")}
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 text-sm">
              <Link href="#" className="hover:text-[#ffd7e2] hover:underline underline-offset-4 decoration-[#ffd7e2] transition-colors">{t("footer.quickLinks.about")}</Link>
              <span className="hidden sm:block text-white/20">•</span>
              <Link href="#" className="hover:text-[#ffd7e2] hover:underline underline-offset-4 decoration-[#ffd7e2] transition-colors">{t("footer.quickLinks.howItWorks")}</Link>
              <span className="hidden sm:block text-white/20">•</span>
              <Link href="#" className="hover:text-[#ffd7e2] hover:underline underline-offset-4 decoration-[#ffd7e2] transition-colors">{t("footer.quickLinks.pricing")}</Link>
              <span className="hidden sm:block text-white/20">•</span>
              <Link href="/privacy" className="hover:text-[#ffd7e2] hover:underline underline-offset-4 decoration-[#ffd7e2] transition-colors">{t("footer.quickLinks.privacy")}</Link>
              <span className="hidden sm:block text-white/20">•</span>
              <Link href="/terms" className="hover:text-[#ffd7e2] hover:underline underline-offset-4 decoration-[#ffd7e2] transition-colors">{t("footer.quickLinks.terms")}</Link>
            </div>

            {/* Social */}
            <div className="flex items-center lg:justify-end gap-3">
              <Link href="https://web.facebook.com/profile.php?id=61583458260206" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/10 hover:ring-[#9B2242]/40 transition">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/cari_jodoh_kamu/" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/10 hover:ring-[#9B2242]/40 transition">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/10 hover:ring-[#9B2242]/40 transition">
                <Twitter className="h-5 w-5" />
              </Link>
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
