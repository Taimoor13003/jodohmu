"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getIdToken, signOut } from "firebase/auth";
import { CheckCircle2, Clock3, LogOut, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LogoIcon from "@/assets/jodohmu-logo.png";

type Candidate = Record<string, unknown>;

export default function RequestSubmittedPage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const { lang } = useLanguage();
  const [candidate, setCandidate] = useState<Candidate>({});
  const [ready, setReady] = useState(false);

  const l = (id: string, en: string) => lang === "id" ? id : en;

  const checkStatus = useCallback(async () => {
    if (!user) return;
    try {
      const token = await getIdToken(user);
      const res = await fetch("/api/candidate/me", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const { data } = await res.json() as { data: Candidate | null };
      const profile = data ?? {};
      if (!profile.fullName || !profile.whatsappNumber || !profile.gender) {
        router.replace("/onboarding");
        return;
      }
      if (profile.personStatus !== "new_lead" && profile.personStatus !== "awaiting_discovery_call") {
        router.replace("/dashboard");
        return;
      }
      setCandidate(profile);
    } finally {
      setReady(true);
    }
  }, [router, user]);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (role === "admin" || role === "worker") { router.replace("/admin"); return; }
    void checkStatus();
    const interval = window.setInterval(() => void checkStatus(), 30_000);
    return () => window.clearInterval(interval);
  }, [checkStatus, loading, role, router, user]);

  const leave = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const name = String(candidate.fullName ?? user?.displayName ?? "").trim().split(" ")[0];

  if (loading || !ready) {
    return <div className="grid min-h-screen place-items-center bg-[#f8f5f7]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9B2242] border-t-transparent" /></div>;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f5f7] px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="Jodohmu home"><Image src={LogoIcon} alt="Jodohmu" height={38} style={{ width: "auto" }} priority /></Link>
          <button onClick={leave} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-[#9B2242]/30 hover:text-[#9B2242]"><LogOut className="h-4 w-4" />{l("Keluar", "Sign out")}</button>
        </header>

        <section className="mt-8 overflow-hidden rounded-[2rem] border border-[#eadce3] bg-white shadow-[0_24px_70px_rgba(67,25,49,0.12)] lg:grid lg:grid-cols-[1.05fr_.95fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#9B2242] via-[#a51e50] to-[#172c66] px-7 py-10 text-white sm:px-11 sm:py-14">
            <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-[#f8c9d6]/20 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[.16em]"><CheckCircle2 className="h-4 w-4" />{l("Permintaan diterima", "Request received")}</span>
              <h1 className="mt-7 font-serif text-4xl font-bold leading-[1.04] sm:text-5xl">{name ? l(`Terima kasih, ${name}.`, `Thank you, ${name}.`) : l("Terima kasih.", "Thank you.")}</h1>
              <p className="mt-5 max-w-md text-base leading-8 text-white/85 sm:text-lg">{l("Detail Anda sudah terkirim ke Tim Jodohmu. Kami akan meninjaunya dan menghubungi Anda segera melalui WhatsApp.", "Your details have been sent to Team Jodohmu. We will review them and contact you soon on WhatsApp.")}</p>
              <div className="mt-9 border-t border-white/20 pt-7">
                <p className="flex gap-3 text-sm leading-6 text-white/90"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#ffd5e2]" />{l("Tidak ada lagi yang perlu Anda lakukan sekarang. Silakan pastikan WhatsApp Anda tetap dapat dihubungi.", "There is nothing else you need to do right now. Please keep your WhatsApp reachable.")}</p>
              </div>
            </div>
          </div>

          <div className="px-7 py-10 sm:px-11 sm:py-14">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#c52d5a]">{l("Sambil menunggu", "While you wait")}</p>
            <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-[#12275b]">{l("Apa itu Jodohmu?", "What is Jodohmu?")}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{l("Jodohmu adalah layanan perkenalan pribadi bagi orang yang mencari pasangan hidup. Kami mendengarkan cerita, tujuan, dan batasan Anda, lalu membantu setiap langkah terasa lebih jelas, tertata, dan manusiawi.", "Jodohmu is a personal introduction service for people looking for a life partner. We listen to your story, goals, and boundaries, then help each step feel clearer, more considered, and more human.")}</p>
            <div className="mt-7 space-y-4">
              {[{ icon: <MessageCircle className="h-5 w-5" />, id: "Kami memulai dengan percakapan, bukan profil publik atau swiping.", en: "We begin with a conversation, not public profiles or swiping." }, { icon: <ShieldCheck className="h-5 w-5" />, id: "Anda tetap memegang pilihan; kami membantu prosesnya menjadi lebih jelas.", en: "You keep the choice; we help make the process clearer." }, { icon: <Sparkles className="h-5 w-5" />, id: "Setiap perkenalan dan langkah berikutnya ditangani dengan perhatian.", en: "Each introduction and next step is handled with care." }].map(item => <div key={item.en} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fff0f5] text-[#c52d5a]">{item.icon}</span><p className="pt-1 text-sm leading-6 text-slate-600">{l(item.id, item.en)}</p></div>)}
            </div>
            <Link href="/blog/apa-itu-jodohmu" className="mt-9 inline-flex rounded-full bg-[#12275b] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#1d3e89]">{l("Baca selengkapnya tentang Jodohmu", "Read the full Jodohmu story")}</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
