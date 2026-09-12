"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "sonner";
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Clock, Globe, Lock,
  LogOut, ShieldCheck, Sparkles, X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth, googleProvider } from "@/lib/firebase";
import { FINAL_CHOICE_NONE, checkProfileAnswers, type ProfileAnswers } from "@/lib/share-questions";
import type { Lang } from "@/lib/share-display";
import type { ShareGatePayload, ShareGateState, ShareViewPayload } from "@/lib/share-types";
import { ProfileCard, profileTitle } from "@/components/share/profile-card";
import { ReflectionForm } from "@/components/share/reflection-form";
import { Eyebrow, GeometricPattern, GoogleMark, T, cardShadow, serif } from "@/components/share/share-theme";
import LogoIcon from "@/assets/jodohmu-logo.png";

const WHATSAPP = "https://wa.me/6281122210303";

type View =
  | { kind: "loading" }
  | { kind: "gate"; gate: ShareGatePayload }
  | { kind: "ready"; data: ShareViewPayload };

/* ── copy ─────────────────────────────────────────────── */

const GATE_COPY: Record<ShareGateState, Record<Lang, { title: string; body: string }>> = {
  signin_required: {
    id: { title: "Perkenalan pribadi untuk Anda", body: "Untuk menjaga amanah setiap kandidat, profil ini hanya dapat dibuka setelah Anda masuk. Kami tidak akan membagikan data Anda." },
    en: { title: "A private introduction for you", body: "To honour each candidate's trust, this profile opens only after you sign in. Your details are never shared." },
  },
  not_invited: {
    id: { title: "Tautan ini untuk orang lain", body: "Akun yang Anda gunakan tidak termasuk penerima tautan ini. Coba masuk dengan akun yang menerima undangan dari tim Jodohmu." },
    en: { title: "This link was meant for someone else", body: "The account you're using isn't on this link's invitation. Try the account the Jodohmu team invited." },
  },
  exhausted_for_you: {
    id: { title: "Anda sudah membuka tautan ini", body: "Tautan ini hanya dapat dibuka sejumlah kali per orang. Hubungi matchmaker Anda jika ingin melihatnya kembali." },
    en: { title: "You've already viewed this", body: "This link can only be opened a limited number of times per person. Ask your matchmaker if you'd like another look." },
  },
  expired: {
    id: { title: "Masa berlaku telah berakhir", body: "Tautan perkenalan ini sudah tidak aktif. Silakan hubungi tim Jodohmu untuk meminta akses baru." },
    en: { title: "This introduction has ended", body: "The viewing period for this link is over. Please contact the Jodohmu team for fresh access." },
  },
  exhausted: {
    id: { title: "Batas akses tercapai", body: "Profil ini telah dibuka sebanyak yang diizinkan. Hubungi tim Jodohmu bila Anda perlu melihatnya kembali." },
    en: { title: "View limit reached", body: "This profile has been opened as many times as allowed. Contact the Jodohmu team if you need to see it again." },
  },
  revoked: {
    id: { title: "Akses telah ditutup", body: "Tim Jodohmu telah menutup tautan ini. Silakan hubungi kami untuk informasi lebih lanjut." },
    en: { title: "Access has been closed", body: "The Jodohmu team has closed this link. Please get in touch for more information." },
  },
  missing: {
    id: { title: "Tautan tidak ditemukan", body: "Periksa kembali tautan yang Anda terima dari tim Jodohmu." },
    en: { title: "Link not found", body: "Please double-check the link you received from the Jodohmu team." },
  },
  error: {
    id: { title: "Terjadi kendala", body: "Profil tidak dapat dimuat saat ini. Silakan coba beberapa saat lagi." },
    en: { title: "Something went wrong", body: "This profile couldn't be loaded right now. Please try again shortly." },
  },
};

function useCountdown(target: string | null, lang: Lang): string | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const [dd, hh, mm] = lang === "id" ? ["h", "j", "m"] : ["d", "h", "m"];
  if (d > 0) return `${d}${dd} ${h}${hh}`;
  if (h > 0) return `${h}${hh} ${m}${mm}`;
  return `${m}${mm}`;
}

/* ── chrome ───────────────────────────────────────────── */

