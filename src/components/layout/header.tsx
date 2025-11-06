"use client";

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
import LogoIcon from "@/assets/jodohmu-icon-logo.png";
import { Globe, ArrowRight } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const badgeBg = lang === "id" ? "#9B2242" : "#0b3a86";

  return (
    <header
      className="sticky top-0 z-50 h-16 flex items-center bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm border-b"
      style={{ borderColor: "#9B224233", backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.6))" }}
    >
      <Link className="flex items-center justify-center" href="/">
        <Image src={LogoIcon} alt="Jodohmu" className="h-8 w-auto" priority />
        <span className="text-xl font-bold text-blue-900">Jodoh</span>
        <span className="text-xl font-bold text-primary">mu</span>
      </Link>
      <nav className="ml-auto flex items-center gap-2 sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Language: ${lang.toUpperCase()}`}
              className="relative h-9 w-9 rounded-full text-[#0b3a86] border border-[#0b3a86]/30 hover:bg-[#f1f5ff]"
            >
              <Globe className="h-5 w-5" />
              <span
                className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white shadow"
                style={{ backgroundColor: badgeBg }}
              >
                {lang.toUpperCase()}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px] border" style={{ borderColor: "#0b3a8626" }}>
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => selectLang("id")}
              className={lang === "id" ? "bg-[#9B2242]/10 text-[#9B2242]" : undefined}
            >
              {lang === "id" ? "✓ " : ""}Bahasa Indonesia
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => selectLang("en")}
              className={lang === "en" ? "bg-[#0b3a86]/10 text-[#0b3a86]" : undefined}
            >
              {lang === "en" ? "✓ " : ""}English
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-1" style={{ boxShadow: "none", borderColor: "transparent" }}>
                <Avatar className="h-10 w-10 ring-1 ring-[#0b3a86]/20 hover:ring-[#0b3a86]/40 transition">
                  <AvatarImage src={user.photoURL || "/placeholder-user.jpg"} alt={user.displayName || "User"} />
                  <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border" style={{ borderColor: "#0b3a8626" }} align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
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
          <Button asChild variant="default" className="bg-[#9B2242] hover:bg-[#7f1a36] text-white border-0 rounded-full shadow-sm px-5">
            <Link href="/login">Login</Link>
          </Button>
        )}
        </nav>
      </div>
    </header>
  );
}
