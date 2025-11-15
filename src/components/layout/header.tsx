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
    <header className="px-4 lg:px-6 h-16 flex items-center bg-white shadow-sm">
      <Link className="flex items-center justify-center" href="/">
        <Image src={LogoIcon} alt="Jodohmu" className="h-8 w-auto" priority />
        <span className="text-xl font-bold text-blue-900">Jodoh</span>
        <span className="text-xl font-bold text-primary">mu</span>
      </Link>
      <nav className="ml-auto flex items-center gap-2 sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Language" className="text-[#0b3a86] hover:bg-[#e6f0ff]">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => selectLang("id")}>
              {lang === "id" ? "✓ " : ""}Bahasa Indonesia
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => selectLang("en")}>
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
          <Button asChild variant="default" className="bg-[#9B2242] hover:bg-[#7f1a36] text-white border-0">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
