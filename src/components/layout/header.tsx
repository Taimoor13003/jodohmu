"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
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
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const { user } = useAuth();
  const [lang, setLang] = useState<"id" | "en">("id");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as "id" | "en" | null) : null;
    const initial = saved || "id";
    setLang(initial);
    if (typeof document !== "undefined") {
      document.documentElement.lang = initial;
    }
  }, []);

  const selectLang = (value: "id" | "en") => {
    setLang(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", value);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = value;
    }
  };

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
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || "/placeholder-user.jpg"} alt={user.displayName || "User"} />
                  <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
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
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
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
