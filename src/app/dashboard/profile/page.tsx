"use client";


import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";
import Image from "next/image";
import MenAvatar    from "@/assets/men-avatar.png";
import WomenAvatar  from "@/assets/women-avatar.png";
import {
  MapPin, Briefcase, GraduationCap, Heart, Eye, EyeOff, Camera,
  ChevronLeft, ChevronRight, X, BookOpen, Shield, Leaf, Star,
  Users, CalendarDays, Target, Link as LinkIcon, CheckCircle2 as CheckCircle2Icon,
  Lock, Brain, ShieldCheck, ClipboardList, History, Sparkles,
} from "lucide-react";

type Lang = "id" | "en";
type D = Record<string, unknown>;

/* ── palette ──────────────────────────────────────────────────────────── */
const C = {
  bg:    "#EEF2F7", card:  "#FFFFFF", border: "#E2E8F0",
  text:  "#0F172A", body:  "#334155", muted: "#94A3B8", div: "#F1F5F9",
  g1:    "#C4294A", g2:    "#1B3A6B",
};

/* ── value translations ───────────────────────────────────────────────── */
const V: Record<string, Record<Lang, string>> = {
  male:                   { id: "Laki-laki",           en: "Male" },
  female:                 { id: "Perempuan",            en: "Female" },
  yes:                    { id: "Ya",                   en: "Yes" },
  no:                     { id: "Tidak",                en: "No" },
  never:                  { id: "Tidak pernah",         en: "Never" },
  occasionally:           { id: "Kadang-kadang",        en: "Occasionally" },
  regularly:              { id: "Rutin",                en: "Regularly" },
  quit:                   { id: "Sudah berhenti",       en: "Quit" },
  rarely:                 { id: "Jarang",               en: "Rarely" },
  sometimes:              { id: "Kadang",               en: "Sometimes" },
  daily:                  { id: "Setiap hari",          en: "Daily" },
  always:                 { id: "Selalu",               en: "Always" },
  mostly:                 { id: "Sebagian besar",       en: "Mostly" },
  weekly:                 { id: "Mingguan",             en: "Weekly" },
  introvert:              { id: "Introvert",            en: "Introvert" },
  extrovert:              { id: "Ekstrovert",           en: "Extrovert" },
  ambivert:               { id: "Ambivert",             en: "Ambivert" },
  none:                   { id: "Tidak ada",            en: "None" },
  basic:                  { id: "Dasar",                en: "Basic" },
  intermediate:           { id: "Menengah",             en: "Intermediate" },
  advanced:               { id: "Lanjutan",             en: "Advanced" },
  strict:                 { id: "Ketat",                en: "Strict" },
  moderate:               { id: "Moderat",              en: "Moderate" },
  relaxed:                { id: "Santai",               en: "Relaxed" },
  avoid:                  { id: "Menghindari",          en: "Avoid" },
  limited:                { id: "Terbatas",             en: "Limited" },
  comfortable:            { id: "Nyaman",               en: "Comfortable" },
  asap:                   { id: "Sesegera mungkin",     en: "As soon as possible" },
  "6_months":             { id: "6 Bulan",              en: "6 Months" },
  "1_year":               { id: "1 Tahun",              en: "1 Year" },
  "2_years":              { id: "2 Tahun",              en: "2 Years" },
  "3_plus_years":         { id: "3+ Tahun",             en: "3+ Years" },
  not_sure:               { id: "Belum pasti",          en: "Not sure" },
  simple:                 { id: "Sederhana",            en: "Simple" },
  grand:                  { id: "Mewah",                en: "Grand" },
  no_preference:          { id: "Tidak ada preferensi", en: "No preference" },
  joint:                  { id: "Bersama",              en: "Joint" },
  separate:               { id: "Terpisah",             en: "Separate" },
  husband_manages:        { id: "Suami kelola",         en: "Husband manages" },
  wife_manages:           { id: "Istri kelola",         en: "Wife manages" },
  discussed:              { id: "Didiskusikan",         en: "Discussed" },
  husband_leads:          { id: "Suami memimpin",       en: "Husband leads" },
  wife_leads:             { id: "Istri memimpin",       en: "Wife leads" },
  discussed_case_by_case: { id: "Kasus per kasus",      en: "Case by case" },
  conditional:            { id: "Kondisional",          en: "Conditional" },
  Islam:                  { id: "Islam",                en: "Islam" },
  very_practicing:        { id: "Sangat taat",          en: "Very practicing" },
  practicing:             { id: "Taat",                 en: "Practicing" },
  not_practicing:         { id: "Tidak taat",           en: "Not practicing" },
  yes_full:               { id: "Ya, penuh",            en: "Yes, full" },
  yes_sometimes:          { id: "Kadang",               en: "Sometimes" },
  converting:             { id: "Dalam proses",         en: "Converting" },
  accept:                 { id: "Menerima",             en: "Accept" },
  not_accept:             { id: "Tidak terima",         en: "Not accept" },
  employed:               { id: "Karyawan",             en: "Employed" },
  self_employed:          { id: "Wiraswasta",           en: "Self-employed" },
  business_owner:         { id: "Pemilik usaha",        en: "Business owner" },
  unemployed:             { id: "Tidak bekerja",        en: "Unemployed" },
  student:                { id: "Pelajar/Mahasiswa",    en: "Student" },
  retired:                { id: "Pensiun",              en: "Retired" },
  below_5m:               { id: "Di bawah 5 Juta",      en: "Below IDR 5M" },
  "5m_10m":               { id: "5–10 Juta",            en: "IDR 5–10M" },
  "10m_20m":              { id: "10–20 Juta",           en: "IDR 10–20M" },
  "20m_50m":              { id: "20–50 Juta",           en: "IDR 20–50M" },
  above_50m:              { id: "Di atas 50 Juta",      en: "Above IDR 50M" },
  prefer_not_to_say:      { id: "Tidak ingin berbagi",  en: "Prefer not to say" },
  own:                    { id: "Milik sendiri",        en: "Own" },
  rent:                   { id: "Sewa",                 en: "Rent" },
  family_home:            { id: "Rumah keluarga",       en: "Family home" },
  company_provided:       { id: "Fasilitas kantor",     en: "Company provided" },
  single:                 { id: "Lajang",               en: "Single" },
  divorced:               { id: "Cerai",                en: "Divorced" },
  widowed:                { id: "Janda/Duda",           en: "Widowed" },
  A: { id: "A", en: "A" }, B: { id: "B", en: "B" }, AB: { id: "AB", en: "AB" }, O: { id: "O", en: "O" },
  ready:                  { id: "Open Ta'aruf",         en: "Open to Ta'aruf" },
  preparing:              { id: "Persiapan Ta'aruf",    en: "Preparing for Ta'aruf" },
  not_selected:           { id: "Belum Pilih Paket",    en: "No Plan Selected" },
  pearl:                  { id: "Pearl",                en: "Pearl" },
  ruby:                   { id: "Ruby",                 en: "Ruby" },
  diamond:                { id: "Diamond",              en: "Diamond" },
  safar:                  { id: "Safar",                en: "Safar" },
  amanah:                 { id: "Amanah",               en: "Amanah" },
  custom:                 { id: "Custom",               en: "Custom" },
  registered_looking:     { id: "Mencari Pasangan",     en: "Searching Matches" },
  new_lead:               { id: "Mencari Pasangan",     en: "Searching Matches" },
  matched:                { id: "Dipertemukan",         en: "Matched" },
  in_taaruf:              { id: "Dalam Ta'aruf",        en: "In Ta'aruf" },
  family_meeting:         { id: "Pertemuan Keluarga",   en: "Family Meeting" },
  closed_success:         { id: "Selesai — Menikah",    en: "Closed — Success" },
  closed_withdrawn:       { id: "Selesai — Mundur",     en: "Closed — Withdrawn" },
  visible_all:            { id: "Terlihat Semua",       en: "Visible to All" },
  after_match:            { id: "Setelah Match",        en: "After Match" },
  custody_self:           { id: "Sendiri",              en: "Self" },
  custody_ex:             { id: "Mantan Pasangan",      en: "Ex-Partner" },
  custody_shared:         { id: "Bersama",              en: "Shared" },
  no_pref:                { id: "Tidak Masalah",        en: "No Preference" },
  required:               { id: "Wajib",                en: "Required" },
  preferred:              { id: "Preferensi",           en: "Preferred" },
  nu:                     { id: "Nahdlatul Ulama (NU)", en: "Nahdlatul Ulama (NU)" },
  muhammadiyah:           { id: "Muhammadiyah",         en: "Muhammadiyah" },
  salafi:                 { id: "Salafi / Wahabi",      en: "Salafi / Wahhabi" },
  netral:                 { id: "Netral",               en: "Neutral" },
  single_only:            { id: "Lajang Saja",          en: "Single Only" },
  open_divorced:          { id: "Terbuka Cerai / Janda-Duda", en: "Open to Divorced/Widowed" },
  open_all:               { id: "Terbuka Semua Status", en: "Open to All" },
  same_city:              { id: "Sekota",               en: "Same City" },
  diff_city_ok:           { id: "Lain Kota OK",         en: "Different City OK" },
  relocate_ok:            { id: "Bersedia Pindah",      en: "Willing to Relocate" },
  must_work:              { id: "Wajib Bekerja",        en: "Must Be Working" },
  slim_build:             { id: "Langsing / Kurus",     en: "Slim" },
  average_build:          { id: "Rata-rata",            en: "Average Build" },
  athletic_build:         { id: "Atletis / Sehat",      en: "Athletic" },
  max_certain:            { id: "Ya, maks. tertentu",   en: "Yes, up to a max" },
  flexible:               { id: "Fleksibel",            en: "Flexible" },
  accepted:               { id: "Diterima",             en: "Accepted" },
  not_accepted:           { id: "Tidak Diterima",       en: "Not Accepted" },
  continue_work:          { id: "Lanjut Bekerja",       en: "Continue Working" },
  stay_home:              { id: "Di Rumah / Fokus Keluarga", en: "Stay at Home" },
  depends:                { id: "Tergantung",           en: "Depends" },
  // parents
  alive:                  { id: "Masih Hidup",          en: "Alive" },
  passed_away:            { id: "Sudah Meninggal",      en: "Passed Away" },
  // children / discussion preference
  prefer_not_to_discuss:  { id: "Tidak Ingin Membahas", en: "Prefer Not to Discuss" },
  // church attendance
  every_sunday:           { id: "Setiap Minggu",        en: "Every Sunday" },
  most_sundays:           { id: "Sebagian Besar Minggu",en: "Most Sundays" },
  // bible / quran
  daily_reading:          { id: "Setiap Hari",          en: "Daily" },
  weekly_reading:         { id: "Mingguan",             en: "Weekly" },
};

