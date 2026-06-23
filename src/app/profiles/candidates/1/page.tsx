import type { Metadata } from "next";
import {
  MapPin, Briefcase, GraduationCap, CheckCircle2,
  Home, Search, Heart, MessageCircle, Bell, User,
  Star, Settings, HelpCircle, LogOut, ChevronLeft,
  Flag, Send, Camera, Lock, Crown, BookOpen, Shield,
  Clock, Leaf, Target, Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Profil Kandidat — Jodohmu",
  robots: "noindex",
};

/* ── data ─────────────────────────────────────────── */
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

/* ── helpers ──────────────────────────────────────── */
function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] cursor-pointer transition-colors text-[14px] font-medium ${
      active
        ? "bg-[#f5e8ee] text-[#9B2242]"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
    }`}>
      <span className="w-[18px] h-[18px] shrink-0">{icon}</span>
      {label}
    </div>
  );
}

function MetaItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[13.5px] text-gray-500">
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-[9px] bg-[#f5e8ee] flex items-center justify-center text-[#9B2242] shrink-0">
          <span className="w-[17px] h-[17px]">{icon}</span>
        </div>
        <span className="text-[15px] font-bold text-gray-900">{title}</span>
      </div>
      {children}
    </div>
  );
}

function PillRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[30px] h-[30px] rounded-[8px] bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-400">
        <span className="w-[15px] h-[15px]">{icon}</span>
      </div>
      <span className="text-[13.5px] text-gray-800 font-medium">{label}</span>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-5 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide w-28 shrink-0 pt-0.5">{label}</span>
      <span className="text-[13.5px] text-gray-700">{value}</span>
    </div>
  );
}

/* ── page ─────────────────────────────────────────── */
export default function CandidateProfilePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f7fb]" style={{ fontFamily: "var(--font-roboto), sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-[220px] shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-[10px] bg-[#9B2242] flex items-center justify-center shrink-0">
            <Heart className="w-[18px] h-[18px] text-white fill-white" />
          </div>
          <span className="text-[17px] font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>Jodohmu</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          <NavItem icon={<Home className="w-full h-full" />}         label="Beranda" />
          <NavItem icon={<Search className="w-full h-full" />}       label="Cari" />
          <NavItem icon={<Heart className="w-full h-full" />}        label="Matches" />
          <NavItem icon={<MessageCircle className="w-full h-full" />} label="Pesan" />
          <NavItem icon={<Bell className="w-full h-full" />}         label="Notifikasi" />
          <NavItem icon={<User className="w-full h-full" />}         label="Profil Saya" active />
          <NavItem icon={<Star className="w-full h-full" />}         label="Premium" />
          <NavItem icon={<Settings className="w-full h-full" />}     label="Pengaturan" />
        </nav>

        <div className="p-3 border-t border-gray-100 flex flex-col gap-0.5">
          <NavItem icon={<HelpCircle className="w-full h-full" />} label="Bantuan" />
          <NavItem icon={<LogOut className="w-full h-full" />}     label="Keluar" />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="h-[52px] shrink-0 bg-white border-b border-gray-100 flex items-center px-7 gap-3">
          <button className="flex items-center gap-1.5 text-[13.5px] text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Kembali ke hasil pencarian
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 text-[13px] text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <Flag className="w-3.5 h-3.5" />
            Laporkan
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors font-bold">
            ···
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-7 pb-16">

          {/* ── Hero ── */}
          <div className="flex gap-7 mb-6">
            {/* Photo */}
            <div className="relative shrink-0">
              <div className="w-[280px] h-[340px] rounded-[18px] bg-gradient-to-br from-[#f0e4ef] to-[#ddd0e8] flex flex-col items-center justify-center gap-3 overflow-hidden">
                <div className="w-[72px] h-[72px] rounded-[22px] bg-[#9B2242] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">SR</span>
                </div>
                <span className="text-sm text-gray-500 font-medium">{C.nickname}</span>
              </div>
              {/* Verified badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur border border-[#9B2242]/20 rounded-full px-2.5 py-[5px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#9B2242]" />
                <span className="text-[11px] font-semibold text-[#9B2242]">Terverifikasi</span>
              </div>
              {/* Photo count */}
              <div className="absolute bottom-3 left-3 bg-black/50 rounded-full px-2.5 py-[5px] flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-white" />
                <span className="text-[11px] text-white font-medium">Lihat Semua Foto (6)</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[32px] font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
                  {C.nickname}, {C.age}
                </h1>
                <span className="flex items-center gap-1.5 text-[13px] text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                  Aktif hari ini
                </span>
              </div>

              <blockquote className="text-[15.5px] text-gray-800 leading-relaxed mb-5 mt-2" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                &ldquo; {C.about.split('.')[0]}.&rdquo;
              </blockquote>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 mb-6">
                <MetaItem icon={<MapPin className="w-[17px] h-[17px]" />}         value={C.city} />
                <MetaItem icon={<Briefcase className="w-[17px] h-[17px]" />}      value="Senior Health Officer" />
                <MetaItem icon={<span className="text-[13px] font-bold">↕</span>} value={C.height} />
                <MetaItem icon={<Heart className="w-[17px] h-[17px]" />}          value={C.maritalStatus} />
                <MetaItem icon={<GraduationCap className="w-[17px] h-[17px]" />}  value={C.education} />
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#9B2242] hover:bg-[#7a1a35] text-white px-6 py-2.5 rounded-xl text-[14px] font-semibold transition-all shadow-sm hover:shadow-md hover:-translate-y-px">
                  <Send className="w-4 h-4" />
                  Kirim Pesan
                </button>
                <button className="flex items-center gap-2 bg-white border-[1.5px] border-gray-200 hover:border-[#9B2242] hover:text-[#9B2242] text-gray-500 px-6 py-2.5 rounded-xl text-[14px] font-medium transition-all">
                  <Heart className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </div>
          </div>

          {/* ── About + Values ── */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <SectionCard title="Tentang Saya" icon={<User className="w-full h-full" />}>
              <p className="text-[13.5px] text-gray-500 leading-[1.75]">{C.about}</p>
            </SectionCard>

            <SectionCard title="Nilai & Keyakinan" icon={<Star className="w-full h-full" />}>
              <div className="flex flex-col gap-2.5">
                <PillRow icon={<Clock className="w-full h-full" />}     label={C.prayer} />
                <PillRow icon={<BookOpen className="w-full h-full" />}  label={C.quran} />
                <PillRow icon={<Users className="w-full h-full" />}     label="Mengutamakan keluarga" />
                <PillRow icon={<Leaf className="w-full h-full" />}      label={`Makanan ${C.halal.toLowerCase()}`} />
                <PillRow icon={<CheckCircle2 className="w-full h-full" />} label="Jujur & komunikatif" />
              </div>
            </SectionCard>
          </div>

          {/* ── Gaya Hidup + Tujuan + Preferensi Pasangan ── */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <SectionCard title="Gaya Hidup" icon={<Leaf className="w-full h-full" />}>
              <div className="flex flex-col gap-2.5">
                <PillRow icon={<Shield className="w-full h-full" />}    label="Tidak merokok" />
                <PillRow icon={<Leaf className="w-full h-full" />}      label="Tidak minum alkohol" />
                <PillRow icon={<CheckCircle2 className="w-full h-full" />} label="Makan makanan halal" />
                <PillRow icon={<Target className="w-full h-full" />}    label="Olahraga rutin, jalan harian" />
              </div>
            </SectionCard>

            <SectionCard title="Tujuan" icon={<Target className="w-full h-full" />}>
              <div className="flex flex-col gap-2.5">
                <PillRow icon={<Heart className="w-full h-full" />}     label={`Menikah dalam ${C.timeline}`} />
                <PillRow icon={<Users className="w-full h-full" />}     label={`Pernikahan ${C.wedding}`} />
                <PillRow icon={<Star className="w-full h-full" />}      label={`Keuangan: ${C.finances}`} />
              </div>
            </SectionCard>

            <SectionCard title="Preferensi Pasangan" icon={<Heart className="w-full h-full" />}>
              <div className="flex flex-col gap-2.5">
                <PillRow icon={<BookOpen className="w-full h-full" />}  label={`Muslim yang aktif beribadah`} />
                <PillRow icon={<Clock className="w-full h-full" />}     label={`Usia ${C.spouseAge}`} />
                <PillRow icon={<Users className="w-full h-full" />}     label="Terbuka untuk janda/duda" />
                <PillRow icon={<Heart className="w-full h-full" />}     label="Berakhlak baik & penyayang" />
                <PillRow icon={<CheckCircle2 className="w-full h-full" />} label="Siap untuk menikah" />
              </div>
            </SectionCard>
          </div>

          {/* ── Foto ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[15px] font-bold text-gray-900">Foto</span>
              <span className="text-[13px] font-semibold text-[#9B2242] cursor-pointer">Lihat Semua</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {["👩‍💼", "🌸", "📖", "🏔️", "🕌", "🤲"].map((emoji, i) => (
                <div key={i} className="aspect-[3/4] rounded-[10px] bg-gradient-to-br from-[#f0e4ef] to-[#ddd0e8] flex items-center justify-center text-2xl">
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          {/* ── Religious + Personal ── */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Profil Agama</p>
              <FieldRow label="Agama"      value={C.religion} />
              <FieldRow label="Ibadah"     value={C.practiceLevel} />
              <FieldRow label="Shalat"     value={C.prayer} />
              <FieldRow label="Quran"      value={C.quran} />
              <FieldRow label="Hijab"      value={C.hijab} />
              <FieldRow label="Wali"       value={C.wali} />
              <FieldRow label="Mahar"      value={C.mahar} />
              <FieldRow label="Poligami"   value={C.polygamy} />
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Data Pribadi</p>
                <FieldRow label="Usia"          value={`${C.age} tahun`} />
                <FieldRow label="Kewarganegaraan" value={`${C.nationality} · ${C.ethnicity}`} />
                <FieldRow label="Tinggi / Berat"  value={`${C.height} / ${C.weight}`} />
                <FieldRow label="Golongan Darah"  value={C.bloodType} />
                <FieldRow label="Bahasa"          value="Indonesia, Sunda, Arab Dasar" />
                <FieldRow label="Paspor"          value="Ya — aktif" />
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Karir & Keuangan</p>
                <FieldRow label="Pekerjaan"   value={C.occupation} />
                <FieldRow label="Status"      value={C.employment} />
                <FieldRow label="Penghasilan" value={C.income} />
                <FieldRow label="Properti"    value={C.property} />
                <FieldRow label="Hutang"      value={C.debts} />
              </div>
            </div>
          </div>

          {/* ── Riwayat Pernikahan ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
            <h2 className="text-[17px] font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, serif" }}>Riwayat Pernikahan</h2>
            <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 mb-4">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wide mb-1.5">Pernikahan Sebelumnya</p>
              <p className="text-[13.5px] text-gray-700 leading-relaxed">{C.divorceContext}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Cerai", value: String(C.divorceYear) },
                { label: "Anak", value: "2 (dewasa)" },
                { label: "Pemulihan", value: "Sudah selesai" },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
                  <p className="text-[13.5px] font-bold text-gray-800 mt-1">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Pelajaran Hidup</p>
              <p className="text-[13.5px] text-gray-600 italic leading-relaxed">&ldquo;{C.lesson}&rdquo;</p>
            </div>
          </div>

          {/* ── Ideal Suami ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
            <h2 className="text-[17px] font-bold text-gray-900 mb-4" style={{ fontFamily: "Georgia, serif" }}>Kriteria Suami Ideal</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Rentang Usia",  value: C.spouseAge },
                { label: "Agama",         value: "Muslim — aktif" },
                { label: "Status",        value: C.openToDivorced },
                { label: "Etnis",         value: C.openToEthnicity },
                { label: "Pendidikan",    value: "Kebijaksanaan > gelar" },
                { label: "Lokasi",        value: "Indonesia — fleksibel" },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
                  <p className="text-[13.5px] font-semibold text-gray-800 mt-1 leading-snug">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Kepribadian yang Dicari</p>
              <p className="text-[13.5px] text-gray-700 leading-relaxed">{C.spousePersonality}</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-100 p-4">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide mb-1.5">Deal-Breaker Mutlak</p>
              <p className="text-[13.5px] text-gray-700 leading-relaxed">{C.dealBreakers}</p>
            </div>
          </div>

          {/* ── Team Assessment ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Penilaian Tim</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1.5">Matchmaker</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{C.matchmakerNote}</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Referensi Imam</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{C.imamNote}</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Catatan Sales</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{C.salesNote}</p>
              </div>
            </div>
          </div>

          {/* ── Informasi Pribadi (locked) ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-[#f5e8ee] flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-[#9B2242]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-gray-900 mb-0.5">Informasi Pribadi</p>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Informasi kontak akan terbuka setelah ada kecocokan atau dengan berlangganan Premium.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-[#9B2242] hover:bg-[#7a1a35] text-white px-5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all shrink-0">
              <Crown className="w-4 h-4" />
              Lihat dengan Premium
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