function TopBar({ lang, onToggleLang, viewer, onSignOut, expiry }: {
  lang: Lang;
  onToggleLang: () => void;
  viewer?: { name: string; email: string } | null;
  onSignOut?: () => void;
  expiry?: string | null;
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: `${T.paper}E6`, borderBottom: `1px solid ${T.hairline}` }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:px-8">
        <Link href="/" className="flex items-center" aria-label="Jodohmu">
          <Image src={LogoIcon} alt="Jodohmu" height={30} style={{ width: "auto" }} priority />
        </Link>
        <span className="hidden items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold sm:flex" style={{ background: T.sage, color: T.sageInk }}>
          <ShieldCheck className="h-3.5 w-3.5" />
          {lang === "id" ? "Rahasia & terbatas" : "Confidential & limited"}
        </span>
        <div className="flex-1" />
        {expiry && (
          <span className="hidden items-center gap-1.5 text-[12px] font-semibold md:flex" style={{ color: T.muted }}>
            <Clock className="h-3.5 w-3.5" />
            {lang === "id" ? `Berakhir dalam ${expiry}` : `Ends in ${expiry}`}
          </span>
        )}
        {viewer && (
          <div className="hidden items-center gap-2 rounded-full py-1 pl-3 pr-1 sm:flex" style={{ border: `1px solid ${T.hairline}`, background: T.card }}>
            <span className="max-w-[160px] truncate text-[12px] font-semibold" style={{ color: T.body }}>{viewer.email || viewer.name}</span>
            <button onClick={onSignOut} title={lang === "id" ? "Keluar" : "Sign out"} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-stone-100">
              <LogOut className="h-3.5 w-3.5" style={{ color: T.muted }} />
            </button>
          </div>
        )}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold"
          style={{ border: `1px solid ${T.hairline}`, background: T.card, color: T.navy }}
        >
          <Globe className="h-3.5 w-3.5" />
          {lang === "id" ? "EN" : "ID"}
        </button>
      </div>
    </header>
  );
}

function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-16 px-6 pb-14 pt-10 text-center" style={{ borderTop: `1px solid ${T.hairline}` }}>
      <Image src={LogoIcon} alt="Jodohmu" height={26} style={{ width: "auto", margin: "0 auto 14px" }} />
      <p className="mx-auto max-w-md text-[12px] leading-relaxed" style={{ color: T.faint }}>
        {lang === "id"
          ? "Profil ini bersifat rahasia dan diberikan atas dasar amanah. Mohon tidak menyalin, menyimpan, atau meneruskannya tanpa izin Jodohmu."
          : "This profile is confidential and shared in trust. Please don't copy, save, or forward it without Jodohmu's permission."}
      </p>
    </footer>
  );
}

function GoogleButton({ onClick, busy, lang, label }: { onClick: () => void; busy: boolean; lang: Lang; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-12 items-center justify-center gap-3 rounded-full px-6 text-[14.5px] font-bold transition-shadow hover:shadow-md disabled:opacity-60"
      style={{ background: T.card, color: T.ink, border: `1px solid ${T.hairline}`, boxShadow: "0 1px 2px rgba(28,25,23,0.06)" }}
    >
      {busy ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2" style={{ borderColor: T.faint, borderTopColor: "transparent" }} />
      ) : (
        <GoogleMark />
      )}
      {label ?? (lang === "id" ? "Lanjutkan dengan Google" : "Continue with Google")}
    </button>
  );
}

/* ── gate ─────────────────────────────────────────────── */

