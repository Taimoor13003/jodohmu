"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-background via-background to-muted/30">
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-card via-card to-[#9B2242]/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#0b3a86] via-[#0b3a86]/90 to-[#9B2242]/80 text-white relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10 text-center space-y-2">
              <Heart className="w-10 h-10 mx-auto" />
              <CardTitle className="text-2xl md:text-3xl font-serif">
                {t("register.guard.title")}
              </CardTitle>
              <p className="text-white/85 text-base md:text-lg max-w-xl mx-auto">
                {t("register.guard.description")}
              </p>
            </div>
          </CardHeader>
          <CardFooter className="flex flex-col items-center gap-4 bg-gradient-to-r from-[#0b3a86]/5 to-[#9B2242]/5 p-8">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#0b3a86] hover:bg-white/90 shadow-lg"
            >
              <Link href="https://wa.me/6281122210303" target="_blank" rel="noopener noreferrer">
                {t("register.guard.cta")}
              </Link>
            </Button>
            <p className="text-sm text-[#2d3150] text-center">
              {t("register.guard.note")}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
