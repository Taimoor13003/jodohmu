"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity, Ban, BarChart3, Check, CheckCircle2, Clock, Copy, Eye, Globe2, HeartHandshake, Image as ImageIcon,
  KeyRound, Link2, Mail, MapPin, Megaphone, MessageCircle, MessageSquareText, Monitor, Plus, RefreshCw,
  RotateCcw, Smartphone, Tablet, Timer, Users, X,
} from "lucide-react";
import { optionsFor } from "@/lib/share-questions";
import type { VisitContext } from "@/lib/share-analytics";
import type { ShareDetail, ShareSummary, ShareViewerRow } from "@/lib/share-types";
import ShareBuilder from "./share-builder";
import { authFetch, formatDateTime, shareUrl } from "./share-api";

type Lang = "id" | "en";

const C = {
  card: "#FFFFFF", border: "#E2E8F0", divider: "#F1F5F9", bg: "#F8FAFC",
  text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8",
  navy: "#1B3A6B", rose: "#C4294A", green: "#047857", greenBg: "#ECFDF5",
};

const STATE_BADGE: Record<ShareSummary["state"], { label: Record<Lang, string>; bg: string; fg: string }> = {
  active: { label: { id: "Aktif", en: "Active" }, bg: "#ECFDF5", fg: "#047857" },
  expired: { label: { id: "Kedaluwarsa", en: "Expired" }, bg: "#FEF2F2", fg: "#B91C1C" },
  exhausted: { label: { id: "Habis", en: "Used up" }, bg: "#FFF7ED", fg: "#C2410C" },
  revoked: { label: { id: "Dicabut", en: "Revoked" }, bg: "#F1F5F9", fg: "#475569" },
};

const ACCESS_META = {
  anyone: { icon: Globe2, id: "Siapa saja", en: "Anyone" },
  signin: { icon: KeyRound, id: "Wajib masuk", en: "Sign-in" },
  invited: { icon: Mail, id: "Diundang", en: "Invited" },
} as const;

const TIER_LABEL: Record<string, Record<Lang, string>> = {
  public: { id: "Tanpa masuk", en: "Not signed in" },
  member: { id: "Sudah masuk", en: "Signed in" },
  candidate: { id: "Kandidat / tim", en: "Candidate / team" },
};

/* ── formatting helpers ───────────────────────────────── */

function formatDuration(seconds: number, lang: Lang): string {
  const id = lang === "id";
  if (!seconds) return id ? "0 dtk" : "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) return id ? `${Math.floor(m / 60)} j ${m % 60} mnt` : `${Math.floor(m / 60)}h ${m % 60}m`;
  if (m > 0) return id ? `${m} mnt ${s} dtk` : `${m}m ${s}s`;
  return id ? `${s} dtk` : `${s}s`;
}

function relativeTime(iso: string | null, lang: Lang): string {
  if (!iso) return "—";
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang === "id" ? "id" : "en", { numeric: "auto" });
  if (diff < 60) return rtf.format(-diff, "second");
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), "minute");
  if (diff < 86_400) return rtf.format(-Math.round(diff / 3600), "hour");
  return rtf.format(-Math.round(diff / 86_400), "day");
}

function DeviceIcon({ device, className }: { device?: VisitContext["device"]; className?: string }) {
  if (device === "desktop") return <Monitor className={className} />;
  if (device === "tablet") return <Tablet className={className} />;
  return <Smartphone className={className} />;
}

function visitSummary(visit: VisitContext | null, lang: Lang): string {
  if (!visit) return lang === "id" ? "Perangkat tidak diketahui" : "Unknown device";
  const device = { mobile: lang === "id" ? "Ponsel" : "Phone", tablet: "Tablet", desktop: lang === "id" ? "Komputer" : "Computer" }[visit.device];
  return [
    `${device} · ${visit.os}`,
    visit.app ? `${lang === "id" ? "lewat" : "via"} ${visit.app}` : visit.browser,
    visit.referrer ? `${lang === "id" ? "dari" : "from"} ${visit.referrer}` : null,
  ].filter(Boolean).join(" · ");
}

function placeLabel(visit: VisitContext | null): string | null {
  if (!visit) return null;
  return [visit.city, visit.country].filter(Boolean).join(", ") || null;
}