function GateScreen({ gate, lang, onToggleLang, onSignIn, onSwitchAccount, signingIn, viewerEmail }: {
  gate: ShareGatePayload;
  lang: Lang;
  onToggleLang: () => void;
  onSignIn: () => void;
  onSwitchAccount: () => void;
  signingIn: boolean;
  viewerEmail: string | null;
}) {
  const copy = GATE_COPY[gate.state][lang];
  const isSignIn = gate.state === "signin_required";
  const isAccount = gate.state === "not_invited";

  return (
    <div className="flex min-h-screen flex-col" style={{ background: T.paper }}>
      <TopBar lang={lang} onToggleLang={onToggleLang} />
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[460px] overflow-hidden rounded-[32px] px-8 pb-10 pt-12 text-center sm:px-12"
          style={{ background: T.card, border: `1px solid ${T.hairline}`, boxShadow: cardShadow }}
        >
          <div className="absolute inset-x-0 top-0 h-28 overflow-hidden" style={{ background: T.paperDeep }}>
            <GeometricPattern opacity={0.22} />
          </div>
          <div
            className="relative mx-auto mb-7 flex h-[76px] w-[76px] items-center justify-center rounded-full"
            style={{ background: T.card, boxShadow: `0 0 0 1px ${T.gold}66, 0 0 0 7px ${T.card}` }}
          >
            {gate.state === "error" ? (
              <AlertCircle className="h-7 w-7" style={{ color: T.rose }} />
            ) : isSignIn ? (
              <Sparkles className="h-7 w-7" style={{ color: T.gold }} />
            ) : (
              <Lock className="h-7 w-7" style={{ color: T.navy }} />
            )}
          </div>

          {isSignIn && gate.recipientLabel && (
            <div className="mb-3"><Eyebrow>{lang === "id" ? `Untuk ${gate.recipientLabel}` : `For ${gate.recipientLabel}`}</Eyebrow></div>
          )}
          <h1 className="mb-4 text-[27px] leading-tight" style={{ fontFamily: serif, color: T.ink }}>{copy.title}</h1>
          <p className="mb-8 text-[14.5px] leading-relaxed" style={{ color: T.muted }}>{copy.body}</p>

          {isSignIn && (
            <>
              {!!gate.profileCount && (
                <p className="mb-6 text-[13px] font-semibold" style={{ color: T.body }}>
                  {lang === "id"
                    ? `${gate.profileCount} profil pilihan menunggu Anda`
                    : `${gate.profileCount} selected profile${gate.profileCount > 1 ? "s" : ""} await${gate.profileCount > 1 ? "" : "s"} you`}
                </p>
              )}
              <GoogleButton onClick={onSignIn} busy={signingIn} lang={lang} />
            </>
          )}

          {isAccount && (
            <>
              {viewerEmail && (
                <p className="mb-5 text-[13px]" style={{ color: T.body }}>
                  {lang === "id" ? "Masuk sebagai" : "Signed in as"} <strong>{viewerEmail}</strong>
                </p>
              )}
              <GoogleButton onClick={onSwitchAccount} busy={signingIn} lang={lang} label={lang === "id" ? "Gunakan akun lain" : "Use another account"} />
            </>
          )}

          {!isSignIn && !isAccount && (
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center rounded-full px-7 text-[14px] font-bold text-white"
              style={{ background: T.navyDeep }}
            >
              {lang === "id" ? "Hubungi Tim Jodohmu" : "Contact the Jodohmu team"}
            </a>
          )}

          <p className="mt-8 text-[11.5px] leading-relaxed" style={{ color: T.faint }}>
            {lang === "id"
              ? "Setiap profil Jodohmu dibagikan secara pribadi, terbatas, dan tercatat."
              : "Every Jodohmu profile is shared privately, on limited terms, and logged."}
          </p>
        </motion.div>
      </main>
    </div>
  );
}

/* ── main ─────────────────────────────────────────────── */

