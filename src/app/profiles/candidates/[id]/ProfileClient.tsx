"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin, Briefcase, GraduationCap, CheckCircle2,
  ChevronLeft, Flag, Camera, Lock, Crown, BookOpen,
  Clock, Leaf, Target, Users, ThumbsUp, ThumbsDown,
  Link, Check, Heart, Star, User, Shield,
  Droplets, Scale, Home, CreditCard, Moon, Calendar,
} from "lucide-react";

/* ── palette ─────────────────────────────────────── */
const P = {
  bg:      "#EEF2F7",
  card:    "#FFFFFF",
  border:  "#E2E8F0",
  div:     "#F8FAFC",
  shadow:  "0 1px 3px rgba(15,23,42,0.04)",
  text:    "#0F172A",
  sub:     "#64748B",
  muted:   "#94A3B8",
  empty:   "#CBD5E1",
  iconBg:  "#EEF2F7",
  label:   "#475569",
  g1:      "#1B3A6B",
  g2:      "#C4294A",
};

/* ── data ─────────────────────────────────────────── */
const C = {
  name: "Shazahra", nickname: "Azzahra", age: 52,
  city: "Bogor, Jawa Barat", height: "—", weight: "—", bloodType: "—",
  ethnicity: "Sunda", nationality: "Indonesian", maritalStatus: "—",
  occupation: "Pengajar TPQ", education: "Madrasah Tsanawiyah",
  employment: "Swasta", income: "—", property: "—", debts: "—",
  photo: "/candidates/shazahra.jpeg",
  about: "Saya seorang wanita yang sederhana, jujur, penyayang keluarga, dan bertanggung jawab. Saya menjalani kehidupan dengan nilai-nilai agama, juga menjaga hubungan baik dengan sesama. Saya menyukai suasana yang tenang, saling menghormati, dan komunikasi yang baik. Harapan saya adalah menemukan pasangan hidup yang dapat bersama-sama membangun rumah tangga yang harmonis, penuh kasih sayang, dan saling mendukung dalam kebaikan.",
  prayer: "Shalat lima waktu", quran: "Pengajar TPQ — aktif mengajar Al-Qur'an",
  hijab: "Berhijab", islamicKnowledge: "Baik — aktif dalam kegiatan keagamaan",
  halal: "Halal", wali: "—", mahar: "Sederhana dan tulus — terbuka untuk didiskusikan",
  polygamy: "—", practiceLevel: "Menjalankan nilai-nilai agama dalam keseharian",
  religion: "Islam", timeline: "Serius untuk menikah",
  wedding: "Sederhana dan penuh kebersamaan", finances: "Saling mendukung dan terbuka",
  decisions: "Komunikasi dua arah dan saling menghormati",
  husbandExpectation: "Pria yang serius untuk menikah, jujur, bertanggung jawab, berakhlak baik, dan menghormati pasangan serta keluarga. Memiliki komitmen dalam membangun rumah tangga yang sakinah, mawaddah, warahmah. Mampu berkomunikasi dengan baik, serta siap saling mendukung dan menerima kekurangan masing-masing.",
  spouseAge: "Terbuka", openToDivorced: "Terbuka", openToEthnicity: "Terbuka",
  spousePersonality: "Jujur, bertanggung jawab, berakhlak baik, dan menghormati pasangan serta keluarga.",
  dealBreakers: "Tidak jujur · Tidak bertanggung jawab · Tidak menghormati pasangan dan keluarga · Tidak berkomitmen",
  matchmakerNote: "Kandidat yang tulus dan religius. Sangat siap dan serius. Profil diisi langsung dari data WhatsApp — perlu follow up untuk melengkapi detail.",
  imamNote: "Pengajar TPQ aktif — menunjukkan komitmen nyata terhadap pendidikan agama di komunitas.",
  salesNote: "Data diterima via WhatsApp — kandidat sangat kooperatif dan antusias dalam proses pendaftaran.",
};

/* ── ratable sections ─────────────────────────────── */
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