function disp(val: string, lang: Lang): string {
  return V[val]?.[lang] ?? val;
}

function raw(data: D, key: string): string {
  const v = data[key];
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v.trim() === "" ? "—" : v;
  if (typeof v === "number") return String(v);
  return "—";
}

function dispV(data: D, key: string, lang: Lang): string {
  const r = raw(data, key);
  if (r === "—") return "—";
  return disp(r, lang);
}

interface EduEntry { level: string; major: string; }

const EDU_LEVEL: Record<string, Record<Lang, string>> = {
  sd:    { id: "SD",      en: "Elementary" },
  smp:   { id: "SMP",     en: "Junior High" },
  sma:   { id: "SMA",     en: "High School" },
  d3:    { id: "D3",      en: "Associate's (D3)" },
  s1_d4: { id: "S1 / D4", en: "Bachelor's" },
  s2:    { id: "S2",      en: "Master's" },
  s3:    { id: "S3",      en: "PhD" },
};

function dispEdu(edu: EduEntry, lang: Lang): string {
  const lvl = EDU_LEVEL[edu.level]?.[lang] ?? edu.level;
  return edu.major ? `${lvl} — ${edu.major}` : lvl;
}

/* ── gender avatar ────────────────────────────────────────────────────── */
function GenderAvatar({ gender }: { gender: string; size?: number }) {
  const src = gender === "female" ? WomenAvatar : MenAvatar;
  return <Image src={src} alt="" className="w-full h-full object-cover object-top" />;
}

/* ── section card ─────────────────────────────────────────────────────── */
function SCard({ title, icon, iconColor, iconBg, children }: {
  title: string; icon: React.ReactNode; iconColor: string; iconBg: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border" style={{ borderColor: C.border, boxShadow: "0 2px 8px rgba(15,23,42,0.06)" }}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b" style={{ borderColor: C.div }}>
        <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 28, height: 28, background: iconBg, color: iconColor }}>
          <span style={{ width: 14, height: 14, display: "flex" }}>{icon}</span>
        </div>
        <h3 className="text-[13px] font-bold" style={{ color: C.text }}>{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/* ── empty hint ───────────────────────────────────────────────────────── */
function EmptyHint({ block = false }: { block?: boolean }) {
  return (
    <div className={`group relative ${block ? "inline-flex" : "inline-flex"}`}>
      <span
        className="flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg border border-dashed cursor-help text-[12px]"
        style={{ color: "#94A3B8", borderColor: "#CBD5E1", background: "#F8FAFC" }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Belum diisi
      </span>
      {/* tooltip */}
      <div
        className="pointer-events-none absolute bottom-full left-0 mb-2 z-30
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
          px-3 py-2 rounded-lg text-[11.5px] font-medium text-white whitespace-nowrap"
        style={{ background: "#1B3A6B", boxShadow: "0 4px 16px rgba(15,23,42,0.25)" }}>
        💬 Hubungi tim Jodohmu untuk melengkapi profil kamu
        <span style={{
          position: "absolute", top: "100%", left: 14,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "5px solid #1B3A6B",
        }} />
      </div>
    </div>
  );
}

/* ── field row ────────────────────────────────────────────────────────── */
function Field({ label, value, stranger = false, long = false }: {
  label: string; value: string; stranger?: boolean; long?: boolean;
}) {
  if (stranger && value === "—") return null;
  const isEmpty = value === "—";
  return (
    <div className={long ? "sm:col-span-2" : ""}>
      <p className="text-[10.5px] font-bold uppercase tracking-wide mb-0.5" style={{ color: C.muted }}>{label}</p>
      {isEmpty && !stranger
        ? <EmptyHint />
        : <p className="text-[13.5px] font-medium leading-snug" style={{ color: C.text }}>{value}</p>
      }
    </div>
  );
}

/* ── grid wrapper for fields ──────────────────────────────────────────── */
function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</div>;
}

/* ── collapsed section (all fields empty) ────────────────────────────────── */
function CollapsedSection({ title, icon, fields, lang }: {
  title: string; icon: React.ReactNode; iconColor: string; iconBg: string;
  fields: string[]; lang: Lang;
}) {
  return (
    <div className="group relative rounded-2xl border bg-white"
      style={{ borderColor: "#E2E8F0", borderStyle: "dashed", cursor: "help" }}>
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center rounded-lg shrink-0"
            style={{ width: 28, height: 28, background: "#F8FAFC", color: "#D1D5DB" }}>
            <span style={{ width: 14, height: 14, display: "flex" }}>{icon}</span>
          </div>
          <h3 className="text-[13px] font-medium" style={{ color: "#94A3B8" }}>{title}</h3>
        </div>
        <span className="text-[11px] italic" style={{ color: "#CBD5E1" }}>
          {lang === "id" ? "Belum diisi" : "Not yet filled"}
        </span>
      </div>

      {/* hover tooltip */}
      <div className="pointer-events-none absolute right-4 top-full mt-2 z-30
        opacity-0 group-hover:opacity-100 transition-opacity duration-150
        rounded-xl px-4 py-3 min-w-[200px] text-white"
        style={{ background: "#1B3A6B", boxShadow: "0 8px 24px rgba(15,23,42,0.2)" }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>
          {lang === "id" ? "Informasi belum diisi:" : "Fields not yet filled:"}
        </p>
        <ul className="flex flex-col gap-1">
          {fields.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-[12px]">
              <span className="shrink-0 rounded-full" style={{ width: 3, height: 3, background: "rgba(255,255,255,0.4)", display: "inline-block" }} />
              {f}
            </li>
          ))}
        </ul>
        <p className="text-[11px] mt-2.5 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)" }}>
          💬 {lang === "id" ? "Hubungi tim Jodohmu untuk melengkapi" : "Contact the Jodohmu team to fill this in"}
        </p>
        {/* caret */}
        <span style={{
          position: "absolute", bottom: "100%", right: 20,
          borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
          borderBottom: "6px solid #1B3A6B",
        }} />
      </div>
    </div>
  );
}

