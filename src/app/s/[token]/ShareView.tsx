"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, Check, ChevronLeft, ChevronRight, Clock, Globe, Heart, Lock, LogOut, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth, googleProvider } from "@/lib/firebase";
import { checkProfileAnswers, swipeQuestionId, type ProfileAnswers } from "@/lib/share-questions";
import type { Lang } from "@/lib/share-display";
import type { ShareGatePayload, ShareGateState, ShareViewPayload } from "@/lib/share-types";
import { profileTitle } from "@/components/share/profile-card";
import { ReflectionForm } from "@/components/share/reflection-form";
import { SwipeDeck, type CaptureKind, type Decision } from "@/components/share/swipe-deck";
import { Eyebrow, GeometricPattern, GoogleMark, T, cardShadow, serif } from "@/components/share/share-theme";
import LogoIcon from "@/assets/jodohmu-logo.png";

const WHATSAPP = "https://wa.me/6281122210303";

type View =
  | { kind: "loading" }
  | { kind: "gate"; gate: ShareGatePayload }
  | { kind: "ready"; data: ShareViewPayload };

type Stage = { kind: "deck" } | { kind: "form"; slot: number; decision: Decision } | { kind: "done" };

/* ── copy ─────────────────────────────────────────────── */

const GATE_COPY: Record<Exclude<ShareGateState, "signin_required">, Record<Lang, { title: string; body: string }>> = {
  completed: {
    id: { title: "Terima kasih, sudah selesai", body: "Anda telah memberikan penilaian untuk semua profil di tautan ini. Matchmaker Anda akan menghubungi Anda untuk langkah berikutnya, insyaAllah." },
    en: { title: "Thank you — all done", body: "You've shared your thoughts on every profile in this link. Your matchmaker will be in touch about the next step, insyaAllah." },
  },
  not_invited: {
    id: { title: "Tautan ini untuk orang lain", body: "Akun yang Anda gunakan tidak termasuk penerima tautan ini. Coba masuk dengan akun yang menerima undangan dari tim Jodohmu." },
    en: { title: "This link was meant for someone else", body: "The account you're using isn't on this link's invitation. Try the account the Jodohmu team invited." },
  },
  exhausted_for_you: {
    id: { title: "Anda sudah membuka tautan ini", body: "Tautan ini hanya dapat dibuka sejumlah kali per orang. Hubungi matchmaker Anda bila ingin melihatnya kembali." },
    en: { title: "You've already viewed this", body: "This link can only be opened a limited number of times per person. Ask your matchmaker for another look." },
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
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (d > 0) return lang === "id" ? `${d} hari` : `${d}d`;
  if (h > 0) return lang === "id" ? `${h} jam` : `${h}h`;
  return lang === "id" ? `${m} menit` : `${m}m`;
}

/* ── chrome: a logo, not a navbar ─────────────────────── */

function TopStrip({ lang, onToggleLang, viewer, onSignOut, expiry, progress }: {
  lang: Lang;
  onToggleLang: () => void;
  viewer?: { name: string; email: string } | null;
  onSignOut?: () => void;
  expiry?: string | null;
  progress?: { current: number; total: number } | null;
}) {
  return (
    <header className="sticky top-0 z-30" style={{ background: `${T.paper}F2`, backdropFilter: "blur(10px)", borderBottom: `1px solid ${T.hairline}` }}>
      <div className="mx-auto flex h-[58px] max-w-2xl items-center gap-3 px-5">
        <Link href="/" aria-label="Jodohmu" className="flex items-center">
          <Image src={LogoIcon} alt="Jodohmu" height={26} style={{ width: "auto" }} priority />
        </Link>
        <div className="flex-1" />
        {expiry && (
          <span className="hidden items-center gap-1.5 text-[11.5px] font-semibold sm:flex" style={{ color: T.faint }}>
            <Clock className="h-3.5 w-3.5" />
            {lang === "id" ? `${expiry} lagi` : expiry}
          </span>
        )}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
          style={{ border: `1px solid ${T.hairline}`, background: T.card, color: T.navy }}
        >
          <Globe className="h-3 w-3" />
          {lang === "id" ? "EN" : "ID"}
        </button>
        {viewer && (
          <button
            onClick={onSignOut}
            title={`${viewer.email} — ${lang === "id" ? "keluar" : "sign out"}`}
            className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2"
            style={{ border: `1px solid ${T.hairline}`, background: T.card }}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: T.navyDeep }}>
              {(viewer.name || viewer.email || "?").slice(0, 1).toUpperCase()}
            </span>
            <LogOut className="h-3 w-3" style={{ color: T.faint }} />
          </button>
        )}
      </div>
      {progress && progress.total > 1 && (
        <div className="mx-auto max-w-2xl px-5 pb-3">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase" style={{ color: T.faint, letterSpacing: "0.14em" }}>
            <span>{lang === "id" ? `Profil ${progress.current} dari ${progress.total}` : `Profile ${progress.current} of ${progress.total}`}</span>
          </div>
          <div className="h-[3px] overflow-hidden rounded-full" style={{ background: T.hairline }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${T.accent}, ${T.rose})` }}
              animate={{ width: `${(progress.current / progress.total) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}
    </header>
  );
}

function GoogleButton({ onClick, busy, lang, label }: { onClick: () => void; busy: boolean; lang: Lang; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-full px-6 text-[15px] font-bold transition-shadow hover:shadow-md disabled:opacity-60"
      style={{ background: T.card, color: T.ink, border: `1px solid ${T.hairline}`, boxShadow: "0 2px 10px -4px rgba(28,25,23,0.25)" }}
    >
      {busy ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2" style={{ borderColor: T.faint, borderTopColor: "transparent" }} />
      ) : (
        <GoogleMark size={20} />
      )}
      {label ?? (lang === "id" ? "Lanjutkan dengan Google" : "Continue with Google")}
    </button>
  );
}

