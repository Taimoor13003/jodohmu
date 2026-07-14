"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Trash2, Save, X,
  Phone, Video, MessageSquare, Brain, FileText,
  Calendar, User, Clock, Link2, Mic,
  ChevronDown, ChevronUp, Tag, UserCog,
} from "lucide-react";

type Lang = "id" | "en";

/* ── palette ── */
const C = {
  bg: "#EEF2F7", card: "#FFFFFF", border: "#E2E8F0", div: "#F1F5F9",
  text: "#0F172A", body: "#334155", muted: "#94A3B8", empty: "#CBD5E1",
  primary: "#1B3A6B", accent: "#C4294A",
  g1: "#1B3A6B", g2: "#C4294A",
};

/* ── entry types ── */
const ENTRY_TYPES = [
  { value: "note",        label: { id: "Catatan",           en: "Note" },          icon: FileText,      color: "#64748B", bg: "#F8FAFC" },
  { value: "call",        label: { id: "Panggilan",         en: "Call" },          icon: Phone,         color: "#10B981", bg: "#ECFDF5" },
  { value: "meeting",     label: { id: "Google Meet",       en: "Google Meet" },   icon: Video,         color: "#6366F1", bg: "#EEF2FF" },
  { value: "message",     label: { id: "Pesan / Chat",      en: "Message / Chat"}, icon: MessageSquare, color: "#F59E0B", bg: "#FFFBEB" },
  { value: "assessment",  label: { id: "Sesi Psikotest",    en: "Psych Session" }, icon: Brain,         color: "#8B5CF6", bg: "#F5F3FF" },
  { value: "status",      label: { id: "Perubahan Status",  en: "Status Change" }, icon: Tag,           color: "#C4294A", bg: "#FFF1F2" },
  { value: "document",    label: { id: "Dokumen / File",    en: "Document / File"},icon: FileText,      color: "#0EA5E9", bg: "#F0F9FF" },
  { value: "onboarding",  label: { id: "Onboarding",        en: "Onboarding" },    icon: User,          color: "#1B3A6B", bg: "#EFF6FF" },
] as const;

type EntryType = typeof ENTRY_TYPES[number]["value"];

interface CRMEntry {
  id: string;
  type: EntryType;
  date: string;
  title: string;
  body: string;
  meetLink?: string;
  recordingLink?: string;
  assessor?: string;
  createdByName: string;
  createdAt: string | null;
}

interface CandidateMeta {
  name?: string;
  paket?: string;
  pic?: string;
  sumberLead?: string;
  lastContact?: string;
  nextFollowUp?: string;
  targetWaktuMenikah?: string;
}

function typeInfo(type: string) {
  return ENTRY_TYPES.find(t => t.value === type) ?? ENTRY_TYPES[0];
}

function disp(v: string | undefined, lang: Lang): string {
  if (!v) return "—";
  const map: Record<string, Record<Lang, string>> = {
    not_selected: { id: "Belum Pilih", en: "Not Selected" },
    pearl: { id: "Pearl", en: "Pearl" }, ruby: { id: "Ruby", en: "Ruby" },
    diamond: { id: "Diamond", en: "Diamond" }, safar: { id: "Safar", en: "Safar" },
    amanah: { id: "Amanah", en: "Amanah" },
    tia: { id: "Tia", en: "Tia" }, abi: { id: "Abi", en: "Abi" }, tia_abi: { id: "Tia & Abi", en: "Tia & Abi" },
    threads_form: { id: "Form Threads", en: "Threads Form" }, instagram: { id: "Instagram", en: "Instagram" },
    mitra_referral: { id: "Mitra Referral", en: "Partner Referral" },
    dm_langsung: { id: "DM Langsung", en: "Direct DM" }, lainnya: { id: "Lainnya", en: "Other" },
    under_3m: { id: "< 3 bulan", en: "< 3 months" }, "3_6m": { id: "3–6 bulan", en: "3–6 months" },
    "6_12m": { id: "6–12 bulan", en: "6–12 months" }, "1yr_plus": { id: "1 tahun+", en: "1 year+" },
    not_sure: { id: "Belum pasti", en: "Not sure" },
  };
  return map[v]?.[lang] ?? v;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return iso; }
}

