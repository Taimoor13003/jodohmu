"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { AtSign, Eye, EyeOff, Lock } from "lucide-react";
import LogoIcon from "@/assets/jodohmu-logo.png";
import CoverImage from "@/assets/login-cover.png";

const WA_FORGOT   = "https://wa.me/6281122210303?text=Assalamualaikum%2C%20saya%20lupa%20password%20akun%20Jodohmu%20saya.";
const WA_REGISTER = "https://wa.me/6281122210303?text=Assalamualaikum%2C%20saya%20ingin%20mendaftar%20akun%20di%20Jodohmu.";

export default function LoginPage() {
  const router      = useRouter();
  const { t, lang } = useLanguage();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (role === "admin" || role === "worker") router.replace("/admin");
    else router.replace("/dashboard");
  }, [user, role, loading, router]);

  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [showPwd,    setShowPwd]    = useState(false);
  const [pending,    setPending]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const l = (id: string, en: string) => lang === "id" ? id : en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      let email = identifier.trim();
      if (!email.includes("@")) {
        const usernameDoc = await getDoc(doc(db, "usernames", email));
        if (!usernameDoc.exists()) { setError(t("login.error")); setPending(false); return; }
        email = (usernameDoc.data() as { email: string }).email;
      }
      const cred    = await signInWithEmailAndPassword(auth, email, password);
      const roleDoc = await getDoc(doc(db, "user_roles", cred.user.uid));
      const role    = (roleDoc.data() as { role?: string } | undefined)?.role;
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      if (redirect)                                   router.push(redirect);
      else if (role === "admin" || role === "worker") router.push("/admin");
      else                                            router.push("/dashboard");
    } catch {
      setError(t("login.error"));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── left: cover image ── */}
      <div className="hidden lg:block relative w-1/2">
        <Image src={CoverImage} alt="Jodohmu" fill className="object-cover" priority />
      </div>

      {/* ── right: form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center bg-white px-8 py-12 sm:px-12">

        {/* mobile logo */}
        <div className="mb-8 flex justify-center lg:hidden">
          <Image src={LogoIcon} alt="Jodohmu" height={40} style={{ width: "auto" }} priority />
        </div>

        <div className="w-full max-w-sm mx-auto flex flex-col gap-7">

          {/* heading */}
          <div>
            <h1 className="text-3xl font-bold text-[#0b3a86]" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {l("Masuk", "Sign in")}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {l("Belum punya akun?", "Don't have an account?")}
              {" "}
              <a href={WA_REGISTER} target="_blank" rel="noopener noreferrer"
                className="font-semibold text-[#9B2242] hover:underline">
                {l("Hubungi kami", "Contact us")}
              </a>
            </p>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="identifier" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("login.emailLabel")}
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="identifier" type="text" autoComplete="username" required
                  value={identifier} onChange={e => setIdentifier(e.target.value)}
                  placeholder={t("login.emailPlaceholder")}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("login.passwordLabel")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password" type={showPwd ? "text" : "password"} autoComplete="current-password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="w-full h-12 pl-10 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-medium text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={pending}
              className="mt-1 w-full h-12 rounded-full font-bold text-base text-white shadow-md transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(to right, #9B2242, #0b3a86)" }}
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {t("login.buttonLoading")}
                </span>
              ) : t("login.button")}
            </button>

          </form>

          {/* helper links */}
          <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-5">
            <a href={WA_FORGOT} target="_blank" rel="noopener noreferrer"
              className="font-semibold text-slate-500 hover:text-[#0b3a86] transition">
              {l("Lupa password?", "Forgot password?")}
            </a>
            <Link href="/" className="text-slate-400 hover:text-slate-600 transition text-xs">
              ← {t("login.back")}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