function viewerTitle(v: ShareViewerRow | undefined, key: string, lang: Lang): string {
  if (v?.name || v?.email) return (v.name || v.email)!;
  return `${lang === "id" ? "Tamu anonim" : "Anonymous guest"} #${key.slice(-4).toUpperCase()}`;
}

/* ── row ──────────────────────────────────────────────── */

function ShareRow({ share, lang, onChanged, onOpenDetails }: {
  share: ShareSummary;
  lang: Lang;
  onChanged: (next: ShareSummary) => void;
  onOpenDetails: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [busy, setBusy] = useState(false);
  const badge = STATE_BADGE[share.state];
  const access = ACCESS_META[share.access.mode];
  const AccessIcon = access.icon;
  const names = share.candidateIds.map(id => share.candidateNames[id] ?? "—");

  const patch = async (body: Record<string, unknown>, msg: string) => {
    setBusy(true);
    try {
      const json = await authFetch<{ share: ShareSummary }>(`/api/admin/shares/${share.id}`, { method: "PATCH", body: JSON.stringify(body) });
      onChanged(json.share);
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const url = shareUrl(share.id);
  const wa = encodeURIComponent(
    lang === "id"
      ? `Assalamualaikum. Berikut perkenalan pribadi dari Jodohmu — tautan ini bersifat rahasia dan terbatas:\n${url}`
      : `Assalamualaikum. Here is a private introduction from Jodohmu — this link is confidential and limited:\n${url}`,
  );

  const btn = "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold disabled:opacity-50";

  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: C.border }}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: badge.bg, color: badge.fg }}>{badge.label[lang]}</span>
        <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: share.purpose === "matchmaking" ? "#FDF2F4" : "#EFF4FB", color: share.purpose === "matchmaking" ? C.rose : C.navy }}>
          {share.purpose === "matchmaking" ? <HeartHandshake className="h-3 w-3" /> : <Megaphone className="h-3 w-3" />}
          {share.purpose === "matchmaking" ? t("Perjodohan", "Matchmaking") : t("Promosi", "Promotion")}
        </span>
        <span className="text-[14px] font-bold" style={{ color: C.text }}>{share.recipientLabel}</span>
        <span className="rounded px-1.5 py-0.5 font-mono text-[10.5px]" style={{ background: C.bg, color: C.muted }}>{share.code}</span>
        <div className="flex-1" />
        <button onClick={() => navigator.clipboard.writeText(url).then(() => toast.success(t("Tautan disalin", "Link copied")))} className={btn} style={{ borderColor: C.border, color: C.body }}>
          <Copy className="h-3 w-3" /> {t("Salin", "Copy")}
        </button>
        <a href={`https://wa.me/?text=${wa}`} target="_blank" rel="noopener noreferrer" className={btn} style={{ borderColor: "#A7F3D0", background: "#ECFDF5", color: "#047857" }}>
          <MessageCircle className="h-3 w-3" /> WhatsApp
        </a>
        <button onClick={onOpenDetails} className={btn} style={{ borderColor: C.navy, background: C.navy, color: "#fff" }}>
          <BarChart3 className="h-3 w-3" /> {t("Metrik", "Metrics")}
        </button>
      </div>

      <p className="mb-3 truncate text-[12.5px]" style={{ color: C.label }}>
        {names.map((n, i) => <span key={i}>{i > 0 && " · "}{n}</span>)}
      </p>

      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11.5px]" style={{ color: C.label }}>
        <span className="flex items-center gap-1.5"><AccessIcon className="h-3 w-3" />{lang === "id" ? access.id : access.en}</span>
        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />
          {share.expiresAt ? `${t("Sampai", "Until")} ${formatDateTime(share.expiresAt, lang)}` : t("Tanpa kedaluwarsa", "No expiry")}
        </span>
        <span className="flex items-center gap-1.5"><Eye className="h-3 w-3" />
          {share.opens}{share.maxOpens !== null ? ` / ${share.maxOpens}` : ""} {t("dibuka", "opens")}
          {share.maxOpensPerViewer !== null && ` · ${t("maks", "max")} ${share.maxOpensPerViewer}/${t("orang", "person")}`}
        </span>
        <span className="flex items-center gap-1.5"><Users className="h-3 w-3" />{share.viewerCount} {t("orang", "people")}</span>
        {share.questionnaire.enabled && (
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: share.responseCount ? C.green : C.label }}>
            <MessageSquareText className="h-3 w-3" />{share.responseCount} {t("jawaban", "responses")}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-3" style={{ borderTop: `1px solid ${C.divider}` }}>
        <span className="text-[11px]" style={{ color: C.muted }}>
          {t("Dibuat", "Created")} {formatDateTime(share.createdAt, lang)} · {share.createdByName}
          {share.lastOpenedAt && ` · ${t("terakhir dibuka", "last opened")} ${relativeTime(share.lastOpenedAt, lang)}`}
        </span>
        <div className="flex-1" />
        {share.state === "revoked" ? (
          <button disabled={busy} onClick={() => patch({ restore: true }, t("Tautan dipulihkan", "Link restored"))} className={btn} style={{ borderColor: C.border, color: C.body }}>
            <RotateCcw className="h-3 w-3" /> {t("Pulihkan", "Restore")}
          </button>
        ) : (
          <>
            {share.state === "exhausted" && (
              <button disabled={busy} onClick={() => patch({ grantExtraOpens: 1 }, t("Ditambah 1 kali buka", "Granted one more open"))} className={btn} style={{ borderColor: C.border, color: C.navy }}>
                <Plus className="h-3 w-3" /> {t("+1 buka", "+1 open")}
              </button>
            )}
            {share.state === "expired" && (
              <button disabled={busy} onClick={() => patch({ expiresAtMs: Date.now() + 72 * 3600_000 }, t("Diperpanjang 3 hari", "Extended by 3 days"))} className={btn} style={{ borderColor: C.border, color: C.navy }}>
                <Clock className="h-3 w-3" /> {t("Perpanjang 3 hari", "Extend 3 days")}
              </button>
            )}
            <button disabled={busy} onClick={() => patch({ revoke: true }, t("Tautan dicabut", "Link revoked"))} className={btn} style={{ borderColor: "#FECACA", background: "#FEF2F2", color: "#B91C1C" }}>
              <Ban className="h-3 w-3" /> {t("Cabut", "Revoke")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── metrics drawer ───────────────────────────────────── */

type Tab = "overview" | "people" | "activity" | "responses";

function Stat({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-white px-4 py-3.5" style={{ borderColor: C.border }}>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{icon}{label}</div>
      <p className="text-[22px] font-extrabold leading-none" style={{ color: C.text }}>{value}</p>
      {hint && <p className="mt-1.5 text-[11.5px]" style={{ color: C.label }}>{hint}</p>}
    </div>
  );
}

function ShareDetailsDrawer({ shareId, lang, onClose, onChanged }: {
  shareId: string;
  lang: Lang;
  onClose: () => void;
  onChanged: (next: ShareSummary) => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [detail, setDetail] = useState<ShareDetail | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setDetail(await authFetch<ShareDetail>(`/api/admin/shares/${shareId}`));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setRefreshing(false);
    }
  }, [shareId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const grantViewer = async (key: string) => {
    try {
      const json = await authFetch<{ share: ShareSummary }>(`/api/admin/shares/${shareId}`, { method: "PATCH", body: JSON.stringify({ grantViewerOpen: key }) });
      onChanged(json.share);
      toast.success(t("Orang ini dapat membuka sekali lagi", "This person can open it once more"));
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  const share = detail?.share;
  const questions = share?.questionnaire.questions ?? [];
  const viewerByKey = useMemo(() => new Map((detail?.viewers ?? []).map(v => [v.key, v])), [detail]);

  const metrics = useMemo(() => {
    if (!detail) return null;
    const { viewers, responses, views, share: s } = detail;
    const signedIn = viewers.filter(v => v.uid).length;
    const totalSeconds = viewers.reduce((sum, v) => sum + v.engagement.seconds, 0);
    const photoViews = viewers.reduce((sum, v) => sum + v.engagement.photoViews, 0);
    const opens = views.filter(e => e.countedAsOpen);
    const tally = (pick: (v: VisitContext) => string | null) => {
      const counts = new Map<string, number>();
      for (const e of opens) {
        const key = e.visit ? pick(e.visit) : null;
        if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    };
    const profiles = s.candidateIds.map((candidateId, slot) => {
      const seconds = viewers.reduce((sum, v) => sum + (v.engagement.stepSeconds[String(slot)] ?? 0), 0);
      const yes = responses.filter(r => r.decisions?.[candidateId] === "yes").length;
      const no = responses.filter(r => r.decisions?.[candidateId] === "no").length;
      return { candidateId, name: s.candidateNames[candidateId] ?? "—", seconds, yes, no };
    });
    const maxSeconds = Math.max(1, ...profiles.map(p => p.seconds));
    return {
      signedIn,
      anonymous: viewers.length - signedIn,
      totalSeconds,
      photoViews,
      responseRate: signedIn ? Math.round((responses.length / signedIn) * 100) : 0,
      devices: tally(v => v.device),
      apps: tally(v => v.app ?? v.browser),
      places: tally(v => [v.city, v.country].filter(Boolean).join(", ") || null),
      profiles,
      maxSeconds,
    };
  }, [detail]);

  const timeline = useMemo(() => {
    if (!detail) return [];
    const opens = detail.views.map(e => ({ kind: e.countedAsOpen ? "open" : "refresh", at: e.at, key: e.viewerKey, visit: e.visit }) as const);
    const answers = detail.responses.map(r => ({ kind: "answer", at: r.updatedAt, key: `u_${r.uid}`, visit: null }) as const);
    return [...opens, ...answers].sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));
  }, [detail]);

  const answerText = (questionId: string, value: string) => {
    const q = questions.find(x => x.id === questionId);
    if (!q || q.type === "text") return value;
    return optionsFor(q).find(o => o.value === value)?.label[lang] ?? value;
  };

  const tabs: { key: Tab; label: string; count?: number; show: boolean }[] = [
    { key: "overview", label: t("Ringkasan", "Overview"), show: true },
    { key: "people", label: t("Orang", "People"), count: detail?.viewers.length, show: true },
    { key: "activity", label: t("Aktivitas", "Activity"), count: timeline.length, show: true },
    { key: "responses", label: t("Jawaban", "Responses"), count: detail?.responses.length, show: !!share?.questionnaire.enabled },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" style={{ background: "rgba(15,23,42,0.45)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: C.border }}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[16px] font-extrabold" style={{ color: C.text }}>{share?.recipientLabel ?? "…"}</p>
              {share && (
                <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: STATE_BADGE[share.state].bg, color: STATE_BADGE[share.state].fg }}>
                  {STATE_BADGE[share.state].label[lang]}
                </span>
              )}
            </div>
            <p className="text-[12px]" style={{ color: C.muted }}>
              {share && `${share.code} · ${share.candidateIds.length} ${t("profil", "profiles")} · ${t("dibuat oleh", "created by")} ${share.createdByName}`}
            </p>
          </div>
          <button onClick={load} disabled={refreshing} className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-50" style={{ borderColor: C.border }} aria-label="Refresh" title={t("Muat ulang", "Refresh")}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} style={{ color: C.label }} />
          </button>
          <a href={share ? shareUrl(share.id) : "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold" style={{ borderColor: C.border, color: C.body }}>
            <Link2 className="h-3.5 w-3.5" /> {t("Buka", "Open")}
          </a>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ borderColor: C.border }} aria-label="Close">
            <X className="h-4 w-4" style={{ color: C.muted }} />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b px-6" style={{ borderColor: C.border }}>
          {tabs.filter(x => x.show).map(x => (
            <button key={x.key} onClick={() => setTab(x.key)} className="whitespace-nowrap border-b-2 px-3 py-3 text-[13px] font-bold" style={{ borderColor: tab === x.key ? C.navy : "transparent", color: tab === x.key ? C.text : C.muted }}>
              {x.label}{x.count !== undefined && ` (${x.count})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6" style={{ background: C.bg }}>
          {!detail || !share || !metrics ? (
            <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-2" style={{ borderColor: C.rose, borderTopColor: "transparent" }} /></div>
          ) : tab === "overview" ? (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat icon={<Eye className="h-3 w-3" />} label={t("Dibuka", "Opens")} value={`${share.opens}${share.maxOpens !== null ? `/${share.maxOpens}` : ""}`} hint={share.lastOpenedAt ? `${t("terakhir", "last")} ${relativeTime(share.lastOpenedAt, lang)}` : t("belum dibuka", "not opened yet")} />
                <Stat icon={<Users className="h-3 w-3" />} label={t("Orang unik", "Unique people")} value={String(detail.viewers.length)} hint={`${metrics.signedIn} ${t("masuk", "signed in")} · ${metrics.anonymous} ${t("anonim", "anonymous")}`} />
                <Stat icon={<Timer className="h-3 w-3" />} label={t("Waktu melihat", "Time viewing")} value={formatDuration(metrics.totalSeconds, lang)} hint={`${metrics.photoViews} ${t("foto dibuka", "photos opened")}`} />
                {share.questionnaire.enabled ? (
                  <Stat icon={<MessageSquareText className="h-3 w-3" />} label={t("Jawaban", "Responses")} value={String(detail.responses.length)} hint={`${metrics.responseRate}% ${t("dari yang masuk", "of signed-in viewers")}`} />
                ) : (
                  <Stat icon={<Activity className="h-3 w-3" />} label={t("Kunjungan", "Visits")} value={String(detail.views.length)} hint={t("termasuk muat ulang", "incl. refreshes")} />
                )}
              </div>

              <section className="rounded-2xl border bg-white p-5" style={{ borderColor: C.border }}>
                <p className="mb-4 text-[12px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{t("Minat per profil", "Interest per profile")}</p>
                <div className="flex flex-col gap-4">
                  {metrics.profiles.map((p, i) => (
                    <div key={p.candidateId}>
                      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[13px]">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10.5px] font-bold" style={{ background: C.bg, color: C.navy }}>{i + 1}</span>
                        <span className="font-bold" style={{ color: C.text }}>{p.name}</span>
                        <div className="flex-1" />
                        <span style={{ color: C.label }}>{formatDuration(p.seconds, lang)}</span>
                        {share.questionnaire.enabled && (
                          <>
                            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: C.greenBg, color: C.green }}>✓ {p.yes}</span>
                            <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: "#FEF2F2", color: "#B91C1C" }}>✕ {p.no}</span>
                          </>
                        )}
                      </div>
                      <div className="h-2 overflow-hidden rounded-full" style={{ background: C.divider }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.round((p.seconds / metrics.maxSeconds) * 100)}%`, background: `linear-gradient(90deg, ${C.navy}, ${C.rose})` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {([
                  [t("Perangkat", "Devices"), metrics.devices],
                  [t("Dibuka lewat", "Opened via"), metrics.apps],
                  [t("Lokasi", "Locations"), metrics.places],
                ] as const).map(([title, rows]) => (
                  <section key={title} className="rounded-2xl border bg-white p-4" style={{ borderColor: C.border }}>
                    <p className="mb-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{title}</p>
                    {rows.length === 0 ? (
                      <p className="text-[12.5px]" style={{ color: C.muted }}>—</p>
                    ) : (
                      <ul className="flex flex-col gap-1.5">
                        {rows.slice(0, 5).map(([name, count]) => (
                          <li key={name} className="flex items-center justify-between text-[13px]">
                            <span className="capitalize" style={{ color: C.body }}>{name}</span>
                            <span className="font-bold" style={{ color: C.text }}>{count}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>

              <section className="rounded-2xl border bg-white p-5" style={{ borderColor: C.border }}>
                <p className="mb-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{t("Detail tautan", "Link details")}</p>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
                  {([
                    [t("Dibuat", "Created"), `${formatDateTime(share.createdAt, lang)} · ${share.createdByName}`],
                    [t("Pertama dibuka", "First opened"), formatDateTime(share.firstOpenedAt, lang)],
                    [t("Terakhir dibuka", "Last opened"), formatDateTime(share.lastOpenedAt, lang)],
                    [t("Berakhir", "Expires"), share.expiresAt ? formatDateTime(share.expiresAt, lang) : t("Tanpa batas", "Never")],
                    [t("Akses", "Access"), lang === "id" ? ACCESS_META[share.access.mode].id : ACCESS_META[share.access.mode].en],
                    [t("Batas per orang", "Per-person limit"), share.maxOpensPerViewer === null ? t("Tanpa batas", "Unlimited") : `${share.maxOpensPerViewer}×`],
                  ] as const).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-1" style={{ borderBottom: `1px solid ${C.divider}` }}>
                      <dt style={{ color: C.label }}>{k}</dt>
                      <dd className="text-right font-semibold" style={{ color: C.text }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          ) : tab === "people" ? (
            detail.viewers.length === 0 ? (
              <p className="py-12 text-center text-[13px]" style={{ color: C.muted }}>{t("Belum ada yang membuka tautan ini.", "Nobody has opened this link yet.")}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {detail.viewers.map(v => {
                  const place = placeLabel(v.lastVisit);
                  const maxStep = Math.max(1, ...Object.values(v.engagement.stepSeconds));
                  return (
                    <div key={v.key} className="rounded-2xl border bg-white p-4" style={{ borderColor: C.border }}>
                      <div className="flex flex-wrap items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold" style={{ background: v.uid ? "#EFF4FB" : C.bg, color: C.navy }}>
                          {(v.name || v.email || "?").slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-[14px] font-bold" style={{ color: C.text }}>{viewerTitle(v, v.key, lang)}</p>
                            <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: C.bg, color: C.label }}>{TIER_LABEL[v.tier]?.[lang]}</span>
                            {v.answered && (
                              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: C.greenBg, color: C.green }}>
                                <CheckCircle2 className="h-3 w-3" /> {t("Sudah menjawab", "Answered")}
                              </span>
                            )}
                          </div>
                          {v.email && v.name && <p className="truncate text-[12px]" style={{ color: C.label }}>{v.email}</p>}
                          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]" style={{ color: C.body }}>
                            <span className="flex items-center gap-1"><DeviceIcon device={v.lastVisit?.device} className="h-3.5 w-3.5" />{visitSummary(v.lastVisit, lang)}</span>
                            {place && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{place}</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[18px] font-extrabold leading-none" style={{ color: C.text }}>{v.opens}×</p>
                          <p className="mt-1 text-[11px]" style={{ color: C.muted }}>{t("dibuka", "opened")}</p>
                          {share.maxOpensPerViewer !== null && (
                            <button onClick={() => grantViewer(v.key)} className="mt-2 rounded-lg border px-2.5 py-1 text-[11px] font-bold" style={{ borderColor: C.border, color: C.navy }}>
                              +1 {t("buka", "open")}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px] sm:grid-cols-4" style={{ color: C.label }}>
                        <span>{t("Pertama", "First")}: <strong style={{ color: C.body }}>{formatDateTime(v.firstAt, lang)}</strong></span>
                        <span>{t("Terakhir", "Last")}: <strong style={{ color: C.body }}>{relativeTime(v.lastAt, lang)}</strong></span>
                        <span>{t("Waktu", "Time")}: <strong style={{ color: C.body }}>{formatDuration(v.engagement.seconds, lang)}</strong></span>
                        <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" /><strong style={{ color: C.body }}>{v.engagement.photoViews}</strong> {t("foto", "photos")}</span>
                      </div>

                      {v.engagement.seconds > 0 && (
                        <div className="mt-3 flex flex-col gap-1.5 rounded-xl p-3" style={{ background: C.bg }}>
                          {share.candidateIds.map((candidateId, slot) => {
                            const secs = v.engagement.stepSeconds[String(slot)] ?? 0;
                            return (
                              <div key={candidateId} className="flex items-center gap-2 text-[11.5px]">
                                <span className="w-32 truncate" style={{ color: C.body }}>{share.candidateNames[candidateId]}</span>
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                                  <div className="h-full rounded-full" style={{ width: `${Math.round((secs / maxStep) * 100)}%`, background: C.navy }} />
                                </div>
                                <span className="w-24 shrink-0 whitespace-nowrap text-right" style={{ color: C.label }}>{formatDuration(secs, lang)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : tab === "activity" ? (
            timeline.length === 0 ? (
              <p className="py-12 text-center text-[13px]" style={{ color: C.muted }}>{t("Belum ada aktivitas.", "No activity yet.")}</p>
            ) : (
              <ol className="relative flex flex-col gap-0.5">
                {timeline.map((item, i) => {
                  const v = viewerByKey.get(item.key);
                  const who = viewerTitle(v, item.key, lang);
                  const place = placeLabel(item.visit);
                  const meta = item.kind === "answer"
                    ? { icon: <MessageSquareText className="h-3.5 w-3.5" />, bg: C.greenBg, fg: C.green, verb: t("mengirim refleksi", "sent their reflections") }
                    : item.kind === "open"
                      ? { icon: <Eye className="h-3.5 w-3.5" />, bg: "#EFF4FB", fg: C.navy, verb: t("membuka tautan", "opened the link") }
                      : { icon: <RefreshCw className="h-3.5 w-3.5" />, bg: C.divider, fg: C.label, verb: t("memuat ulang halaman", "reloaded the page") };
                  return (
                    <li key={`${item.kind}-${item.at}-${i}`} className="flex gap-3 rounded-xl px-3 py-2.5 hover:bg-white">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: meta.bg, color: meta.fg }}>{meta.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px]" style={{ color: C.body }}>
                          <strong style={{ color: C.text }}>{who}</strong> {meta.verb}
                        </p>
                        {item.visit && (
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[11.5px]" style={{ color: C.label }}>
                            <span className="flex items-center gap-1"><DeviceIcon device={item.visit.device} className="h-3 w-3" />{visitSummary(item.visit, lang)}</span>
                            {place && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{place}</span>}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[12px] font-semibold" style={{ color: C.body }}>{relativeTime(item.at, lang)}</p>
                        <p className="text-[11px]" style={{ color: C.muted }}>{formatDateTime(item.at, lang)}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )
          ) : detail.responses.length === 0 ? (
            <p className="py-12 text-center text-[13px]" style={{ color: C.muted }}>{t("Belum ada refleksi yang dikirim.", "No reflections have been sent yet.")}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {detail.responses.map(r => {
                const liked = share.candidateIds.filter(id => r.decisions?.[id] === "yes").map(id => share.candidateNames[id]);
                return (
                  <div key={r.uid} className="rounded-2xl border bg-white" style={{ borderColor: C.border }}>
                    <div className="flex flex-wrap items-center gap-2 border-b px-5 py-3" style={{ borderColor: C.divider }}>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-bold" style={{ color: C.text }}>{r.name || r.email}</p>
                        <p className="text-[11.5px]" style={{ color: C.label }}>{r.email} · {formatDateTime(r.updatedAt, lang)}</p>
                      </div>
                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                        style={liked.length ? { background: C.greenBg, color: C.green } : { background: "#F1F5F9", color: C.label }}
                      >
                        <Check className="h-3 w-3" />
                        {liked.length ? liked.join(", ") : t("Belum ada yang cocok", "No matches")}
                      </span>
                      {r.completedAt && (
                        <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: C.bg, color: C.label }}>
                          {t("selesai", "finished")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-4 px-5 py-4">
                      {share.candidateIds.map(candidateId => {
                        const answers = r.answers[candidateId] ?? {};
                        return (
                          <div key={candidateId}>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <p className="text-[12px] font-extrabold uppercase tracking-wide" style={{ color: C.navy }}>{share.candidateNames[candidateId]}</p>
                              {r.decisions?.[candidateId] && (
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10.5px] font-bold"
                                  style={r.decisions[candidateId] === "yes" ? { background: C.greenBg, color: C.green } : { background: "#FEF2F2", color: "#B91C1C" }}
                                >
                                  {r.decisions[candidateId] === "yes" ? t("Cocok", "Match") : t("Belum cocok", "Not a match")}
                                </span>
                              )}
                            </div>
                            <dl className="flex flex-col gap-2">
                              {questions.filter(q => answers[q.id]).map(q => (
                                <div key={q.id}>
                                  <dt className="text-[11.5px]" style={{ color: C.muted }}>{q.label[lang]}</dt>
                                  <dd className="whitespace-pre-line text-[13.5px]" style={{ color: C.body }}>{answerText(q.id, answers[q.id])}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        );
                      })}
                      {r.finalNote && (
                        <div className="rounded-xl px-4 py-3" style={{ background: C.bg }}>
                          <p className="text-[11.5px]" style={{ color: C.muted }}>{t("Pesan untuk matchmaker", "Note for matchmaker")}</p>
                          <p className="whitespace-pre-line text-[13.5px]" style={{ color: C.body }}>{r.finalNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── list (panel + dashboard) ─────────────────────────── */

export function ShareList({ shares, lang, onChanged }: {
  shares: ShareSummary[];
  lang: Lang;
  onChanged: (next: ShareSummary) => void;
}) {
  const [detailsId, setDetailsId] = useState<string | null>(null);

  if (shares.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed px-6 py-10 text-center" style={{ background: C.bg, borderColor: C.border }}>
        <Link2 className="mx-auto mb-2.5 h-5 w-5" style={{ color: C.muted }} />
        <p className="mb-1 text-[13px] font-semibold" style={{ color: C.body }}>{lang === "id" ? "Belum ada tautan" : "No links yet"}</p>
        <p className="text-[12px]" style={{ color: C.muted }}>
          {lang === "id" ? "Buat tautan terkontrol untuk mengirim profil dengan aman." : "Create a controlled link to send profiles out safely."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {shares.map(share => (
          <ShareRow key={share.id} share={share} lang={lang} onChanged={onChanged} onOpenDetails={() => setDetailsId(share.id)} />
        ))}
      </div>
      {detailsId && <ShareDetailsDrawer shareId={detailsId} lang={lang} onClose={() => setDetailsId(null)} onChanged={onChanged} />}
    </>
  );
}

/* ── modal on the candidate page ──────────────────────── */

export default function SharePanel({ candidateId, candidateName, lang, onClose }: {
  candidateId: string;
  candidateName: string;
  photoUrls?: string[];
  lang: Lang;
  onClose: () => void;
}) {
  const [shares, setShares] = useState<ShareSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await authFetch<{ shares: ShareSummary[] }>(`/api/admin/shares?candidateId=${encodeURIComponent(candidateId)}`);
      setShares(json.shares);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load links");
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => { load(); }, [load]);

  const activeCount = useMemo(() => shares.filter(s => s.state === "active").length, [shares]);
  const replace = (next: ShareSummary) => setShares(prev => prev.map(s => (s.id === next.id ? next : s)));

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-3 sm:p-8" style={{ background: "rgba(15,23,42,0.55)" }} onClick={creating ? undefined : onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className={`my-auto w-full overflow-hidden rounded-3xl bg-white ${creating ? "max-w-6xl" : "max-w-3xl"}`}
        style={{ boxShadow: "0 24px 64px rgba(15,23,42,0.28)" }}
      >
        <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: C.border }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "#EFF6FF" }}>
            <Link2 className="h-4 w-4" style={{ color: C.navy }} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-extrabold" style={{ color: C.text }}>
              {creating ? (lang === "id" ? "Buat tautan profil" : "Create a profile link") : lang === "id" ? "Tautan Profil" : "Profile Links"}
            </h2>
            <p className="truncate text-[12px]" style={{ color: C.muted }}>
              {candidateName} · {activeCount} {lang === "id" ? "tautan aktif" : "active"}
            </p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ borderColor: C.border }} aria-label="Close">
            <X className="h-4 w-4" style={{ color: C.muted }} />
          </button>
        </div>

        {creating ? (
          <ShareBuilder
            initialCandidate={{ id: candidateId }}
            lang={lang}
            onCancel={() => setCreating(false)}
            onCreated={share => {
              setShares(prev => [share, ...prev]);
              setCreating(false);
            }}
          />
        ) : (
          <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
            <button
              onClick={() => setCreating(true)}
              className="mb-5 flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.rose})` }}
            >
              <Plus className="h-4 w-4" /> {lang === "id" ? "Buat tautan baru" : "Create new link"}
            </button>
            {loading ? (
              <div className="flex justify-center py-10"><div className="h-7 w-7 animate-spin rounded-full border-2" style={{ borderColor: C.rose, borderTopColor: "transparent" }} /></div>
            ) : (
              <ShareList shares={shares} lang={lang} onChanged={replace} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
