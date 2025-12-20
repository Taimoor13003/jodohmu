"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LogoIcon from "@/assets/jodohmu-logo.png";
import { Globe, ArrowRight, Menu, X } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsMobileOpen(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const badgeBg = lang === "id" ? "#9B2242" : "#0b3a86";

  return (
    <header className="sticky top-0 z-50 h-20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm border-b">
      <div className="container mx-auto flex h-full items-center px-4 relative">
        <Link className="flex items-center justify-center" href="/">
          <Image
            src={LogoIcon}
            alt="Jodohmu"
            className="h-12 w-auto sm:h-14 md:h-16 lg:h-20"
            priority
          />
        </Link>
        <nav className="ml-auto hidden items-center gap-2 sm:gap-3 sm:flex">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#0b3a86]/15 bg-white/80 px-3 py-2 text-sm font-semibold text-[#0b3a86] shadow-sm shadow-[#0b3a86]/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9B2242]/40 hover:text-[#9B2242] hover:shadow-md hover:shadow-[#9B2242]/15"
          >
            {t("header.blog")}
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#0b3a86]/15 bg-white/80 px-3 py-2 text-sm font-semibold text-[#0b3a86] shadow-sm shadow-[#0b3a86]/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9B2242]/40 hover:text-[#9B2242] hover:shadow-md hover:shadow-[#9B2242]/15"
          >
            {t("header.faq")}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Language: ${lang.toUpperCase()}`}
                className="relative h-14 w-14 rounded-full text-[#0b3a86] border border-[#0b3a86]/30 hover:bg-[#f1f5ff]"
              >
                <Globe className="h-8 w-8" />
                <span
                  className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white shadow"
                  style={{ backgroundColor: badgeBg }}
                >
                  {lang.toUpperCase()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px] border" style={{ borderColor: "#0b3a8626" }}>
              <DropdownMenuLabel>{t("header.language")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLang("id")}
                className={lang === "id" ? "bg-[#9B2242]/10 text-[#9B2242]" : undefined}
              >
                {lang === "id" ? "✓ " : ""}Bahasa Indonesia
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLang("en")}
                className={lang === "en" ? "bg-[#0b3a86]/10 text-[#0b3a86]" : undefined}
              >
                {lang === "en" ? "✓ " : ""}English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2" style={{ borderColor: badgeBg }}>
                    <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
                    <AvatarFallback>
                      {user.displayName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">{t("header.dashboard")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>{t("header.logout")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="bg-gradient-to-r from-[#9B2242] to-[#0b3a86] text-white rounded-full px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/login">
                <span>{t("common.login")}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Language: ${lang.toUpperCase()}`}
            className="relative h-12 w-12 rounded-full text-[#0b3a86] border border-[#0b3a86]/30 hover:bg-[#f1f5ff]"
            onClick={() => setIsMobileOpen(false)}
          >
            <Globe className="h-7 w-7" />
            <span
              className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white shadow"
              style={{ backgroundColor: badgeBg }}
            >
              {lang.toUpperCase()}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle navigation"
            className="h-12 w-12 rounded-full border border-[#0b3a86]/30 text-[#0b3a86] hover:bg-[#f1f5ff]"
            onClick={() => setIsMobileOpen((v) => !v)}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMobileOpen ? (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[#e6eaf5] bg-white/95 shadow-lg shadow-[#0b3a86]/10 p-4 space-y-3 sm:hidden">
            <div className="flex flex-col gap-2">
              <Link
                href="/blog"
                className="rounded-xl border border-[#0b3a86]/10 px-4 py-3 text-sm font-semibold text-[#0b3a86] hover:border-[#9B2242]/30 hover:text-[#9B2242] transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                {t("header.blog")}
              </Link>
              <Link
                href="/faq"
                className="rounded-xl border border-[#0b3a86]/10 px-4 py-3 text-sm font-semibold text-[#0b3a86] hover:border-[#9B2242]/30 hover:text-[#9B2242] transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                {t("header.faq")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={lang === "id" ? "default" : "outline"}
                className="w-full"
                onClick={() => {
                  setLang("id");
                  setIsMobileOpen(false);
                }}
              >
                Bahasa
              </Button>
              <Button
                variant={lang === "en" ? "default" : "outline"}
                className="w-full"
                onClick={() => {
                  setLang("en");
                  setIsMobileOpen(false);
                }}
              >
                English
              </Button>
            </div>
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-[#0b3a86]/10 px-4 py-3 text-sm font-semibold text-[#0b3a86] hover:border-[#9B2242]/30 hover:text-[#9B2242] transition-colors"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {t("header.dashboard")}
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-[#9B2242]/40 text-[#9B2242] hover:bg-[#9B2242]/10"
                  onClick={handleLogout}
                >
                  {t("header.logout")}
                </Button>
              </div>
            ) : (
              <Button
                asChild
                className="w-full bg-gradient-to-r from-[#9B2242] to-[#0b3a86] text-white rounded-xl px-4 py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow duration-200"
                onClick={() => setIsMobileOpen(false)}
              >
                <Link href="/login">
                  <span>{t("common.login")}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
