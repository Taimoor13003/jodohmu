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
            <Button variant="ghost" size="icon" aria-label="Language">
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
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