export default function ShareView({ token }: { token: string }) {
  const { lang, setLang } = useLanguage();
  const l = (lang === "en" ? "en" : "id") as Lang;
  const toggleLang = () => setLang(l === "id" ? "en" : "id");
  const { user, loading: authLoading } = useAuth();
  const reduceMotion = useReducedMotion();

  const [view, setView] = useState<View>({ kind: "loading" });
  const [signingIn, setSigningIn] = useState(false);
  const [step, setStep] = useState(0);
  const [lightbox, setLightbox] = useState<{ slot: number; index: number } | null>(null);

  const [answers, setAnswers] = useState<Record<string, ProfileAnswers>>({});
  const [finalChoice, setFinalChoice] = useState<string | null>(null);
  const [finalNote, setFinalNote] = useState("");
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [highlight, setHighlight] = useState<{ slot: number; questionId: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      const current = auth.currentUser;
      if (current) headers.Authorization = `Bearer ${await current.getIdToken()}`;
      let referrer = "";
      try {
        const host = document.referrer ? new URL(document.referrer).hostname : "";
        if (host && host !== window.location.hostname) referrer = `?r=${encodeURIComponent(host)}`;
      } catch { /* unparseable referrer */ }
      const res = await fetch(`/api/share/${encodeURIComponent(token)}${referrer}`, { cache: "no-store", headers });
      const json = await res.json().catch(() => ({ available: false, state: "error" }));
      setView(json.available ? { kind: "ready", data: json as ShareViewPayload } : { kind: "gate", gate: json as ShareGatePayload });
    } catch {
      setView({ kind: "gate", gate: { available: false, state: "error" } });
    }
  }, [token]);

  // Load once per identity: a dev double-mount or auth settling must not charge a second open.
  const loadedFor = useRef<string | null>(null);
  useEffect(() => {
    if (authLoading) return;
    const identity = user?.uid ?? "anonymous";
    if (loadedFor.current === identity) return;
    loadedFor.current = identity;
    load();
  }, [authLoading, user?.uid, load]);

  const data = view.kind === "ready" ? view.data : null;
  const draftKey = data?.viewer && user ? `jm_share_draft_${token}_${user.uid}` : null;

  /* hydrate answers: local draft first, then the saved response */
  useEffect(() => {
    if (!data) return;
    let draft: { answers?: Record<string, ProfileAnswers>; finalChoice?: string | null; finalNote?: string } | null = null;
    try {
      if (draftKey) draft = JSON.parse(localStorage.getItem(draftKey) ?? "null");
    } catch { /* storage unavailable */ }
    const saved = data.response;
    setAnswers(draft?.answers ?? saved?.answers ?? {});
    setFinalChoice(draft?.finalChoice ?? saved?.finalChoice ?? null);
    setFinalNote(draft?.finalNote ?? saved?.finalNote ?? "");
    setSubmittedAt(saved?.submittedAt ?? null);
  }, [data, draftKey]);

  useEffect(() => {
    if (!draftKey) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({ answers, finalChoice, finalNote }));
    } catch { /* storage unavailable */ }
  }, [draftKey, answers, finalChoice, finalNote]);

  const signIn = async () => {
    setSigningIn(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      loadedFor.current = cred.user.uid;
      const idToken = await cred.user.getIdToken();
      await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ name: cred.user.displayName ?? "", shareToken: token }),
      });
      await load();
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      if (!code.includes("popup-closed") && !code.includes("cancelled-popup")) {
        toast.error(l === "id" ? "Gagal masuk dengan Google. Coba lagi." : "Google sign-in failed. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  const switchAccount = async () => {
    await signOut(auth);
    await signIn();
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setView({ kind: "loading" });
  };

  const expiry = useCountdown(data?.expiresAt ?? null, l);

  const profiles = useMemo(() => data?.profiles ?? [], [data]);
  const questionnaire = data?.purpose === "matchmaking" && data.questionnaire.enabled ? data.questionnaire : null;
  const hasDecision = !!questionnaire && profiles.length > 1;
  const stepCount = profiles.length + (hasDecision ? 1 : 0);
  const onDecisionStep = hasDecision && step === profiles.length;

  /* ── engagement metrics for the team: visible time per step + photo opens ── */
  const beacon = useCallback((body: { slot: number; seconds?: number; photo?: boolean }) => {
    const url = `/api/share/${encodeURIComponent(token)}/activity`;
    const payload = JSON.stringify(body);
    try {
      if (navigator.sendBeacon?.(url, new Blob([payload], { type: "application/json" }))) return;
    } catch { /* fall through to fetch */ }
    fetch(url, { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }, [token]);

  const activeSlot = data ? (onDecisionStep ? -1 : profiles[Math.min(step, profiles.length - 1)]?.slot ?? null) : null;

  useEffect(() => {
    if (activeSlot === null) return;
    let startedAt: number | null = document.visibilityState === "visible" ? Date.now() : null;
    const flush = () => {
      if (startedAt === null) return;
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      startedAt = document.visibilityState === "visible" ? Date.now() : null;
      if (seconds > 0) beacon({ slot: activeSlot, seconds: Math.min(seconds, 120) });
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else startedAt = Date.now();
    };
    const interval = setInterval(flush, 30_000);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, [activeSlot, beacon]);

  const completion = useMemo(
    () => profiles.map(p => !!questionnaire && checkProfileAnswers(questionnaire.questions, answers[String(p.slot)], p.photosHidden).ok),
    [profiles, questionnaire, answers],
  );

  const goTo = (next: number) => {
    setStep(Math.max(0, Math.min(stepCount - 1, next)));
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const submit = async () => {
    if (!questionnaire || !data) return;
    for (const p of profiles) {
      const check = checkProfileAnswers(questionnaire.questions, answers[String(p.slot)], p.photosHidden);
      if (!check.ok) {
        setHighlight({ slot: p.slot, questionId: check.questionId! });
        goTo(p.slot);
        toast.error(l === "id" ? "Masih ada pertanyaan yang belum dijawab." : "A few questions still need an answer.");
        return;
      }
    }
    if (hasDecision && !finalChoice) {
      goTo(profiles.length);
      toast.error(l === "id" ? "Pilih profil yang ingin Anda lanjutkan." : "Choose which profile you'd like to continue with.");
      return;
    }

    setSubmitting(true);
    try {
      const current = auth.currentUser;
      if (!current) throw new Error("auth");
      const res = await fetch(`/api/share/${encodeURIComponent(token)}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await current.getIdToken()}` },
        body: JSON.stringify({ answers, finalChoice, finalNote }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (typeof json.slot === "number" && json.questionId) {
          setHighlight({ slot: json.slot, questionId: json.questionId });
          goTo(json.slot);
        }
        throw new Error(json.error ?? "failed");
      }
      setSubmittedAt(new Date().toISOString());
      setHighlight(null);
      try { if (draftKey) localStorage.removeItem(draftKey); } catch { /* ignore */ }
      toast.success(l === "id" ? "Jazakumullahu khairan — refleksi Anda telah terkirim." : "Jazakumullahu khairan — your reflections have been sent.");
    } catch {
      toast.error(l === "id" ? "Belum berhasil mengirim. Coba lagi." : "Couldn't send yet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* keyboard for lightbox */
  useEffect(() => {
    if (!lightbox || !data) return;
    const photos = data.profiles[lightbox.slot]?.photos ?? [];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox(lb => lb && { ...lb, index: (lb.index + 1) % photos.length });
      if (e.key === "ArrowLeft") setLightbox(lb => lb && { ...lb, index: (lb.index - 1 + photos.length) % photos.length });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, data]);

  /* ── render ── */

  if (view.kind === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: T.paper }}>
        <div className="flex flex-col items-center gap-5">
          <Image src={LogoIcon} alt="Jodohmu" height={34} style={{ width: "auto" }} priority />
          <div className="h-[2px] w-28 overflow-hidden rounded-full" style={{ background: T.hairline }}>
            <motion.div
              className="h-full w-1/2 rounded-full"
              style={{ background: T.gold }}
              animate={reduceMotion ? undefined : { x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (view.kind === "gate") {
    return (
      <GateScreen
        gate={view.gate}
        lang={l}
        onToggleLang={toggleLang}
        onSignIn={signIn}
        onSwitchAccount={switchAccount}
        signingIn={signingIn}
        viewerEmail={user?.email ?? null}
      />
    );
  }

  const d = view.data;
  const current = profiles[Math.min(step, profiles.length - 1)];
  const lockedAny = !onDecisionStep && current && (current.locked.fields > 0 || current.locked.photos > 0 || current.locked.name);
  const isLast = step === stepCount - 1;

  const notice = lockedAny ? (
    <div className="flex flex-col items-start gap-4 rounded-[24px] px-6 py-5 sm:flex-row sm:items-center sm:px-8" style={{ background: T.goldSoft, border: `1px solid ${T.gold}33` }}>
      <Lock className="h-5 w-5 shrink-0" style={{ color: T.gold }} />
      <p className="flex-1 text-[13.5px] leading-relaxed" style={{ color: "#5B4A2E" }}>
        {d.tier === "public"
          ? l === "id"
            ? "Sebagian detail dan foto disimpan dengan penuh amanah. Masuk untuk melihat lebih banyak."
            : "Some details and photos are held in trust. Sign in to see more."
          : l === "id"
            ? "Detail dan foto lainnya terbuka bagi kandidat terdaftar Jodohmu."
            : "Further details and photos are open to registered Jodohmu candidates."}
      </p>
      {d.tier === "public" ? (
        <GoogleButton onClick={signIn} busy={signingIn} lang={l} label={l === "id" ? "Masuk dengan Google" : "Sign in with Google"} />
      ) : (
        <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="rounded-full px-5 py-2.5 text-[13px] font-bold text-white" style={{ background: T.navyDeep }}>
          {l === "id" ? "Daftar sebagai kandidat" : "Become a candidate"}
        </a>
      )}
    </div>
  ) : null;

  const motionProps = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <div className="min-h-screen" style={{ background: T.paper }}>
      <TopBar lang={l} onToggleLang={toggleLang} viewer={d.viewer} onSignOut={handleSignOut} expiry={expiry} />

      {/* ── intro ── */}
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16">
        <Eyebrow>{d.purpose === "matchmaking" ? (l === "id" ? "Perkenalan dari Jodohmu" : "An introduction from Jodohmu") : (l === "id" ? "Profil pilihan Jodohmu" : "Selected by Jodohmu")}</Eyebrow>
        <h1 className="mt-3 max-w-3xl text-[34px] leading-[1.08] sm:text-[48px]" style={{ fontFamily: serif, color: T.ink }}>
          {d.recipientLabel
            ? l === "id" ? <>Untuk <em style={{ color: T.rose }}>{d.recipientLabel}</em></> : <>For <em style={{ color: T.rose }}>{d.recipientLabel}</em></>
            : l === "id" ? "Seseorang yang layak Anda kenal" : "Someone worth getting to know"}
        </h1>
        {d.recipientNote && (
          <div className="mt-7 max-w-2xl rounded-[22px] px-6 py-5" style={{ background: T.card, border: `1px solid ${T.hairline}` }}>
            <p className="whitespace-pre-line text-[15px] leading-[1.8]" style={{ color: T.body }}>{d.recipientNote}</p>
            <p className="mt-3 text-[13px] italic" style={{ fontFamily: serif, color: T.gold }}>— {l === "id" ? "Tim Jodohmu" : "The Jodohmu team"}</p>
          </div>
        )}
      </section>

      {/* ── stepper ── */}
      {stepCount > 1 && (
        <nav className="sticky top-16 z-30 backdrop-blur-md" style={{ background: `${T.paper}E6`, borderBottom: `1px solid ${T.hairline}` }}>
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 sm:px-8">
            {profiles.map((p, i) => {
              const active = step === i;
              return (
                <button
                  key={p.slot}
                  onClick={() => goTo(i)}
                  className="flex shrink-0 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-[13px] font-bold transition-colors"
                  style={active ? { background: T.navyDeep, color: "#fff" } : { background: T.card, color: T.body, border: `1px solid ${T.hairline}` }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[12px]"
                    style={active ? { background: "rgba(255,255,255,0.16)" } : { background: T.paperDeep, color: T.navy }}
                  >
                    {completion[i] ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="max-w-[140px] truncate">{profileTitle(p, l)}</span>
                </button>
              );
            })}
            {hasDecision && (
              <button
                onClick={() => goTo(profiles.length)}
                className="flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-bold"
                style={onDecisionStep ? { background: T.rose, color: "#fff" } : { background: T.card, color: T.rose, border: `1px solid ${T.rose}40` }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {l === "id" ? "Keputusan Anda" : "Your decision"}
              </button>
            )}
          </div>
          <div className="h-[2px]" style={{ background: T.hairline }}>
            <motion.div className="h-full" style={{ background: T.gold }} animate={{ width: `${((step + 1) / stepCount) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} {...motionProps}>
            {!onDecisionStep && current && (
              <>
                <ProfileCard
                  profile={current}
                  lang={l}
                  position={{ index: step, total: profiles.length }}
                  onOpenPhoto={index => {
                    setLightbox({ slot: current.slot, index });
                    beacon({ slot: current.slot, photo: true });
                  }}
                  notice={notice}
                />

                {questionnaire && (
                  <section className="mt-10 overflow-hidden rounded-[28px]" style={{ background: T.card, border: `1px solid ${T.hairline}`, boxShadow: cardShadow }}>
                    <div className="px-6 py-8 sm:px-12 sm:py-11">
                      <Eyebrow color={T.rose}>{l === "id" ? "Refleksi Anda" : "Your reflection"}</Eyebrow>
                      <h2 className="mt-3 text-[28px] leading-tight sm:text-[34px]" style={{ fontFamily: serif, color: T.ink }}>
                        {l === "id" ? `Bagaimana perasaan Anda tentang ${profileTitle(current, l)}?` : `How do you feel about ${profileTitle(current, l)}?`}
                      </h2>
                      <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed" style={{ color: T.muted }}>
                        {l === "id"
                          ? "Tidak ada jawaban benar atau salah. Jawaban yang jujur membantu matchmaker Anda memberikan pendampingan terbaik — hanya tim Jodohmu yang membacanya."
                          : "There are no right or wrong answers. Honest reflections help your matchmaker guide you well — only the Jodohmu team reads them."}
                      </p>

                      <div className="mt-10">
                        {d.viewer ? (
                          <ReflectionForm
                            questions={questionnaire.questions}
                            answers={answers[String(current.slot)] ?? {}}
                            onChange={next => setAnswers(prev => ({ ...prev, [String(current.slot)]: next }))}
                            photosHidden={current.photosHidden}
                            lang={l}
                            highlightId={highlight?.slot === current.slot ? highlight.questionId : null}
                          />
                        ) : (
                          <div className="flex flex-col items-start gap-5 rounded-[22px] px-6 py-7 sm:flex-row sm:items-center" style={{ background: T.paper, border: `1px solid ${T.hairline}` }}>
                            <p className="flex-1 text-[14.5px] leading-relaxed" style={{ color: T.body }}>
                              {l === "id"
                                ? "Masuk untuk menuliskan refleksi Anda. Jawaban Anda tersimpan aman dan hanya dibaca oleh matchmaker Anda."
                                : "Sign in to write your reflection. Your answers are kept safe and read only by your matchmaker."}
                            </p>
                            <GoogleButton onClick={signIn} busy={signingIn} lang={l} />
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            {onDecisionStep && (
              <section className="overflow-hidden rounded-[28px]" style={{ background: T.card, border: `1px solid ${T.hairline}`, boxShadow: cardShadow }}>
                <div className="relative h-24 overflow-hidden" style={{ background: T.paperDeep }}>
                  <GeometricPattern opacity={0.2} />
                </div>
                <div className="px-6 pb-10 pt-8 sm:px-12">
                  <Eyebrow color={T.rose}>{l === "id" ? "Langkah terakhir" : "Final step"}</Eyebrow>
                  <h2 className="mt-3 text-[30px] leading-tight sm:text-[38px]" style={{ fontFamily: serif, color: T.ink }}>
                    {l === "id" ? "Dengan siapa Anda ingin melangkah?" : "Who would you like to move forward with?"}
                  </h2>
                  <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed" style={{ color: T.muted }}>
                    {l === "id"
                      ? "Pilih satu profil, atau tidak ada untuk saat ini. Matchmaker Anda akan menghubungi Anda untuk langkah berikutnya, insyaAllah."
                      : "Choose one profile, or none for now. Your matchmaker will reach out about the next step, insyaAllah."}
                  </p>

                  <div role="radiogroup" className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {profiles.map((p, i) => {
                      const selected = finalChoice === String(p.slot);
                      const said = answers[String(p.slot)]?.match;
                      return (
                        <button
                          key={p.slot}
                          role="radio"
                          aria-checked={selected}
                          disabled={!d.viewer}
                          onClick={() => setFinalChoice(String(p.slot))}
                          className="flex items-center gap-4 rounded-[20px] px-5 py-4 text-left transition-all disabled:opacity-60"
                          style={selected
                            ? { background: T.navyDeep, color: "#fff", border: `1px solid ${T.navyDeep}` }
                            : { background: T.paper, color: T.ink, border: `1px solid ${T.hairline}` }}
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[17px]" style={{ fontFamily: serif, background: selected ? "rgba(255,255,255,0.14)" : T.card, color: selected ? "#fff" : T.navy, border: selected ? "none" : `1px solid ${T.hairline}` }}>
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[16px]" style={{ fontFamily: serif }}>{profileTitle(p, l)}</span>
                            {said && (
                              <span className="text-[12px]" style={{ color: selected ? "rgba(255,255,255,0.75)" : T.muted }}>
                                {said === "yes" ? (l === "id" ? "Anda merasa cocok" : "You felt a match") : (l === "id" ? "Anda merasa kurang cocok" : "You felt it wasn't a match")}
                              </span>
                            )}
                          </span>
                          {selected && <Check className="h-5 w-5 shrink-0" />}
                        </button>
                      );
                    })}
                    <button
                      role="radio"
                      aria-checked={finalChoice === FINAL_CHOICE_NONE}
                      disabled={!d.viewer}
                      onClick={() => setFinalChoice(FINAL_CHOICE_NONE)}
                      className="rounded-[20px] px-5 py-4 text-left text-[14.5px] font-semibold transition-all disabled:opacity-60 sm:col-span-2"
                      style={finalChoice === FINAL_CHOICE_NONE
                        ? { background: T.ink, color: "#fff", border: `1px solid ${T.ink}` }
                        : { background: T.card, color: T.body, border: `1px dashed ${T.faint}` }}
                    >
                      {l === "id" ? "Belum ada yang tepat untuk saat ini" : "None of them feels right for now"}
                    </button>
                  </div>

                  <label className="mt-8 block text-[16px]" style={{ fontFamily: serif, color: T.ink }}>
                    {l === "id" ? "Pesan untuk matchmaker Anda" : "A note for your matchmaker"}
                    <span className="ml-2 font-sans text-[11.5px]" style={{ color: T.faint }}>{l === "id" ? "(opsional)" : "(optional)"}</span>
                  </label>
                  <textarea
                    value={finalNote}
                    onChange={e => setFinalNote(e.target.value)}
                    disabled={!d.viewer}
                    rows={4}
                    maxLength={2000}
                    className="mt-3 w-full resize-y rounded-2xl px-4 py-3.5 text-[15px] leading-relaxed focus:outline-none"
                    style={{ background: T.paper, border: `1px solid ${T.hairline}`, color: T.ink }}
                    placeholder={l === "id" ? "Apa pun yang perlu kami ketahui…" : "Anything we should know…"}
                  />
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── step controls ── */}
        {(stepCount > 1 || questionnaire) && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {step > 0 && (
              <button onClick={() => goTo(step - 1)} className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-[14px] font-bold" style={{ background: T.card, color: T.body, border: `1px solid ${T.hairline}` }}>
                <ArrowLeft className="h-4 w-4" />
                {l === "id" ? "Sebelumnya" : "Previous"}
              </button>
            )}
            <div className="flex-1" />
            {submittedAt && (
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: T.sageInk }}>
                <Check className="h-4 w-4" />
                {l === "id" ? "Terkirim — Anda masih dapat memperbaruinya" : "Sent — you can still update it"}
              </span>
            )}
            {!isLast ? (
              <button onClick={() => goTo(step + 1)} className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-bold text-white" style={{ background: T.navyDeep }}>
                {step + 1 === profiles.length && hasDecision
                  ? l === "id" ? "Ke keputusan" : "To your decision"
                  : l === "id" ? "Profil berikutnya" : "Next profile"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : questionnaire && d.viewer ? (
              <button onClick={submit} disabled={submitting} className="inline-flex h-12 items-center gap-2 rounded-full px-7 text-[14px] font-bold text-white disabled:opacity-60" style={{ background: T.rose, boxShadow: "0 12px 28px -12px rgba(155,34,66,0.6)" }}>
                {submitting
                  ? l === "id" ? "Mengirim…" : "Sending…"
                  : submittedAt
                    ? l === "id" ? "Perbarui refleksi" : "Update reflections"
                    : l === "id" ? "Kirim ke matchmaker" : "Send to my matchmaker"}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        )}

        {d.purpose === "promotion" && (
          <section className="relative mt-12 overflow-hidden rounded-[28px] px-6 py-12 text-center sm:px-12" style={{ background: T.navyDeep }}>
            <GeometricPattern color="#ffffff" opacity={0.06} />
            <h2 className="relative text-[28px] leading-tight text-white sm:text-[34px]" style={{ fontFamily: serif }}>
              {l === "id" ? "Siap memulai ta'aruf yang terarah?" : "Ready for a guided ta'aruf?"}
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-[14.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
              {l === "id"
                ? "Tim Jodohmu mendampingi setiap langkah — dari perkenalan, pertemuan keluarga, hingga khitbah."
                : "The Jodohmu team walks with you through every step — introduction, family meeting, and proposal."}
            </p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="relative mt-7 inline-flex h-12 items-center rounded-full px-7 text-[14px] font-bold" style={{ background: "#fff", color: T.navyDeep }}>
              {l === "id" ? "Bicara dengan matchmaker" : "Talk to a matchmaker"}
            </a>
          </section>
        )}
      </main>

      <Footer lang={l} />

      {/* ── lightbox ── */}
      <AnimatePresence>
        {lightbox && d.profiles[lightbox.slot]?.photos[lightbox.index] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(12,10,9,0.92)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute right-5 top-5 rounded-full p-2.5" style={{ background: "rgba(255,255,255,0.12)" }} aria-label="Close">
              <X className="h-5 w-5 text-white" />
            </button>
            {d.profiles[lightbox.slot].photos.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); const n = d.profiles[lightbox.slot].photos.length; setLightbox({ ...lightbox, index: (lightbox.index - 1 + n) % n }); }}
                  className="absolute left-4 rounded-full p-3" style={{ background: "rgba(255,255,255,0.12)" }} aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); const n = d.profiles[lightbox.slot].photos.length; setLightbox({ ...lightbox, index: (lightbox.index + 1) % n }); }}
                  className="absolute right-4 rounded-full p-3" style={{ background: "rgba(255,255,255,0.12)" }} aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${d.profiles[lightbox.slot].photos[lightbox.index].src}?size=full`}
              alt=""
              draggable={false}
              onClick={e => e.stopPropagation()}
              onContextMenu={e => e.preventDefault()}
              className="max-h-[88vh] max-w-full select-none rounded-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
