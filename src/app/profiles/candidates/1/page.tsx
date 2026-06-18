import type { Metadata } from "next";
import { MapPin, Briefcase, GraduationCap, CheckCircle2, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Profil Ta'aruf — Jodohmu",
  robots: "noindex",
};

const C = {
  name: "Siti Rahmawati Kusuma",
  nickname: "Rahma",
  age: 50,
  city: "Bandung, Jawa Barat",
  height: "158 cm",
  weight: "57 kg",
  bloodType: "O+",
  ethnicity: "Sundanese",
  nationality: "Indonesian",
  maritalStatus: "Divorced",

  occupation: "Senior Health Officer · Dinas Kesehatan Kota Bandung",
  education: "S1 Public Health — Universitas Padjadjaran",
  employment: "PNS (Government)",
  income: "Rp 12–18 juta / bulan",
  property: "Owns home outright",
  debts: "None",

  about: "Rahma has a quiet kind of depth that only comes from real life. She raised two children, held a government career, survived a difficult marriage, and spent three years rebuilding herself before deciding she was ready again. She's not looking for perfection — she's looking for presence. Someone who shows up, tells the truth, and takes their faith seriously.",

  strengths: ["Patience", "Emotional maturity", "Loyalty", "Deep empathy", "Strong faith"],
  loveLanguage: "Acts of Service & Quality Time",
  personality: "Ambivert — social in the right settings, values quiet evenings",
  conflictStyle: "Calm. Listens first. Never raises her voice.",
  hobbies: "Cooking traditional Sundanese food, light hiking, Islamic reading, Quran circles, family time",

  religion: "Islam",
  practiceLevel: "Practicing — religion guides her daily life",
  prayer: "5× daily, always on time",
  quran: "Fluent with Tajweed",
  hijab: "Always — syar'i style",
  islamicKnowledge: "Good — regular pengajian and Quran study circle",
  halal: "Strict",
  wali: "Yes — oldest brother",
  mahar: "Simple and sincere — open to discuss",
  polygamy: "Not open",

  divorceYear: 2019,
  divorceContext: "Ended a 24-year marriage due to long-term emotional unavailability. Handled with maturity — no ongoing conflict with ex-spouse.",
  healing: "Spent 3 years in personal growth and spiritual renewal before seeking marriage again. Fully healed.",
  lesson: "She chose too young without truly knowing herself. She now knows exactly what a healthy, present marriage looks like — and won't settle for less.",
  children: "2 adult children (ages 26 & 22) — both independent",

  timeline: "Within 6–12 months",
  wedding: "Simple and intimate — close family only",
  finances: "Discuss and manage together",
  decisions: "Mutual — discuss everything as equals",
  moreChildren: "No — loves her two deeply. Open to being a stepmother.",
  husbandExpectation: "A true leader who is present, spiritually grounded, and emotionally available. Not controlling — just consistent and kind.",

  spouseAge: "48 – 60 years",
  spouseReligion: "Must be Muslim — practicing",
  openToDivorced: "Yes, fully open",
  openToEthnicity: "Fully open",
  spousePersonality: "Calm, emotionally mature, God-fearing, consistent, and genuinely kind.",
  dealBreakers: "Dishonesty · Unresolved emotional baggage · Disrespect toward women · Weak faith",

  matchmakerNote: "One of the most self-aware candidates we have met. No red flags. High readiness. Priority candidate.",
  imamNote: "Known at Masjid Al-Ikhlas — described as 'a woman of firm character and beautiful akhlaq.' Highly recommended.",
  salesNote: "First call 12 March 2025 — very composed, clear-headed. Said she waited years before reaching out. Extremely serious.",
};

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
      {children}
    </span>
  );
}

