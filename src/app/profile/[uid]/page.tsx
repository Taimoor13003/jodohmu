"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";
import MenAvatar   from "@/assets/men-avatar.png";
import WomenAvatar from "@/assets/women-avatar.png";
import LogoIcon    from "@/assets/jodohmu-logo.png";
import {
  MapPin, Briefcase, GraduationCap, Heart, Eye, EyeOff,
  ChevronLeft, ChevronRight, X, Lock, Send, CheckCircle2, Globe,
} from "lucide-react";

type Lang = "id" | "en";
type D = Record<string, unknown>;

const C = {
  bg: "#EEF2F7", card: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", body: "#334155", muted: "#94A3B8",
  g1: "#C4294A", g2: "#1B3A6B",
};

const V: Record<string, Record<Lang, string>> = {
  male: { id: "Laki-laki", en: "Male" }, female: { id: "Perempuan", en: "Female" },
  ready: { id: "Open Ta'aruf", en: "Open to Ta'aruf" },
  preparing: { id: "Persiapan Ta'aruf", en: "Preparing for Ta'aruf" },
  no: { id: "Tidak Open", en: "Not Open" },
  never: { id: "Tidak pernah", en: "Never" }, occasionally: { id: "Kadang-kadang", en: "Occasionally" },
  regularly: { id: "Rutin", en: "Regularly" }, quit: { id: "Sudah berhenti", en: "Quit" },
  rarely: { id: "Jarang", en: "Rarely" }, sometimes: { id: "Kadang", en: "Sometimes" },
  daily: { id: "Setiap hari", en: "Daily" }, always: { id: "Selalu", en: "Always" },
  introvert: { id: "Introvert", en: "Introvert" }, extrovert: { id: "Ekstrovert", en: "Extrovert" },
  ambivert: { id: "Ambivert", en: "Ambivert" }, basic: { id: "Dasar", en: "Basic" },
  intermediate: { id: "Menengah", en: "Intermediate" }, advanced: { id: "Lanjutan", en: "Advanced" },
  strict: { id: "Ketat", en: "Strict" }, moderate: { id: "Moderat", en: "Moderate" },
  relaxed: { id: "Santai", en: "Relaxed" }, avoid: { id: "Menghindari", en: "Avoid" },
  asap: { id: "Sesegera mungkin", en: "As soon as possible" },
  "6_months": { id: "6 Bulan", en: "6 Months" }, "1_year": { id: "1 Tahun", en: "1 Year" },
  "2_years": { id: "2 Tahun", en: "2 Years" }, "3_plus_years": { id: "3+ Tahun", en: "3+ Years" },
  not_sure: { id: "Belum pasti", en: "Not sure" },
  simple: { id: "Sederhana", en: "Simple" }, grand: { id: "Mewah", en: "Grand" },
  husband_manages: { id: "Suami kelola", en: "Husband manages" },
  wife_manages: { id: "Istri kelola", en: "Wife manages" },
  discussed: { id: "Didiskusikan", en: "Discussed" },
  husband_leads: { id: "Suami memimpin", en: "Husband leads" },
  very_practicing: { id: "Sangat taat", en: "Very practicing" },
  practicing: { id: "Taat", en: "Practicing" }, not_practicing: { id: "Tidak taat", en: "Not practicing" },
  employed: { id: "Karyawan", en: "Employed" }, self_employed: { id: "Wiraswasta", en: "Self-employed" },
  business_owner: { id: "Pemilik usaha", en: "Business owner" },
  unemployed: { id: "Tidak bekerja", en: "Unemployed" }, student: { id: "Pelajar", en: "Student" },
  single: { id: "Lajang", en: "Single" }, divorced: { id: "Cerai", en: "Divorced" },
  widowed: { id: "Janda/Duda", en: "Widowed" },
  registered_looking: { id: "Mencari Pasangan", en: "Searching" },
  matched: { id: "Dipertemukan", en: "Matched" }, in_taaruf: { id: "Dalam Ta'aruf", en: "In Ta'aruf" },
  visible_all: { id: "Terlihat Semua", en: "Visible to All" },
  after_match: { id: "Setelah Match", en: "After Match" },
};

function disp(val: string, lang: Lang) { return V[val]?.[lang] ?? val; }
function raw(data: D, key: string): string {
  const v = data[key];
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v.trim() || "—";
  if (typeof v === "number") return String(v);
  return "—";
}