type SectionRating = { rating: "cocok" | "tidak" | null; alasan: string };

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
function CardRating({ sectionId, rating, onRate, onAlasan }: {
  sectionId: string; rating: SectionRating | undefined;
  onRate: (id: string, r: "cocok" | "tidak") => void;
  onAlasan: (id: string, a: string) => void;
}) {
  const isCocok = rating?.rating === "cocok";
  const isTidak = rating?.rating === "tidak";
  return (
    <div className="mt-4 pt-3.5 flex flex-col gap-2" style={{ borderTop: `1px solid ${P.div}` }}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 11, color: P.muted, flex: 1 }}>Nilai bagian ini:</span>
        <button
          onClick={() => onRate(sectionId, "cocok")}
          className="flex items-center gap-1 px-3 py-1 rounded-full font-semibold border transition-all"
          style={isCocok
            ? { background: "#10b981", borderColor: "#10b981", color: "#fff", fontSize: 11.5 }
            : { background: "transparent", borderColor: P.border, color: P.muted, fontSize: 11.5 }}
        >
          👍 Cocok
        </button>
        <button
          onClick={() => onRate(sectionId, "tidak")}
          className="flex items-center gap-1 px-3 py-1 rounded-full font-semibold border transition-all"
          style={isTidak
            ? { background: "#f87171", borderColor: "#f87171", color: "#fff", fontSize: 11.5 }
            : { background: "transparent", borderColor: P.border, color: P.muted, fontSize: 11.5 }}
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
          className="w-full resize-none focus:outline-none placeholder:text-red-300"
          style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, color: P.text }}
        />
      )}
    </div>
  );
}

/* ── SecHeader ────────────────────────────────────── */
function SecHeader({ icon, title, rating }: { icon: React.ReactNode; title: string; rating?: SectionRating }) {
  const ok = rating?.rating === "cocok";
  const bad = rating?.rating === "tidak";
  return (
    <div className="flex items-center gap-2.5 pb-[13px] mb-[14px]" style={{ borderBottom: `1px solid ${P.div}` }}>
      <div className="shrink-0 flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 8, background: P.iconBg }}>
        <span style={{ width: 14, height: 14, color: P.sub, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      </div>
      <span className="font-bold uppercase" style={{ fontSize: 11, color: P.label, letterSpacing: "0.7px" }}>{title}</span>
      <div className="flex-1" />
      {(ok || bad) && (
        <span className="font-bold" style={{ fontSize: 11, color: ok ? "#10b981" : "#f87171" }}>
          {ok ? "Cocok ✓" : "Kurang cocok"}
        </span>
      )}
    </div>
  );
}

/* ── Card ─────────────────────────────────────────── */
function Card({ children, sectionId, ratings, onRate, onAlasan }: {
  children: React.ReactNode;
  sectionId?: string;
  ratings?: Record<string, SectionRating>;
  onRate?: (id: string, r: "cocok" | "tidak") => void;
  onAlasan?: (id: string, a: string) => void;
}) {
  const rating = sectionId && ratings ? ratings[sectionId] : undefined;
  const isCocok = rating?.rating === "cocok";
  const isTidak = rating?.rating === "tidak";
  return (
    <div style={{
      background: P.card,
      border: `1px solid ${isCocok ? "#10b981" : isTidak ? "#f87171" : P.border}`,
      borderRadius: 14, boxShadow: P.shadow,
      padding: "20px 22px", transition: "border-color 0.2s",
    }}>
      {children}
      {sectionId && onRate && onAlasan && (
        <CardRating sectionId={sectionId} rating={rating} onRate={onRate} onAlasan={onAlasan} />
      )}
    </div>
  );
}

/* ── FieldRow: icon + label left | bold value right ─ */
function FieldRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const empty = value === "—";
  return (
    <div className="flex items-center justify-between py-[10px] last:border-0" style={{ borderBottom: `1px solid ${P.div}` }}>
      <div className="flex items-center gap-[7px]">
        <span style={{ width: 13, height: 13, color: P.muted, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: P.sub }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: empty ? 400 : 700, color: empty ? P.empty : P.text, fontStyle: empty ? "italic" : "normal" }}>
        {value}
      </span>
    </div>
  );
}

/* ── PillRow: icon + label (for lists without right value) */
function PillRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 py-[7px]">
      <div className="shrink-0 flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 8, background: P.iconBg }}>
        <span style={{ width: 13, height: 13, color: P.sub, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      </div>
      <span style={{ fontSize: 13, color: P.text }}>{label}</span>
    </div>
  );
}

