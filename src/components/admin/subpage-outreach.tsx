"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, ChevronDown, Copy, Globe, Instagram, Loader2, Mail, Phone, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/components/admin/share-api";
import { findSocialAccount } from "@/lib/social-accounts";
import { instagramUrl, nextWorkday, type OutreachAccount, type OutreachItem } from "@/lib/mitra";

const C = { border: "#E2E8F0", text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8", navy: "#1B3A6B" };
const API = "/api/admin/outreach";

/* Subpages → Outreach: the Mitra prospects this account writes to first, a few each working day. Whoever is on duty
   copies the message, sends it by hand from the app (switched to this account) or from email, and taps Sent.
   Replies come into the account's own inbox and are logged on the Mitra page. */
export default function SubpageOutreach({ accountKey, lang }: { accountKey: OutreachAccount; lang: "id" | "en" }) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const account = findSocialAccount(accountKey)!;
  const { role, permissions } = useAuth();
  const canOpenMitra = role === "admin" || permissions.includes("mitra");
  const [items, setItems] = useState<OutreachItem[]>([]);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await authFetch<{ today: string; items: OutreachItem[] }>(API);
      setItems(data.items.filter((i) => i.outreach.account === accountKey));
      setToday(data.today);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [accountKey]);
  useEffect(() => { load(); }, [load]);

  const act = async (id: string, action: "sent" | "undo" | "move") => {
    setBusy(id);
    try {
      await authFetch(API, { method: "POST", body: JSON.stringify({ action, id }) });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const { due, upcoming, sent } = useMemo(() => ({
    due: items.filter((i) => !i.outreach.sentAt && i.outreach.day <= today),
    upcoming: items.filter((i) => !i.outreach.sentAt && i.outreach.day > today),
    sent: items.filter((i) => i.outreach.sentAt).sort((a, b) => (b.outreach.sentAt ?? "").localeCompare(a.outreach.sentAt ?? "")),
  }), [items, today]);
  const upcomingDays = useMemo(() => {
    const byDay = new Map<string, OutreachItem[]>();
    for (const item of upcoming) byDay.set(item.outreach.day, [...(byDay.get(item.outreach.day) ?? []), item]);
    return Array.from(byDay.entries());
  }, [upcoming]);
  // Sent, no answer logged yet, and the wait is over: time to check the inbox and nudge once
  const needsFollowUp = sent.filter((i) => i.stage === "contacted" && i.followUpDate && i.followUpDate <= today);

  const dayLabel = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" });

  if (loading) return <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-[#1B3A6B]" /></div>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-4 text-sm" style={{ borderColor: C.border, color: C.body }}>
        <p className="font-bold" style={{ color: C.text }}>{t(`Cara kirim dari @${account.handle}`, `How to send from @${account.handle}`)}</p>
        <ol className="mt-1.5 list-decimal space-y-0.5 pl-5 text-[13px]">
          <li>{t(`Di aplikasi Instagram, pindah ke akun @${account.handle}. Follow mereka dan like satu post dulu.`, `In the Instagram app, switch to @${account.handle}. Follow them and like one post first.`)}</li>
          <li>{t("Salin pesan, tempel di DM (atau email), sesuaikan satu kalimat kalau perlu. Jangan tambahkan link.", "Copy the message, paste it into the DM (or email), adjust a line if needed. Don't add links.")}</li>
          <li>{t("Tekan Terkirim. Follow-up otomatis dijadwalkan 3 hari kerja kemudian.", "Tap Sent. A follow-up is planned 3 working days later.")}</li>
          <li>{t(`Cek inbox @${account.handle} setiap hari. Balasan dicatat di halaman Mitra.`, `Check @${account.handle}'s inbox every day. Log replies on the Mitra page.`)}</li>
        </ol>
        <p className="mt-2 text-[12px]" style={{ color: C.muted }}>
          {t("Jangan pernah kirim pesan pertama lewat WhatsApp, dan jangan pakai alat kirim otomatis.", "Never send the first message on WhatsApp, and never use an automatic sending tool.")}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[[t("Hari ini", "Due today"), due.length], [t("Terjadwal", "Upcoming"), upcoming.length], [t("Terkirim", "Sent"), sent.length]].map(([label, n]) => (
          <div key={label as string} className="rounded-xl border bg-white px-3 py-2.5" style={{ borderColor: C.border }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.label }}>{label}</p>
            <p className="text-xl font-bold" style={{ color: C.text }}>{n}</p>
          </div>
        ))}
      </div>

      <Section title={t("Kirim hari ini", "Send today")} empty={t("Tidak ada yang perlu dikirim hari ini.", "Nothing to send today.")}>
        {due.map((item) => (
          <OutreachCard key={item.id} item={item} today={today} lang={lang} busy={busy === item.id} accent={account.accent}
            onSent={() => act(item.id, "sent")} onMove={() => act(item.id, "move")} moveLabel={dayLabel(nextWorkday(today))} />
        ))}
      </Section>

      {needsFollowUp.length > 0 && (
        <Section title={t("Belum ada balasan — cek inbox & follow-up sekali", "No reply logged — check the inbox and nudge once")}>
          {needsFollowUp.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-amber-50/60 px-4 py-2.5 text-sm" style={{ borderColor: "#FDE68A" }}>
              <span><b style={{ color: C.text }}>{item.organization || item.name}</b> <span style={{ color: C.label }}>· {t("terkirim", "sent")} {item.outreach.sentAt?.slice(0, 10)}</span></span>
              {canOpenMitra && <a href="/admin/mitra" className="text-xs font-bold" style={{ color: C.navy }}>{t("Catat di Mitra", "Log on Mitra")}</a>}
              <div className="w-full"><ContactRow item={item} lang={lang} /></div>
            </div>
          ))}
        </Section>
      )}

      {upcomingDays.length > 0 && (
        <Section title={t("Jadwal berikutnya", "Coming up")}>
          {upcomingDays.map(([day, list]) => (
            <div key={day}>
              <p className="mb-1.5 text-xs font-bold" style={{ color: C.label }}>{dayLabel(day)} · {list.length}</p>
              <div className="space-y-2">
                {list.map((item) => (
                  <details key={item.id} className="group rounded-xl border bg-white" style={{ borderColor: C.border }}>
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm">
                      <ChannelIcon channel={item.outreach.channel} />
                      <span className="min-w-0 flex-1 truncate font-semibold" style={{ color: C.text }}>
                        {item.organization || item.name}
                        <span className="font-normal" style={{ color: C.muted }}> · {item.outreach.channel === "email" ? item.email : `@${item.instagram}`}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="space-y-2 border-t px-4 py-3" style={{ borderColor: C.border }}>
                      <ContactRow item={item} lang={lang} />
                      <p className="text-xs" style={{ color: C.body }}>{item.reason}</p>
                      <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-[13px]" style={{ color: C.body }}>{item.outreach.message}</pre>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </Section>
      )}

      {sent.length > 0 && (
        <Section title={t("Sudah terkirim", "Sent")}>
          {sent.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm" style={{ borderColor: C.border }}>
              <div className="w-full"><ContactRow item={item} lang={lang} /></div>
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="min-w-0 flex-1 truncate"><b style={{ color: C.text }}>{item.organization || item.name}</b>
                <span style={{ color: C.muted }}> · {item.outreach.sentAt?.slice(0, 10)} · {item.outreach.sentBy} · {item.stage}</span></span>
              <button type="button" disabled={busy === item.id} onClick={() => act(item.id, "undo")} className="inline-flex items-center gap-1 text-xs font-bold disabled:opacity-50" style={{ color: C.label }}>
                <Undo2 className="h-3 w-3" />{t("Batalkan", "Undo")}
              </button>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, empty, children }: { title: string; empty?: string; children: React.ReactNode }) {
  const list = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return (
    <section>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{title}</p>
      {list.length ? <div className="space-y-3">{children}</div> : empty ? <p className="rounded-xl border bg-white px-4 py-6 text-center text-sm" style={{ borderColor: C.border, color: C.muted }}>{empty}</p> : null}
    </section>
  );
}

/* Every way to reach them, as links. The planned channel comes first and is highlighted; the phone is shown
   for a call only, since a first message never goes out on WhatsApp. */
function ContactRow({ item, lang }: { item: OutreachItem; lang: "id" | "en" }) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const email = item.outreach.channel === "email";
  const pill = "inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold";
  const main = { borderColor: "#1B3A6B", background: "#1B3A6B", color: "white" };
  const other = { borderColor: C.border, color: C.navy };
  const site = item.website && !item.website.includes(" ") ? (/^https?:\/\//.test(item.website) ? item.website : `https://${item.website}`) : "";
  const links = [
    item.instagram && (
      <a key="ig" href={instagramUrl(item.instagram)} target="_blank" rel="noopener noreferrer" className={pill} style={email ? other : main}>
        <Instagram className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{t("Buka profil", "Open profile")} @{item.instagram}</span>
      </a>
    ),
    item.email && (
      <a key="em" href={email ? `mailto:${item.email}?subject=${encodeURIComponent(item.outreach.subject)}&body=${encodeURIComponent(item.outreach.message)}` : `mailto:${item.email}`}
        className={pill} style={email ? main : other}>
        <Mail className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{item.email}</span>
      </a>
    ),
    site && (
      <a key="web" href={site} target="_blank" rel="noopener noreferrer" className={pill} style={other}>
        <Globe className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{item.website.replace(/^https?:\/\//, "")}</span>
      </a>
    ),
    item.phone && (
      <a key="ph" href={`tel:${item.phone.replace(/[^\d+]/g, "")}`} className={pill} style={other} title={t("Untuk telepon saja, bukan WhatsApp", "For a call only, not WhatsApp")}>
        <Phone className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{item.phone}</span>
      </a>
    ),
  ].filter(Boolean);
  if (!links.length) return <p className="text-xs font-semibold text-rose-600">{t("Belum ada kontak — cek di halaman Mitra.", "No contact saved — check the Mitra page.")}</p>;
  return <div className="flex flex-wrap gap-1.5">{links}</div>;
}

function ChannelIcon({ channel }: { channel: "instagram" | "email" }) {
  return channel === "email" ? <Mail className="h-4 w-4 shrink-0 text-sky-600" /> : <Instagram className="h-4 w-4 shrink-0 text-pink-600" />;
}

function OutreachCard({ item, today, lang, busy, accent, onSent, onMove, moveLabel }: {
  item: OutreachItem; today: string; lang: "id" | "en"; busy: boolean; accent: string; onSent: () => void; onMove: () => void; moveLabel: string;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const { outreach } = item;
  const email = outreach.channel === "email";
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t(`${what} disalin`, `${what} copied`));
    } catch {
      toast.error(t("Gagal menyalin", "Couldn't copy"));
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: C.border }}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3" style={{ borderColor: C.border }}>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-bold" style={{ color: C.text }}>
            <ChannelIcon channel={outreach.channel} />{item.organization || item.name}
          </p>
          <p className="text-xs" style={{ color: C.label }}>
            {item.name !== item.organization ? `${item.name} · ` : ""}{item.city}
            {outreach.day < today && <span className="font-bold text-rose-600"> · {t("terlambat", "overdue")} ({outreach.day})</span>}
          </p>
        </div>
      </div>
      <div className="space-y-3 px-4 py-3">
        <ContactRow item={item} lang={lang} />
        <details>
          <summary className="cursor-pointer text-xs font-bold" style={{ color: C.label }}>{t("Kenapa mereka", "Why them")}</summary>
          <p className="mt-1 whitespace-pre-line text-xs" style={{ color: C.body }}>{item.reason}{item.notes ? `\n\n${item.notes}` : ""}</p>
        </details>
        {email && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs font-bold" style={{ color: C.label }}>{t("Subjek", "Subject")}</span>
            <span className="min-w-0 flex-1 truncate" style={{ color: C.text }}>{outreach.subject}</span>
            <button type="button" onClick={() => copy(outreach.subject, t("Subjek", "Subject"))} className="text-xs font-bold" style={{ color: C.navy }}><Copy className="h-3.5 w-3.5" /></button>
          </div>
        )}
        <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-sans text-[13px] leading-relaxed" style={{ color: C.body }}>{outreach.message}</pre>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => copy(outreach.message, t("Pesan", "Message"))}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-bold" style={{ borderColor: C.border, color: C.navy }}>
            <Copy className="h-4 w-4" />{t("Salin pesan", "Copy message")}
          </button>
          <button type="button" disabled={busy} onClick={onSent}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-white disabled:opacity-50" style={{ background: accent }}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{t("Terkirim", "Sent")}
          </button>
          <button type="button" disabled={busy} onClick={onMove}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-bold disabled:opacity-50" style={{ color: C.label }}>
            <CalendarClock className="h-4 w-4" />{t("Pindah ke", "Move to")} {moveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