/* ── signed out: blurred deck behind a sign-in modal ──── */

function SignInGate({ gate, lang, onToggleLang, onSignIn, busy }: {
  gate: ShareGatePayload;
  lang: Lang;
  onToggleLang: () => void;
  onSignIn: () => void;
  busy: boolean;
}) {
  const count = gate.profileCount ?? 0;
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: T.paper }}>
      {/* blurred decoy — no real profile data is ever sent before sign-in */}
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ filter: "blur(16px)", opacity: 0.75 }}>
        <div className="relative" style={{ width: 380, maxWidth: "86vw", aspectRatio: "3 / 4" }}>
          <div className="absolute inset-0 overflow-hidden rounded-[28px]" style={{ background: T.paperDeep, transform: "scale(0.94) translateY(18px)" }}>
            <GeometricPattern opacity={0.3} />
          </div>
          <div className="absolute inset-0 overflow-hidden rounded-[28px]" style={{ background: T.paperDeep, boxShadow: cardShadow }}>
            <GeometricPattern opacity={0.4} />
            <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: `linear-gradient(to top, ${T.navyDeep}CC, transparent)` }} />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-7">
              <div className="h-7 w-2/3 rounded-full" style={{ background: "rgba(255,255,255,0.5)" }} />
              <div className="h-4 w-1/2 rounded-full" style={{ background: "rgba(255,255,255,0.35)" }} />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-20 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
                <div className="h-6 w-24 rounded-full" style={{ background: "rgba(255,255,255,0.3)" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0" style={{ background: `${T.paper}5C` }} />

      <div className="relative flex min-h-screen flex-col">
        <div className="flex items-center px-5 py-4">
          <Link href="/" aria-label="Jodohmu" className="flex items-center">
            <Image src={LogoIcon} alt="Jodohmu" height={26} style={{ width: "auto" }} priority />
          </Link>
          <div className="flex-1" />
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
            style={{ border: `1px solid ${T.hairline}`, background: T.card, color: T.navy }}
          >
            <Globe className="h-3 w-3" />
            {lang === "id" ? "EN" : "ID"}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[420px] rounded-[30px] px-7 pb-8 pt-9 text-center sm:px-9"
            style={{ background: T.card, border: `1px solid ${T.hairline}`, boxShadow: "0 30px 70px -30px rgba(28,25,23,0.45)" }}
          >
            <div
              className="mx-auto mb-6 flex h-[68px] w-[68px] items-center justify-center rounded-full"
              style={{ background: T.paper, boxShadow: `0 0 0 1px ${T.accent}55, 0 0 0 8px ${T.paper}` }}
            >
              <Sparkles className="h-7 w-7" style={{ color: T.accent }} />
            </div>

            {gate.recipientLabel && <Eyebrow>{lang === "id" ? `Untuk ${gate.recipientLabel}` : `For ${gate.recipientLabel}`}</Eyebrow>}
            <h1 className="mb-3 mt-3 text-[26px] leading-tight" style={{ fontFamily: serif, color: T.ink }}>
              {lang === "id" ? "Perkenalan pribadi untuk Anda" : "A private introduction for you"}
            </h1>
            <p className="mb-7 text-[14.5px] leading-relaxed" style={{ color: T.muted }}>
              {count > 0
                ? lang === "id"
                  ? `${count} profil pilihan menunggu. Masuk untuk membukanya — demi menjaga amanah setiap kandidat.`
                  : `${count} selected profiles are waiting. Sign in to open them — this protects each candidate's trust.`
                : lang === "id"
                  ? "Masuk untuk membuka perkenalan ini — demi menjaga amanah setiap kandidat."
                  : "Sign in to open this introduction — this protects each candidate's trust."}
            </p>

            <GoogleButton onClick={onSignIn} busy={busy} lang={lang} />

            <p className="mt-6 flex items-center justify-center gap-1.5 text-[11.5px]" style={{ color: T.faint }}>
              <Lock className="h-3 w-3" />
              {lang === "id" ? "Rahasia, terbatas, dan tercatat." : "Confidential, limited, and logged."}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function GateScreen({ state, lang, onToggleLang }: { state: Exclude<ShareGateState, "signin_required">; lang: Lang; onToggleLang: () => void }) {
  const copy = GATE_COPY[state][lang];
  const done = state === "completed";
  return (
    <div className="flex min-h-screen flex-col" style={{ background: T.paper }}>
      <TopStrip lang={lang} onToggleLang={onToggleLang} />
      <main className="flex flex-1 items-center justify-center px-5 py-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative w-full max-w-[430px] overflow-hidden rounded-[30px] px-8 pb-10 pt-12 text-center"
          style={{ background: T.card, border: `1px solid ${T.hairline}`, boxShadow: cardShadow }}
        >
          <div className="absolute inset-x-0 top-0 h-24 overflow-hidden" style={{ background: T.paperDeep }}>
            <GeometricPattern opacity={0.22} />
          </div>
          <div
            className="relative mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full"
            style={{ background: T.card, boxShadow: `0 0 0 1px ${T.accent}66, 0 0 0 7px ${T.card}` }}
          >
            {state === "error" ? <AlertCircle className="h-7 w-7" style={{ color: T.rose }} />
              : done ? <Check className="h-7 w-7" style={{ color: T.successInk }} />
              : <Lock className="h-7 w-7" style={{ color: T.navy }} />}
          </div>
          <h1 className="mb-3 text-[25px] leading-tight" style={{ fontFamily: serif, color: T.ink }}>{copy.title}</h1>
          <p className="mb-8 text-[14.5px] leading-relaxed" style={{ color: T.muted }}>{copy.body}</p>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-full px-7 text-[14px] font-bold text-white"
            style={{ background: T.navyDeep }}
          >
            {lang === "id" ? "Hubungi Tim Jodohmu" : "Contact the Jodohmu team"}
          </a>
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
  const [decided, setDecided] = useState<number[]>([]);
  const [stage, setStage] = useState<Stage>({ kind: "deck" });
  const [answers, setAnswers] = useState<ProfileAnswers>({});
  const [saving, setSaving] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ slot: number; index: number } | null>(null);
  const [finalNote, setFinalNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

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

  useEffect(() => {
    if (!data) return;
    setDecided(data.progress.decidedSlots);
    setFinalNote(data.progress.finalNote);
  }, [data]);

  const profiles = useMemo(() => data?.profiles ?? [], [data]);
  const questionnaire = data?.questionnaire.enabled ? data.questionnaire : null;
  const swipeId = useMemo(() => (questionnaire ? swipeQuestionId(questionnaire.questions) : null), [questionnaire]);

  const index = useMemo(() => {
    const next = profiles.findIndex(p => !decided.includes(p.slot));
    return next === -1 ? profiles.length : next;
  }, [profiles, decided]);

  useEffect(() => {
    if (!data) return;
    if (index >= profiles.length && profiles.length > 0 && stage.kind === "deck") setStage({ kind: "done" });
  }, [index, profiles.length, data, stage.kind]);

  /* ── engagement: visible seconds per profile + photo opens ── */
  const beacon = useCallback((body: { slot: number; seconds?: number; photo?: boolean; capture?: CaptureKind }) => {
    const url = `/api/share/${encodeURIComponent(token)}/activity`;
    const payload = JSON.stringify(body);
    try {
      if (navigator.sendBeacon?.(url, new Blob([payload], { type: "application/json" }))) return;
    } catch { /* fall through to fetch */ }
    fetch(url, { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }, [token]);

  const activeSlot = data ? (stage.kind === "form" ? stage.slot : profiles[index]?.slot ?? -1) : null;

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

  /* ── auth ── */
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

  const handleSignOut = async () => {
    await signOut(auth);
    loadedFor.current = null;
    setView({ kind: "loading" });
  };

  /* ── swiping ── */
  const onDecide = (decision: Decision) => {
    const profile = profiles[index];
    if (!profile) return;
    if (!questionnaire) {
      setDecided(prev => [...prev, profile.slot]);
      return;
    }
    setAnswers(swipeId ? { [swipeId]: decision } : {});
    setHighlight(null);
    setStage({ kind: "form", slot: profile.slot, decision });
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  /** Step back to the profile just decided so it can be swiped again. */
  const undo = () => {
    if (!decided.length) return;
    setDecided(prev => prev.slice(0, -1));
    setAnswers({});
    setHighlight(null);
    setStage({ kind: "deck" });
  };

  const saveDecision = async () => {
    if (stage.kind !== "form" || !questionnaire) return;
    const profile = profiles.find(p => p.slot === stage.slot);
    if (!profile) return;

    const seeded = swipeId ? { ...answers, [swipeId]: stage.decision } : answers;
    const check = checkProfileAnswers(questionnaire.questions, seeded, profile.photosHidden);
    if (!check.ok) {
      setHighlight(check.questionId ?? null);
      toast.error(l === "id" ? "Masih ada pertanyaan yang belum dijawab." : "A few questions still need an answer.");
      return;
    }

    setSaving(true);
    try {
      const current = auth.currentUser;
      if (!current) throw new Error("auth");
      const res = await fetch(`/api/share/${encodeURIComponent(token)}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await current.getIdToken()}` },
        body: JSON.stringify({ kind: "decision", slot: stage.slot, decision: stage.decision, answers }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.questionId) setHighlight(json.questionId);
        throw new Error(json.error ?? "failed");
      }
      setDecided(json.decidedSlots ?? [...decided, stage.slot]);
      setAnswers({});
      setStage({ kind: "deck" });
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    } catch {
      toast.error(l === "id" ? "Belum berhasil menyimpan. Coba lagi." : "Couldn't save yet. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      const current = auth.currentUser;
      if (!current) throw new Error("auth");
      const res = await fetch(`/api/share/${encodeURIComponent(token)}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await current.getIdToken()}` },
        body: JSON.stringify({ kind: "note", finalNote }),
      });
      if (!res.ok) throw new Error("failed");
      setNoteSaved(true);
      toast.success(l === "id" ? "Catatan terkirim. Jazakumullahu khairan." : "Note sent. Jazakumullahu khairan.");
    } catch {
      toast.error(l === "id" ? "Belum berhasil mengirim." : "Couldn't send it yet.");
    } finally {
      setSaving(false);
    }
  };

  const expiry = useCountdown(data?.expiresAt ?? null, l);

  /* lightbox keys */
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
          <Image src={LogoIcon} alt="Jodohmu" height={32} style={{ width: "auto" }} priority />
          <div className="h-[2px] w-24 overflow-hidden rounded-full" style={{ background: T.hairline }}>
            <motion.div
              className="h-full w-1/2 rounded-full"
              style={{ background: T.accent }}
              animate={reduceMotion ? undefined : { x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (view.kind === "gate") {
    return view.gate.state === "signin_required"
      ? <SignInGate gate={view.gate} lang={l} onToggleLang={toggleLang} onSignIn={signIn} busy={signingIn} />
      : <GateScreen state={view.gate.state} lang={l} onToggleLang={toggleLang} />;
  }

  const d = view.data;
  const formProfile = stage.kind === "form" ? profiles.find(p => p.slot === stage.slot) : null;

  // The deck fills the screen like a dating app; the form and finish screens scroll normally.
  const deckMode = stage.kind === "deck" && index < profiles.length;

  return (
    <div
      className={deckMode ? "flex h-screen flex-col overflow-hidden" : "min-h-screen"}
      style={deckMode ? { background: T.paper, height: "100dvh" } : { background: T.paper }}
    >
      <TopStrip
        lang={l}
        onToggleLang={toggleLang}
        viewer={d.viewer}
        onSignOut={handleSignOut}
        expiry={expiry}
        progress={stage.kind === "done" ? null : { current: Math.min(index + 1, profiles.length), total: profiles.length }}
      />

      {deckMode ? (
        <main className="relative min-h-0 flex-1">
          <SwipeDeck
            profiles={profiles}
            index={index}
            lang={l}
            askQuestions={!!questionnaire}
            note={index === 0 ? d.recipientNote || undefined : undefined}
            onDecide={onDecide}
            onUndo={undo}
            canUndo={decided.length > 0}
            watermark={`${d.viewer?.email || d.recipientLabel} · ${d.code}`}
            onCaptureAttempt={kind => beacon({ slot: profiles[index]?.slot ?? -1, capture: kind })}
            onOpenPhoto={(slot, photoIndex) => {
              setLightbox({ slot, index: photoIndex });
              beacon({ slot, photo: true });
            }}
          />
        </main>
      ) : (
      <main className="mx-auto max-w-2xl px-5 pb-16 pt-4">
        <AnimatePresence mode="wait">
          {/* ── the form that follows a swipe ── */}
          {stage.kind === "form" && formProfile && questionnaire && (
            <motion.div
              key={`form-${stage.slot}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-[28px]"
              style={{ background: T.card, border: `1px solid ${T.hairline}`, boxShadow: cardShadow }}
            >
              <div className="flex items-center gap-3 px-6 py-5 sm:px-8" style={{ background: T.paperDeep }}>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold"
                  style={{ background: stage.decision === "yes" ? "#ECFDF5" : T.roseSoft, color: stage.decision === "yes" ? T.successInk : T.rose }}
                >
                  {stage.decision === "yes" ? <Heart className="h-5 w-5 fill-current" /> : <X className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px]" style={{ fontFamily: serif, color: T.ink }}>{profileTitle(formProfile, l)}</p>
                  <p className="text-[12.5px]" style={{ color: T.muted }}>
                    {stage.decision === "yes"
                      ? l === "id" ? "Anda merasa cocok" : "You felt it's a match"
                      : l === "id" ? "Anda merasa belum cocok" : "You felt it's not a match"}
                  </p>
                </div>
                <button
                  onClick={() => { setStage({ kind: "deck" }); setAnswers({}); }}
                  className="rounded-full px-3 py-1.5 text-[12px] font-bold"
                  style={{ border: `1px solid ${T.hairline}`, background: T.card, color: T.body }}
                >
                  {l === "id" ? "Ubah" : "Change"}
                </button>
              </div>

              <div className="px-6 py-7 sm:px-8">
                <p className="mb-7 text-[14px] leading-relaxed" style={{ color: T.muted }}>
                  {l === "id"
                    ? "Ceritakan sedikit alasannya. Jawaban jujur membantu matchmaker Anda — hanya tim Jodohmu yang membacanya."
                    : "Tell us a little about why. Honest answers help your matchmaker — only the Jodohmu team reads them."}
                </p>

                <ReflectionForm
                  questions={questionnaire.questions.filter(q => q.id !== swipeId)}
                  answers={swipeId ? { ...answers, [swipeId]: stage.decision } : answers}
                  onChange={setAnswers}
                  photosHidden={formProfile.photosHidden}
                  lang={l}
                  highlightId={highlight}
                  disabled={saving}
                />

                <button
                  onClick={saveDecision}
                  disabled={saving}
                  className="mt-9 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${T.navyDeep}, ${T.rose})`, boxShadow: "0 14px 30px -14px rgba(155,34,66,0.6)" }}
                >
                  {saving
                    ? l === "id" ? "Menyimpan…" : "Saving…"
                    : index + 1 >= profiles.length
                      ? l === "id" ? "Simpan & selesai" : "Save & finish"
                      : l === "id" ? "Simpan & lanjut" : "Save & continue"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── finished ── */}
          {stage.kind === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-[28px] text-center"
              style={{ background: T.card, border: `1px solid ${T.hairline}`, boxShadow: cardShadow }}
            >
              <div className="relative h-24 overflow-hidden" style={{ background: T.paperDeep }}>
                <GeometricPattern opacity={0.25} />
              </div>
              <div className="px-6 pb-9 pt-7 sm:px-10">
                <div
                  className="relative z-10 mx-auto -mt-16 mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full"
                  style={{ background: T.card, boxShadow: `0 0 0 1px ${T.accent}66, 0 0 0 7px ${T.card}` }}
                >
                  <Check className="h-7 w-7" style={{ color: T.successInk }} />
                </div>
                <Eyebrow>{l === "id" ? "Selesai" : "All done"}</Eyebrow>
                <h1 className="mb-3 mt-3 text-[28px] leading-tight" style={{ fontFamily: serif, color: T.ink }}>
                  {l === "id" ? "Jazakumullahu khairan" : "Jazakumullahu khairan"}
                </h1>
                <p className="mx-auto mb-8 max-w-md text-[14.5px] leading-relaxed" style={{ color: T.muted }}>
                  {questionnaire
                    ? l === "id"
                      ? "Refleksi Anda sudah kami terima. Matchmaker Anda akan meninjau dan menghubungi Anda untuk langkah berikutnya, insyaAllah."
                      : "We've received your reflections. Your matchmaker will review them and be in touch about the next step, insyaAllah."
                    : l === "id"
                      ? "Terima kasih telah melihat profil pilihan kami."
                      : "Thank you for looking through our selected profiles."}
                </p>

                {questionnaire && (
                  <div className="mx-auto mb-8 max-w-md text-left">
                    <label className="mb-2 block text-[15px]" style={{ fontFamily: serif, color: T.ink }}>
                      {l === "id" ? "Ada pesan untuk matchmaker Anda?" : "Anything to add for your matchmaker?"}
                      <span className="ml-2 font-sans text-[11.5px]" style={{ color: T.faint }}>{l === "id" ? "(opsional)" : "(optional)"}</span>
                    </label>
                    <textarea
                      value={finalNote}
                      onChange={e => { setFinalNote(e.target.value); setNoteSaved(false); }}
                      rows={3}
                      maxLength={2000}
                      className="w-full resize-y rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed focus:outline-none"
                      style={{ background: T.surface, border: `1px solid ${T.hairline}`, color: T.ink }}
                      placeholder={l === "id" ? "Apa pun yang perlu kami ketahui…" : "Anything we should know…"}
                    />
                    <button
                      onClick={saveNote}
                      disabled={saving || !finalNote.trim() || noteSaved}
                      className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-bold text-white disabled:opacity-50"
                      style={{ background: T.navyDeep }}
                    >
                      {noteSaved ? <><Check className="h-4 w-4" /> {l === "id" ? "Terkirim" : "Sent"}</> : l === "id" ? "Kirim catatan" : "Send note"}
                    </button>
                  </div>
                )}

                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center rounded-full px-7 text-[14px] font-bold"
                  style={{ background: T.paperDeep, color: T.navyDeep }}
                >
                  {l === "id" ? "Bicara dengan matchmaker" : "Talk to a matchmaker"}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      )}

      {/* ── lightbox ── */}
      <AnimatePresence>
        {lightbox && d.profiles[lightbox.slot]?.photos[lightbox.index] && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(12,10,9,0.94)" }}
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
