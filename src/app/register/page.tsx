"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { AtSign, Eye, EyeOff, Lock, User as UserIcon } from "lucide-react";
import LogoIcon from "@/assets/jodohmu-logo.png";
import CoverImage from "@/assets/login-cover.png";

export default function RegisterPage() {
  const router      = useRouter();
  const { lang }    = useLanguage();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (role === "admin" || role === "worker") router.replace("/admin");
    else router.replace("/dashboard");
  }, [user, role, loading, router]);

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [pending,       setPending]       = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const l = (id: string, en: string) => lang === "id" ? id : en;

  const bootstrap = async (idToken: string, displayName: string) => {
    const res = await fetch("/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ name: displayName }),
    });
    const data = await res.json() as { role?: string; needsOnboarding?: boolean; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Bootstrap failed");
    return data;
  };

  const routeAfterAuth = (role: string | undefined, needsOnboarding: boolean) => {
    if (role === "admin" || role === "worker") router.push("/admin");
    else if (needsOnboarding)                  router.push("/onboarding");
    else                                        router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError(l("Kata sandi tidak cocok.", "Passwords do not match."));
      return;
    }
    if (password.length < 8) {
      setError(l("Kata sandi minimal 8 karakter.", "Password must be at least 8 characters."));
      return;
    }

    setPending(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      const token = await cred.user.getIdToken();
      const data  = await bootstrap(token, name.trim());
      routeAfterAuth(data.role, !!data.needsOnboarding);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        setError(l("Email ini sudah terdaftar. Silakan masuk.", "That email is already registered. Please sign in."));
      } else {
        setError(l("Gagal membuat akun. Coba lagi.", "Could not create your account. Please try again."));
      }
    } finally {
      setPending(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGooglePending(true);
    try {
      const cred  = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken();
      const data  = await bootstrap(token, cred.user.displayName ?? "");
      routeAfterAuth(data.role, !!data.needsOnboarding);
    } catch {
      setError(l("Gagal mendaftar dengan Google. Coba lagi.", "Google sign-up failed. Please try again."));
    } finally {
      setGooglePending(false);
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
              {l("Mulai perjalananmu", "Begin your journey")}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {l("Sudah punya akun?", "Already have an account?")}
              {" "}
              <Link href="/login" className="font-semibold text-[#9B2242] hover:underline">
                {l("Masuk", "Sign in")}
              </Link>
            </p>
          </div>

          {/* Google sign-up */}
          <button
            type="button" onClick={handleGoogle} disabled={googlePending || pending}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-[15px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98] transition disabled:opacity-60"
          >
            {googlePending ? (
              <svg className="w-4 h-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.12A11.996 11.996 0 0012 24z" />
                <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 010-4.54V6.61H1.26a12 12 0 000 10.78l4.01-3.12z" />
                <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.12C6.22 6.88 8.87 4.77 12 4.77z" />
              </svg>
            )}
            {l("Daftar dengan Google", "Sign up with Google")}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{l("atau", "or")}</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {l("Nama Lengkap", "Full Name")}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="name" type="text" autoComplete="name" required
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder={l("Nama lengkap kamu", "Your full name")}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {l("Email", "Email")}
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={l("email@contoh.com", "you@example.com")}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {l("Kata Sandi", "Password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password" type={showPwd ? "text" : "password"} autoComplete="new-password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={l("Minimal 8 karakter", "At least 8 characters")}
                  className="w-full h-12 pl-10 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirm" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {l("Konfirmasi Kata Sandi", "Confirm Password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="confirm" type={showPwd ? "text" : "password"} autoComplete="new-password" required
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder={l("Ulangi kata sandi", "Re-enter password")}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3a86]/25 focus:border-[#0b3a86]/40 transition"
                />
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
                  {l("Membuat akun...", "Creating account...")}
                </span>
              ) : l("Buat Akun", "Create Account")}
            </button>

          </form>

          <p className="text-center text-xs text-slate-400 border-t border-slate-100 pt-5">
            {l(
              "Dengan mendaftar, kamu setuju untuk dihubungi oleh tim Jodohmu untuk melanjutkan proses ta'aruf.",
              "By signing up, you agree to be contacted by the Jodohmu team to continue your ta'aruf journey."
            )}
          </p>

          <Link href="/" className="text-center text-slate-400 hover:text-slate-600 transition text-xs">
            ← {l("Kembali ke beranda", "Back to homepage")}
          </Link>

        </div>
      </div>
    </div>
  );
}