function Divider() {
  return <div className="h-px bg-gray-100 my-5" />;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-6 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function CandidateProfilePage() {
  return (
    <div className="min-h-screen bg-[#f6f7f9]" style={{ fontFamily: "var(--font-roboto), sans-serif" }}>

      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#9B2242] flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">Jodohmu</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Verified Profile · Confidential
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-8">
        <div className="lg:grid lg:grid-cols-[360px_1fr] lg:gap-8 lg:items-start">

          {/* ──────────────────────────
              LEFT SIDEBAR
          ────────────────────────── */}
          <div className="lg:sticky lg:top-20 space-y-4 mb-6 lg:mb-0">

            {/* Hero card */}
            <div className="rounded-2xl bg-white shadow-sm overflow-hidden border border-gray-100">
              {/* Top banner — one clean gradient, tasteful */}
              <div className="h-32 bg-[#0b3a86] relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='50' cy='50' r='25' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E\")",
                    backgroundSize: "80px 80px" }} />
              </div>

              <div className="px-5 pb-5">
                {/* Avatar */}
                <div className="-mt-10 mb-4">
                  <div className="h-20 w-20 rounded-xl border-4 border-white shadow-md bg-[#9B2242] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">SR</span>
                  </div>
                </div>

                <h1 className="text-xl font-bold text-gray-900">{C.name}</h1>
                <p className="text-sm text-[#9B2242] font-semibold mt-0.5">{C.age} years old · {C.nickname}</p>

                <div className="mt-3 space-y-1.5 text-gray-500">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {C.city}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    {C.occupation}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    {C.education}
                  </div>
                </div>

                {/* Quick facts */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { label: "Height", value: C.height },
                    { label: "Blood", value: C.bloodType },
                    { label: "Status", value: "Divorced" },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg bg-gray-50 p-2.5 text-center border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{s.label}</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#9B2242]/10 px-3 py-1 text-xs font-semibold text-[#9B2242]">
                    🕌 Practicing Muslimah
                  </span>
                  <Tag>PNS · Bandung</Tag>
                  <Tag>2 Adult Children</Tag>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    ✓ High Readiness
                  </span>
                </div>
              </div>
            </div>

            {/* Lifestyle */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Lifestyle</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "🕌 5× daily prayer", "📖 Quran with Tajweed", "🧕 Hijab syar'i",
                  "🚭 Non-smoker", "🚫 No alcohol", "🥗 Halal strict",
                  "🌙 Tahajjud routine", "🏃 Daily walks", "📚 Islamic books",
                  "🍲 Sundanese cooking", "✈️ Passport holder",
                ].map(t => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>

            {/* Relocation */}
            <div className="rounded-2xl bg-[#0b3a86] px-5 py-4 text-white">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Relocation</p>
              <p className="text-sm font-semibold">Open to relocating within Indonesia</p>
              <p className="text-xs text-white/50 mt-0.5">The right person matters more than the city.</p>
            </div>

            {/* Team notes */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4 space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Team Assessment</p>
              <div className="rounded-lg bg-amber-50 border border-amber-100/80 p-3.5">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">Matchmaker</p>
                <p className="text-sm text-gray-700 leading-relaxed">{C.matchmakerNote}</p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Imam&apos;s Reference</p>
                <p className="text-sm text-gray-700 leading-relaxed">{C.imamNote}</p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Sales Lead</p>
                <p className="text-sm text-gray-700 leading-relaxed">{C.salesNote}</p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-300 py-1">Confidential · Jodohmu</p>
          </div>

          {/* ──────────────────────────
              RIGHT CONTENT
          ────────────────────────── */}
          <div className="space-y-4">

            {/* About */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-7 py-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">About Rahma</h2>
              <p className="text-[15px] text-gray-600 leading-relaxed">{C.about}</p>

              <Divider />

              {/* Strengths */}
              <Block title="Strengths">
                <div className="flex flex-wrap gap-2">
                  {C.strengths.map(s => (
                    <div key={s} className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-700">{s}</span>
                    </div>
                  ))}
                </div>
              </Block>

              <Divider />

              {/* Personality */}
              <Block title="Personality">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Love Language", value: C.loveLanguage },
                    { label: "Personality", value: C.personality },
                    { label: "Attachment", value: "Secure" },
                    { label: "Conflict Style", value: C.conflictStyle },
                    { label: "Maturity", value: "Very high" },
                    { label: "Self-Awareness", value: "Exceptional" },
                  ].map(i => (
                    <div key={i.label} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{i.label}</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug">{i.value}</p>
                    </div>
                  ))}
                </div>
              </Block>

              <Divider />

              <Block title="Hobbies & Interests">
                <p className="text-sm text-gray-600 leading-relaxed">{C.hobbies}</p>
              </Block>
            </div>

            {/* Religious + Personal — side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Religious Profile</h3>
                <FieldRow label="Religion" value={C.religion} />
                <FieldRow label="Practice" value={C.practiceLevel} />
                <FieldRow label="Prayer" value={C.prayer} />
                <FieldRow label="Quran" value={C.quran} />
                <FieldRow label="Hijab" value={C.hijab} />
                <FieldRow label="Knowledge" value={C.islamicKnowledge} />
                <FieldRow label="Halal" value={C.halal} />
                <FieldRow label="Wali" value={C.wali} />
                <FieldRow label="Mahar" value={C.mahar} />
                <FieldRow label="Polygamy" value={C.polygamy} />
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Personal Details</h3>
                  <FieldRow label="Date of Birth" value="12 April 1975" />
                  <FieldRow label="Nationality" value={`${C.nationality} · ${C.ethnicity}`} />
                  <FieldRow label="Height / Weight" value={`${C.height} / ${C.weight}`} />
                  <FieldRow label="Blood Type" value={C.bloodType} />
                  <FieldRow label="Languages" value="Indonesian, Sundanese, Basic Arabic" />
                  <FieldRow label="Passport" value="Yes — active" />
                </div>

                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Health & Wellness</h3>
                  <FieldRow label="Smoking" value="Never" />
                  <FieldRow label="Alcohol" value="Never" />
                  <FieldRow label="Exercise" value="Daily walk + weekend yoga" />
                  <FieldRow label="Sleep" value="Early bird — Tahajjud routine" />
                  <FieldRow label="Conditions" value="Mild hypertension — well-managed" />
                  <FieldRow label="Disability" value="None" />
                </div>
              </div>
            </div>

            {/* Career */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-7 py-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Education & Career</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                <div>
                  <FieldRow label="Education" value={C.education} />
                  <FieldRow label="Occupation" value={C.occupation} />
                  <FieldRow label="Status" value={C.employment} />
                  <FieldRow label="Income" value={C.income} />
                </div>
                <div>
                  <FieldRow label="Financial" value="Fully ready" />
                  <FieldRow label="Property" value={C.property} />
                  <FieldRow label="Debts" value={C.debts} />
                  <FieldRow label="Savings" value="Disciplined monthly saver" />
                </div>
              </div>
            </div>

            {/* Marital History */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-7 py-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Marital History</h2>

              <div className="rounded-xl bg-rose-50 border border-rose-100 p-5 mb-5">
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wide mb-2">Previous Marriage</p>
                <p className="text-sm text-gray-700 leading-relaxed">{C.divorceContext}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Divorced", value: String(C.divorceYear) },
                  { label: "Children", value: "2 (adults)" },
                  { label: "Recovery", value: "Fully healed" },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Lesson Learned</p>
                <p className="text-sm text-gray-600 italic leading-relaxed">&ldquo;{C.lesson}&rdquo;</p>
              </div>
            </div>

            {/* Family + Marriage Vision */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Family Background</h3>
                <FieldRow label="Parents" value="Father passed (2018) · Mother alive, very close" />
                <FieldRow label="Siblings" value="3 — all married" />
                <FieldRow label="Family Faith" value="Very religious — father was local ustaz" />
                <FieldRow label="Family Role" value="Consults, then decides independently" />
                <FieldRow label="Living Now" value="Own home · youngest child (22) moving out" />
              </div>

              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Marriage Vision</h3>
                <FieldRow label="Timeline" value={C.timeline} />
                <FieldRow label="Wedding" value={C.wedding} />
                <FieldRow label="Finances" value={C.finances} />
                <FieldRow label="Decisions" value={C.decisions} />
                <FieldRow label="Children" value={C.moreChildren} />
                <FieldRow label="Polygamy" value={C.polygamy} />
              </div>
            </div>

            {/* What she wants */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-7 py-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What She Wants in a Husband</h3>
              <p className="text-[15px] text-gray-700 leading-relaxed">{C.husbandExpectation}</p>
            </div>

            {/* Ideal Spouse */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-7 py-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Her Ideal Husband</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Age Range", value: C.spouseAge },
                  { label: "Religion", value: "Muslim — practicing" },
                  { label: "Divorced / Widowed", value: C.openToDivorced },
                  { label: "Ethnicity", value: C.openToEthnicity },
                  { label: "Education", value: "Wisdom over degree" },
                  { label: "Location", value: "Indonesia — flexible" },
                ].map(s => (
                  <div key={s.label} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1 leading-snug">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 mb-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Personality She&apos;s Looking For</p>
                <p className="text-sm text-gray-700 leading-relaxed">{C.spousePersonality}</p>
              </div>

              <div className="rounded-xl bg-red-50 border border-red-100 p-5">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-2">Absolute Deal-Breakers</p>
                <p className="text-sm text-gray-700 leading-relaxed">{C.dealBreakers}</p>
              </div>
            </div>

          </div>
          {/* end right col */}
        </div>
      </div>
    </div>
  );
}
