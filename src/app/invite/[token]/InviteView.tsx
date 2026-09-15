"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, signOut, type User } from "firebase/auth";
import { Clock3, KeyRound, Link2Off, Loader2, PencilLine, Share2, ShieldCheck } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { GoogleMark } from "@/components/share/share-theme";
import type { InvitePublicPayload, InviteState } from "@/lib/account-invites";
import LogoIcon from "@/assets/jodohmu-logo.png";

const WA = `https://wa.me/6281122210303?text=${encodeURIComponent("Assalamualaikum, saya butuh link baru untuk masuk ke profil Jodohmu saya.")}`;

type L = (id: string, en: string) => string;
type Problem = { kind: "wrong_account"; emailHint: string; signedInAs: string } | { kind: "error" };

export default function InviteView({ token }: { token: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { lang } = useLanguage();
  const l: L = (id, en) => (lang === "id" ? id : en);

  const [info, setInfo] = useState<InvitePublicPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const claiming = useRef(false);
  const autoTried = useRef(false);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(r => r.json())
      .then((p: InvitePublicPayload) => setInfo(p))
      .catch(() => setInfo({ state: "missing" }));
  }, [token]);

  /** Claims the invite for the signed-in account and moves on. */
  const claim = useCallback(async (u: User): Promise<boolean> => {
    if (claiming.current) return false;
    claiming.current = true;
    setBusy(true);
    setProblem(null);
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${await u.getIdToken()}` },
      });
      const body = (await res.json().catch(() => ({}))) as {
        team?: boolean; candidateId?: string; error?: string; emailHint?: string;
      };
      if (res.ok) {
        router.replace(body.team && body.candidateId ? `/admin/candidates/${body.candidateId}` : "/dashboard/profile");
        return true;
      }
      setProblem(
        body.error === "wrong_account"
          ? { kind: "wrong_account", emailHint: body.emailHint ?? "", signedInAs: u.email ?? "" }
          : { kind: "error" },
      );
      setBusy(false);
      return false;
    } catch {
      setProblem({ kind: "error" });
      setBusy(false);
      return false;
    } finally {
      claiming.current = false;
    }
  }, [token, router]);

  const usable = info?.state === "valid" || info?.state === "accepted";

  // Already signed in (e.g. came back from password login): claim straight away
  useEffect(() => {
    if (loading || !user || !usable || autoTried.current) return;
    autoTried.current = true;
    claim(user);
  }, [loading, user, usable, claim]);

  const continueWithGoogle = async () => {
    setProblem(null);
    setBusy(true);
    autoTried.current = true;
    try {
      if (auth.currentUser) await signOut(auth);
      const cred = await signInWithPopup(auth, googleProvider);
      const ok = await claim(cred.user);
      if (!ok) await signOut(auth);
    } catch {
      // popup closed or blocked
      setBusy(false);
    }
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #FDEFF3 0%, #FFFFFF 40%, #F1F5FF 100%)" }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-6 sm:px-5">
        <Link href="/" className="mx-auto flex items-center gap-2" aria-label="Jodohmu">
          <Image src={LogoIcon} alt="" width={36} height={36} className="h-9 w-9 object-contain" priority />
          <span className="text-lg font-extrabold tracking-tight text-[#102B61]">Jodohmu</span>
        </Link>

        <div className="flex flex-1 items-center py-8">
          {!info ? (
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#9B2242] border-t-transparent" />
          ) : usable ? (
            <Welcome
              l={l}
              info={info}
              token={token}
              busy={busy}
              problem={problem}
              onGoogle={continueWithGoogle}
            />
          ) : (
            <Unavailable l={l} state={info.state} />
          )}
        </div>

        <p className="text-center text-[11.5px] leading-relaxed text-[#7C8AA3]">
          {l(
            "Link ini bersifat pribadi. Jangan bagikan ke orang lain.",
            "This link is personal. Please don't share it with anyone.",
          )}
        </p>
      </div>
    </main>
  );
}

function Welcome({ l, info, token, busy, problem, onGoogle }: {
  l: L;
  info: InvitePublicPayload;
  token: string;
  busy: boolean;
  problem: Problem | null;
  onGoogle: () => void;
}) {
  const wrong = problem?.kind === "wrong_account" ? problem : null;

  return (
    <section className="w-full overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-24px_rgba(16,43,97,0.35)] ring-1 ring-[#E6EAF5]">
      <div
        className="px-6 pb-7 pt-8 text-white"
        style={{ background: "linear-gradient(135deg, #0B3A86 0%, #4C1F35 62%, #9B2242 100%)" }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
          {l("Undangan pribadi", "Personal invitation")}
        </p>
        <h1 className="mt-2 text-[26px] font-extrabold leading-tight">
          Assalamualaikum{info.firstName ? `, ${info.firstName}` : ""}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-white/85">
          {l(
            "Tim Jodohmu sudah menyiapkan profil ta'aruf kamu. Masuk untuk melihat dan melengkapinya.",
            "The Jodohmu team has set up your ta'aruf profile. Sign in to view and complete it.",
          )}
        </p>
      </div>

      <div className="px-5 py-6 sm:px-6">
        <ul className="space-y-4">
          <Perk
            icon={<PencilLine className="h-4 w-4" />}
            title={l("Lengkapi & perbarui profil", "Complete and update your profile")}
            text={l(
              "Ubah data diri kapan saja. Bagian yang dikunci tim tetap bisa kamu lihat.",
              "Edit your details anytime. Anything the team has locked stays visible to you.",
            )}
          />
          <Perk
            icon={<ShieldCheck className="h-4 w-4" />}
            title={l("Lihat hasil verifikasi", "See your verification results")}
            text={l(
              "Tes psikolog, background check, verifikasi identitas, dan assessment Jodohmu — hanya untuk dilihat.",
              "Psych test, background check, identity check and Jodohmu assessment — view only.",
            )}
          />
          <Perk
            icon={<Share2 className="h-4 w-4" />}
            title={l("Bagikan profil kamu", "Share your profile")}
            text={l(
              "Aktifkan link profil untuk dibagikan ke keluarga atau orang yang kamu percaya.",
              "Turn on your profile link to share it with family or people you trust.",
            )}
          />
        </ul>

        <div className="mt-6 rounded-2xl bg-[#F6F8FC] px-4 py-3 text-[13px] leading-relaxed text-[#52617C]">
          {l("Masuk dengan akun", "Sign in with")}{" "}
          <span className="break-all font-semibold text-[#102B61]">{info.emailHint}</span>
        </div>

        {wrong && (
          <div className="mt-3 rounded-2xl border border-[#F7BFD0] bg-[#FFF5F8] px-4 py-3 text-[13px] leading-relaxed text-[#9B2242]">
            {l(
              `Kamu masuk sebagai ${wrong.signedInAs || "akun lain"}, sedangkan undangan ini untuk ${wrong.emailHint}. Pilih akun Google yang benar.`,
              `You signed in as ${wrong.signedInAs || "a different account"}, but this invitation is for ${wrong.emailHint}. Please choose the right Google account.`,
            )}
          </div>
        )}
        {problem?.kind === "error" && (
          <div className="mt-3 rounded-2xl border border-[#F7BFD0] bg-[#FFF5F8] px-4 py-3 text-[13px] text-[#9B2242]">
            {l("Terjadi kesalahan. Silakan coba lagi.", "Something went wrong. Please try again.")}
          </div>
        )}

        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white text-[15px] font-semibold text-[#102B61] shadow-sm ring-1 ring-[#D6DCEA] transition hover:bg-[#F6F8FC] disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleMark size={20} />}
          {wrong ? l("Pilih akun Google lain", "Choose another Google account") : l("Lanjutkan dengan Google", "Continue with Google")}
        </button>

        <Link
          href={`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`}
          className={`mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold transition hover:bg-[#F1F5FF] ${info.googleEmail ? "text-[#7C8AA3]" : "text-[#0B3A86]"}`}
        >
          <KeyRound className="h-4 w-4" />
          {l("Masuk dengan email & password dari tim", "Sign in with the email & password from our team")}
        </Link>
      </div>
    </section>
  );
}

function Perk({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FDEFF3] text-[#9B2242]">
        {icon}
      </span>
      <span>
        <span className="block text-[14px] font-semibold text-[#102B61]">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-relaxed text-[#52617C]">{text}</span>
      </span>
    </li>
  );
}

function Unavailable({ l, state }: { l: L; state: InviteState }) {
  const expired = state === "expired";
  return (
    <section className="w-full rounded-3xl bg-white px-6 py-10 text-center shadow-[0_24px_60px_-24px_rgba(16,43,97,0.35)] ring-1 ring-[#E6EAF5]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDEFF3] text-[#9B2242]">
        {expired ? <Clock3 className="h-6 w-6" /> : <Link2Off className="h-6 w-6" />}
      </div>
      <h1 className="mt-4 text-xl font-extrabold text-[#102B61]">
        {expired ? l("Link sudah kedaluwarsa", "This link has expired") : l("Link tidak berlaku", "This link isn't valid")}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-[#52617C]">
        {expired
          ? l(
              "Minta link baru ke tim Jodohmu, atau masuk langsung jika kamu sudah pernah login.",
              "Ask the Jodohmu team for a new link, or sign in directly if you've logged in before.",
            )
          : l(
              "Link ini sudah diganti dengan yang baru atau tidak ditemukan. Minta link terbaru ke tim Jodohmu.",
              "This link was replaced by a newer one or doesn't exist. Ask the Jodohmu team for the latest link.",
            )}
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <a
          href={WA}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center rounded-full text-[14px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #0B3A86, #9B2242)" }}
        >
          {l("Hubungi tim Jodohmu", "Contact the Jodohmu team")}
        </a>
        <Link href="/login" className="flex h-11 items-center justify-center rounded-full text-[14px] font-semibold text-[#0B3A86] hover:bg-[#F1F5FF]">
          {l("Masuk", "Sign in")}
        </Link>
      </div>
    </section>
  );
}
