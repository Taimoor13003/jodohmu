'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Mail, MessageCircle, Phone, Globe, Instagram, ChevronDown, Clock, ArrowRight, List, SquareKanban } from "lucide-react";
import { addDays, findLabel } from "@/lib/calldesk";
import {
  MITRA_CHANNELS, MITRA_CLOSED, MITRA_FACILITATOR, MITRA_FAITHS, MITRA_SCORE_QUESTIONS, MITRA_SIGNED, MITRA_SOURCES, MITRA_STAGES, MITRA_TYPES, instagramUrl,
  type MitraProspect,
} from "@/lib/mitra";
import { callDeskFetch, formatDay, telLink, useL, waLink } from "@/components/admin/calldesk/shared";
import { Tile } from "@/components/admin/calldesk/insights";
import { MitraBoard } from "./mitra-board";
import { useLanguage } from "@/context/LanguageContext";

const input = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800";
const API = "/api/admin/mitra";

type Profile = Pick<MitraProspect, "name" | "organization" | "type" | "city" | "phone" | "instagram" | "email" | "website" | "source"
  | "faith" | "reason" | "sourceDetail" | "nextAction" | "bestTime" | "facilitatorRate" | "notes">;
const BLANK: Profile = {
  name: "", organization: "", type: "wedding", city: "Jakarta", phone: "", instagram: "", email: "", website: "", source: "research",
  faith: "general", reason: "", sourceDetail: "", nextAction: "", bestTime: "", facilitatorRate: "", notes: "",
};

function FacilitatorBadge({ value }: { value: string }) {
  const l = useL();
  if (value === "unknown") return null;
  const item = MITRA_FACILITATOR.find((f) => f.value === value);
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${item?.tone ?? ""}`}>
      {l(item?.label) || value}
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const l = useL();
  const item = MITRA_STAGES.find((s) => s.value === stage);
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${item?.tone ?? ""}`}>
      {l(item?.label) || stage}
    </span>
  );
}

// Name, organization, contact details and notes; used both to add someone and to edit them
function ProfileForm({ initial, saving, onSave, onCancel }: {
  initial: Profile; saving: boolean; onSave: (profile: Profile) => void; onCancel: () => void;
}) {
  const l = useL();
  const [form, setForm] = useState(initial);
  const set = (key: keyof Profile) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });
  const area = "min-h-[64px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 sm:col-span-3";
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <input className={input} placeholder={l({ id: "Nama orang *", en: "Person's name *" })} value={form.name} onChange={set("name")} />
      <input className={input} placeholder={l({ id: "Nama usaha / organisasi", en: "Business / organization" })} value={form.organization} onChange={set("organization")} />
      <select className={input} value={form.type} onChange={set("type")}>
        {MITRA_TYPES.map((t) => <option key={t.value} value={t.value}>{l(t.label)}</option>)}
      </select>
      <input className={input} placeholder={l({ id: "Kota", en: "City" })} value={form.city} onChange={set("city")} />
      <input className={input} inputMode="tel" placeholder={l({ id: "Telepon / WhatsApp", en: "Phone / WhatsApp" })} value={form.phone} onChange={set("phone")} />
      <input className={input} placeholder="Instagram (@handle)" value={form.instagram} onChange={set("instagram")} />
      <input className={input} type="email" placeholder="Email" value={form.email} onChange={set("email")} />
      <input className={input} placeholder={l({ id: "Website", en: "Website" })} value={form.website} onChange={set("website")} />
      <select className={input} value={form.source} onChange={set("source")}>
        {MITRA_SOURCES.map((s) => <option key={s.value} value={s.value}>{l(s.label)}</option>)}
      </select>
      <select className={input} value={form.faith} onChange={set("faith")}>
        {MITRA_FAITHS.map((f) => <option key={f.value} value={f.value}>{l(f.label)}</option>)}
      </select>
      <input className={input} placeholder={l({ id: "Detail sumber (link / Google Maps)", en: "Source detail (link / Google Maps)" })} value={form.sourceDetail} onChange={set("sourceDetail")} />
      <input className={input} placeholder={l({ id: "Waktu terbaik menelepon", en: "Best time to call" })} value={form.bestTime} onChange={set("bestTime")} />
      <input className={input} placeholder={l({ id: "Tarif pendamping / pertemuan", en: "Facilitator rate / meeting" })} value={form.facilitatorRate} onChange={set("facilitatorRate")} />
      <textarea className={area} value={form.reason} onChange={set("reason")}
        placeholder={l({ id: "Kenapa mereka ada di daftar? Misalnya: masjid besar di Jaksel dengan kajian pranikah", en: "Why they're on the list, e.g. big mosque in South Jakarta that runs pre-marriage classes" })} />
      <input className={`${input} sm:col-span-3`} value={form.nextAction} onChange={set("nextAction")}
        placeholder={l({ id: "Langkah berikutnya, misalnya: telepon sekretariat, minta bicara dengan ketua", en: "Next action, e.g. call the office, ask for the chairperson" })} />
      <textarea className={area} value={form.notes} onChange={set("notes")}
        placeholder={l({ id: "Catatan lain", en: "Other notes" })} />
      <div className="flex gap-2 sm:col-span-3">
        <button type="button" disabled={saving} onClick={() => onSave(form)} className="h-10 rounded-lg bg-[#1B3A6B] px-5 text-sm font-bold text-white disabled:opacity-60">
          {l({ id: "Simpan", en: "Save" })}
        </button>
        <button type="button" onClick={onCancel} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600">
          {l({ id: "Batal", en: "Cancel" })}
        </button>
      </div>
    </div>
  );
}