/* ── blank form ── */
const blank = (): Omit<CRMEntry, "id" | "createdByName" | "createdAt"> => ({
  type: "note", date: new Date().toISOString().slice(0, 10),
  title: "", body: "", meetLink: "", recordingLink: "", assessor: "",
});

export default function CRMPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user, role, loading: authLoading } = useAuth();
  const { lang } = useLanguage();

  const [candidateMeta, setCandidateMeta] = useState<CandidateMeta>({});
  const [entries, setEntries]             = useState<CRMEntry[]>([]);
  const [pageLoading, setPageLoading]     = useState(true);
  const [fetchError, setFetchError]       = useState<string | null>(null);

  /* meta edit */
  const [editMeta, setEditMeta]   = useState(false);
  const [metaDraft, setMetaDraft] = useState<CandidateMeta>({});
  const [savingMeta, setSavingMeta] = useState(false);

  /* new entry form */
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(blank());
  const [submitting, setSubmitting] = useState(false);

  /* expanded entries */
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const getToken = useCallback(async () => {
    if (!auth.currentUser) throw new Error("Not logged in");
    return getIdToken(auth.currentUser);
  }, []);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/crm/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setCandidateMeta(json.data ?? {});
      setEntries(json.entries ?? []);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Error");
    } finally {
      setPageLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => { if (!authLoading && user) load(); }, [authLoading, user, load]);

  const saveMeta = async () => {
    setSavingMeta(true);
    try {
      const token = await getToken();
      await fetch(`/api/admin/crm/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(metaDraft),
      });
      setCandidateMeta(prev => ({ ...prev, ...metaDraft }));
      setEditMeta(false);
      toast.success(lang === "id" ? "Berhasil disimpan" : "Saved");
    } catch { toast.error(lang === "id" ? "Gagal menyimpan" : "Failed to save"); }
    finally { setSavingMeta(false); }
  };

  const addEntry = async () => {
    if (!form.title.trim()) { toast.error(lang === "id" ? "Judul wajib diisi" : "Title is required"); return; }
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/crm/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      const newEntry: CRMEntry = {
        ...form, id: json.id, createdByName: user?.displayName ?? user?.email ?? "Admin",
        createdAt: new Date().toISOString(),
      };
      setEntries(prev => [newEntry, ...prev]);
      setForm(blank()); setShowForm(false);
      toast.success(lang === "id" ? "Entri ditambahkan" : "Entry added");
    } catch { toast.error(lang === "id" ? "Gagal" : "Failed"); }
    finally { setSubmitting(false); }
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm(lang === "id" ? "Hapus entri ini?" : "Delete this entry?")) return;
    try {
      const token = await getToken();
      await fetch(`/api/admin/crm/${id}?entry=${entryId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setEntries(prev => prev.filter(e => e.id !== entryId));
      toast.success(lang === "id" ? "Dihapus" : "Deleted");
    } catch { toast.error(lang === "id" ? "Gagal menghapus" : "Failed to delete"); }
  };

  const toggleExpand = (entryId: string) =>
    setExpanded(prev => { const s = new Set(prev); if (s.has(entryId)) s.delete(entryId); else s.add(entryId); return s; });

  if (authLoading || pageLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: C.primary }} />
    </div>
  );
  if (role !== "admin" && role !== "worker") return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <p style={{ color: C.muted }}>Access denied</p>
    </div>
  );
  if (fetchError) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <p style={{ color: C.accent }}>{fetchError}</p>
    </div>
  );

  const candidateName = (candidateMeta as Record<string, string | undefined>).name ?? id;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "var(--font-roboto)" }}>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 pb-20">

        {/* ── top nav ── */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/admin/candidates/${id}`}
            className="flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-white"
            style={{ color: C.muted, borderColor: C.border }}>
            <ArrowLeft style={{ width: 13, height: 13 }} />
            {lang === "id" ? "Kembali ke Profil" : "Back to Profile"}
          </Link>
          <div style={{ flex: 1 }} />
          <span className="text-[13px] font-extrabold" style={{ color: C.primary }}>CRM — {candidateName}</span>
        </div>

        {/* ── meta strip ── */}
        <div className="rounded-2xl mb-5 overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(15,23,42,0.05)" }}>
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${C.div}` }}>
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>
              {lang === "id" ? "Info CRM Kandidat" : "Candidate CRM Info"}
            </span>
            {!editMeta
              ? <button onClick={() => { setMetaDraft({ ...candidateMeta }); setEditMeta(true); }}
                  className="text-[11.5px] font-semibold px-3 py-1 rounded-lg border hover:bg-slate-50 transition-colors"
                  style={{ color: C.muted, borderColor: C.border }}>
                  {lang === "id" ? "Edit" : "Edit"}
                </button>
              : <div className="flex gap-2">
                  <button onClick={() => setEditMeta(false)}
                    className="text-[11.5px] font-semibold px-3 py-1 rounded-lg border" style={{ color: C.muted, borderColor: C.border }}>
                    <X style={{ width: 12, height: 12, display: "inline", marginRight: 3 }} />{lang === "id" ? "Batal" : "Cancel"}
                  </button>
                  <button onClick={saveMeta} disabled={savingMeta}
                    className="text-[11.5px] font-bold px-3 py-1 rounded-lg text-white" style={{ background: C.primary, opacity: savingMeta ? 0.6 : 1 }}>
                    <Save style={{ width: 12, height: 12, display: "inline", marginRight: 3 }} />{lang === "id" ? "Simpan" : "Save"}
                  </button>
                </div>
            }
          </div>
          {editMeta ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-5 py-4">
              {[
                { k: "lastContact",        l: lang === "id" ? "Kontak Terakhir" : "Last Contact",         type: "date" },
                { k: "nextFollowUp",       l: lang === "id" ? "Follow-up Berikutnya" : "Next Follow-up",  type: "date" },
                { k: "paket",              l: lang === "id" ? "Paket" : "Plan Tier",                       type: "select", opts: ["not_selected","pearl","ruby","diamond","safar","amanah"] },
                { k: "pic",                l: "PIC",                                                        type: "select", opts: ["tia","abi","tia_abi"] },
                { k: "sumberLead",         l: lang === "id" ? "Sumber Lead" : "Lead Source",               type: "select", opts: ["threads_form","instagram","mitra_referral","dm_langsung","lainnya"] },
                { k: "targetWaktuMenikah", l: lang === "id" ? "Target Menikah" : "Marriage Timeline",      type: "select", opts: ["under_3m","3_6m","6_12m","1yr_plus","not_sure"] },
              ].map(f => (
                <div key={f.k}>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{f.l}</p>
                  {f.type === "date"
                    ? <input type="date" className="w-full text-[12.5px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }}
                        value={(metaDraft as Record<string, string | undefined>)[f.k] ?? ""} onChange={e => setMetaDraft(prev => ({ ...prev, [f.k]: e.target.value }))} />
                    : <select className="w-full text-[12.5px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }}
                        value={(metaDraft as Record<string, string | undefined>)[f.k] ?? ""} onChange={e => setMetaDraft(prev => ({ ...prev, [f.k]: e.target.value }))}>
                        <option value="">—</option>
                        {f.opts!.map(o => <option key={o} value={o}>{disp(o, lang)}</option>)}
                      </select>
                  }
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-6 gap-y-2 px-5 py-3.5">
              {[
                { icon: Clock,   label: lang === "id" ? "Kontak Terakhir" : "Last Contact", val: candidateMeta.lastContact, color: C.muted },
                { icon: Calendar,label: lang === "id" ? "Follow-up" : "Follow-up",           val: candidateMeta.nextFollowUp, color: "#0EA5E9" },
                { icon: Tag,     label: lang === "id" ? "Paket" : "Plan",                    val: candidateMeta.paket ? disp(candidateMeta.paket, lang) : undefined, color: C.primary },
                { icon: UserCog, label: "PIC",                                                val: candidateMeta.pic ? disp(candidateMeta.pic, lang) : undefined, color: C.muted },
                { icon: Link2,   label: lang === "id" ? "Sumber" : "Source",                 val: candidateMeta.sumberLead ? disp(candidateMeta.sumberLead, lang) : undefined, color: C.muted },
                { icon: Calendar,label: lang === "id" ? "Target Nikah" : "Target",           val: candidateMeta.targetWaktuMenikah ? disp(candidateMeta.targetWaktuMenikah, lang) : undefined, color: C.muted },
              ].filter(f => f.val).map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <f.icon style={{ width: 12, height: 12, color: f.color }} />
                  <span className="text-[11.5px]" style={{ color: C.muted }}>{f.label}:</span>
                  <span className="text-[12px] font-semibold" style={{ color: f.color }}>{f.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── add entry button ── */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[13.5px] font-extrabold" style={{ color: C.text }}>
            {lang === "id" ? "Riwayat Aktivitas" : "Activity History"}
            <span className="ml-2 text-[12px] font-semibold" style={{ color: C.muted }}>({entries.length})</span>
          </h2>
          <div style={{ flex: 1 }} />
          <button onClick={() => { setShowForm(f => !f); }}
            className="flex items-center gap-1.5 text-[12.5px] font-bold px-4 py-1.5 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g2})` }}>
            {showForm ? <X style={{ width: 13, height: 13 }} /> : <Plus style={{ width: 13, height: 13 }} />}
            {showForm ? (lang === "id" ? "Tutup" : "Close") : (lang === "id" ? "Tambah Entri" : "Add Entry")}
          </button>
        </div>

        {/* ── new entry form ── */}
        {showForm && (
          <div className="rounded-2xl mb-4 overflow-hidden" style={{ background: C.card, border: `2px solid ${C.primary}22`, boxShadow: "0 4px 20px rgba(27,58,107,0.1)" }}>
            <div className="px-5 pt-4 pb-2" style={{ borderBottom: `1px solid ${C.div}` }}>
              <p className="text-[12px] font-extrabold uppercase tracking-wide" style={{ color: C.primary }}>
                {lang === "id" ? "Tambah Entri Baru" : "New Entry"}
              </p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              {/* Type selector */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: C.muted }}>{lang === "id" ? "Tipe" : "Type"}</p>
                <div className="flex flex-wrap gap-2">
                  {ENTRY_TYPES.map(et => (
                    <button key={et.value} onClick={() => setForm(f => ({ ...f, type: et.value }))}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11.5px] font-semibold transition-colors"
                      style={form.type === et.value
                        ? { background: et.bg, color: et.color, borderColor: et.color + "60" }
                        : { background: "#F8FAFC", color: C.muted, borderColor: C.border }}>
                      <et.icon style={{ width: 11, height: 11 }} />
                      {et.label[lang]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{lang === "id" ? "Tanggal" : "Date"}</p>
                  <input type="date" className="w-full text-[13px] rounded-lg px-3 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }}
                    value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{lang === "id" ? "Judul" : "Title"} *</p>
                  <input type="text" className="w-full text-[13px] rounded-lg px-3 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }}
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder={lang === "id" ? "Ringkasan singkat…" : "Brief summary…"} />
                </div>
              </div>
              {/* Assessor — only for assessment type */}
              {form.type === "assessment" && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{lang === "id" ? "Assessor / Psikolog" : "Assessor / Psychologist"}</p>
                  <input type="text" className="w-full text-[13px] rounded-lg px-3 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }}
                    value={form.assessor ?? ""} onChange={e => setForm(f => ({ ...f, assessor: e.target.value }))}
                    placeholder={lang === "id" ? "Nama assessor…" : "Assessor name…"} />
                </div>
              )}
              {/* Meet / Recording links — for meeting/assessment */}
              {(form.type === "meeting" || form.type === "assessment") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>Google Meet Link</p>
                    <input type="url" className="w-full text-[13px] rounded-lg px-3 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }}
                      value={form.meetLink ?? ""} onChange={e => setForm(f => ({ ...f, meetLink: e.target.value }))}
                      placeholder="https://meet.google.com/…" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{lang === "id" ? "Link Rekaman" : "Recording Link"}</p>
                    <input type="url" className="w-full text-[13px] rounded-lg px-3 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }}
                      value={form.recordingLink ?? ""} onChange={e => setForm(f => ({ ...f, recordingLink: e.target.value }))}
                      placeholder="https://drive.google.com/…" />
                  </div>
                </div>
              )}
              {/* Notes body */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{lang === "id" ? "Catatan / Detail" : "Notes / Details"}</p>
                <textarea rows={4} className="w-full text-[13px] rounded-lg px-3 py-2 border resize-none focus:outline-none" style={{ borderColor: C.border, color: C.text, lineHeight: 1.6 }}
                  value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder={lang === "id" ? "Detail, observasi, poin penting…" : "Details, observations, key points…"} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => { setShowForm(false); setForm(blank()); }}
                  className="text-[12px] font-semibold px-4 py-1.5 rounded-xl border transition-colors hover:bg-slate-50"
                  style={{ color: C.muted, borderColor: C.border }}>
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
                <button onClick={addEntry} disabled={submitting}
                  className="text-[12px] font-bold px-4 py-1.5 rounded-xl text-white transition-opacity hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g2})`, opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? "…" : (lang === "id" ? "Simpan Entri" : "Save Entry")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── timeline ── */}
        {entries.length === 0 ? (
          <div className="rounded-2xl px-6 py-12 text-center" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[14px]" style={{ color: C.muted }}>
              {lang === "id" ? "Belum ada riwayat. Mulai dengan menambahkan entri pertama." : "No history yet. Start by adding the first entry."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => {
              const ti = typeInfo(entry.type);
              const isExpanded = expanded.has(entry.id);
              const hasExtra = entry.body || entry.meetLink || entry.recordingLink || entry.assessor;
              return (
                <div key={entry.id} className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                  {/* entry header */}
                  <div className="flex items-start gap-3 px-4 py-3.5">
                    {/* type icon */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: ti.bg, color: ti.color }}>
                      <ti.icon style={{ width: 15, height: 15 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: ti.bg, color: ti.color }}>{ti.label[lang]}</span>
                        <span className="text-[12px] font-bold" style={{ color: C.text }}>{entry.title}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: C.muted }}>
                          <Calendar style={{ width: 10, height: 10 }} />{entry.date}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: C.muted }}>
                          <User style={{ width: 10, height: 10 }} />{entry.createdByName}
                        </span>
                        {entry.createdAt && (
                          <span className="text-[11px]" style={{ color: C.empty }}>dibuat {formatDate(entry.createdAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {hasExtra && (
                        <button onClick={() => toggleExpand(entry.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                          style={{ color: C.muted }}>
                          {isExpanded ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                        </button>
                      )}
                      <button onClick={() => deleteEntry(entry.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                        style={{ color: C.empty }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                        onMouseLeave={e => (e.currentTarget.style.color = C.empty)}>
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>

                  {/* expanded detail */}
                  {isExpanded && hasExtra && (
                    <div className="px-4 pb-4 flex flex-col gap-3" style={{ borderTop: `1px solid ${C.div}` }}>
                      {entry.assessor && (
                        <div className="flex items-center gap-1.5 pt-3">
                          <User style={{ width: 12, height: 12, color: C.muted }} />
                          <span className="text-[11.5px]" style={{ color: C.muted }}>{lang === "id" ? "Assessor" : "Assessor"}:</span>
                          <span className="text-[12px] font-semibold" style={{ color: C.text }}>{entry.assessor}</span>
                        </div>
                      )}
                      {entry.meetLink && (
                        <div className="flex items-center gap-1.5">
                          <Video style={{ width: 12, height: 12, color: "#6366F1" }} />
                          <a href={entry.meetLink} target="_blank" rel="noopener noreferrer"
                            className="text-[12px] font-semibold underline truncate max-w-xs" style={{ color: "#6366F1" }}>
                            Google Meet
                          </a>
                        </div>
                      )}
                      {entry.recordingLink && (
                        <div className="flex items-center gap-1.5">
                          <Mic style={{ width: 12, height: 12, color: "#10B981" }} />
                          <a href={entry.recordingLink} target="_blank" rel="noopener noreferrer"
                            className="text-[12px] font-semibold underline truncate max-w-xs" style={{ color: "#10B981" }}>
                            {lang === "id" ? "Rekaman" : "Recording"}
                          </a>
                        </div>
                      )}
                      {entry.body && (
                        <div className="rounded-xl px-4 py-3" style={{ background: C.bg }}>
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: C.body }}>{entry.body}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
