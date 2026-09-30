"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, AtSign, CheckCircle2, ChevronDown, Facebook, Instagram, XCircle } from "lucide-react";
import { authFetch } from "@/components/admin/share-api";
import type { SocialAccountKey } from "@/lib/social-accounts";

type Lang = "id" | "en";
type Logins = {
  meta: { present: boolean; valid: boolean; expiresAt: number | null; missing: { scope: string; for: string }[]; error: string | null };
  threads: { connected: boolean; expiresAt: number | null };
  threadsConfigured: boolean;
};
type Tone = "ok" | "warn" | "bad" | "off";

const DAY = 24 * 60 * 60 * 1000;
// Two weeks' warning before the bot login runs out
const WARN_DAYS = 14;
// Indonesian for what each missing permission stops (the server sends English)
const PERMISSION_ID: Record<string, string> = {
  pages_show_list: "menemukan Page",
  business_management: "mengakses Page di portofolio bisnis",
  instagram_basic: "membaca posting Instagram",
  instagram_content_publish: "posting ke Instagram",
  instagram_manage_comments: "membalas & menyembunyikan komentar Instagram",
  pages_read_engagement: "membaca posting Facebook",
  pages_manage_posts: "posting ke Facebook",
  pages_read_user_content: "membaca komentar Facebook",
  pages_manage_engagement: "membalas & menyembunyikan komentar Facebook",
};
const TONE: Record<Tone, { bg: string; border: string; text: string }> = {
  ok: { bg: "#F0FDF4", border: "#BBF7D0", text: "#047857" },
  warn: { bg: "#FFFBEB", border: "#FDE68A", text: "#B45309" },
  bad: { bg: "#FFF1F2", border: "#FECDD3", text: "#BE123C" },
  off: { bg: "#F8FAFC", border: "#E2E8F0", text: "#64748B" },
};

/* Until when each login behind an account works, above every Subpages view, so the team can see
   why posting stopped (an expired login, a missing permission) and how to renew it. */
