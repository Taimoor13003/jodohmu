"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { Shield, Users, Heart } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, setIsPending] = useState(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setIsPending(true);
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070&auto=format&fit=crop"
        alt="Couple holding hands at sunset"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b3a86]/80 via-[#0b3a86]/70 to-[#9B2242]/80" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/15 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="relative hidden h-full bg-white/5 lg:block">
            <Image
              src="https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?q=80&w=2046&auto=format&fit=crop"
              alt="Couple walking together"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#9B2242]/85 via-[#0b3a86]/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-10 text-white space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold uppercase tracking-wide">
                <span className="h-2 w-2 rounded-full bg-white" />
                {t("login.badge")}
              </span>
              <h2 className="text-3xl font-serif font-bold leading-tight drop-shadow">
                {t("login.title")}
              </h2>
              <p className="text-white/85 leading-relaxed">
                {t("login.subtitle")}
              </p>
              <div className="grid gap-3 pt-4 text-sm text-white/80">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-white/20 p-2"><Shield className="h-4 w-4" /></div>
                  <p>{t("login.features.security")}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-white/20 p-2"><Users className="h-4 w-4" /></div>
                  <p>{t("login.features.matches")}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-white/20 p-2"><Heart className="h-4 w-4" /></div>
                  <p>{t("login.features.support")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-white/85 px-6 py-10 sm:px-10">
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#9B2242]/15 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#0b3a86]/15 blur-3xl" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-3 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#9B2242]/10 px-4 py-1 text-sm font-semibold text-[#9B2242]">
                  {t("login.badge")}
                </span>
                <h1 className="text-3xl font-serif font-bold text-[#0b3a86] sm:text-4xl">
                  {t("login.title")}
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t("login.subtitle")}
                </p>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                disabled={isPending}
                className="w-full rounded-full bg-gradient-to-r from-[#9B2242] to-[#0b3a86] py-6 text-base font-semibold shadow-lg transition duration-300 hover:from-[#861b37] hover:to-[#0a3377] disabled:opacity-80"
              >
                {isPending ? t("login.buttonLoading") : t("login.button")}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/" className="font-semibold text-[#9B2242] transition hover:text-[#7f1b36]">
                  {t("login.back")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
