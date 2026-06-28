"use client";

import { useState } from "react";
import {
  MapPin, Briefcase, GraduationCap, CheckCircle2,
  Home, Search, Heart, MessageCircle, Bell, User,
  Star, Settings, HelpCircle, LogOut, ChevronLeft,
  Flag, Camera, Lock, Crown, BookOpen, Shield,
  Clock, Leaf, Target, Users, ThumbsUp, ThumbsDown,
  Link, Check,
} from "lucide-react";

/* ── data ─────────────────────────────────────────── */
const C = {
  name: "Shazahra",
  nickname: "Azzahra",
  age: 52,
  city: "Bogor, Jawa Barat",
  height: "—", weight: "—", bloodType: "—",
  ethnicity: "Indonesian", nationality: "Indonesian",
  maritalStatus: "—",
  occupation: "Pengajar TPQ",
  education: "Madrasah Tsanawiyah",
  employment: "Swasta",
  income: "—", property: "—", debts: "—",
  photo: "/candidates/shazahra.jpeg",
  about: "Saya seorang wanita yang sederhana, jujur, penyayang keluarga, dan bertanggung jawab. Saya menjalani kehidupan dengan nilai-nilai agama, juga menjaga hubungan baik dengan sesama. Saya menyukai suasana yang tenang, saling menghormati, dan komunikasi yang baik. Harapan saya adalah menemukan pasangan hidup yang dapat bersama-sama membangun rumah tangga yang harmonis, penuh kasih sayang, dan saling mendukung dalam kebaikan.",
  prayer: "Shalat lima waktu",
  quran: "Pengajar TPQ — aktif mengajar Al-Qur'an",
  hijab: "Berhijab",
  islamicKnowledge: "Baik — aktif dalam kegiatan keagamaan",
  halal: "Halal",
  wali: "—", mahar: "Sederhana dan tulus — terbuka untuk didiskusikan", polygamy: "—",
  practiceLevel: "Menjalankan nilai-nilai agama dalam keseharian",
  religion: "Islam",
  timeline: "Serius untuk menikah",
  wedding: "Sederhana dan penuh kebersamaan",
  finances: "Saling mendukung dan terbuka",
  decisions: "Komunikasi dua arah dan saling menghormati",
  husbandExpectation: "Pria yang serius untuk menikah, jujur, bertanggung jawab, berakhlak baik, dan menghormati pasangan serta keluarga. Memiliki komitmen dalam membangun rumah tangga yang sakinah, mawaddah, warahmah. Mampu berkomunikasi dengan baik, serta siap saling mendukung dan menerima kekurangan masing-masing.",
  spouseAge: "Terbuka",
  openToDivorced: "Terbuka", openToEthnicity: "Terbuka",
  spousePersonality: "Jujur, bertanggung jawab, berakhlak baik, dan menghormati pasangan serta keluarga.",
  dealBreakers: "Tidak jujur · Tidak bertanggung jawab · Tidak menghormati pasangan dan keluarga · Tidak berkomitmen",
  matchmakerNote: "Kandidat yang tulus dan religius. Sangat siap dan serius. Profil diisi langsung dari data WhatsApp — perlu follow up untuk melengkapi detail.",
  imamNote: "Pengajar TPQ aktif — menunjukkan komitmen nyata terhadap pendidikan agama di komunitas.",
  salesNote: "Data diterima via WhatsApp — kandidat sangat kooperatif dan antusias dalam proses pendaftaran.",
};

/* ── ratable sections (9 — excludes Data Pribadi which is factual) ── */
const RATABLE = [
  { id: "tentang-saya",    label: "Tentang Saya" },
  { id: "nilai-keyakinan", label: "Nilai & Keyakinan" },
  { id: "gaya-hidup",      label: "Gaya Hidup" },
  { id: "tujuan",          label: "Tujuan" },
  { id: "preferensi",      label: "Preferensi Pasangan" },
  { id: "profil-agama",    label: "Profil Agama" },
  { id: "karir",           label: "Karir & Keuangan" },
  { id: "kriteria",        label: "Kriteria Pasangan Ideal" },
  { id: "harapan",         label: "Harapan dalam Pernikahan" },
];