/* ── result card (psych test / bg check / etc) ─────────────────────────── */
function ResultCard({ title, icon, iconBg, iconColor, locked, lang, children }: {
  title: string; icon: React.ReactNode; iconBg: string; iconColor: string;
  locked: boolean; lang: Lang; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border" style={{
      borderColor: locked ? "#E2E8F0" : "#E2E8F0",
      background: locked ? "#FAFAFA" : "#fff",
      boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
    }}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "#F1F5F9" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center rounded-lg shrink-0" style={{
            width: 28, height: 28,
            background: locked ? "#F1F5F9" : iconBg,
            color: locked ? "#CBD5E1" : iconColor,
          }}>
            <span style={{ width: 14, height: 14, display: "flex" }}>{icon}</span>
          </div>
          <h3 className="text-[13px] font-bold" style={{ color: locked ? "#94A3B8" : C.text }}>{title}</h3>
        </div>
        {locked
          ? <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#F1F5F9", color: "#94A3B8" }}>
              <Lock style={{ width: 9, height: 9 }} />
              {lang === "id" ? "Belum Tersedia" : "Not Yet Available"}
            </span>
          : <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#F0FDF4", color: "#16A34A" }}>
              ✓ {lang === "id" ? "Tersedia" : "Available"}
            </span>
        }
      </div>
      <div className="px-5 py-4">
        {locked
          ? <p className="text-[12.5px] italic leading-relaxed" style={{ color: "#CBD5E1" }}>
              {lang === "id"
                ? "Tim Jodohmu sedang memproses ini. Kamu akan diberitahu ketika hasilnya siap."
                : "The Jodohmu team is working on this. You'll be notified once it's ready."}
            </p>
          : children
        }
      </div>
    </div>
  );
}