// What happened on one touch, plus the new stage, call score, referrals and next follow-up
function LogForm({ prospect, today, saving, onLog }: {
  prospect: MitraProspect; today: string; saving: boolean; onLog: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const l = useL();
  const initialAnswers = MITRA_SCORE_QUESTIONS.map((_, i) => prospect.score !== null && i < prospect.score);
  const [channel, setChannel] = useState("call");
  const [note, setNote] = useState("");
  const [stage, setStage] = useState<string>(prospect.stage);
  const [answers, setAnswers] = useState(initialAnswers);
  const [scored, setScored] = useState(prospect.score !== null);
  const [referrals, setReferrals] = useState(prospect.referrals);
  const [followUpDate, setFollowUpDate] = useState(prospect.followUpDate ?? "");
  const [nextAction, setNextAction] = useState(prospect.nextAction);
  const [facilitator, setFacilitator] = useState<string>(prospect.facilitator);
  const [meetings, setMeetings] = useState(prospect.meetingsFacilitated);
  const score = answers.filter(Boolean).length;

  const submit = async () => {
    const ok = await onLog({
      action: "log", id: prospect.id, channel, note, stage, referrals, followUpDate: followUpDate || null,
      nextAction, facilitator, meetingsFacilitated: meetings,
      ...(scored ? { score } : {}),
    });
    if (ok) setNote("");
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{l({ id: "Catat kontak", en: "Log a touch" })}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <select className={input} value={channel} onChange={(e) => setChannel(e.target.value)}>
          {MITRA_CHANNELS.map((c) => <option key={c.value} value={c.value}>{l(c.label)}</option>)}
        </select>
        <select className={input} value={stage} onChange={(e) => setStage(e.target.value)}>
          {MITRA_STAGES.map((s) => <option key={s.value} value={s.value}>{l(s.label)}</option>)}
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <span className="shrink-0">{l({ id: "Follow-up berikutnya", en: "Next follow-up" })}</span>
          <input type="date" className={input} value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
        </label>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[[3, "+3"], [7, "+7"], [14, "+14"], [30, "+30"]].map(([days, label]) => (
          <button key={label} type="button" onClick={() => setFollowUpDate(addDays(today, days as number))}
            className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50">
            {label} {l({ id: "hari", en: "days" })}
          </button>
        ))}
        <button type="button" onClick={() => setFollowUpDate("")} className="rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:underline">
          {l({ id: "Tanpa follow-up", en: "No follow-up" })}
        </button>
      </div>
      <textarea
        className="min-h-[64px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
        placeholder={l({ id: "Apa yang terjadi? Misalnya: sudah kirim info di WA, minta telepon lagi Senin", en: "What happened? e.g. sent info on WA, asked us to call back Monday" })}
        value={note} onChange={(e) => setNote(e.target.value)}
      />
      <input className={input} value={nextAction} onChange={(e) => setNextAction(e.target.value)}
        placeholder={l({ id: "Langkah berikutnya", en: "Next action" })} />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <span className="shrink-0">{l({ id: "Pendamping pertemuan", en: "Meeting facilitator" })}</span>
          <select className={input} value={facilitator} onChange={(e) => setFacilitator(e.target.value)}>
            {MITRA_FACILITATOR.map((f) => <option key={f.value} value={f.value}>{l(f.label)}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <span className="shrink-0">{l({ id: "Pertemuan didampingi", en: "Meetings facilitated" })}</span>
          <input type="number" min={0} className="h-10 w-20 rounded-lg border border-slate-200 px-2 text-sm" value={meetings}
            onChange={(e) => setMeetings(Math.max(0, Number(e.target.value) || 0))} />
        </label>
      </div>
      <div className="rounded-lg bg-slate-50 p-3">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <input type="checkbox" checked={scored} onChange={(e) => setScored(e.target.checked)} className="h-3.5 w-3.5 accent-[#0b3a86]" />
          {l({ id: "Skor panggilan", en: "Call score" })}: {scored ? `${score}/4` : "—"}
          {scored && <span className="font-normal text-slate-400">· {score >= 3 ? l({ id: "layak video call dengan Nova", en: "worth a video call with Nova" }) : score === 2 ? l({ id: "kirim kode, cek lagi 1 minggu", en: "send code, check back in a week" }) : l({ id: "jangan dikejar", en: "don't chase" })}</span>}
        </label>
        {scored && (
          <div className="mt-2 space-y-1.5">
            {MITRA_SCORE_QUESTIONS.map((q, i) => (
              <label key={i} className="flex cursor-pointer items-start gap-2 text-xs text-slate-600">
                <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 accent-[#0b3a86]" checked={answers[i]}
                  onChange={() => setAnswers(answers.map((a, j) => (j === i ? !a : a)))} />
                {l(q)}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          {l({ id: "Klien yang sudah dirujuk", en: "Clients referred" })}
          <input type="number" min={0} className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-sm" value={referrals}
            onChange={(e) => setReferrals(Math.max(0, Number(e.target.value) || 0))} />
        </label>
        <button type="button" disabled={saving} onClick={submit} className="ml-auto h-10 rounded-lg bg-[#C4294A] px-5 text-sm font-bold text-white hover:bg-[#a82340] disabled:opacity-60">
          {l({ id: "Simpan", en: "Save" })}
        </button>
      </div>
    </div>
  );
}

function ContactLinks({ p }: { p: MitraProspect }) {
  const link = "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50";
  return (
    <div className="flex shrink-0 gap-1.5" onClick={(e) => e.stopPropagation()}>
      {p.phone && <a className={`${link} text-emerald-600`} href={waLink(p.phone)} target="_blank" rel="noopener noreferrer" title="WhatsApp"><MessageCircle className="h-4 w-4" /></a>}
      {p.phone && <a className={link} href={telLink(p.phone)} title={p.phone}><Phone className="h-4 w-4" /></a>}
      {p.instagram && <a className={`${link} text-pink-600`} href={instagramUrl(p.instagram)} target="_blank" rel="noopener noreferrer" title={`@${p.instagram}`}><Instagram className="h-4 w-4" /></a>}
      {p.email && <a className={link} href={`mailto:${p.email}`} title={p.email}><Mail className="h-4 w-4" /></a>}
      {p.website && <a className={link} href={/^https?:\/\//.test(p.website) ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer" title={p.website}><Globe className="h-4 w-4" /></a>}
    </div>
  );
}

export function MitraDesk() {
  const l = useL();
  const { lang } = useLanguage();
  const [prospects, setProspects] = useState<MitraProspect[] | null>(null);
  const [today, setToday] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("due");
  const [type, setType] = useState("");
  const [faith, setFaith] = useState("");
  const [facilitator, setFacilitator] = useState("");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "board">("list");

  const load = useCallback(async () => {
    try {
      const data = await callDeskFetch<{ today: string; prospects: MitraProspect[] }>(API);
      setProspects(data.prospects);
      setToday(data.today);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const post = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try {
      await callDeskFetch(API, { method: "POST", body: JSON.stringify(body) });
      await load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const isDue = useCallback((p: MitraProspect) =>
    !MITRA_CLOSED.includes(p.stage) && (p.followUpDate ? p.followUpDate <= today : p.stage === "prospect"), [today]);

  // Search and dropdown filters; shared by the list and the board
  const matching = useMemo(() => {
    if (!prospects) return [];
    const q = query.trim().toLowerCase();
    return prospects
      .filter((p) => !type || p.type === type)
      .filter((p) => !faith || p.faith === faith)
      .filter((p) => !facilitator || p.facilitator === facilitator)
      .filter((p) => !q || [p.name, p.organization, p.city, p.instagram, p.phone, p.reason, p.nextAction, p.notes].some((v) => v.toLowerCase().includes(q)));
  }, [prospects, type, faith, facilitator, query]);

  const shown = useMemo(() => {
    return matching
      .filter((p) => filter === "all" || (filter === "due" ? isDue(p) : p.stage === filter))
      // Due list: oldest follow-up first, never-contacted after; otherwise newest first as loaded
      .sort((a, b) => (filter === "due" ? (a.followUpDate ?? "9999").localeCompare(b.followUpDate ?? "9999") : 0));
  }, [matching, filter, isDue]);

  // Clicking a board card opens it in the list, where the details and log form live
  const openFromBoard = (id: string) => {
    setView("list");
    setFilter("all");
    setOpenId(id);
    setEditingId(null);
    requestAnimationFrame(() => document.getElementById(`mitra-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  if (!prospects && error) return <p className="text-sm font-semibold text-rose-600">{error}</p>;
  if (!prospects) return <Loader2 className="h-6 w-6 animate-spin text-[#1B3A6B]" />;

  const count = (stage: string) => prospects.filter((p) => p.stage === stage).length;
  const due = prospects.filter(isDue).length;
  // Sign-ups in the last 7 days, from the stage change in each log
  const weekAgo = addDays(today, -6);
  const signedThisWeek = prospects.filter((p) => p.log.some((e) => e.stageTo === "signed" && e.at.slice(0, 10) >= weekAgo)).length;
  const chip = (value: string, label: string, n: number) => (
    <button key={value} type="button" onClick={() => setFilter(value)}
      className={`rounded-full border px-3 py-1 text-xs font-bold ${filter === value ? "border-[#1B3A6B] bg-[#1B3A6B] text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
      {label} <span className="opacity-60">{n}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label={l({ id: "Perlu dihubungi hari ini", en: "Due today" })} value={String(due)} />
        <Tile label={l({ id: "Bergabung minggu ini", en: "Signed this week" })} value={String(signedThisWeek)} hint={l({ id: "target: 5", en: "target: 5" })} />
        <Tile label={l({ id: "Sudah bergabung", en: "Signed up" })} value={String(prospects.filter((p) => MITRA_SIGNED.includes(p.stage)).length)} />
        <Tile label={l({ id: "Aktif (sudah merujuk)", en: "Active (have referred)" })} value={String(count("active"))} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
          <input className="h-9 min-w-[180px] flex-1 rounded-lg border border-slate-200 px-3 text-sm" placeholder={l({ id: "Cari nama, kota, IG…", en: "Search name, city, IG…" })}
            value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">{l({ id: "Semua jenis", en: "All types" })}</option>
            {MITRA_TYPES.map((t) => <option key={t.value} value={t.value}>{l(t.label)}</option>)}
          </select>
          <select className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700" value={faith} onChange={(e) => setFaith(e.target.value)}>
            <option value="">{l({ id: "Semua agama", en: "All faiths" })}</option>
            {MITRA_FAITHS.map((f) => <option key={f.value} value={f.value}>{l(f.label)}</option>)}
          </select>
          <select className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700" value={facilitator} onChange={(e) => setFacilitator(e.target.value)}>
            <option value="">{l({ id: "Pendamping: semua", en: "Facilitator: any" })}</option>
            {MITRA_FACILITATOR.map((f) => <option key={f.value} value={f.value}>{l(f.label)}</option>)}
          </select>
          <div className="flex h-9 overflow-hidden rounded-lg border border-slate-200">
            {([["list", <List key="i" className="h-4 w-4" />, l({ id: "Daftar", en: "List" })], ["board", <SquareKanban key="i" className="h-4 w-4" />, l({ id: "Papan", en: "Board" })]] as const).map(([value, icon, label]) => (
              <button key={value} type="button" onClick={() => setView(value)}
                className={`flex items-center gap-1.5 px-3 text-sm font-semibold ${view === value ? "bg-[#1B3A6B] text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                {icon}{label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setAdding((open) => !open)} className="h-9 rounded-lg bg-[#C4294A] px-4 text-sm font-bold text-white hover:bg-[#a82340]">
            {adding ? l({ id: "Batal", en: "Cancel" }) : l({ id: "+ Tambah calon mitra", en: "+ Add potential Mitra" })}
          </button>
        </div>
        {adding && (
          <div className="border-b border-slate-100 bg-slate-50/60 p-5">
            <ProfileForm initial={BLANK} saving={saving} onCancel={() => setAdding(false)}
              onSave={async (profile) => { if (await post({ action: "create", ...profile })) setAdding(false); }} />
          </div>
        )}
        {view === "board" ? (
          <div className="pt-3"><MitraBoard prospects={matching} today={today} onOpen={openFromBoard} onChanged={load} /></div>
        ) : (<>
        <div className="flex flex-wrap gap-1.5 px-5 py-3">
          {chip("due", l({ id: "Perlu dihubungi", en: "Due" }), due)}
          {chip("all", l({ id: "Semua", en: "All" }), prospects.length)}
          {MITRA_STAGES.map((s) => chip(s.value, l(s.label), count(s.value)))}
        </div>
        {error && <p className="px-5 pb-3 text-sm font-semibold text-rose-600">{error}</p>}

        <ul className="divide-y divide-slate-100">
          {shown.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-slate-400">
              {filter === "due" ? l({ id: "Tidak ada yang perlu dihubungi hari ini.", en: "Nobody is due today." }) : l({ id: "Belum ada.", en: "Nothing here yet." })}
            </li>
          )}
          {shown.map((p) => {
            const open = openId === p.id;
            const overdue = p.followUpDate && p.followUpDate < today;
            return (
              <li key={p.id} id={`mitra-${p.id}`} className="scroll-mt-4">
                <div role="button" tabIndex={0} onClick={() => { setOpenId(open ? null : p.id); setEditingId(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") setOpenId(open ? null : p.id); }}
                  className="flex cursor-pointer flex-wrap items-center gap-3 px-5 py-3 hover:bg-slate-50/70">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900">{p.name}</span>
                      {p.organization && <span className="text-sm text-slate-500">· {p.organization}</span>}
                      <StageBadge stage={p.stage} />
                      {p.score !== null && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">{p.score}/4</span>}
                      <FacilitatorBadge value={p.facilitator} />
                      {p.referrals > 0 && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700">{p.referrals} {l({ id: "rujukan", en: "referred" })}</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {l(findLabel(MITRA_TYPES, p.type))}{p.faith !== "general" ? ` · ${l(findLabel(MITRA_FAITHS, p.faith))}` : ""}{p.city ? ` · ${p.city}` : ""}
                      {p.followUpDate && (
                        <span className={overdue ? "font-bold text-rose-600" : ""}>
                          {" · "}{l({ id: "Follow-up", en: "Follow-up" })} {formatDay(p.followUpDate, lang)}
                        </span>
                      )}
                    </p>
                    {(p.nextAction || p.bestTime) && (
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600">
                        {p.nextAction && <span className="inline-flex items-center gap-1"><ArrowRight className="h-3 w-3 text-[#C4294A]" />{p.nextAction}</span>}
                        {p.bestTime && <span className="inline-flex items-center gap-1 text-slate-400"><Clock className="h-3 w-3" />{p.bestTime}</span>}
                      </p>
                    )}
                  </div>
                  <ContactLinks p={p} />
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </div>

                {open && (
                  <div className="grid gap-4 bg-slate-50/70 px-5 pb-5 pt-2 lg:grid-cols-2">
                    <div className="space-y-3">
                      {editingId === p.id ? (
                        <ProfileForm initial={p} saving={saving} onCancel={() => setEditingId(null)}
                          onSave={async (profile) => { if (await post({ action: "edit", id: p.id, ...profile })) setEditingId(null); }} />
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
                          <div className="flex items-start justify-between gap-2">
                            <dl className="grid flex-1 grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs">
                              {p.phone && <><dt className="text-slate-400">{l({ id: "Telepon", en: "Phone" })}</dt><dd className="text-slate-700">{p.phone}</dd></>}
                              {p.instagram && <><dt className="text-slate-400">Instagram</dt><dd className="text-slate-700">@{p.instagram}</dd></>}
                              {p.email && <><dt className="text-slate-400">Email</dt><dd className="break-all text-slate-700">{p.email}</dd></>}
                              {p.website && <><dt className="text-slate-400">Website</dt><dd className="break-all text-slate-700">{p.website}</dd></>}
                              <dt className="text-slate-400">{l({ id: "Sumber", en: "Source" })}</dt>
                              <dd className="break-all text-slate-700">{l(findLabel(MITRA_SOURCES, p.source))}{p.sourceDetail ? ` · ${p.sourceDetail}` : ""}</dd>
                              {p.bestTime && <><dt className="text-slate-400">{l({ id: "Waktu telepon", en: "Best time" })}</dt><dd className="text-slate-700">{p.bestTime}</dd></>}
                              <dt className="text-slate-400">{l({ id: "Pendamping", en: "Facilitator" })}</dt>
                              <dd className="text-slate-700">
                                {l(findLabel(MITRA_FACILITATOR, p.facilitator))}
                                {p.facilitatorRate ? ` · ${p.facilitatorRate}` : ""}
                                {p.meetingsFacilitated > 0 ? ` · ${p.meetingsFacilitated} ${l({ id: "pertemuan", en: "meetings" })}` : ""}
                              </dd>
                              <dt className="text-slate-400">{l({ id: "Ditambahkan", en: "Added" })}</dt>
                              <dd className="text-slate-700">{p.createdAt ? formatDay(p.createdAt.slice(0, 10), lang, { day: "numeric", month: "short", year: "numeric" }) : "—"} · {p.createdBy}</dd>
                            </dl>
                            <button type="button" onClick={() => setEditingId(p.id)} className="text-xs font-bold text-[#0b3a86] hover:underline">
                              {l({ id: "Ubah", en: "Edit" })}
                            </button>
                          </div>
                          {p.reason && (
                            <div className="mt-3 border-t border-slate-100 pt-3">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{l({ id: "Kenapa ada di daftar", en: "Why they're here" })}</p>
                              <p className="mt-0.5 whitespace-pre-line text-xs text-slate-700">{p.reason}</p>
                            </div>
                          )}
                          {p.nextAction && (
                            <div className="mt-3 rounded-lg bg-rose-50/60 px-3 py-2">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-[#C4294A]">{l({ id: "Langkah berikutnya", en: "Next action" })}</p>
                              <p className="mt-0.5 text-xs text-slate-700">{p.nextAction}</p>
                            </div>
                          )}
                          {p.notes && <p className="mt-3 whitespace-pre-line border-t border-slate-100 pt-3 text-xs text-slate-600">{p.notes}</p>}
                        </div>
                      )}
                      <LogForm key={`${p.id}-${p.log.length}`} prospect={p} today={today} saving={saving} onLog={post} />
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{l({ id: "Riwayat", en: "History" })}</p>
                      {p.log.length === 0 ? (
                        <p className="mt-3 text-xs text-slate-400">{l({ id: "Belum pernah dihubungi.", en: "Not contacted yet." })}</p>
                      ) : (
                        <ol className="mt-3 space-y-3">
                          {p.log.map((entry, i) => (
                            <li key={i} className="border-l-2 border-slate-200 pl-3">
                              <p className="text-[11px] text-slate-400">
                                {formatDay(entry.at.slice(0, 10), lang, { day: "numeric", month: "short", year: "numeric" })} · {entry.by} · {l(findLabel(MITRA_CHANNELS, entry.channel))}
                              </p>
                              {entry.stageTo && (
                                <p className="text-xs text-slate-600">
                                  {l(findLabel(MITRA_STAGES, entry.stageFrom)) || "—"} → <span className="font-semibold">{l(findLabel(MITRA_STAGES, entry.stageTo))}</span>
                                </p>
                              )}
                              {entry.note && <p className="whitespace-pre-line text-sm text-slate-700">{entry.note}</p>}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        </>)}
      </section>
    </div>
  );
}