/* ── types ────────────────────────────────────────── */
type SectionRating = { rating: "cocok" | "tidak" | null; alasan: string };

/* ── helpers ──────────────────────────────────────── */
function isFullyRated(ratings: Record<string, SectionRating>): boolean {
  return RATABLE.every(s => {
    const r = ratings[s.id];
    if (!r || r.rating === null) return false;
    if (r.rating === "tidak" && !r.alasan.trim()) return false;
    return true;
  });
}

function countRated(ratings: Record<string, SectionRating>): number {
  return RATABLE.filter(s => {
    const r = ratings[s.id];
    if (!r || r.rating === null) return false;
    if (r.rating === "tidak" && !r.alasan.trim()) return false;
    return true;
  }).length;
}

function buildVerdict(ratings: Record<string, SectionRating>, overall: "cocok" | "tidak"): string {
  const total = RATABLE.length;
  const cocokCount = RATABLE.filter(s => ratings[s.id]?.rating === "cocok").length;
  const tidakItems = RATABLE
    .filter(s => ratings[s.id]?.rating === "tidak")
    .map(s => `${s.label}${ratings[s.id]?.alasan ? ` (alasan: ${ratings[s.id].alasan})` : ""}`);

  const rekomen = overall === "cocok"
    ? (cocokCount >= 7 ? "Lanjut diskusi" : "Lanjut dengan pertimbangan lebih lanjut")
    : "Tidak direkomendasikan untuk saat ini";

  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  let v = `${cocokCount} dari ${total} bagian cocok. `;
  if (tidakItems.length > 0) v += `Kurang cocok di: ${tidakItems.join("; ")}. `;
  v += `Rekomendasi: ${rekomen}. (${today})`;
  return v;
}

/* ── CardRating ───────────────────────────────────── */
function CardRating({
  sectionId, rating, onRate, onAlasan,
}: {
  sectionId: string;
  rating: SectionRating | undefined;
  onRate: (id: string, r: "cocok" | "tidak") => void;
  onAlasan: (id: string, a: string) => void;
}) {
  const isCocok = rating?.rating === "cocok";
  const isTidak = rating?.rating === "tidak";
  return (
    <div className="mt-4 pt-3 border-t border-gray-50">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-400 flex-1">Nilai bagian ini:</span>
        <button
          onClick={() => onRate(sectionId, "cocok")}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11.5px] font-semibold border transition-all ${
            isCocok
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600"
          }`}
        >
          👍 Cocok
        </button>
        <button
          onClick={() => onRate(sectionId, "tidak")}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11.5px] font-semibold border transition-all ${
            isTidak
              ? "bg-red-400 border-red-400 text-white"
              : "border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500"
          }`}
        >
          👎 Tidak
        </button>
      </div>
      {isTidak && (
        <textarea
          placeholder="Kenapa kurang cocok di bagian ini? (wajib diisi)"
          value={rating?.alasan ?? ""}
          onChange={e => onAlasan(sectionId, e.target.value)}
          rows={2}
          className="mt-2 w-full text-[12.5px] text-gray-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-red-200 placeholder:text-red-300"
        />
      )}
    </div>
  );
}