interface EduEntry { level: string; major: string; }
const EDU: Record<string, Record<Lang, string>> = {
  sd: { id: "SD", en: "Elementary" }, smp: { id: "SMP", en: "Junior High" },
  sma: { id: "SMA", en: "High School" }, d3: { id: "D3", en: "Associate's" },
  s1_d4: { id: "S1/D4", en: "Bachelor's" }, s2: { id: "S2", en: "Master's" }, s3: { id: "S3", en: "PhD" },
};
function dispEdu(e: EduEntry, lang: Lang) { return `${EDU[e.level]?.[lang] ?? e.level}${e.major ? ` — ${e.major}` : ""}`; }

function Field({ label, value }: { label: string; value: string }) {
  if (value === "—") return null;
  return (
    <div>
      <p className="text-[10.5px] font-bold uppercase tracking-wide mb-0.5" style={{ color: C.muted }}>{label}</p>
      <p className="text-[13.5px] font-medium" style={{ color: C.text }}>{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
      <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: C.g1 }}>{title}</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
  );
}

export default function PublicProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  const [data,         setData]         = useState<D | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [lightboxIdx,  setLightboxIdx]  = useState<number | null>(null);
  const [message,      setMessage]      = useState("");
  const [sending,      setSending]      = useState(false);
  const [sent,         setSent]         = useState(false);
  const [sendError,    setSendError]    = useState("");

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const res = await fetch(`/api/public/profile/${uid}`);
        const json = await res.json() as { available: boolean; data?: D };
        setData(json.available ? (json.data ?? null) : null);
      } catch { setData(null); }
      finally { setLoading(false); }
    })();
  }, [uid]);

  const l = (id: string, en: string) => lang === "id" ? id : en;

  const sendRequest = async () => {
    if (!user) { router.push(`/login?redirect=/profile/${uid}`); return; }
    setSending(true); setSendError("");
    try {
      const token = await getIdToken(auth.currentUser!);
      const res = await fetch("/api/taaruf-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUid: uid, message }),
      });
      if (res.status === 409) { setSent(true); return; }
      if (!res.ok) {
        let msg = l("Terjadi kesalahan. Coba lagi.", "Something went wrong. Please try again.");
        try {
          const body = await res.json() as { error?: string };
          if (body.error === "Cannot request yourself") msg = l("Anda tidak bisa mengajukan ta'aruf ke diri sendiri.", "You cannot send a Ta'aruf request to yourself.");
          else if (body.error === "Profile not available") msg = l("Profil tidak tersedia.", "Profile not available.");
          else if (body.error) msg = body.error;
        } catch { /* ignore */ }
        setSendError(msg);
        return;
      }
      setSent(true);
    } catch { setSendError(l("Terjadi kesalahan.", "Something went wrong.")); }
    finally { setSending(false); }
  };

  /* ── states ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <p style={{ color: C.muted, fontSize: 14 }}>{l("Memuat profil…", "Loading profile…")}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: C.bg }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#F1F5F9" }}>
          <Lock className="w-6 h-6" style={{ color: C.muted }} />
        </div>
        <h1 className="text-[20px] font-bold" style={{ color: C.text }}>{l("Profil Tidak Tersedia", "Profile Not Available")}</h1>
        <p className="text-[14px] text-center max-w-xs" style={{ color: C.muted }}>
          {l("Profil ini sedang dikunci atau tidak ditemukan.", "This profile is currently private or doesn't exist.")}
        </p>
        <Link href="/" className="mt-2 px-5 py-2 rounded-xl text-[13px] font-bold text-white" style={{ background: C.g1 }}>
          {l("Ke Beranda", "Go Home")}
        </Link>
      </div>
    );
  }

  const name       = raw(data, "fullName");
  const age        = raw(data, "age");
  const gender     = raw(data, "gender");
  const photos     = Array.isArray(data.photoUrls) ? data.photoUrls as string[] : [];
  const showPhotos = !!(data as Record<string, unknown>)?.publicPhotosVisible;
  const openTaaruf = raw(data, "openToTaaruf");
  const educations = Array.isArray(data.educations) ? data.educations as EduEntry[] : [];
  const avatarSrc  = gender === "female" ? WomenAvatar : MenAvatar;

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {/* topbar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b flex items-center px-5 h-14" style={{ borderColor: C.border }}>
        <Link href="/">
          <Image src={LogoIcon} alt="Jodohmu" height={34} style={{ width: "auto" }} />
        </Link>
        <div style={{ flex: 1 }} />
        <div className="flex items-center gap-2">
          {/* language toggle */}
          <button onClick={() => setLang(lang === "id" ? "en" : "id")}
            style={{
              display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700,
              padding: "5px 12px", borderRadius: 20, border: "1px solid #E2E8F0",
              background: "#F8FAFC", color: "#1B3A6B", cursor: "pointer",
            }}>
            <Globe style={{ width: 13, height: 13 }} />
            {lang === "id" ? "EN" : "ID"}
          </button>
          {!user && (
            <>
              <Link href={`/login?redirect=/profile/${uid}`} className="px-3 py-1.5 rounded-lg text-[12.5px] font-semibold border" style={{ borderColor: C.border, color: C.body }}>
                {l("Masuk", "Sign In")}
              </Link>
              <Link href={`/register?redirect=/profile/${uid}`} className="px-3 py-1.5 rounded-lg text-[12.5px] font-bold text-white" style={{ background: C.g1 }}>
                {l("Daftar", "Sign Up")}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-20 pb-16">
        {/* Profile header card */}
        <div className="bg-white rounded-2xl border overflow-hidden mb-4" style={{ borderColor: C.border, boxShadow: "0 2px 16px rgba(15,23,42,0.08)" }}>
          {/* Cover */}
          <div className="h-24" style={{ background: `linear-gradient(135deg, ${C.g1}22, ${C.g2}22)` }} />
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="-mt-12 mb-3">
              <div className="p-[3px] rounded-full inline-block" style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g2})` }}>
                <div className="rounded-full overflow-hidden" style={{ width: 88, height: 88, background: C.bg }}>
                  {showPhotos && photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos[0]} alt={name} className="w-full h-full object-cover object-top cursor-pointer"
                      onClick={() => setLightboxIdx(0)} />
                  ) : (
                    <Image src={avatarSrc} alt="" className="w-full h-full object-cover object-top" />
                  )}
                </div>
              </div>
            </div>
            <h1 className="text-[22px] font-extrabold mb-1" style={{ color: C.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {name !== "—" ? name : l("Kandidat", "Candidate")}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {age !== "—" && <span className="text-[13px] font-semibold" style={{ color: C.body }}>{age} {l("thn", "yrs")}</span>}
              {gender !== "—" && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold border"
                  style={gender === "female" ? { background: "#FFF1F2", color: "#C4294A", borderColor: "#FECDD3" } : { background: "#EFF6FF", color: "#1B3A6B", borderColor: "#BFDBFE" }}>
                  {disp(gender, lang)}
                </span>
              )}
              {openTaaruf !== "—" && (
                <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${openTaaruf === "ready" ? "bg-amber-50 text-amber-700 border-amber-200" : openTaaruf === "preparing" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                  <Heart className="w-2.5 h-2.5 fill-current inline mr-0.5" />
                  {openTaaruf === "no" ? l("Tidak Open Ta'aruf", "Not Open to Ta'aruf") : disp(openTaaruf, lang)}
                </span>
              )}
            </div>
            {/* Quick info row */}
            <div className="flex flex-wrap gap-3">
              {raw(data, "location") !== "—" && (
                <span className="flex items-center gap-1 text-[12.5px]" style={{ color: C.body }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: C.muted }} />{raw(data, "location")}
                </span>
              )}
              {raw(data, "occupation") !== "—" && (
                <span className="flex items-center gap-1 text-[12.5px]" style={{ color: C.body }}>
                  <Briefcase className="w-3.5 h-3.5" style={{ color: C.muted }} />{raw(data, "occupation")}
                </span>
              )}
              {educations.slice(0, 1).map((e, i) => (
                <span key={i} className="flex items-center gap-1 text-[12.5px]" style={{ color: C.body }}>
                  <GraduationCap className="w-3.5 h-3.5" style={{ color: C.muted }} />{dispEdu(e, lang)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Photos */}
        {showPhotos && photos.length > 0 && (
          <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
            <div className="flex items-center gap-1.5 mb-3">
              <Eye className="w-3.5 h-3.5" style={{ color: "#059669" }} />
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.g1 }}>{l("Foto", "Photos")}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {photos.map((url, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group relative"
                  onClick={() => setLightboxIdx(i)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

        {!showPhotos && (
          <div className="bg-white rounded-2xl border p-5 mb-4 flex items-center gap-3" style={{ borderColor: C.border }}>
            <EyeOff className="w-4 h-4 shrink-0" style={{ color: C.muted }} />
            <p className="text-[13px]" style={{ color: C.muted }}>
              {l("Foto hanya tersedia setelah match disetujui.", "Photos are only visible after a match is approved.")}
            </p>
          </div>
        )}

        {/* About Me */}
        {raw(data, "aboutMe") !== "—" && (
          <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: C.g1 }}>{l("Tentang Saya", "About Me")}</p>
            <p className="text-[13.5px] leading-relaxed" style={{ color: C.body }}>{raw(data, "aboutMe")}</p>
          </div>
        )}

        {/* Personal + Career */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Section title={l("Data Pribadi", "Personal Info")}>
            <Field label={l("Usia","Age")} value={age} />
            <Field label={l("Jenis Kelamin","Gender")} value={disp(raw(data,"gender"), lang)} />
            <Field label={l("Kewarganegaraan","Nationality")} value={raw(data,"nationality")} />
            <Field label={l("Suku","Ethnicity")} value={raw(data,"ethnicity")} />
            <Field label={l("Tinggi","Height")} value={raw(data,"height") !== "—" ? `${raw(data,"height")} cm` : "—"} />
            <Field label={l("Berat","Weight")} value={raw(data,"weight") !== "—" ? `${raw(data,"weight")} kg` : "—"} />
            <Field label={l("Kondisi Kesehatan","Health")} value={raw(data,"ownHealthCondition")} />
          </Section>
          <Section title={l("Karir", "Career")}>
            <Field label={l("Pekerjaan","Occupation")} value={raw(data,"occupation")} />
            <Field label={l("Status Kerja","Employment")} value={disp(raw(data,"employmentStatus"), lang)} />
          </Section>
        </div>

        {/* Lifestyle + Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Section title={l("Gaya Hidup", "Lifestyle")}>
            <Field label={l("Merokok","Smoking")} value={disp(raw(data,"smokingStatus"), lang)} />
            <Field label={l("Alkohol","Alcohol")} value={disp(raw(data,"alcoholUse"), lang)} />
            <Field label={l("Olahraga","Exercise")} value={disp(raw(data,"exerciseFrequency"), lang)} />
            <Field label={l("Kepribadian","Social Style")} value={disp(raw(data,"socialPreference"), lang)} />
          </Section>
          <Section title={l("Agama", "Religion")}>
            <Field label={l("Agama","Religion")} value={raw(data,"religion")} />
            <Field label={l("Tingkat Taat","Practice")} value={disp(raw(data,"religiousPracticeLevel"), lang)} />
            <Field label={l("Sholat","Prayer")} value={disp(raw(data,"prayerHabit"), lang)} />
            <Field label={gender === "female" ? l("Hijab","Hijab") : l("Jenggot","Beard")}
              value={disp(raw(data, gender === "female" ? "hijab" : "beard"), lang)} />
            <Field label={l("Pandangan Poligami","Polygamy View")} value={disp(raw(data,"polygamyView"), lang)} />
          </Section>
        </div>

        {/* Goals */}
        {(raw(data,"maritalTimeline") !== "—" || raw(data,"weddingPreference") !== "—") && (
          <Section title={l("Tujuan Pernikahan", "Marriage Goals")}>
            <Field label={l("Timeline","Timeline")} value={disp(raw(data,"maritalTimeline"), lang)} />
            <Field label={l("Resepsi","Wedding Style")} value={disp(raw(data,"weddingPreference"), lang)} />
            <Field label={l("Keuangan","Finance")} value={disp(raw(data,"financialManagementStyle"), lang)} />
            <Field label={l("Keputusan","Decisions")} value={disp(raw(data,"decisionMakingStyle"), lang)} />
          </Section>
        )}

        {/* Ideal Partner */}
        {(raw(data,"preferredMinAge") !== "—" || raw(data,"preferredReligion") !== "—" || raw(data,"preferredPersonalityTraits") !== "—") && (
          <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: C.border, boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: C.g1 }}>{l("Kriteria Pasangan", "Ideal Partner")}</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label={l("Usia","Age Range")} value={raw(data,"preferredMinAge") !== "—" && raw(data,"preferredMaxAge") !== "—" ? `${raw(data,"preferredMinAge")} – ${raw(data,"preferredMaxAge")} thn` : "—"} />
              <Field label={l("Agama","Religion")} value={raw(data,"preferredReligion")} />
              <Field label={l("Pendidikan","Education")} value={disp(raw(data,"preferredEducationLevel"), lang)} />
              <Field label={l("Lokasi","Location")} value={disp(raw(data,"preferredLocationOfSpouse"), lang)} />
              <Field label={l("Tinggi Min","Min Height")} value={raw(data,"prefMinHeight") !== "—" ? `${raw(data,"prefMinHeight")} cm` : "—"} />
              {raw(data,"preferredPersonalityTraits") !== "—" && (
                <div className="col-span-2">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide mb-0.5" style={{ color: C.muted }}>{l("Kepribadian Diharapkan","Desired Personality")}</p>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: C.text }}>{raw(data,"preferredPersonalityTraits")}</p>
                </div>
              )}
              {raw(data,"spouseDealBreakers") !== "—" && (
                <div className="col-span-2">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide mb-0.5" style={{ color: C.muted }}>{l("Deal Breaker","Deal Breakers")}</p>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: C.text }}>{raw(data,"spouseDealBreakers")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Ta'aruf Request ── */}
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border, boxShadow: "0 2px 16px rgba(15,23,42,0.08)" }}>
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="w-10 h-10" style={{ color: "#16A34A" }} />
              <p className="text-[16px] font-bold" style={{ color: C.text }}>
                {l("Permintaan Terkirim!", "Request Sent!")}
              </p>
              <p className="text-[13.5px] text-center" style={{ color: C.muted }}>
                {l("Tim Jodohmu akan menghubungimu untuk langkah selanjutnya.", "The Jodohmu team will reach out to you for the next steps.")}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-5 h-5 fill-current" style={{ color: C.g1 }} />
                <h2 className="text-[16px] font-bold" style={{ color: C.text }}>
                  {l(`Ingin Ta'aruf dengan ${name !== "—" ? name : "kandidat ini"}?`, `Interested in Ta'aruf with ${name !== "—" ? name : "this candidate"}?`)}
                </h2>
              </div>
              <p className="text-[13px] mb-5" style={{ color: C.muted }}>
                {l("Kirim permintaan dan tim kami akan memfasilitasi proses ta'aruf.", "Send a request and our team will facilitate the ta'aruf process.")}
              </p>

              {user ? (
                <>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border px-3 py-2.5 text-[13.5px] focus:outline-none focus:ring-2 mb-3 resize-none"
                    style={{ borderColor: C.border, color: C.text, background: C.bg }}
                    placeholder={l("Pesan singkat (opsional)…", "Short message (optional)…")}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  {sendError && <p className="text-[12.5px] text-red-500 mb-2">{sendError}</p>}
                  <button
                    onClick={sendRequest}
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] text-white transition-opacity"
                    style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g2})`, opacity: sending ? 0.7 : 1 }}>
                    <Send className="w-4 h-4" />
                    {sending ? l("Mengirim…", "Sending…") : l("Kirim Permintaan Ta'aruf", "Send Ta'aruf Request")}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-[13px]" style={{ color: C.body }}>
                    {l("Buat akun atau masuk untuk mengirim permintaan ta'aruf.", "Create an account or sign in to send a ta'aruf request.")}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/register?redirect=/profile/${uid}`}
                      className="flex-1 text-center py-2.5 rounded-xl font-bold text-[13.5px] text-white"
                      style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g2})` }}>
                      {l("Daftar Sekarang", "Create Account")}
                    </Link>
                    <Link href={`/login?redirect=/profile/${uid}`}
                      className="flex-1 text-center py-2.5 rounded-xl font-bold text-[13.5px] border"
                      style={{ borderColor: C.border, color: C.body }}>
                      {l("Masuk", "Sign In")}
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Powered by */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <Image src={LogoIcon} alt="Jodohmu" height={18} style={{ width: "auto", opacity: 0.5 }} />
          <p className="text-[11.5px] font-semibold" style={{ color: C.muted }}>
            {l("Profil ini dibagikan melalui Jodohmu", "This profile is shared via Jodohmu")}
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10" onClick={() => setLightboxIdx(null)}>
            <X className="w-7 h-7" />
          </button>
          {photos.length > 1 && (
            <button className="absolute left-4 text-white/70 hover:text-white z-10 p-2"
              onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + photos.length) % photos.length); }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          <div className="max-w-[min(90vw,560px)] flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[lightboxIdx]} alt="" className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl" />
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