/* ── main ─────────────────────────────────────────── */
export default function ProfileClient({ id }: { id: string }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.uid !== id) { router.replace(`/profiles/candidates/${user.uid}`); return; }
    if (role !== "candidate") { router.replace("/dashboard"); return; }
  }, [user, role, loading, id, router]);

  const [sectionRatings, setSectionRatings] = useState<Record<string, SectionRating>>({});
  const [copied, setCopied] = useState(false);
  const [reviewerVerdict, setReviewerVerdict] = useState<string | null>(null);

  if (loading || !user || user.uid !== id || role !== "candidate") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: P.bg }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${P.g2} transparent ${P.g2} ${P.g2}` }} />
      </div>
    );
  }

  const ratedCount = countRated(sectionRatings);
  const allRated   = isFullyRated(sectionRatings);
  const total      = RATABLE.length;
  const progress   = (ratedCount / total) * 100;

  const onRate = (sid: string, r: "cocok" | "tidak") =>
    setSectionRatings(prev => ({ ...prev, [sid]: { rating: r, alasan: prev[sid]?.alasan ?? "" } }));
  const onAlasan = (sid: string, a: string) =>
    setSectionRatings(prev => ({ ...prev, [sid]: { ...prev[sid], alasan: a } }));

  const handleFinalVote = (type: "cocok" | "tidak") => {
    if (!allRated) return;
    setReviewerVerdict(buildVerdict(sectionRatings, type));
    setTimeout(() => {
      document.getElementById("penilaian-tim")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    }
  };

  const rProps = { ratings: sectionRatings, onRate, onAlasan };

  return (
    <div className="min-h-screen" style={{ background: P.bg, fontFamily: "var(--font-roboto), sans-serif" }}>

      {/* Toast */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg"
          style={{ background: P.text }}>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          Link profil disalin!
        </div>
      )}

      {/* ── Topbar ── */}
      <header className="sticky top-20 z-30 flex items-center px-6 gap-3"
        style={{ background: P.card, borderBottom: `1px solid ${P.border}`, height: 60 }}>
        <button onClick={() => router.back()} className="flex items-center gap-1.5 transition-colors"
          style={{ fontSize: 13, fontWeight: 600, color: P.sub }}>
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Kembali ke Kandidat</span>
        </button>
        <div className="flex-1" />
        <button onClick={handleShare} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all"
          style={{ fontSize: 12.5, fontWeight: 600, color: P.sub, border: `1px solid ${P.border}`, background: P.bg }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
          {copied ? "Disalin!" : "Bagikan"}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors"
          style={{ fontSize: 12.5, color: P.muted, border: `1px solid ${P.border}`, background: P.bg }}>
          <Flag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Laporkan</span>
        </button>
      </header>

      {/* ── Progress bar ── */}
      <div className="sticky z-20 flex items-center gap-3 px-6 py-2"
        style={{ top: 60, background: "rgba(238,242,247,0.96)", borderBottom: `1px solid ${P.border}`, backdropFilter: "blur(6px)" }}>
        <span className="text-[11.5px] font-semibold shrink-0" style={{ color: P.sub }}>
          {ratedCount}/{total} dinilai
        </span>
        <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: P.border }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: allRated ? "#10b981" : `linear-gradient(90deg, ${P.g1}, ${P.g2})` }} />
        </div>
        {allRated
          ? <span className="text-[11px] font-bold text-emerald-600 shrink-0">Siap dinilai ✓</span>
          : <span className="text-[11px] shrink-0" style={{ color: P.muted }}>{total - ratedCount} tersisa</span>
        }
      </div>

      {/* ── Body ── */}
      <div className="flex items-start gap-6 max-w-6xl mx-auto px-5 sm:px-6 py-6 pb-28">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:block shrink-0 sticky top-[108px]" style={{ width: 256 }}>
          <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 18, boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 4px 20px rgba(15,23,42,0.05)", overflow: "hidden" }}>
            {/* Photo */}
            <div className="flex flex-col items-center px-5 pt-7 pb-5" style={{ borderBottom: `1px solid ${P.div}` }}>
              <div className="mb-4 p-[3px] rounded-full" style={{ background: `linear-gradient(135deg, ${P.g1}, ${P.g2})` }}>
                <div className="rounded-full overflow-hidden" style={{ width: 112, height: 112, background: P.card }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={C.photo} alt={C.nickname} className="w-full h-full object-cover object-top" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-extrabold" style={{ fontSize: 20, color: P.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
                  {C.name}
                </span>
                <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                  style={{ background: P.g1 }}>
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-4">
                <MapPin className="w-3 h-3" style={{ color: P.muted }} />
                <span style={{ fontSize: 12, color: P.muted }}>{C.city}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {[`${C.age} thn`, "Perempuan", C.ethnicity].map(t => (
                  <span key={t} className="px-2.5 py-[3px] rounded-full font-bold"
                    style={{ fontSize: 11, color: P.sub, background: P.bg, border: `1px solid ${P.border}` }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick info */}
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${P.div}` }}>
              <div className="flex flex-col gap-2.5">
                {[
                  { icon: <Briefcase className="w-full h-full" />, v: C.occupation },
                  { icon: <GraduationCap className="w-full h-full" />, v: C.education },
                  { icon: <Heart className="w-full h-full" />, v: "Status pernikahan" },
                ].map(({ icon, v }) => (
                  <div key={v} className="flex items-center gap-2" style={{ fontSize: 12.5, color: P.sub }}>
                    <span className="w-3.5 h-3.5 shrink-0" style={{ color: P.muted }}>{icon}</span>
                    {v}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress dots */}
            <div className="px-5 py-4">
              <p className="font-bold uppercase mb-3" style={{ fontSize: 10, color: P.label, letterSpacing: "0.7px" }}>
                Progress Penilaian
              </p>
              <div className="flex flex-col gap-1.5">
                {RATABLE.map(s => {
                  const r = sectionRatings[s.id];
                  const done = r?.rating && (r.rating !== "tidak" || r.alasan.trim());
                  const cocok = r?.rating === "cocok";
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className="shrink-0 rounded-full" style={{
                        width: 6, height: 6,
                        background: done ? (cocok ? "#10b981" : "#f87171") : P.border,
                      }} />
                      <span style={{ fontSize: 11.5, color: done ? P.text : P.muted }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">

          {/* Mobile: mini header */}
          <div className="lg:hidden flex items-center gap-3 mb-1">
            <div className="p-[3px] rounded-full shrink-0" style={{ background: `linear-gradient(135deg, ${P.g1}, ${P.g2})` }}>
              <div className="rounded-full overflow-hidden" style={{ width: 56, height: 56, background: P.card }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={C.photo} alt={C.nickname} className="w-full h-full object-cover object-top" />
              </div>
            </div>
            <div>
              <h1 className="font-bold" style={{ fontSize: 20, color: P.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
                {C.name}, {C.age}
              </h1>
              <p style={{ fontSize: 12.5, color: P.sub }}>{C.city}</p>
            </div>
          </div>

          {/* ── Tentang Saya ── */}
          <Card sectionId="tentang-saya" {...rProps}>
            <SecHeader icon={<User className="w-full h-full" />} title="Tentang Saya" rating={sectionRatings["tentang-saya"]} />
            <p style={{ fontSize: 13.5, color: P.sub, lineHeight: 1.8 }}>{C.about}</p>
          </Card>

          {/* ── 3-col: Gaya Hidup, Nilai & Keyakinan, Preferensi ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card sectionId="gaya-hidup" {...rProps}>
              <SecHeader icon={<Leaf className="w-full h-full" />} title="Gaya Hidup" rating={sectionRatings["gaya-hidup"]} />
              <PillRow icon={<Shield className="w-full h-full" />} label="Tidak merokok" />
              <PillRow icon={<Leaf className="w-full h-full" />}   label="Tidak minum alkohol" />
              <PillRow icon={<CheckCircle2 className="w-full h-full" />} label="Makan makanan halal" />
              <PillRow icon={<Target className="w-full h-full" />} label="Aktif dalam kegiatan agama" />
            </Card>
            <Card sectionId="nilai-keyakinan" {...rProps}>
              <SecHeader icon={<Star className="w-full h-full" />} title="Nilai & Keyakinan" rating={sectionRatings["nilai-keyakinan"]} />
              <PillRow icon={<Clock className="w-full h-full" />}      label={C.prayer} />
              <PillRow icon={<BookOpen className="w-full h-full" />}   label={C.quran} />
              <PillRow icon={<Users className="w-full h-full" />}      label="Mengutamakan keluarga" />
              <PillRow icon={<Leaf className="w-full h-full" />}       label={`Makanan ${C.halal.toLowerCase()}`} />
              <PillRow icon={<CheckCircle2 className="w-full h-full" />} label="Jujur & komunikatif" />
            </Card>
            <Card sectionId="preferensi" {...rProps}>
              <SecHeader icon={<Heart className="w-full h-full" />} title="Preferensi Pasangan" rating={sectionRatings["preferensi"]} />
              <PillRow icon={<BookOpen className="w-full h-full" />}    label="Muslim aktif beribadah" />
              <PillRow icon={<Clock className="w-full h-full" />}       label={`Usia ${C.spouseAge}`} />
              <PillRow icon={<Users className="w-full h-full" />}       label="Terbuka untuk duda" />
              <PillRow icon={<Heart className="w-full h-full" />}       label="Berakhlak baik & penyayang" />
              <PillRow icon={<CheckCircle2 className="w-full h-full" />} label="Siap untuk menikah" />
            </Card>
          </div>

          {/* ── Tujuan ── */}
          <Card sectionId="tujuan" {...rProps}>
            <SecHeader icon={<Target className="w-full h-full" />} title="Tujuan Pernikahan" rating={sectionRatings["tujuan"]} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: "Target Waktu",    value: C.timeline },
                { label: "Pref. Pernikahan", value: `Pernikahan ${C.wedding}` },
                { label: "Keuangan",         value: C.finances },
                { label: "Keputusan",        value: C.decisions },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3.5" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                  <p className="font-bold uppercase mb-2" style={{ fontSize: 9.5, color: P.muted, letterSpacing: "0.4px" }}>{s.label}</p>
                  <p className="font-semibold leading-snug" style={{ fontSize: 12.5, color: P.text }}>{s.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* ── 2-col: Data Pribadi | (Karir + Profil Agama) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Data Pribadi — not ratable */}
            <Card>
              <SecHeader icon={<User className="w-full h-full" />} title="Data Pribadi" />
              <FieldRow icon={<Calendar className="w-full h-full" />}    label="Usia"         value={`${C.age} tahun`} />
              <FieldRow icon={<User className="w-full h-full" />}        label="Jenis Kelamin" value="Perempuan" />
              <FieldRow icon={<MapPin className="w-full h-full" />}      label="Asal"          value={`${C.nationality} · ${C.ethnicity}`} />
              <FieldRow icon={<GraduationCap className="w-full h-full" />} label="Pendidikan" value={C.education} />
              <FieldRow icon={<Scale className="w-full h-full" />}       label="Tinggi/Berat"  value={`${C.height} / ${C.weight}`} />
              <FieldRow icon={<Droplets className="w-full h-full" />}    label="Gol. Darah"    value={C.bloodType} />
            </Card>

            <div className="flex flex-col gap-3">
              {/* Karir & Keuangan */}
              <Card sectionId="karir" {...rProps}>
                <SecHeader icon={<Briefcase className="w-full h-full" />} title="Karir & Keuangan" rating={sectionRatings["karir"]} />
                <FieldRow icon={<Briefcase className="w-full h-full" />} label="Pekerjaan"   value={C.occupation} />
                <FieldRow icon={<CheckCircle2 className="w-full h-full" />} label="Status"   value={C.employment} />
                <FieldRow icon={<CreditCard className="w-full h-full" />} label="Penghasilan" value={C.income} />
                <FieldRow icon={<Home className="w-full h-full" />}      label="Properti"    value={C.property} />
                <FieldRow icon={<Scale className="w-full h-full" />}     label="Hutang"      value={C.debts} />
              </Card>

              {/* Profil Agama */}
              <Card sectionId="profil-agama" {...rProps}>
                <SecHeader icon={<Moon className="w-full h-full" />} title="Profil Agama" rating={sectionRatings["profil-agama"]} />
                <FieldRow icon={<Moon className="w-full h-full" />}     label="Agama"    value={C.religion} />
                <FieldRow icon={<BookOpen className="w-full h-full" />} label="Ibadah"   value={C.practiceLevel} />
                <FieldRow icon={<Clock className="w-full h-full" />}    label="Shalat"   value={C.prayer} />
                <FieldRow icon={<BookOpen className="w-full h-full" />} label="Quran"    value={C.quran} />
                <FieldRow icon={<User className="w-full h-full" />}     label="Hijab"    value={C.hijab} />
                <FieldRow icon={<Users className="w-full h-full" />}    label="Wali"     value={C.wali} />
                <FieldRow icon={<Heart className="w-full h-full" />}    label="Mahar"    value={C.mahar} />
                <FieldRow icon={<Users className="w-full h-full" />}    label="Poligami" value={C.polygamy} />
              </Card>
            </div>
          </div>

          {/* ── Foto gallery ── */}
          <Card>
            <SecHeader icon={<Camera className="w-full h-full" />} title="Galeri Foto" />
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              <div className="aspect-[3/4] rounded-[10px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={C.photo} alt={C.nickname} className="w-full h-full object-cover object-top" />
              </div>
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-[3/4] rounded-[10px] flex items-center justify-center"
                  style={{ background: P.bg, border: `2px dashed ${P.border}` }}>
                  <Camera className="w-5 h-5" style={{ color: P.empty }} />
                </div>
              ))}
            </div>
          </Card>

          {/* ── Kriteria Pasangan Ideal ── */}
          {(() => {
            const rating = sectionRatings["kriteria"];
            const isCocok = rating?.rating === "cocok";
            const isTidak = rating?.rating === "tidak";
            return (
              <div style={{
                background: P.card,
                border: `1px solid ${isCocok ? "#10b981" : isTidak ? "#f87171" : P.border}`,
                borderRadius: 14, boxShadow: P.shadow, padding: "20px 22px", transition: "border-color 0.2s",
              }}>
                <SecHeader icon={<Target className="w-full h-full" />} title="Kriteria Pasangan Ideal" rating={rating} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-4">
                  {[
                    { label: "Rentang Usia", value: C.spouseAge },
                    { label: "Agama",        value: "Muslim — aktif" },
                    { label: "Status",       value: C.openToDivorced },
                    { label: "Etnis",        value: C.openToEthnicity },
                    { label: "Pendidikan",   value: "Terbuka" },
                    { label: "Lokasi",       value: "Indonesia — fleksibel" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                      <p className="font-bold uppercase mb-1" style={{ fontSize: 9.5, color: P.muted, letterSpacing: "0.4px" }}>{s.label}</p>
                      <p className="font-semibold leading-snug" style={{ fontSize: 13, color: P.text }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-4 mb-2.5" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                  <p className="font-bold uppercase mb-1.5" style={{ fontSize: 9.5, color: P.muted, letterSpacing: "0.4px" }}>Kepribadian yang Dicari</p>
                  <p style={{ fontSize: 13, color: P.sub, lineHeight: 1.7 }}>{C.spousePersonality}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: "#fff5f5", border: "1px solid #fecaca" }}>
                  <p className="font-bold uppercase mb-1.5" style={{ fontSize: 9.5, color: "#f87171", letterSpacing: "0.4px" }}>Deal-Breaker Mutlak</p>
                  <p style={{ fontSize: 13, color: P.sub, lineHeight: 1.7 }}>{C.dealBreakers}</p>
                </div>
                <CardRating sectionId="kriteria" rating={rating} onRate={onRate} onAlasan={onAlasan} />
              </div>
            );
          })()}

          {/* ── Harapan dalam Pernikahan ── */}
          {(() => {
            const rating = sectionRatings["harapan"];
            const isCocok = rating?.rating === "cocok";
            const isTidak = rating?.rating === "tidak";
            return (
              <div style={{
                background: P.card,
                border: `1px solid ${isCocok ? "#10b981" : isTidak ? "#f87171" : P.border}`,
                borderRadius: 14, boxShadow: P.shadow, padding: "20px 22px", transition: "border-color 0.2s",
              }}>
                <SecHeader icon={<Heart className="w-full h-full" />} title="Harapan dalam Pernikahan" rating={rating} />
                <p style={{ fontSize: 13.5, color: P.sub, lineHeight: 1.8 }}>{C.husbandExpectation}</p>
                <CardRating sectionId="harapan" rating={rating} onRate={onRate} onAlasan={onAlasan} />
              </div>
            );
          })()}

          {/* ── Final verdict ── */}
          <div style={{
            background: P.card,
            border: `1px solid ${allRated ? P.g1 : P.border}`,
            borderRadius: 14, boxShadow: P.shadow, padding: "20px 22px", transition: "border-color 0.2s",
          }}>
            <p className="font-bold mb-1" style={{ fontSize: 14, color: P.text }}>Penilaian Keseluruhan</p>
            <p className="mb-4" style={{ fontSize: 12.5, color: P.muted }}>
              {allRated
                ? "Semua bagian sudah dinilai. Berikan keputusan akhir Anda:"
                : `Nilai ${total - ratedCount} bagian lagi sebelum bisa memberikan keputusan akhir.`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleFinalVote("cocok")} disabled={!allRated}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all"
                style={{ fontSize: 14, ...(allRated
                  ? { background: "#10b981", color: "#fff", border: "none", cursor: "pointer" }
                  : { background: P.bg, color: P.muted, border: `1px solid ${P.border}`, cursor: "not-allowed" }) }}>
                <ThumbsUp className="w-4 h-4" />
                Cocok — Lanjut
              </button>
              <button onClick={() => handleFinalVote("tidak")} disabled={!allRated}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all"
                style={{ fontSize: 14, ...(allRated
                  ? { background: "#f87171", color: "#fff", border: "none", cursor: "pointer" }
                  : { background: P.bg, color: P.muted, border: `1px solid ${P.border}`, cursor: "not-allowed" }) }}>
                <ThumbsDown className="w-4 h-4" />
                Tidak Cocok
              </button>
            </div>
          </div>

          {/* ── Penilaian Tim ── */}
          <div id="penilaian-tim" style={{
            background: P.card, border: `1px solid ${P.border}`,
            borderRadius: 14, boxShadow: P.shadow, padding: "20px 22px",
          }}>
            <SecHeader icon={<Users className="w-full h-full" />} title="Penilaian Tim" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl p-3.5" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                <p className="font-bold uppercase mb-1.5" style={{ fontSize: 9.5, color: "#d97706", letterSpacing: "0.7px" }}>Matchmaker</p>
                <p style={{ fontSize: 12.5, color: P.sub, lineHeight: 1.6 }}>{C.matchmakerNote}</p>
              </div>
              <div className="rounded-xl p-3.5" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                <p className="font-bold uppercase mb-1.5" style={{ fontSize: 9.5, color: P.muted, letterSpacing: "0.7px" }}>Referensi Imam</p>
                <p style={{ fontSize: 12.5, color: P.sub, lineHeight: 1.6 }}>{C.imamNote}</p>
              </div>
              <div className="rounded-xl p-3.5" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                <p className="font-bold uppercase mb-1.5" style={{ fontSize: 9.5, color: P.muted, letterSpacing: "0.7px" }}>Catatan Sales</p>
                <p style={{ fontSize: 12.5, color: P.sub, lineHeight: 1.6 }}>{C.salesNote}</p>
              </div>
            </div>
            {reviewerVerdict && (
              <div className="mt-2.5 rounded-xl p-3.5" style={{ background: `${P.g1}10`, border: `1px solid ${P.g1}30` }}>
                <p className="font-bold uppercase mb-1.5" style={{ fontSize: 9.5, color: P.g1, letterSpacing: "0.7px" }}>Catatan Reviewer</p>
                <p style={{ fontSize: 12.5, color: P.text, lineHeight: 1.6 }}>{reviewerVerdict}</p>
              </div>
            )}
          </div>

          {/* ── Locked info ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, boxShadow: P.shadow, padding: "20px 22px" }}>
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 44, height: 44, borderRadius: 13, background: `${P.g2}12` }}>
              <Lock className="w-5 h-5" style={{ color: P.g2 }} />
            </div>
            <div className="flex-1">
              <p className="font-bold mb-0.5" style={{ fontSize: 14, color: P.text }}>Informasi Pribadi</p>
              <p style={{ fontSize: 12.5, color: P.sub, lineHeight: 1.55 }}>
                Informasi kontak akan terbuka setelah ada kecocokan atau dengan berlangganan Premium.
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold shrink-0 w-full sm:w-auto justify-center"
              style={{ fontSize: 13, background: `linear-gradient(135deg, ${P.g1}, ${P.g2})`, color: "#fff" }}>
              <Crown className="w-4 h-4" />
              Lihat dengan Premium
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