/* ── SectionCard ──────────────────────────────────── */
function SectionCard({
  title, icon, children,
  sectionId, ratings, onRate, onAlasan,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  sectionId?: string;
  ratings?: Record<string, SectionRating>;
  onRate?: (id: string, r: "cocok" | "tidak") => void;
  onAlasan?: (id: string, a: string) => void;
}) {
  const rating = sectionId && ratings ? ratings[sectionId] : undefined;
  const isRated = !!rating?.rating;
  const isTidak = rating?.rating === "tidak";

  return (
    <div className={`bg-white border rounded-2xl p-4 md:p-5 transition-colors ${
      isRated ? (isTidak ? "border-red-200" : "border-emerald-200") : "border-gray-100"
    }`}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-[9px] bg-[#f5e8ee] flex items-center justify-center text-[#9B2242] shrink-0">
          <span className="w-[17px] h-[17px]">{icon}</span>
        </div>
        <span className="text-[14px] md:text-[15px] font-bold text-gray-900 flex-1">{title}</span>
        {isRated && (
          <span className={`text-[11px] font-bold shrink-0 ${isTidak ? "text-red-400" : "text-emerald-500"}`}>
            {isTidak ? "Kurang cocok" : "Cocok ✓"}
          </span>
        )}
      </div>
      {children}
      {sectionId && onRate && onAlasan && (
        <CardRating sectionId={sectionId} rating={rating} onRate={onRate} onAlasan={onAlasan} />
      )}
    </div>
  );
}

/* ── plain card with optional rating ─────────────── */
function PlainCard({
  label, children,
  sectionId, ratings, onRate, onAlasan,
}: {
  label: string;
  children: React.ReactNode;
  sectionId?: string;
  ratings?: Record<string, SectionRating>;
  onRate?: (id: string, r: "cocok" | "tidak") => void;
  onAlasan?: (id: string, a: string) => void;
}) {
  const rating = sectionId && ratings ? ratings[sectionId] : undefined;
  const isRated = !!rating?.rating;
  const isTidak = rating?.rating === "tidak";

  return (
    <div className={`bg-white border rounded-2xl p-4 md:p-5 transition-colors ${
      isRated ? (isTidak ? "border-red-200" : "border-emerald-200") : "border-gray-100"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        {isRated && (
          <span className={`text-[11px] font-bold ${isTidak ? "text-red-400" : "text-emerald-500"}`}>
            {isTidak ? "Kurang cocok" : "Cocok ✓"}
          </span>
        )}
      </div>
      {children}
      {sectionId && onRate && onAlasan && (
        <CardRating sectionId={sectionId} rating={rating} onRate={onRate} onAlasan={onAlasan} />
      )}
    </div>
  );
}

/* ── small UI helpers ─────────────────────────────── */
function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] cursor-pointer transition-colors text-[14px] font-medium ${
      active ? "bg-[#f5e8ee] text-[#9B2242]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
    }`}>
      <span className="w-[18px] h-[18px] shrink-0">{icon}</span>
      {label}
    </div>
  );
}
function BottomNavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 py-2 ${active ? "text-[#9B2242]" : "text-gray-400"}`}>
      <span className="w-5 h-5">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}
function MetaItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px] text-gray-500">
      <span className="shrink-0 text-gray-400">{icon}</span>
      <span>{value}</span>
    </div>
  );
}
function PillRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[28px] h-[28px] rounded-[8px] bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-400">
        <span className="w-[14px] h-[14px]">{icon}</span>
      </div>
      <span className="text-[13px] text-gray-800 font-medium">{label}</span>
    </div>
  );
}
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide w-24 shrink-0 pt-0.5">{label}</span>
      <span className="text-[13px] text-gray-700">{value}</span>
    </div>
  );
}

/* ── main page ────────────────────────────────────── */
export default function ProfileClient() {
  const [sectionRatings, setSectionRatings] = useState<Record<string, SectionRating>>({});
  const [copied, setCopied] = useState(false);
  const [reviewerVerdict, setReviewerVerdict] = useState<string | null>(null);

  const ratedCount = countRated(sectionRatings);
  const allRated   = isFullyRated(sectionRatings);
  const total      = RATABLE.length;
  const progress   = (ratedCount / total) * 100;

  const onRate = (id: string, r: "cocok" | "tidak") =>
    setSectionRatings(prev => ({ ...prev, [id]: { rating: r, alasan: prev[id]?.alasan ?? "" } }));

  const onAlasan = (id: string, a: string) =>
    setSectionRatings(prev => ({ ...prev, [id]: { ...prev[id], alasan: a } }));

  const handleFinalVote = (type: "cocok" | "tidak") => {
    if (!allRated) return;
    setReviewerVerdict(buildVerdict(sectionRatings, type));
    setTimeout(() => {
      document.getElementById("penilaian-tim")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleKirimPesan = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  const rProps = { ratings: sectionRatings, onRate, onAlasan };

  return (
    <div className="bg-[#f8f7fb] min-h-screen md:flex md:h-screen md:overflow-hidden"
         style={{ fontFamily: "var(--font-roboto), sans-serif" }}>

      {/* Clipboard toast */}
      {copied && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          Link profil disalin!
        </div>
      )}

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex w-[220px] shrink-0 bg-white border-r border-gray-100 flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-[10px] bg-[#9B2242] flex items-center justify-center shrink-0">
            <Heart className="w-[18px] h-[18px] text-white fill-white" />
          </div>
          <span className="text-[17px] font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>Jodohmu</span>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          <NavItem icon={<Home className="w-full h-full" />}          label="Beranda" />
          <NavItem icon={<Search className="w-full h-full" />}        label="Cari" />
          <NavItem icon={<Heart className="w-full h-full" />}         label="Matches" />
          <NavItem icon={<MessageCircle className="w-full h-full" />} label="Pesan" />
          <NavItem icon={<Bell className="w-full h-full" />}          label="Notifikasi" />
          <NavItem icon={<User className="w-full h-full" />}          label="Profil Saya" active />
          <NavItem icon={<Star className="w-full h-full" />}          label="Premium" />
          <NavItem icon={<Settings className="w-full h-full" />}      label="Pengaturan" />
        </nav>
        <div className="p-3 border-t border-gray-100 flex flex-col gap-0.5">
          <NavItem icon={<HelpCircle className="w-full h-full" />} label="Bantuan" />
          <NavItem icon={<LogOut className="w-full h-full" />}     label="Keluar" />
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col md:overflow-hidden">

        {/* Topbar */}
        <div className="sticky top-0 z-20 h-[52px] shrink-0 bg-white border-b border-gray-100 flex items-center px-4 md:px-7 gap-2">
          <button className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali ke hasil pencarian</span>
          </button>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 text-[12.5px] text-gray-500 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Laporkan</span>
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors font-bold">···</button>
        </div>

        {/* Progress counter — sticky just below topbar */}
        <div className="sticky top-[52px] z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-4 md:px-8 py-2 flex items-center gap-3 shrink-0">
          <span className="text-[12px] font-semibold text-gray-600 shrink-0">
            {ratedCount} dari {total} bagian dinilai
          </span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-400"
              style={{
                width: `${progress}%`,
                background: allRated ? "#10b981" : "#9B2242",
              }}
            />
          </div>
          {allRated
            ? <span className="text-[11.5px] font-bold text-emerald-500 shrink-0">Siap dinilai ✓</span>
            : <span className="text-[11.5px] text-gray-400 shrink-0">{total - ratedCount} tersisa</span>
          }
        </div>

        {/* Scrollable content */}
        <div className="flex-1 md:overflow-y-auto px-4 md:px-8 py-5 md:py-7 pb-24 md:pb-10">

          {/* ── Hero ── */}
          <div className="flex flex-col sm:flex-row gap-5 md:gap-7 mb-5 md:mb-6">
            <div className="relative shrink-0 self-center sm:self-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={C.photo} alt={C.nickname}
                className="w-full max-w-[320px] sm:w-[240px] md:w-[280px] h-[300px] md:h-[340px] rounded-[18px] object-cover object-top mx-auto"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur border border-[#9B2242]/20 rounded-full px-2.5 py-[5px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#9B2242]" />
                <span className="text-[11px] font-semibold text-[#9B2242]">Terverifikasi</span>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/50 rounded-full px-2.5 py-[5px] flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-white" />
                <span className="text-[11px] text-white font-medium">Lihat Semua Foto</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-[26px] md:text-[32px] font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
                  {C.name}, {C.age}
                </h1>
                <span className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                  Aktif hari ini
                </span>
              </div>
              <blockquote className="text-[14px] md:text-[15px] text-gray-700 leading-relaxed mb-4 mt-2" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                &ldquo; {C.about.split('.')[0]}.&rdquo;
              </blockquote>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-5">
                <MetaItem icon={<MapPin className="w-4 h-4" />}        value={C.city} />
                <MetaItem icon={<Briefcase className="w-4 h-4" />}     value={C.occupation} />
                <MetaItem icon={<GraduationCap className="w-4 h-4" />} value={C.education} />
                <MetaItem icon={<Heart className="w-4 h-4" />}         value={C.maritalStatus} />
              </div>
              {/* Kirim Pesan only — Cocok/Tidak moved to bottom */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleKirimPesan}
                  className="flex items-center gap-2 bg-[#9B2242] hover:bg-[#7a1a35] text-white px-5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                  {copied ? "Link Disalin!" : "Kirim Pesan"}
                </button>
              </div>
            </div>
          </div>

          {/* ── About + Values ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <SectionCard title="Tentang Saya" icon={<User className="w-full h-full" />} sectionId="tentang-saya" {...rProps}>
              <p className="text-[13px] text-gray-500 leading-[1.75]">{C.about}</p>
            </SectionCard>
            <SectionCard title="Nilai & Keyakinan" icon={<Star className="w-full h-full" />} sectionId="nilai-keyakinan" {...rProps}>
              <div className="flex flex-col gap-2.5">
                <PillRow icon={<Clock className="w-full h-full" />}        label={C.prayer} />
                <PillRow icon={<BookOpen className="w-full h-full" />}     label={C.quran} />
                <PillRow icon={<Users className="w-full h-full" />}        label="Mengutamakan keluarga" />
                <PillRow icon={<Leaf className="w-full h-full" />}         label={`Makanan ${C.halal.toLowerCase()}`} />
                <PillRow icon={<CheckCircle2 className="w-full h-full" />} label="Jujur & komunikatif" />
              </div>
            </SectionCard>
          </div>

          {/* ── Gaya Hidup + Tujuan + Preferensi ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <SectionCard title="Gaya Hidup" icon={<Leaf className="w-full h-full" />} sectionId="gaya-hidup" {...rProps}>
              <div className="flex flex-col gap-2.5">
                <PillRow icon={<Shield className="w-full h-full" />}       label="Tidak merokok" />
                <PillRow icon={<Leaf className="w-full h-full" />}         label="Tidak minum alkohol" />
                <PillRow icon={<CheckCircle2 className="w-full h-full" />} label="Makan makanan halal" />
                <PillRow icon={<Target className="w-full h-full" />}       label="Aktif dalam kegiatan agama" />
              </div>
            </SectionCard>
            <SectionCard title="Tujuan" icon={<Target className="w-full h-full" />} sectionId="tujuan" {...rProps}>
              <div className="flex flex-col gap-2.5">
                <PillRow icon={<Heart className="w-full h-full" />} label={C.timeline} />
                <PillRow icon={<Users className="w-full h-full" />} label={`Pernikahan ${C.wedding}`} />
                <PillRow icon={<Star className="w-full h-full" />}  label={`Keuangan: ${C.finances}`} />
              </div>
            </SectionCard>
            <SectionCard title="Preferensi Pasangan" icon={<Heart className="w-full h-full" />} sectionId="preferensi" {...rProps}>
              <div className="flex flex-col gap-2.5">
                <PillRow icon={<BookOpen className="w-full h-full" />}     label="Muslim aktif beribadah" />
                <PillRow icon={<Clock className="w-full h-full" />}        label={`Usia ${C.spouseAge}`} />
                <PillRow icon={<Users className="w-full h-full" />}        label="Terbuka untuk duda" />
                <PillRow icon={<Heart className="w-full h-full" />}        label="Berakhlak baik & penyayang" />
                <PillRow icon={<CheckCircle2 className="w-full h-full" />} label="Siap untuk menikah" />
              </div>
            </SectionCard>
          </div>

          {/* ── Foto ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-bold text-gray-900">Foto</span>
              <span className="text-[12.5px] font-semibold text-[#9B2242] cursor-pointer">Lihat Semua</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <div className="aspect-[3/4] rounded-[10px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={C.photo} alt={C.nickname} className="w-full h-full object-cover object-top" />
              </div>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="aspect-[3/4] rounded-[10px] bg-gradient-to-br from-[#f0e4ef] to-[#ddd0e8] flex items-center justify-center text-gray-300">
                  <Camera className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Profil Agama + Data Pribadi + Karir ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Profil Agama — ratable */}
            <PlainCard label="Profil Agama" sectionId="profil-agama" {...rProps}>
              <FieldRow label="Agama"    value={C.religion} />
              <FieldRow label="Ibadah"   value={C.practiceLevel} />
              <FieldRow label="Shalat"   value={C.prayer} />
              <FieldRow label="Quran"    value={C.quran} />
              <FieldRow label="Hijab"    value={C.hijab} />
              <FieldRow label="Wali"     value={C.wali} />
              <FieldRow label="Mahar"    value={C.mahar} />
              <FieldRow label="Poligami" value={C.polygamy} />
            </PlainCard>

            <div className="space-y-3">
              {/* Data Pribadi — NOT ratable (factual) */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Data Pribadi</p>
                <FieldRow label="Usia"         value={`${C.age} tahun`} />
                <FieldRow label="Asal"         value={`${C.nationality} · ${C.ethnicity}`} />
                <FieldRow label="Tinggi/Berat" value={`${C.height} / ${C.weight}`} />
                <FieldRow label="Gol. Darah"   value={C.bloodType} />
              </div>

              {/* Karir & Keuangan — ratable */}
              <PlainCard label="Karir & Keuangan" sectionId="karir" {...rProps}>
                <FieldRow label="Pekerjaan"   value={C.occupation} />
                <FieldRow label="Status"      value={C.employment} />
                <FieldRow label="Penghasilan" value={C.income} />
                <FieldRow label="Properti"    value={C.property} />
                <FieldRow label="Hutang"      value={C.debts} />
              </PlainCard>
            </div>
          </div>

          {/* ── Kriteria Pasangan Ideal — ratable ── */}
          {(() => {
            const rating = sectionRatings["kriteria"];
            const isRated = !!rating?.rating;
            const isTidak = rating?.rating === "tidak";
            return (
              <div className={`bg-white border rounded-2xl p-4 md:p-6 mb-3 transition-colors ${
                isRated ? (isTidak ? "border-red-200" : "border-emerald-200") : "border-gray-100"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[16px] font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>Kriteria Pasangan Ideal</h2>
                  {isRated && (
                    <span className={`text-[11px] font-bold ${isTidak ? "text-red-400" : "text-emerald-500"}`}>
                      {isTidak ? "Kurang cocok" : "Cocok ✓"}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">
                  {[
                    { label: "Rentang Usia", value: C.spouseAge },
                    { label: "Agama",        value: "Muslim — aktif" },
                    { label: "Status",       value: C.openToDivorced },
                    { label: "Etnis",        value: C.openToEthnicity },
                    { label: "Pendidikan",   value: "Terbuka" },
                    { label: "Lokasi",       value: "Indonesia — fleksibel" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{s.label}</p>
                      <p className="text-[13px] font-semibold text-gray-800 mt-1 leading-snug">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Kepribadian yang Dicari</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{C.spousePersonality}</p>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-100 p-4">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide mb-1.5">Deal-Breaker Mutlak</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{C.dealBreakers}</p>
                </div>
                <CardRating sectionId="kriteria" rating={rating} onRate={onRate} onAlasan={onAlasan} />
              </div>
            );
          })()}

          {/* ── Harapan dalam Pernikahan — ratable ── */}
          {(() => {
            const rating = sectionRatings["harapan"];
            const isRated = !!rating?.rating;
            const isTidak = rating?.rating === "tidak";
            return (
              <div className={`bg-white border rounded-2xl p-4 md:p-6 mb-3 transition-colors ${
                isRated ? (isTidak ? "border-red-200" : "border-emerald-200") : "border-gray-100"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[16px] font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>Harapan dalam Pernikahan</h2>
                  {isRated && (
                    <span className={`text-[11px] font-bold ${isTidak ? "text-red-400" : "text-emerald-500"}`}>
                      {isTidak ? "Kurang cocok" : "Cocok ✓"}
                    </span>
                  )}
                </div>
                <p className="text-[13.5px] text-gray-700 leading-relaxed">{C.husbandExpectation}</p>
                <CardRating sectionId="harapan" rating={rating} onRate={onRate} onAlasan={onAlasan} />
              </div>
            );
          })()}

          {/* ── Final verdict buttons ── */}
          <div className={`bg-white border rounded-2xl p-5 mb-3 transition-colors ${allRated ? "border-gray-200" : "border-gray-100"}`}>
            <div className="mb-3">
              <p className="text-[14px] font-bold text-gray-900 mb-0.5">Penilaian Keseluruhan</p>
              <p className="text-[12.5px] text-gray-400">
                {allRated
                  ? "Semua bagian sudah dinilai. Berikan keputusan akhir Anda:"
                  : `Nilai ${total - ratedCount} bagian lagi sebelum bisa memberikan keputusan akhir.`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleFinalVote("cocok")}
                disabled={!allRated}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold transition-all border ${
                  allRated
                    ? "bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Cocok — Lanjut
              </button>
              <button
                onClick={() => handleFinalVote("tidak")}
                disabled={!allRated}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold transition-all border ${
                  allRated
                    ? "bg-red-400 border-red-400 text-white hover:bg-red-500"
                    : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                Tidak Cocok
              </button>
            </div>
          </div>

          {/* ── Penilaian Tim ── */}
          <div id="penilaian-tim" className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Penilaian Tim</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3.5">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1.5">Matchmaker</p>
                <p className="text-[12.5px] text-gray-700 leading-relaxed">{C.matchmakerNote}</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Referensi Imam</p>
                <p className="text-[12.5px] text-gray-700 leading-relaxed">{C.imamNote}</p>
              </div>
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Catatan Sales</p>
                <p className="text-[12.5px] text-gray-700 leading-relaxed">{C.salesNote}</p>
              </div>
            </div>

            {/* Catatan Reviewer — appended on submit */}
            {reviewerVerdict && (
              <div className="mt-2.5 rounded-xl bg-[#f5e8ee] border border-[#9B2242]/20 p-3.5">
                <p className="text-[10px] font-bold text-[#9B2242] uppercase tracking-wide mb-1.5">Catatan Reviewer</p>
                <p className="text-[12.5px] text-gray-800 leading-relaxed">{reviewerVerdict}</p>
              </div>
            )}
          </div>

          {/* ── Locked ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-[13px] bg-[#f5e8ee] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#9B2242]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-gray-900 mb-0.5">Informasi Pribadi</p>
              <p className="text-[12.5px] text-gray-500 leading-relaxed">
                Informasi kontak akan terbuka setelah ada kecocokan atau dengan berlangganan Premium.
              </p>
            </div>
            <button className="flex items-center gap-2 bg-[#9B2242] hover:bg-[#7a1a35] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all shrink-0 w-full sm:w-auto justify-center">
              <Crown className="w-4 h-4" />
              Lihat dengan Premium
            </button>
          </div>

        </div>
      </div>

      {/* ── Bottom nav (mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center z-30 px-2">
        <BottomNavItem icon={<Home className="w-full h-full" />}          label="Beranda" />
        <BottomNavItem icon={<Search className="w-full h-full" />}        label="Cari" />
        <BottomNavItem icon={<Heart className="w-full h-full" />}         label="Matches" />
        <BottomNavItem icon={<MessageCircle className="w-full h-full" />} label="Pesan" />
        <BottomNavItem icon={<User className="w-full h-full" />}          label="Profil" active />
      </nav>
    </div>
  );
}
