"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Instagram, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { authFetch } from "@/components/admin/share-api";
import { issueLabel } from "@/components/admin/subpage-outreach";
import { findSocialAccount, SOCIAL_ACCOUNTS } from "@/lib/social-accounts";
import { instagramUrl, type OutreachItem } from "@/lib/mitra";

const C = { border: "#E2E8F0", text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8" };
const DAYS = 10;

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/* Subpages → Mitra outreach → All pages: every first message across our accounts for today and the next 10 days,
   grouped by day, so the whole plan can be read and corrected in one go. Anything Claude couldn't send is on top. */
export default function OutreachPlan({ lang }: { lang: "id" | "en" }) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [items, setItems] = useState<OutreachItem[]>([]);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<{ today: string; items: OutreachItem[] }>("/api/admin/outreach")
      .then((data) => { setItems(data.items); setToday(data.today); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const { problems, days } = useMemo(() => {
    const last = today ? addDays(today, DAYS) : "";
    const sentDay = (i: OutreachItem) => (i.outreach.sentAt ? i.outreach.sentAt.slice(0, 10) : i.outreach.day);
    const inWindow = items.filter((i) => (i.outreach.sentAt ? sentDay(i) === today : i.outreach.day >= today && i.outreach.day <= last));
    const byDay = new Map<string, OutreachItem[]>();
    for (const item of inWindow.filter((i) => !i.outreach.issue || i.outreach.sentAt)) {
      byDay.set(sentDay(item), [...(byDay.get(sentDay(item)) ?? []), item]);
    }
    return {
      problems: items.filter((i) => !i.outreach.sentAt && (i.outreach.issue || i.outreach.day < today)),
      days: Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b))
        .map(([day, list]) => [day, list.sort((a, b) => a.outreach.account.localeCompare(b.outreach.account))] as const),
    };
  }, [items, today]);

  // Same checks as the daily run (scripts/outreach.mjs warnings): a queue running dry or a channel that stopped sending
  const warnings = useMemo(() => {
    if (!today) return [];
    const jakarta = (iso: string) => new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 10);
    const left: Record<string, number> = {};
    const lastSent: Record<string, string> = {};
    for (const { outreach: o, stage } of items) {
      const key = o.channel === "email" ? "email" : o.account;
      if (o.sentAt) {
        const day = jakarta(o.sentAt);
        if (!lastSent[key] || day > lastSent[key]) lastSent[key] = day;
      } else if (stage === "prospect" && (!o.issue || o.issue.kind === "follow_first")) left[key] = (left[key] ?? 0) + 1;
    }
    return [...SOCIAL_ACCOUNTS.map((a) => ({ key: a.key, name: `@${a.handle}`, perDay: 2 })), { key: "email", name: "Email info@jodohmu.com", perDay: 3 }]
      .flatMap(({ key, name, perDay }) => {
        const n = left[key] ?? 0;
        const out: string[] = [];
        if (n === 0) out.push(`${name}: ${t("tidak ada pesan tersisa, perlu prospek baru", "nothing left to send, needs new prospects")}`);
        else if (n < perDay * 3) out.push(`${name}: ${t(`tinggal ${n} pesan`, `only ${n} left`)}`);
        if (n > 0 && lastSent[key] && lastSent[key] < addDays(today, -2)) out.push(`${name}: ${t("tidak ada yang terkirim sejak", "nothing sent since")} ${lastSent[key]}`);
        return out;
      });
  }, [items, today, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const dayLabel =(day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" });

  if (loading) return <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-[#1B3A6B]" /></div>;

  return (
    <div className="space-y-5">
      <p className="rounded-2xl border bg-white p-4 text-sm" style={{ borderColor: C.border, color: C.body }}>
        {t(`Semua pesan pertama dari semua akun, hari ini sampai ${DAYS} hari ke depan. Claude mengirim otomatis setiap pagi: DM Instagram maks. 2 per akun per hari, email dari info@jodohmu.com maks. 3 per hari. Kalau ada pesan yang kurang pas, beri tahu Taimoor sebelum harinya.`,
          `Every first message from every account, today and the next ${DAYS} days. Claude sends them every morning: Instagram DMs at most 2 per account a day, emails from info@jodohmu.com at most 3 a day. If a message isn't right, tell Taimoor before its day.`)}
      </p>

      {warnings.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p className="mb-1 flex items-center gap-1.5 font-bold"><AlertTriangle className="h-4 w-4" />{t("Pengiriman bisa terhenti", "Outreach may stop")}</p>
          <ul className="list-disc space-y-0.5 pl-5">{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
        </div>
      )}

      {problems.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-700">{t("Belum terkirim — perlu dicek", "Not sent yet — needs a look")} · {problems.length}</p>
          <div className="space-y-2">{problems.map((item) => <Row key={item.id} item={item} lang={lang} today={today} />)}</div>
        </section>
      )}

      {days.map(([day, list]) => (
        <section key={day}>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>
            {day === today ? t("Hari ini", "Today") : dayLabel(day)} · {list.length}
          </p>
          <div className="space-y-2">{list.map((item) => <Row key={item.id} item={item} lang={lang} today={today} />)}</div>
        </section>
      ))}
      {!days.length && !problems.length && (
        <p className="rounded-xl border bg-white px-4 py-6 text-center text-sm" style={{ borderColor: C.border, color: C.muted }}>{t("Belum ada yang dijadwalkan.", "Nothing planned.")}</p>
      )}
    </div>
  );
}

function Row({ item, lang, today }: { item: OutreachItem; lang: "id" | "en"; today: string }) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const account = findSocialAccount(item.outreach.account);
  const { outreach } = item;
  return (
    <details className="group rounded-xl border bg-white" style={{ borderColor: C.border }}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm">
        <span className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: account?.accent ?? "#1B3A6B" }}>@{account?.handle ?? outreach.account}</span>
        {outreach.channel === "email" ? <Mail className="h-4 w-4 shrink-0 text-sky-600" /> : <Instagram className="h-4 w-4 shrink-0 text-pink-600" />}
        <span className="min-w-0 flex-1 truncate font-semibold" style={{ color: C.text }}>
          {item.organization || item.name}
          <span className="font-normal" style={{ color: C.muted }}> · {outreach.channel === "email" ? item.email : `@${item.instagram}`}</span>
        </span>
        {outreach.sentAt
          ? <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-700"><Check className="h-3.5 w-3.5" />{outreach.sentBy}</span>
          : outreach.issue
            ? <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-amber-700"><AlertTriangle className="h-3.5 w-3.5" />{issueLabel(outreach.issue.kind, lang)}</span>
            : outreach.day < today && <span className="shrink-0 text-xs font-bold text-rose-600">{t("terlambat", "overdue")} · {outreach.day}</span>}
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-2 border-t px-4 py-3" style={{ borderColor: C.border }}>
        {outreach.issue && <p className="text-xs font-semibold text-amber-700">{outreach.issue.note}</p>}
        {item.reason && <p className="text-xs" style={{ color: C.label }}>{item.reason}</p>}
        {outreach.subject && <p className="text-xs" style={{ color: C.body }}><b>{t("Subjek", "Subject")}:</b> {outreach.subject}</p>}
        <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-[13px] leading-relaxed" style={{ color: C.body }}>{outreach.message}</pre>
        {item.instagram && (
          <a href={instagramUrl(item.instagram)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#1B3A6B]">
            <Instagram className="h-3.5 w-3.5" />{t("Buka profil", "Open profile")}
          </a>
        )}
      </div>
    </details>
  );
}