export default function LoginStatus({ accountKey, lang }: { accountKey: SocialAccountKey; lang: Lang }) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [logins, setLogins] = useState<Logins | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    authFetch<Logins>(`/api/admin/hub?account=${accountKey}&logins=1`).then((d) => { if (live) setLogins(d); }).catch(() => null);
    return () => { live = false; };
  }, [accountKey]);
  if (!logins) return null;

  const date = (ms: number) => new Date(ms).toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const daysLeft = (ms: number) => Math.ceil((ms - Date.now()) / DAY);

  // The Instagram + Facebook bot login
  const m = logins.meta;
  const metaExpired = m.present && (!m.valid || (m.expiresAt !== null && m.expiresAt <= Date.now()));
  const metaTone: Tone = !m.present || metaExpired ? "bad"
    : m.missing.length || (m.expiresAt !== null && daysLeft(m.expiresAt) <= WARN_DAYS) ? "warn" : "ok";
  const metaLine = !m.present
    ? t("Belum ada login. Posting ke Instagram & Facebook mati.", "No login set. Posting to Instagram and Facebook is off.")
    : metaExpired
      ? `${m.expiresAt ? t(`Kedaluwarsa ${date(m.expiresAt)}.`, `Expired on ${date(m.expiresAt)}.`) : t("Kedaluwarsa atau tidak berlaku.", "Expired or no longer valid.")} ${t("Posting ke Instagram & Facebook berhenti sampai diperbarui.", "Posting to Instagram and Facebook has stopped until it's renewed.")}`
      : m.expiresAt === null
        ? t("Berlaku tanpa batas waktu.", "Never expires.")
        : daysLeft(m.expiresAt) <= WARN_DAYS
          ? t(`Kedaluwarsa dalam ${daysLeft(m.expiresAt)} hari (${date(m.expiresAt)}). Perbarui sebelum tanggal itu.`, `Expires in ${daysLeft(m.expiresAt)} days (${date(m.expiresAt)}). Renew before then.`)
          : t(`Berlaku sampai ${date(m.expiresAt)} (${daysLeft(m.expiresAt)} hari lagi).`, `Valid until ${date(m.expiresAt)} (${daysLeft(m.expiresAt)} days left).`);

  // This account's Threads login, which renews itself while it's in use
  const th = logins.threads;
  const threadsExpired = !th.connected && th.expiresAt !== null;
  const threadsTone: Tone = th.connected ? "ok" : threadsExpired ? "bad" : "off";
  const threadsLine = th.connected
    ? t(`Diperbarui otomatis · berlaku sampai ${date(th.expiresAt!)}.`, `Renews itself · valid until ${date(th.expiresAt!)}.`)
    : threadsExpired
      ? t(`Login kedaluwarsa ${date(th.expiresAt!)}. Posting ke Threads berhenti. Klik "Hubungkan" di Inbox & posting.`, `Login expired on ${date(th.expiresAt!)}. Posting to Threads has stopped. Click "Connect" under Inbox & posting.`)
      : t("Belum terhubung.", "Not connected.");

  const needsHelp = metaTone !== "ok";
  const Row = ({ tone, icons, name, line }: { tone: Tone; icons: React.ReactNode; name: string; line: string }) => {
    const c = TONE[tone];
    const Icon = tone === "ok" ? CheckCircle2 : tone === "bad" ? XCircle : AlertTriangle;
    return (
      <div className="flex items-start gap-2 rounded-lg border px-3 py-2 text-[12.5px]" style={{ background: c.bg, borderColor: c.border }}>
        <span className="mt-0.5 flex shrink-0 gap-0.5 text-slate-500">{icons}</span>
        <p className="min-w-0 flex-1" style={{ color: "#0F172A" }}>
          <b>{name}</b> <span style={{ color: c.text }}>{line}</span>
        </p>
        {tone !== "off" && <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: c.text }} />}
      </div>
    );
  };

  return (
    <div className="space-y-1.5">
      <div className="grid gap-1.5 md:grid-cols-2">
        <Row tone={metaTone} name={t("Login Instagram + Facebook", "Instagram + Facebook login")} line={metaLine}
          icons={<><Instagram className="h-3.5 w-3.5" /><Facebook className="h-3.5 w-3.5" /></>} />
        <Row tone={threadsTone} name={t("Login Threads", "Threads login")} line={threadsLine} icons={<AtSign className="h-3.5 w-3.5" />} />
      </div>

      {m.present && m.valid && m.missing.length > 0 && (
        <div className="rounded-lg border px-3 py-2 text-[12.5px]" style={{ background: TONE.warn.bg, borderColor: TONE.warn.border, color: TONE.warn.text }}>
          <b>{t("Izin yang belum ada:", "Missing permissions:")}</b>{" "}
          {m.missing.map((p) => `${p.scope} (${t(`untuk ${PERMISSION_ID[p.scope] ?? p.for}`, `needed for ${p.for}`)})`).join(" · ")}
        </div>
      )}
      {m.error && metaExpired && <p className="px-1 text-[11.5px]" style={{ color: TONE.bad.text }}>Meta: {m.error}</p>}

      {needsHelp && (
        <div className="rounded-lg border bg-white text-[12.5px]" style={{ borderColor: "#E2E8F0" }}>
          <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-1.5 px-3 py-2 font-bold" style={{ color: "#1B3A6B" }}>
            <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
            {t("Cara memperbarui login Instagram + Facebook", "How to renew the Instagram + Facebook login")}
          </button>
          {open && (
            <ol className="list-decimal space-y-1 px-8 pb-3" style={{ color: "#334155" }}>
              <li>{t("Buka business.facebook.com → Settings → System users → ", "Open business.facebook.com → Settings → System users → ")}<b>Jodohmu Poster Bot</b>.</li>
              <li>{t("Klik ", "Click ")}<b>Generate token</b>{t(", pilih aplikasi Jodohmu Poster, centang semua izin di atas, lalu salin tokennya.", ", choose the Jodohmu Poster app, tick every permission listed above, and copy the token.")}</li>
              <li>{t("Di Vercel → project jodohmu → Settings → Environment Variables, ganti ", "In Vercel → the jodohmu project → Settings → Environment Variables, replace ")}<b>META_SYSTEM_USER_TOKEN</b>{t(" dengan token baru, lalu Redeploy.", " with the new token, then Redeploy.")}</li>
              <li>{t("Muat ulang halaman ini. Tanggal berlaku akan diperbarui sendiri.", "Reload this page. The valid-until date updates by itself.")}</li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
