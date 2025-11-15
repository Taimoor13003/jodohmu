"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Mail, Phone, Info, Heart, Smartphone } from "lucide-react";
import LogoIcon from "@/assets/jodohmu-logo.png";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-white text-brand-blue">
      <div className="h-1 w-full bg-gradient-to-r from-brand-rose to-brand-blue" />
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <Image src={LogoIcon} alt="Jodohmu" className="h-20 w-auto" />
            <p className="text-sm text-brand-blue/80 max-w-sm">
              {t("footer.hero.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-brand-blue">{t("footer.quickLinks.title")}</h3>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <Link href="#" className="hover:text-brand-rose transition-colors">{t("footer.quickLinks.about")}</Link>
              <Link href="#" className="hover:text-brand-rose transition-colors">{t("footer.quickLinks.howItWorks")}</Link>
              <Link href="#" className="hover:text-brand-rose transition-colors">{t("footer.quickLinks.pricing")}</Link>
              <Link href="/privacy" className="hover:text-brand-rose transition-colors">{t("footer.quickLinks.privacy")}</Link>
              <Link href="/terms" className="hover:text-brand-rose transition-colors">{t("footer.quickLinks.terms")}</Link>
            </div>
          </div>

          {/* Connect With Us */}
          <div className="space-y-4">
            <h3 className="font-bold text-brand-blue">{t("footer.connect.title")}</h3>
            <p className="text-sm text-brand-blue/80">
              {t("footer.connect.description")}
            </p>
            <div className="flex flex-col gap-3 text-sm font-medium">
              <a href="mailto:info@jodohmu.com" className="flex items-center gap-3 hover:text-brand-rose transition-colors">
                <Mail className="h-5 w-5" />
                <span>{t("footer.connect.email")}</span>
              </a>
              <a href="tel:+6281327054561" className="flex items-center gap-3 hover:text-brand-rose transition-colors">
                <Phone className="h-5 w-5" />
                <span>{t("footer.connect.phone")}</span>
              </a>
              <a href="https://wa.me/6281327054561" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-brand-rose transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M16.75 13.96c.25.42.43.88.54 1.36-1.1.27-2.3.4-3.54.4-4.68 0-8.5-3.82-8.5-8.5s3.82-8.5 8.5-8.5 8.5 3.82 8.5 8.5c0 1.96-.67 3.73-1.77 5.14l2.58 2.58-2.58-2.58zm-3.3-5.43c-.28-.14-1.68-.82-1.94-.91-.26-.09-.44-.09-.62.09-.18.18-.7.82-.85.99-.15.17-.3.19-.55.12-.25-.07-1.03-.38-1.96-1.21-.73-.64-1.22-1.44-1.4-1.68-.18-.24-.02-.37.15-.51.15-.12.33-.31.5-.42.17-.11.22-.19.33-.31.11-.12.1-.26-.04-.38-.14-.12-.62-1.5-1.7-2.04-.2-.1-.4-.15-.6-.15h-.5c-.25 0-.5.07-.75.31-.25.24-1.03 1.03-1.03 2.51 0 1.48 1.05 2.91 1.2 3.12.15.21 2.02 3.17 4.95 4.35.73.3 1.29.48 1.74.62.69.21 1.32.18 1.83.11.57-.08 1.68-.69 1.92-1.36.24-.67.24-1.24.17-1.36-.07-.12-.25-.19-.53-.33z" />
                </svg>
                <span>{t("footer.connect.whatsapp")}</span>
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-blue">Follow Us</h3>
            <div className="flex items-center gap-3">
              <Link href="https://web.facebook.com/profile.php?id=61583458260206" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-rose/10 hover:text-brand-rose transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/cari_jodoh_kamu/" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-rose/10 hover:text-brand-rose transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-rose/10 hover:text-brand-rose transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-blue/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs font-medium text-brand-blue/60 sm:flex-row sm:text-sm">
          <p className="flex items-center gap-2">
            <span>{t("footer.subfooter.copyright", { year })}</span>
            <span>•</span>
            <span>{t("footer.subfooter.rights")}</span>
          </p>
          <p className="flex items-center gap-1">
            <span>{t("footer.subfooter.crafted")}</span>
            <Heart className="h-4 w-4 text-brand-rose" />
            <span>{t("footer.subfooter.andFaith")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
