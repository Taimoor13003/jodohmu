"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone, Heart, Youtube } from "lucide-react";
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
            <Image src={LogoIcon} alt="Jodohmu" className="h-16 w-auto" />
            <p className="text-sm font-medium text-brand-blue/80 max-w-sm">
              {t("footer.hero.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-brand-blue">{t("footer.quickLinks.title")}</h3>
            <div className="flex flex-col gap-2 text-sm font-semibold">
              <Link href="/privacy" className="hover:text-brand-rose transition-colors">{t("footer.quickLinks.privacy")}</Link>
              <Link href="/terms" className="hover:text-brand-rose transition-colors">{t("footer.quickLinks.terms")}</Link>
            </div>
          </div>

          {/* Connect With Us */}
          <div className="space-y-4">
            <h3 className="font-bold text-brand-blue">{t("footer.connect.title")}</h3>
            <p className="text-sm font-medium text-brand-blue/80">
              {t("footer.connect.description")}
            </p>
            <div className="flex flex-col gap-3 text-sm font-semibold">
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
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.439-9.892-9.892-9.892-5.452 0-9.887 4.434-9.889 9.889-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.794.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>{t("footer.connect.whatsapp")}</span>
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-bold text-brand-blue">Follow Us</h3>
            <div className="flex items-center gap-3">
              <Link href="https://www.facebook.com/profile.php?id=61583458260206" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-rose/10 hover:text-brand-rose transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/jodohmu_official/" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-rose/10 hover:text-brand-rose transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://www.tiktok.com/@jodohmu.official" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-rose/10 hover:text-brand-rose transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M21 8.5c-1.4-.1-2.7-.5-3.9-1.3-1.1-.8-1.9-1.8-2.3-2.9-.2-.6-.3-1.2-.4-1.8V2h-3.6v13.1c0 .7-.3 1.4-.9 1.9-.6.5-1.3.8-2.1.8C7.1 17.8 6 16.7 6 15.3c0-1.4 1.1-2.5 2.5-2.5.3 0 .6.1.9.2l.7.3V9.6l-.3-.1c-.4-.1-.9-.2-1.3-.2-1.3 0-2.5.4-3.5 1.2C4.1 11.4 3.5 12.8 3.5 14.2 3.5 17 5.7 19.2 8.5 19.2c1.3 0 2.5-.4 3.5-1.2 1.1-.8 1.8-2 2-3.3v-.2-.1-6.3c.7.7 1.5 1.3 2.4 1.7.9.4 1.9.7 2.9.8h.3V8.5H21z" />
                </svg>
              </Link>
              <Link href="https://www.youtube.com/@jodohmu_official" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue hover:bg-brand-rose/10 hover:text-brand-rose transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-blue/10">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs font-semibold text-brand-blue/60 sm:flex-row sm:text-sm">
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