/* ── main component ───────────────────────────────────────────────────── */
export default function CandidateProfilePage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [data, setData]                     = useState<D>({});
  const [loading, setLoading]               = useState(true);
  const [stranger, setStranger]             = useState(false);
  const [lightboxIdx, setLightboxIdx]       = useState<number | null>(null);
  const [linkActive, setLinkActive]         = useState(false);
  const [togglingLink, setTogglingLink]     = useState(false);
  const [photosPublic, setPhotosPublic]     = useState(false);
  const [togglingPhotos, setTogglingPhotos] = useState(false);
  const [copied, setCopied]                 = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const token = await getIdToken(auth.currentUser!);
      const res = await fetch("/api/candidate/me", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const { data: d } = await res.json() as { data: D | null };
        setData(d ?? {});
        setLinkActive(!!(d?.profileLinkActive));
        setPhotosPublic(!!(d?.publicPhotosVisible));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stranger") === "1") setStranger(true);
  }, []);

  const toggleLink = async () => {
    if (togglingLink) return;
    setTogglingLink(true);
    const next = !linkActive;
    try {
      const token = await getIdToken(auth.currentUser!);
      await fetch("/api/candidate/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileLinkActive: next }),
      });
      setLinkActive(next);
    } catch { /* silent */ }
    finally { setTogglingLink(false); }
  };

  const togglePhotos = async () => {
    if (togglingPhotos) return;
    setTogglingPhotos(true);
    const next = !photosPublic;
    try {
      const token = await getIdToken(auth.currentUser!);
      await fetch("/api/candidate/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ publicPhotosVisible: next }),
      });
      setPhotosPublic(next);
    } catch { /* silent */ }
    finally { setTogglingPhotos(false); }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/profile/${user?.uid}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const l = (id: string, en: string) => lang === "id" ? id : en;

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: C.muted, fontSize: 14 }}>{l("Memuat profil…", "Loading profile…")}</p>
      </div>
    );
  }

  /* derived values */
  const name        = raw(data, "fullName") !== "—" ? raw(data, "fullName") : (user.displayName ?? user.email ?? "—");
  const age         = raw(data, "age");
  const gender      = raw(data, "gender");
  const photos      = Array.isArray(data.photoUrls) ? data.photoUrls as string[] : [];
  const photoVis    = raw(data, "photoVisibility");
  const showPhotos  = !stranger || photoVis === "visible_all";
  const openTaaruf  = raw(data, "openToTaaruf");
  const personStatus = raw(data, "personStatus");
  const paket       = raw(data, "paket");
  const educations  = Array.isArray(data.educations) ? data.educations as EduEntry[] : [];

  const hasPaket    = paket && paket !== "—" && paket !== "not_selected";
  const s = (key: string) => dispV(data, key, lang);

  // Religion-based display
  const religionRaw     = raw(data, "religion").toLowerCase();
  const isIslam         = religionRaw === "islam";
  const isChristian     = ["kristen", "christian", "catholic", "katholik", "protestan", "katolik"].some(r => religionRaw.includes(r));
  const isHinduBuddhist = ["hindu", "buddh", "budha"].some(r => religionRaw.includes(r));
  const isAtheistLiberal= ["atheis", "agnostik", "agnostic", "liberal", "tidak beragama"].some(r => religionRaw.includes(r));
  const religionKnown   = religionRaw !== "—";

  // Children
  const hasChildrenVal  = raw(data, "hasChildren"); // "yes" | "no" | "prefer_not_to_discuss"
  const showChildDetails = hasChildrenVal === "yes";

  /* ── sidebar ── */
  const Sidebar = (
    <div className="w-full lg:w-[260px] lg:flex-shrink-0">
      <div className="lg:sticky lg:top-4 flex flex-col gap-3">
        {/* Photo + identity */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: C.border, boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
          {/* mobile: row layout, desktop: column layout */}
          <div className="flex flex-row lg:flex-col items-center lg:items-center gap-4 lg:gap-0 px-4 lg:px-5 pt-5 lg:pt-7 pb-4 lg:pb-5" style={{ borderBottom: `1px solid ${C.div}` }}>
            <div className="lg:mb-4 p-[3px] rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g2})` }}>
              <div className="rounded-full overflow-hidden cursor-pointer" style={{ width: 80, height: 80, background: C.bg }}
                onClick={() => showPhotos && photos.length > 0 && setLightboxIdx(0)}>
                {showPhotos && photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photos[0]} alt={name} className="w-full h-full object-cover object-top hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: C.bg }}>
                    <GenderAvatar gender={gender} size={60} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 lg:flex-none lg:w-full text-left lg:text-center">
              <h2 className="font-extrabold leading-tight mb-1" style={{ fontSize: 17, color: C.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {name}
              </h2>
              <div className="flex items-center gap-2 flex-wrap lg:justify-center">
                {age !== "—" && <p className="text-[13px] font-semibold" style={{ color: C.body }}>{age} {l("thn", "yrs")}</p>}
                {gender !== "—" && (
                  <span className="px-2 py-[2px] rounded-full text-[11px] font-bold border"
                    style={gender === "female"
                      ? { background: "#FFF1F2", color: "#C4294A", borderColor: "#FECDD3" }
                      : { background: "#EFF6FF", color: "#1B3A6B", borderColor: "#BFDBFE" }}>
                    {disp(gender, lang)}
                  </span>
                )}
              </div>
              {/* Badges */}
              <div className="flex flex-wrap lg:justify-center gap-1.5 mt-2">
                {openTaaruf !== "—" && (
                  <span className={`px-2.5 py-[3px] rounded-full border text-[11px] font-bold ${openTaaruf === "ready" ? "bg-amber-50 text-amber-700 border-amber-200" : openTaaruf === "preparing" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    <Heart className="w-2.5 h-2.5 fill-current inline mr-0.5" />
                    {openTaaruf === "no" ? l("Tidak Open Ta'aruf", "Not Open to Ta'aruf") : disp(openTaaruf, lang)}
                  </span>
                )}
                {personStatus !== "—" && (
                  <span className="px-2.5 py-[3px] rounded-full border text-[11px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                    {disp(personStatus, lang)}
                  </span>
                )}
                {hasPaket && (
                  <span className="px-2.5 py-[3px] rounded-full border text-[11px] font-extrabold text-white" style={{ background: "#1B3A6B", borderColor: "#1B3A6B" }}>
                    {disp(paket, lang)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Quick info */}
          <div className="px-5 py-4 flex flex-col gap-2.5">
            {raw(data, "location") !== "—" && (
              <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: C.body }}>
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: C.muted }} />
                {raw(data, "location")}
              </div>
            )}
            {raw(data, "occupation") !== "—" && (
              <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: C.body }}>
                <Briefcase className="w-3.5 h-3.5 shrink-0" style={{ color: C.muted }} />
                {raw(data, "occupation")}
              </div>
            )}
            {educations.map((edu, i) => (
              <div key={i} className="flex items-start gap-2" style={{ fontSize: 12.5, color: C.body }}>
                <GraduationCap className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: C.muted }} />
                {dispEdu(edu, lang)}
              </div>
            ))}
          </div>
        </div>

        {/* Stranger toggle */}
        <button
          onClick={() => setStranger(s => !s)}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12.5px] font-bold border transition-colors"
          style={stranger
            ? { background: "#1B3A6B", color: "#fff", borderColor: "#1B3A6B" }
            : { background: "#fff", color: "#1B3A6B", borderColor: "#BFDBFE" }}>
          {stranger ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {stranger ? l("Lihat Profil Saya", "View My Full Profile") : l("Lihat Sebagai Orang Lain", "View as Stranger")}
        </button>

        {/* Share link card */}
        <div className="rounded-2xl border p-4 flex flex-col gap-3" style={{ background: "#fff", borderColor: C.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12.5px] font-bold" style={{ color: C.text }}>{l("Link Profil", "Profile Link")}</p>
              <p className="text-[11px]" style={{ color: C.muted }}>
                {linkActive ? l("Aktif — siapapun dengan link bisa melihat", "Active — anyone with link can view") : l("Nonaktif — link tidak bisa diakses", "Inactive — link is locked")}
              </p>
            </div>
            {/* toggle switch */}
            <button onClick={toggleLink} disabled={togglingLink}
              className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors cursor-pointer"
              style={{ background: linkActive ? C.g1 : "#CBD5E1", borderColor: "transparent" }}>
              <span className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: linkActive ? "translateX(20px)" : "translateX(0)" }} />
            </button>
          </div>
          {linkActive && (
            <>
              <div className="border-t" style={{ borderColor: C.border }} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-semibold" style={{ color: C.text }}>{l("Foto Terlihat", "Photos Visible")}</p>
                  <p className="text-[11px]" style={{ color: C.muted }}>
                    {photosPublic ? l("Ya — orang lain bisa melihat foto", "Yes — strangers can see photos") : l("Tidak — hanya avatar yang terlihat", "No — only avatar is shown")}
                  </p>
                </div>
                <button onClick={togglePhotos} disabled={togglingPhotos}
                  className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors cursor-pointer"
                  style={{ background: photosPublic ? C.g1 : "#CBD5E1", borderColor: "transparent" }}>
                  <span className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform"
                    style={{ transform: photosPublic ? "translateX(20px)" : "translateX(0)" }} />
                </button>
              </div>
              <button onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-[12.5px] font-bold border transition-colors"
                style={{ borderColor: C.g1, color: copied ? "#16A34A" : C.g1, background: copied ? "#F0FDF4" : "#FFF1F2" }}>
                {copied ? <CheckCircle2Icon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                {copied ? l("Link Disalin!", "Link Copied!") : l("Salin Link", "Copy Link")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  /* ── helper: only render section if it has any data in stranger mode ── */
  const hasAny = (...keys: string[]) => keys.some(k => raw(data, k) !== "—");

  /* ── main content ── */
  return (
    <div className="p-3 sm:p-6" style={{ minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
        {Sidebar}

        <div className="flex-1 w-full flex flex-col gap-4">

          {/* About Me */}
          {stranger ? (
            raw(data,"aboutMe") !== "—" && (
              <SCard title={l("Tentang Saya","About Me")} icon={<BookOpen className="w-full h-full" />} iconColor="#8B5CF6" iconBg="#F5F3FF">
                <p className="text-[13.5px] leading-relaxed" style={{ color: C.body }}>{raw(data,"aboutMe")}</p>
              </SCard>
            )
          ) : (
            raw(data,"aboutMe") !== "—"
              ? <SCard title={l("Tentang Saya","About Me")} icon={<BookOpen className="w-full h-full" />} iconColor="#8B5CF6" iconBg="#F5F3FF">
                  <p className="text-[13.5px] leading-relaxed" style={{ color: C.body }}>{raw(data,"aboutMe")}</p>
                </SCard>
              : <CollapsedSection title={l("Tentang Saya","About Me")} icon={<BookOpen className="w-full h-full" />} iconColor="#8B5CF6" iconBg="#F5F3FF" lang={lang}
                  fields={[l("Deskripsi diri","About yourself")]} />
          )}

          {/* Photos */}
          {showPhotos && (!stranger || photos.length > 0) && (
            <SCard title={l("Foto", "Photos")} icon={<Camera className="w-full h-full" />} iconColor="#EC4899" iconBg="#FDF2F8">
              <div className="flex items-center gap-1.5 mb-3">
                {photoVis === "visible_all"
                  ? <><Eye className="w-3.5 h-3.5" style={{ color: "#059669" }} /><span className="text-[11.5px] font-semibold" style={{ color: "#059669" }}>{disp("visible_all", lang)}</span></>
                  : photoVis === "after_match"
                    ? <><EyeOff className="w-3.5 h-3.5" style={{ color: C.muted }} /><span className="text-[11.5px] font-semibold" style={{ color: C.muted }}>{disp("after_match", lang)}</span></>
                    : null
                }
              </div>
              {photos.length > 0
                ? <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {photos.map((url, i) => (
                      <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group relative"
                        onClick={() => setLightboxIdx(i)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors rounded-xl" />
                      </div>
                    ))}
                  </div>
                : <p className="text-[13px] italic" style={{ color: C.muted }}>{l("Belum ada foto.", "No photos yet.")}</p>
              }
            </SCard>
          )}

          {/* 2-col: Data Pribadi + Karir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stranger ? (
              hasAny("age","gender","dateOfBirth","nationality","ethnicity","height","weight","bloodType","birthPlace","currentlyLivingWith","ownHealthCondition") && (
                <SCard title={l("Data Pribadi","Personal Info")} icon={<Shield className="w-full h-full" />} iconColor="#3B82F6" iconBg="#EFF6FF">
                  <FieldGrid>
                    <Field label={l("Usia","Age")} value={age} stranger={stranger} />
                    <Field label={l("Jenis Kelamin","Gender")} value={s("gender")} stranger={stranger} />
                    <Field label={l("Tgl Lahir","Date of Birth")} value={raw(data,"dateOfBirth")} stranger={stranger} />
                    <Field label={l("Kewarganegaraan","Nationality")} value={raw(data,"nationality")} stranger={stranger} />
                    <Field label={l("Suku","Ethnicity")} value={raw(data,"ethnicity")} stranger={stranger} />
                    <Field label={l("Tinggi","Height")} value={raw(data,"height") !== "—" ? `${raw(data,"height")} cm` : "—"} stranger={stranger} />
                    <Field label={l("Berat","Weight")} value={raw(data,"weight") !== "—" ? `${raw(data,"weight")} kg` : "—"} stranger={stranger} />
                    <Field label={l("Gol. Darah","Blood Type")} value={s("bloodType")} stranger={stranger} />
                    <Field label={l("Lahir Di","Place of Birth")} value={raw(data,"birthPlace")} stranger={stranger} />
                    <Field label={l("Tinggal Dengan","Living With")} value={raw(data,"currentlyLivingWith")} stranger={stranger} />
                    <Field label={l("Kondisi Kesehatan","Health Condition")} value={raw(data,"ownHealthCondition")} stranger={stranger} long />
                  </FieldGrid>
                </SCard>
              )
            ) : (
              hasAny("age","gender","dateOfBirth","nationality","ethnicity","height","weight","bloodType","birthPlace","currentlyLivingWith","ownHealthCondition")
                ? <SCard title={l("Data Pribadi","Personal Info")} icon={<Shield className="w-full h-full" />} iconColor="#3B82F6" iconBg="#EFF6FF">
                    <FieldGrid>
                      <Field label={l("Usia","Age")} value={age} stranger={stranger} />
                      <Field label={l("Jenis Kelamin","Gender")} value={s("gender")} stranger={stranger} />
                      <Field label={l("Tgl Lahir","Date of Birth")} value={raw(data,"dateOfBirth")} stranger={stranger} />
                      <Field label={l("Kewarganegaraan","Nationality")} value={raw(data,"nationality")} stranger={stranger} />
                      <Field label={l("Suku","Ethnicity")} value={raw(data,"ethnicity")} stranger={stranger} />
                      <Field label={l("Tinggi","Height")} value={raw(data,"height") !== "—" ? `${raw(data,"height")} cm` : "—"} stranger={stranger} />
                      <Field label={l("Berat","Weight")} value={raw(data,"weight") !== "—" ? `${raw(data,"weight")} kg` : "—"} stranger={stranger} />
                      <Field label={l("Gol. Darah","Blood Type")} value={s("bloodType")} stranger={stranger} />
                      <Field label={l("Lahir Di","Place of Birth")} value={raw(data,"birthPlace")} stranger={stranger} />
                      <Field label={l("Tinggal Dengan","Living With")} value={raw(data,"currentlyLivingWith")} stranger={stranger} />
                      <Field label={l("Kondisi Kesehatan","Health Condition")} value={raw(data,"ownHealthCondition")} stranger={stranger} long />
                      <Field label={l("WhatsApp","WhatsApp")} value={raw(data,"whatsappNumber")} stranger={false} />
                    </FieldGrid>
                  </SCard>
                : <CollapsedSection title={l("Data Pribadi","Personal Info")} icon={<Shield className="w-full h-full" />} iconColor="#3B82F6" iconBg="#EFF6FF" lang={lang}
                    fields={[l("Usia","Age"), l("Jenis Kelamin","Gender"), l("Tgl Lahir","Date of Birth"), l("Kewarganegaraan","Nationality"), l("Suku","Ethnicity"), l("Tinggi","Height"), l("Berat","Weight"), l("Gol. Darah","Blood Type"), l("Lahir Di","Place of Birth"), l("Kondisi Kesehatan","Health Condition"), l("WhatsApp","WhatsApp")]} />
            )}

            {stranger ? (
              hasAny("occupation","employmentStatus","incomeRange","propertyStatus","hasDebts") && (
                <SCard title={l("Karir & Keuangan","Career & Finance")} icon={<Briefcase className="w-full h-full" />} iconColor="#14B8A6" iconBg="#F0FDFA">
                  <FieldGrid>
                    <Field label={l("Pekerjaan","Occupation")} value={raw(data,"occupation")} stranger={stranger} long />
                    <Field label={l("Status Kerja","Employment")} value={s("employmentStatus")} stranger={stranger} />
                    <Field label={l("Pendapatan","Income")} value={s("incomeRange")} stranger={stranger} />
                    <Field label={l("Properti","Property")} value={s("propertyStatus")} stranger={stranger} />
                    <Field label={l("Hutang","Has Debts")} value={s("hasDebts")} stranger={stranger} />
                  </FieldGrid>
                </SCard>
              )
            ) : (
              hasAny("occupation","employmentStatus","incomeRange","propertyStatus","hasDebts")
                ? <SCard title={l("Karir & Keuangan","Career & Finance")} icon={<Briefcase className="w-full h-full" />} iconColor="#14B8A6" iconBg="#F0FDFA">
                    <FieldGrid>
                      <Field label={l("Pekerjaan","Occupation")} value={raw(data,"occupation")} stranger={stranger} long />
                      <Field label={l("Status Kerja","Employment")} value={s("employmentStatus")} stranger={stranger} />
                      <Field label={l("Pendapatan","Income")} value={s("incomeRange")} stranger={stranger} />
                      <Field label={l("Properti","Property")} value={s("propertyStatus")} stranger={stranger} />
                      <Field label={l("Hutang","Has Debts")} value={s("hasDebts")} stranger={stranger} />
                    </FieldGrid>
                  </SCard>
                : <CollapsedSection title={l("Karir & Keuangan","Career & Finance")} icon={<Briefcase className="w-full h-full" />} iconColor="#14B8A6" iconBg="#F0FDFA" lang={lang}
                    fields={[l("Pekerjaan","Occupation"), l("Status Kerja","Employment"), l("Pendapatan","Income"), l("Properti","Property"), l("Hutang","Has Debts")]} />
            )}
          </div>

          {/* 2-col: Lifestyle + Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stranger ? (
              hasAny("smokingStatus","alcoholUse","exerciseFrequency","socialPreference") && (
                <SCard title={l("Gaya Hidup","Lifestyle")} icon={<Leaf className="w-full h-full" />} iconColor="#16A34A" iconBg="#F0FDF4">
                  <FieldGrid>
                    <Field label={l("Merokok","Smoking")} value={s("smokingStatus")} stranger={stranger} />
                    <Field label={l("Alkohol","Alcohol")} value={s("alcoholUse")} stranger={stranger} />
                    <Field label={l("Olahraga","Exercise")} value={s("exerciseFrequency")} stranger={stranger} />
                    <Field label={l("Kepribadian Sosial","Social Style")} value={s("socialPreference")} stranger={stranger} />
                  </FieldGrid>
                </SCard>
              )
            ) : (
              hasAny("smokingStatus","alcoholUse","exerciseFrequency","socialPreference")
                ? <SCard title={l("Gaya Hidup","Lifestyle")} icon={<Leaf className="w-full h-full" />} iconColor="#16A34A" iconBg="#F0FDF4">
                    <FieldGrid>
                      <Field label={l("Merokok","Smoking")} value={s("smokingStatus")} stranger={stranger} />
                      <Field label={l("Alkohol","Alcohol")} value={s("alcoholUse")} stranger={stranger} />
                      <Field label={l("Olahraga","Exercise")} value={s("exerciseFrequency")} stranger={stranger} />
                      <Field label={l("Kepribadian Sosial","Social Style")} value={s("socialPreference")} stranger={stranger} />
                    </FieldGrid>
                  </SCard>
                : <CollapsedSection title={l("Gaya Hidup","Lifestyle")} icon={<Leaf className="w-full h-full" />} iconColor="#16A34A" iconBg="#F0FDF4" lang={lang}
                    fields={[l("Merokok","Smoking"), l("Alkohol","Alcohol"), l("Olahraga","Exercise"), l("Kepribadian Sosial","Social Style")]} />
            )}

            {stranger ? (
              hasAny("quranReading","islamicKnowledgeLevel","halalLifestyleStrictness","viewsOnMixedSocializing") && (
                <SCard title={l("Nilai & Keyakinan","Values & Beliefs")} icon={<Star className="w-full h-full" />} iconColor="#F59E0B" iconBg="#FFFBEB">
                  <FieldGrid>
                    <Field label={l("Baca Al-Qur'an","Quran Reading")} value={s("quranReading")} stranger={stranger} />
                    <Field label={l("Ilmu Islam","Islamic Knowledge")} value={s("islamicKnowledgeLevel")} stranger={stranger} />
                    <Field label={l("Gaya Hidup Halal","Halal Lifestyle")} value={s("halalLifestyleStrictness")} stranger={stranger} />
                    <Field label={l("Pergaulan Campur","Mixed Socializing")} value={s("viewsOnMixedSocializing")} stranger={stranger} />
                  </FieldGrid>
                </SCard>
              )
            ) : (
              hasAny("quranReading","islamicKnowledgeLevel","halalLifestyleStrictness","viewsOnMixedSocializing")
                ? <SCard title={l("Nilai & Keyakinan","Values & Beliefs")} icon={<Star className="w-full h-full" />} iconColor="#F59E0B" iconBg="#FFFBEB">
                    <FieldGrid>
                      <Field label={l("Baca Al-Qur'an","Quran Reading")} value={s("quranReading")} stranger={stranger} />
                      <Field label={l("Ilmu Islam","Islamic Knowledge")} value={s("islamicKnowledgeLevel")} stranger={stranger} />
                      <Field label={l("Gaya Hidup Halal","Halal Lifestyle")} value={s("halalLifestyleStrictness")} stranger={stranger} />
                      <Field label={l("Pergaulan Campur","Mixed Socializing")} value={s("viewsOnMixedSocializing")} stranger={stranger} />
                    </FieldGrid>
                  </SCard>
                : <CollapsedSection title={l("Nilai & Keyakinan","Values & Beliefs")} icon={<Star className="w-full h-full" />} iconColor="#F59E0B" iconBg="#FFFBEB" lang={lang}
                    fields={[l("Baca Al-Qur'an","Quran Reading"), l("Ilmu Islam","Islamic Knowledge"), l("Gaya Hidup Halal","Halal Lifestyle"), l("Pergaulan Campur","Mixed Socializing")]} />
            )}
          </div>

          {/* Profil Agama — conditional on religion */}
          {hasAny("religion","religiousPracticeLevel","prayerHabit","hijab","beard","waliAvailability","islamicKnowledgeLevel","churchAttendance","baptized","quranReading","halalLifestyleStrictness","viewsOnMixedSocializing","islamicOrganization","bibleReading","religionNotes") ? (
            <SCard title={l("Profil Agama","Religious Profile")} icon={<BookOpen className="w-full h-full" />} iconColor="#7C3AED" iconBg="#F5F3FF">
              <FieldGrid>
                <Field label={l("Agama","Religion")} value={raw(data,"religion")} stranger={stranger} />

                {/* ── Islam ── */}
                {(isIslam || !religionKnown) && <>
                  <Field label={l("Tingkat Praktik","Practice Level")}    value={s("religiousPracticeLevel")}  stranger={stranger} />
                  <Field label={l("Sholat","Prayer Habit")}               value={s("prayerHabit")}             stranger={stranger} />
                  <Field label={l("Baca Al-Qur'an","Quran Reading")}      value={s("quranReading")}            stranger={stranger} />
                  <Field label={l("Ilmu Islam","Islamic Knowledge")}       value={s("islamicKnowledgeLevel")}   stranger={stranger} />
                  <Field label={l("Gaya Hidup Halal","Halal Lifestyle")}  value={s("halalLifestyleStrictness")} stranger={stranger} />
                  <Field label={l("Pergaulan Campur","Mixed Socializing")} value={s("viewsOnMixedSocializing")} stranger={stranger} />
                  {gender !== "male"  && <Field label={l("Hijab","Hijab")}      value={s("hijab")} stranger={stranger} />}
                  {gender === "male"  && <Field label={l("Jenggot","Beard")}    value={s("beard")} stranger={stranger} />}
                  <Field label={l("Wali Tersedia","Wali Available")}       value={s("waliAvailability")}        stranger={stranger} />
                  <Field label={l("Organisasi Islam","Islamic Org.")}      value={s("islamicOrganization")}     stranger={stranger} />
                </>}

                {/* ── Kristen / Katolik ── */}
                {isChristian && <>
                  <Field label={l("Tingkat Praktik","Practice Level")}    value={s("religiousPracticeLevel")}  stranger={stranger} />
                  <Field label={l("Ibadah Mingguan","Church Attendance")} value={s("churchAttendance")}        stranger={stranger} />
                  <Field label={l("Sudah Dibaptis","Baptized")}           value={s("baptized")}                stranger={stranger} />
                  <Field label={l("Baca Alkitab","Bible Reading")}        value={s("bibleReading")}            stranger={stranger} />
                </>}

                {/* ── Hindu / Buddha ── */}
                {isHinduBuddhist && <>
                  <Field label={l("Tingkat Praktik","Practice Level")}    value={s("religiousPracticeLevel")}  stranger={stranger} />
                  <Field label={l("Kebiasaan Ibadah","Worship Habit")}    value={s("prayerHabit")}             stranger={stranger} />
                  <Field label={l("Catatan","Notes")}                     value={raw(data,"religionNotes")}    stranger={stranger} long />
                </>}

                {/* ── Atheis / Liberal / Agnostik ── */}
                {isAtheistLiberal && (
                  <Field label={l("Catatan","Notes")} value={raw(data,"religionNotes")} stranger={stranger} long />
                )}

                {/* ── Other known religion ── */}
                {religionKnown && !isIslam && !isChristian && !isHinduBuddhist && !isAtheistLiberal && <>
                  <Field label={l("Tingkat Praktik","Practice Level")}    value={s("religiousPracticeLevel")}  stranger={stranger} />
                  <Field label={l("Kebiasaan Ibadah","Worship Habit")}    value={s("prayerHabit")}             stranger={stranger} />
                  <Field label={l("Catatan","Notes")}                     value={raw(data,"religionNotes")}    stranger={stranger} long />
                </>}
              </FieldGrid>
            </SCard>
          ) : (
            !stranger && <CollapsedSection
              title={l("Profil Agama","Religious Profile")}
              icon={<BookOpen className="w-full h-full" />} iconColor="#7C3AED" iconBg="#F5F3FF"
              lang={lang}
              fields={[
                l("Agama","Religion"),
                l("Tingkat Praktik","Practice Level"),
                l("Kebiasaan Ibadah / Sholat","Prayer / Worship Habit"),
                l("Bacaan Kitab Suci","Scripture Reading"),
                l("Catatan Agama","Religion Notes"),
              ]}
            />
          )}

          {/* Goals + Expectations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasAny("maritalTimeline","weddingPreference","financialManagementStyle","decisionMakingStyle") ? (
              <SCard title={l("Tujuan Pernikahan","Marriage Goals")} icon={<CalendarDays className="w-full h-full" />} iconColor="#0EA5E9" iconBg="#F0F9FF">
                <FieldGrid>
                  <Field label={l("Timeline","Timeline")} value={s("maritalTimeline")} stranger={stranger} />
                  <Field label={l("Resepsi","Wedding Style")} value={s("weddingPreference")} stranger={stranger} />
                  <Field label={l("Keuangan","Finance Mgmt")} value={s("financialManagementStyle")} stranger={stranger} />
                  <Field label={l("Keputusan","Decision Making")} value={s("decisionMakingStyle")} stranger={stranger} />
                </FieldGrid>
              </SCard>
            ) : (
              !stranger && <CollapsedSection
                title={l("Tujuan Pernikahan","Marriage Goals")}
                icon={<CalendarDays className="w-full h-full" />} iconColor="#0EA5E9" iconBg="#F0F9FF"
                lang={lang}
                fields={[
                  l("Timeline Menikah","Marriage Timeline"),
                  l("Gaya Resepsi","Wedding Style"),
                  l("Manajemen Keuangan","Finance Management"),
                  l("Pengambilan Keputusan","Decision Making"),
                ]}
              />
            )}

            {hasAny("roleExpectationsHusband","roleExpectationsWife","myRoleExpectation") ? (
              <SCard title={l("Harapan Peran","Role Expectations")} icon={<Heart className="w-full h-full" />} iconColor="#EC4899" iconBg="#FDF2F8">
                <div className="flex flex-col gap-5">

                  {/* My own role */}
                  {(!stranger || raw(data,"myRoleExpectation") !== "—") && (
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>
                        {gender === "male"   ? l("Peran Saya sebagai Suami",   "My Role as Husband")
                        : gender === "female" ? l("Peran Saya sebagai Istri",   "My Role as Wife")
                        :                       l("Peran Saya",                  "My Role")}
                      </p>
                      {raw(data,"myRoleExpectation") !== "—"
                        ? <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>{raw(data,"myRoleExpectation")}</p>
                        : !stranger ? <EmptyHint block /> : null
                      }
                    </div>
                  )}

                  {/* Expectations of partner */}
                  {gender === "male" && (!stranger || raw(data,"roleExpectationsWife") !== "—") && (
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>
                        {l("Harapan terhadap Istri","What I Expect from My Wife")}
                      </p>
                      {raw(data,"roleExpectationsWife") !== "—"
                        ? <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>{raw(data,"roleExpectationsWife")}</p>
                        : !stranger ? <EmptyHint block /> : null
                      }
                    </div>
                  )}

                  {gender === "female" && (!stranger || raw(data,"roleExpectationsHusband") !== "—") && (
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>
                        {l("Harapan terhadap Suami","What I Expect from My Husband")}
                      </p>
                      {raw(data,"roleExpectationsHusband") !== "—"
                        ? <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>{raw(data,"roleExpectationsHusband")}</p>
                        : !stranger ? <EmptyHint block /> : null
                      }
                    </div>
                  )}

                  {/* If gender unknown, show both */}
                  {gender !== "male" && gender !== "female" && <>
                    {(!stranger || raw(data,"roleExpectationsHusband") !== "—") && (
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{l("Harapan terhadap Suami","Expectations of Husband")}</p>
                        {raw(data,"roleExpectationsHusband") !== "—"
                          ? <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>{raw(data,"roleExpectationsHusband")}</p>
                          : !stranger ? <EmptyHint block /> : null}
                      </div>
                    )}
                    {(!stranger || raw(data,"roleExpectationsWife") !== "—") && (
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{l("Harapan terhadap Istri","Expectations of Wife")}</p>
                        {raw(data,"roleExpectationsWife") !== "—"
                          ? <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>{raw(data,"roleExpectationsWife")}</p>
                          : !stranger ? <EmptyHint block /> : null}
                      </div>
                    )}
                  </>}
                </div>
              </SCard>
            ) : (
              !stranger && <CollapsedSection
                title={l("Harapan Peran","Role Expectations")}
                icon={<Heart className="w-full h-full" />} iconColor="#EC4899" iconBg="#FDF2F8"
                lang={lang}
                fields={[
                  gender === "male"   ? l("Peran Saya sebagai Suami","My Role as Husband")
                  : gender === "female" ? l("Peran Saya sebagai Istri","My Role as Wife")
                  :                       l("Peran Saya","My Role"),
                  gender === "male"   ? l("Harapan terhadap Istri","What I Expect from My Wife")
                  : gender === "female" ? l("Harapan terhadap Suami","What I Expect from My Husband")
                  :                       l("Harapan terhadap Pasangan","Expectations of Partner"),
                ]}
              />
            )}
          </div>

          {/* Family */}
          {hasAny("siblingCount","childOrder","childrenCount","waliName","waliRelationship","fatherAlive","motherAlive","hasChildren","maleSiblingCount","femaleSiblingCount","childCustody","childrenLivingWith","childrenNotes","waliContact") ? (
            <SCard title={l("Keluarga","Family")} icon={<Users className="w-full h-full" />} iconColor="#C4294A" iconBg="#FFF1F2">
              <div className="flex flex-col gap-5">

                {/* Parents */}
                {(!stranger || hasAny("fatherAlive","motherAlive")) && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>{l("Orang Tua","Parents")}</p>
                    <FieldGrid>
                      <Field label={l("Ayah","Father")} value={s("fatherAlive")} stranger={stranger} />
                      <Field label={l("Ibu","Mother")} value={s("motherAlive")} stranger={stranger} />
                    </FieldGrid>
                  </div>
                )}

                {/* Siblings */}
                {(!stranger || hasAny("siblingCount","childOrder","maleSiblingCount","femaleSiblingCount")) && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>{l("Saudara Kandung","Siblings")}</p>
                    <FieldGrid>
                      <Field label={l("Jumlah Saudara","No. of Siblings")} value={raw(data,"siblingCount")} stranger={stranger} />
                      <Field label={l("Anak Ke-","Birth Order")} value={raw(data,"childOrder")} stranger={stranger} />
                      <Field label={l("Saudara Laki-laki","Male Siblings")} value={raw(data,"maleSiblingCount")} stranger={stranger} />
                      <Field label={l("Saudara Perempuan","Female Siblings")} value={raw(data,"femaleSiblingCount")} stranger={stranger} />
                    </FieldGrid>
                  </div>
                )}

                {/* Children — conditional */}
                {(!stranger || hasAny("hasChildren","childrenCount","childrenLivingWith","childCustody","childrenNotes")) && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>{l("Anak","Children")}</p>
                    {hasChildrenVal === "prefer_not_to_discuss" ? (
                      <p className="text-[13px]" style={{ color: C.muted }}>{l("Tidak ingin membahas.", "Prefers not to discuss.")}</p>
                    ) : hasChildrenVal === "no" ? (
                      <p className="text-[13px] font-medium" style={{ color: C.body }}>{l("Belum memiliki anak.", "No children.")}</p>
                    ) : showChildDetails ? (
                      <FieldGrid>
                        <Field label={l("Jumlah Anak","No. of Children")} value={raw(data,"childrenCount")} stranger={stranger} />
                        <Field label={l("Hak Asuh","Custody")} value={s("childCustody")} stranger={stranger} />
                        <Field label={l("Anak Tinggal Dengan","Children Live With")} value={raw(data,"childrenLivingWith")} stranger={stranger} />
                        <Field label={l("Catatan tentang Anak","Notes on Children")} value={raw(data,"childrenNotes")} stranger={stranger} long />
                      </FieldGrid>
                    ) : (
                      /* hasChildren not yet set by admin */
                      !stranger ? <EmptyHint block /> : null
                    )}
                  </div>
                )}

                {/* Wali */}
                {(!stranger || hasAny("waliName","waliRelationship")) && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>{l("Wali / Guardian","Guardian / Wali")}</p>
                    <FieldGrid>
                      <Field label={l("Nama Wali","Guardian Name")} value={raw(data,"waliName")} stranger={stranger} />
                      <Field label={l("Hubungan","Relationship")} value={raw(data,"waliRelationship")} stranger={stranger} />
                      {!stranger && <Field label={l("Kontak Wali","Guardian Contact")} value={raw(data,"waliContact")} stranger={false} />}
                    </FieldGrid>
                  </div>
                )}
              </div>
            </SCard>
          ) : (
            !stranger && <CollapsedSection
              title={l("Keluarga","Family")}
              icon={<Users className="w-full h-full" />} iconColor="#C4294A" iconBg="#FFF1F2"
              lang={lang}
              fields={[
                l("Status Ayah","Father's Status"),
                l("Status Ibu","Mother's Status"),
                l("Jumlah Saudara","No. of Siblings"),
                l("Anak Ke-","Birth Order"),
                l("Memiliki Anak","Has Children"),
                l("Wali / Guardian","Guardian / Wali"),
              ]}
            />
          )}

          {/* Ideal Partner */}
          {hasAny("preferredMinAge","preferredMaxAge","preferredReligion","prefReligionLevel","preferredEducationLevel","prefPreviousStatus","preferredLocationOfSpouse","prefMinHeight","prefMaxHeight","preferredPersonalityTraits","spouseDealBreakers","openToDifferentEthnicity","prefBodyType","physicalPreferences") ? (
            <SCard title={l("Kriteria Pasangan Ideal","Ideal Partner Criteria")} icon={<Target className="w-full h-full" />} iconColor="#C4294A" iconBg="#FFF1F2">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>{l("Umum","General")}</p>
                  <FieldGrid>
                    <Field label={l("Usia Min","Min Age")} value={raw(data,"preferredMinAge")} stranger={stranger} />
                    <Field label={l("Usia Max","Max Age")} value={raw(data,"preferredMaxAge")} stranger={stranger} />
                    <Field label={l("Agama","Religion")} value={raw(data,"preferredReligion")} stranger={stranger} />
                    <Field label={l("Tingkat Agama","Religiosity")} value={s("prefReligionLevel")} stranger={stranger} />
                    <Field label={l("Pendidikan","Education")} value={s("preferredEducationLevel")} stranger={stranger} />
                    <Field label={l("Status Sebelumnya","Prev Status")} value={s("prefPreviousStatus")} stranger={stranger} />
                    <Field label={l("Lokasi","Location")} value={s("preferredLocationOfSpouse")} stranger={stranger} />
                    <Field label={l("Suku Berbeda","Diff Ethnicity")} value={s("openToDifferentEthnicity")} stranger={stranger} />
                  </FieldGrid>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>{l("Fisik","Physical")}</p>
                  <FieldGrid>
                    <Field label={l("Tinggi Min","Min Height")} value={raw(data,"prefMinHeight") !== "—" ? `${raw(data,"prefMinHeight")} cm` : "—"} stranger={stranger} />
                    <Field label={l("Tinggi Max","Max Height")} value={raw(data,"prefMaxHeight") !== "—" ? `${raw(data,"prefMaxHeight")} cm` : "—"} stranger={stranger} />
                    <Field label={l("Tipe Tubuh","Body Type")} value={s("prefBodyType")} stranger={stranger} />
                    <Field label={l("Pref Fisik Lain","Other Physical")} value={raw(data,"physicalPreferences")} stranger={stranger} long />
                  </FieldGrid>
                </div>
                {(raw(data,"preferredPersonalityTraits") !== "—" || raw(data,"spouseDealBreakers") !== "—") && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-3" style={{ color: C.muted }}>{l("Karakter","Character")}</p>
                    <div className="flex flex-col gap-3">
                      {raw(data,"preferredPersonalityTraits") !== "—" && (
                        <div>
                          <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{l("Kepribadian Diharapkan","Desired Personality")}</p>
                          <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>{raw(data,"preferredPersonalityTraits")}</p>
                        </div>
                      )}
                      {raw(data,"spouseDealBreakers") !== "—" && (
                        <div>
                          <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{l("Deal Breaker","Deal Breakers")}</p>
                          <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>{raw(data,"spouseDealBreakers")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </SCard>
          ) : (
            !stranger && <CollapsedSection
              title={l("Kriteria Pasangan Ideal","Ideal Partner Criteria")}
              icon={<Target className="w-full h-full" />} iconColor="#C4294A" iconBg="#FFF1F2"
              lang={lang}
              fields={[
                l("Rentang Usia","Age Range"),
                l("Agama & Tingkat Religiusitas","Religion & Religiosity"),
                l("Pendidikan","Education"),
                l("Lokasi","Location"),
                l("Tinggi Badan","Height Range"),
                l("Kepribadian Diharapkan","Desired Personality"),
                l("Deal Breaker","Deal Breakers"),
              ]}
            />
          )}

          {/* ── Laporan & Hasil (own view only) ── */}
          {!stranger && (() => {
            const psychLocked   = !data.psychTestResult          || data.psychTestResult          === "";
            const bgLocked      = !data.bgCheckResult            || data.bgCheckResult            === "";
            const assessLocked  = !data.jodohmuAssessmentResult  || data.jodohmuAssessmentResult  === "";
            const taarufLocked  = !data.pastTaarufResults        || (Array.isArray(data.pastTaarufResults) && (data.pastTaarufResults as unknown[]).length === 0) || data.pastTaarufResults === "";
            const matchLocked   = !data.recommendedMatches       || (Array.isArray(data.recommendedMatches)  && (data.recommendedMatches  as unknown[]).length === 0) || data.recommendedMatches  === "";

            return (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.g1 }}>
                    {l("Laporan & Hasil", "Reports & Results")}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <ResultCard
                    title={l("Tes Psikolog", "Psych Test")}
                    icon={<Brain className="w-full h-full" />}
                    iconBg="#F5F3FF" iconColor="#7C3AED"
                    locked={!!psychLocked} lang={lang}>
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: C.body }}>
                      {String(data.psychTestResult)}
                    </p>
                  </ResultCard>

                  <ResultCard
                    title={l("Background Check", "Background Check")}
                    icon={<ShieldCheck className="w-full h-full" />}
                    iconBg="#F0F9FF" iconColor="#0369A1"
                    locked={!!bgLocked} lang={lang}>
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: C.body }}>
                      {String(data.bgCheckResult)}
                    </p>
                  </ResultCard>

                  <ResultCard
                    title={l("Jodohmu Assessment", "Jodohmu Assessment")}
                    icon={<ClipboardList className="w-full h-full" />}
                    iconBg="#FFFBEB" iconColor="#B45309"
                    locked={!!assessLocked} lang={lang}>
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: C.body }}>
                      {String(data.jodohmuAssessmentResult)}
                    </p>
                  </ResultCard>

                  <ResultCard
                    title={l("Riwayat Ta'aruf", "Past Ta'aruf")}
                    icon={<History className="w-full h-full" />}
                    iconBg="#FFF1F2" iconColor="#C4294A"
                    locked={!!taarufLocked} lang={lang}>
                    {Array.isArray(data.pastTaarufResults)
                      ? <div className="flex flex-col gap-3">
                          {(data.pastTaarufResults as Record<string,string>[]).map((e, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 flex flex-col gap-1">
                              {e.date    && <p className="text-[10.5px] font-bold text-slate-400">{e.date}</p>}
                              {e.outcome && <span className="self-start px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-600 border border-rose-100">{e.outcome}</span>}
                              {e.notes   && <p className="text-[12.5px] text-slate-700 leading-relaxed">{e.notes}</p>}
                            </div>
                          ))}
                        </div>
                      : <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: C.body }}>{String(data.pastTaarufResults)}</p>
                    }
                  </ResultCard>

                  <ResultCard
                    title={l("Rekomendasi Match", "Recommended Matches")}
                    icon={<Sparkles className="w-full h-full" />}
                    iconBg="#F0FDF4" iconColor="#059669"
                    locked={!!matchLocked} lang={lang}>
                    {Array.isArray(data.recommendedMatches)
                      ? <div className="flex flex-col gap-3">
                          {(data.recommendedMatches as Record<string,string>[]).map((m, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 flex flex-col gap-1">
                              {m.name  && <p className="text-[13px] font-bold text-slate-800">{m.name}</p>}
                              <div className="flex gap-3 text-[11.5px] text-slate-500">
                                {m.age      && <span>{m.age} {l("thn","yrs")}</span>}
                                {m.location && <span>· {m.location}</span>}
                              </div>
                              {m.notes && <p className="text-[12.5px] text-slate-600 leading-relaxed">{m.notes}</p>}
                            </div>
                          ))}
                        </div>
                      : <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: C.body }}>{String(data.recommendedMatches)}</p>
                    }
                  </ResultCard>
                </div>
              </div>
            );
          })()}

          {/* My Status (own view only) */}
          {!stranger && (
            <SCard title={l("Status Akun","Account Status")} icon={<Shield className="w-full h-full" />} iconColor="#64748B" iconBg="#F8FAFC">
              <FieldGrid>
                <Field label={l("Status Profil","Profile Status")} value={s("profileStatus")} stranger={false} />
                <Field label={l("Paket","Plan")} value={paket !== "—" ? disp(paket, lang) : "—"} stranger={false} />
                <Field label={l("Open Ta'aruf","Open to Ta'aruf")} value={openTaaruf !== "—" ? (openTaaruf === "no" ? l("Tidak Open Ta'aruf","Not Open to Ta'aruf") : disp(openTaaruf, lang)) : "—"} stranger={false} />
                <Field label={l("Status","Status")} value={personStatus !== "—" ? disp(personStatus, lang) : "—"} stranger={false} />
                <Field label={l("Visibilitas Foto","Photo Visibility")} value={photoVis !== "—" ? disp(photoVis, lang) : "—"} stranger={false} />
              </FieldGrid>
            </SCard>
          )}

        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            onClick={() => setLightboxIdx(null)}>
            <X className="w-7 h-7" />
          </button>
          {photos.length > 1 && (
            <button className="absolute left-4 text-white/70 hover:text-white z-10 p-2"
              onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + photos.length) % photos.length); }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          <div className="max-w-[min(90vw,560px)] max-h-[88vh] flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[lightboxIdx]} alt={`Photo ${lightboxIdx + 1}`}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl" />
            {photos.length > 1 && (
              <div className="flex gap-1.5">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setLightboxIdx(i)} className="rounded-full transition-all"
                    style={{ width: i === lightboxIdx ? 20 : 7, height: 7, background: i === lightboxIdx ? "#fff" : "rgba(255,255,255,0.35)" }} />
                ))}
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <button className="absolute right-4 text-white/70 hover:text-white z-10 p-2"
              onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % photos.length); }}>
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
