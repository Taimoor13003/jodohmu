"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";
import {
  User, Eye, ArrowRight, HeartHandshake,
  ClipboardList, Search, Users, Heart, PhoneCall, CheckCircle2, MessageCircle,
} from "lucide-react";

type D = Record<string, unknown>;

function raw(data: D, key: string): string {
  const v = data[key];
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "—";
}

const TAARUF_LABEL: Record<string, { id: string; en: string }> = {
  ready:     { id: "Open Ta'aruf", en: "Open to Ta'aruf" },
  preparing: { id: "Persiapan",    en: "Preparing" },
  no:        { id: "Tidak Open",   en: "Not Open" },
};

const STATUS_LABEL: Record<string, { id: string; en: string }> = {
  new_lead:           { id: "Akun Belum Aktif",  en: "Account Not Active" },
  registered_looking: { id: "Mencari Pasangan",  en: "Searching" },
  matched:            { id: "Match Ditemukan",    en: "Match Found" },
  in_taaruf:          { id: "Dalam Ta'aruf",      en: "In Ta'aruf" },
  family_meeting:     { id: "Pertemuan Keluarga", en: "Family Meeting" },
  closed_success:     { id: "Selesai — Nikah",    en: "Closed — Success" },
  closed_withdrawn:   { id: "Mundur",             en: "Withdrawn" },
};

const PAKET_LABEL: Record<string, { id: string; en: string }> = {
  pearl:   { id: "Pearl",   en: "Pearl" },
  ruby:    { id: "Ruby",    en: "Ruby" },
  diamond: { id: "Diamond", en: "Diamond" },
  safar:   { id: "Safar",   en: "Safar" },
  amanah:  { id: "Amanah",  en: "Amanah" },
  custom:  { id: "Custom",  en: "Custom" },
};

const STEPS: Array<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: { id: string; en: string };
  desc: { id: string; en: string };
}> = [
  {
    icon: <ClipboardList className="w-full h-full" />,
    iconBg: "#EFF6FF", iconColor: "#1B3A6B",
    title: { id: "1. Pengisian Profil", en: "1. Profile Completion" },
    desc: {
      id: "Kamu mengisi profil lengkap termasuk data pribadi, kepribadian, nilai-nilai hidup, dan kriteria pasangan ideal. Semakin lengkap profilmu, semakin baik tim kami dapat menemukan pasangan yang tepat untukmu.",
      en: "You complete a detailed profile covering personal info, personality, values, and your ideal partner criteria. The more complete your profile, the better we can find the right match for you.",
    },
  },
  {
    icon: <Search className="w-full h-full" />,
    iconBg: "#F5F3FF", iconColor: "#7C3AED",
    title: { id: "2. Verifikasi & Assessment", en: "2. Verification & Assessment" },
    desc: {
      id: "Tim Jodohmu melakukan verifikasi identitas, background check, dan tes psikolog. Proses ini memastikan bahwa semua kandidat adalah orang-orang serius dan dapat dipercaya.",
      en: "The Jodohmu team conducts identity verification, a background check, and a psychologist assessment. This ensures that every candidate is serious, trustworthy, and well-screened.",
    },
  },
  {
    icon: <Users className="w-full h-full" />,
    iconBg: "#F0FDF4", iconColor: "#059669",
    title: { id: "3. Pencocokan Manual oleh Tim", en: "3. Manual Matching by Our Team" },
    desc: {
      id: "Tim matchmaker kami secara manual mencocokkan profilmu dengan kandidat yang sesuai — mempertimbangkan nilai agama, kepribadian, tujuan pernikahan, dan kriteria khusus yang kamu tentukan.",
      en: "Our matchmaker team manually pairs your profile with compatible candidates — considering religious values, personality, marriage goals, and the specific criteria you've set.",
    },
  },
  {
    icon: <Heart className="w-full h-full" />,
    iconBg: "#FFF1F2", iconColor: "#C4294A",
    title: { id: "4. Proses Ta'aruf", en: "4. Ta'aruf Process" },
    desc: {
      id: "Jika ada kecocokan, kamu akan diperkenalkan secara resmi dan terjaga. Proses ta'aruf dilakukan dengan pendampingan tim Jodohmu untuk menjaga keamanan, kenyamanan, dan nilai-nilai Islam.",
      en: "When a match is found, you'll be formally and safely introduced. The ta'aruf process is guided by the Jodohmu team to ensure safety, comfort, and Islamic values throughout.",
    },
  },
  {
    icon: <PhoneCall className="w-full h-full" />,
    iconBg: "#FFFBEB", iconColor: "#B45309",
    title: { id: "5. Pertemuan Keluarga", en: "5. Family Meeting" },
    desc: {
      id: "Jika kedua pihak merasa cocok setelah proses ta'aruf, tim Jodohmu akan memfasilitasi pertemuan keluarga sebagai langkah resmi menuju pernikahan.",
      en: "If both parties feel compatible after ta'aruf, the Jodohmu team facilitates a family meeting as the formal step toward marriage.",
    },
  },
  {
    icon: <CheckCircle2 className="w-full h-full" />,
    iconBg: "#F0FDF4", iconColor: "#16A34A",
    title: { id: "6. Menuju Pernikahan", en: "6. Toward Marriage" },
    desc: {
      id: "Setelah semua pihak siap dan setuju, proses dilanjutkan menuju akad nikah. Tim Jodohmu mendampingi selama perjalanan ini hingga tujuan mulia tercapai.",
      en: "Once all parties are ready and in agreement, the process moves toward the marriage contract. The Jodohmu team supports you throughout this journey until the blessed goal is achieved.",
    },
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [profileData, setProfileData] = useState<D | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await getIdToken(auth.currentUser!);
        const res = await fetch("/api/candidate/me", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const { data } = await res.json() as { data: D | null };
          setProfileData(data);
        }
      } catch { /* silent */ }
    })();
  }, [user]);

  if (!user) return <div className="flex min-h-screen items-center justify-center">Loading…</div>;

  const name     = user.displayName ?? user.email?.split("@")[0] ?? "—";
  const taaruf   = profileData ? raw(profileData, "openToTaaruf") : "—";
  const status   = profileData ? raw(profileData, "personStatus") : "—";
  const paket    = profileData ? raw(profileData, "paket") : "—";
  const hasPaket = paket && paket !== "—" && paket !== "not_selected";

  const taarufLabel = TAARUF_LABEL[taaruf]?.[lang] ?? taaruf;
  const statusLabel = STATUS_LABEL[status]?.[lang] ?? status;
  const paketLabel  = PAKET_LABEL[paket]?.[lang]   ?? null;

  const l = (id: string, en: string) => lang === "id" ? id : en;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">

      {/* Welcome */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 mb-5"
        style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.07)" }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#C4294A" }}>
          Dashboard
        </p>
        <h1 className="text-[22px] sm:text-[26px] font-extrabold mb-1"
          style={{ color: "#0F172A", fontFamily: "var(--font-playfair), Georgia, serif" }}>
          {l(`Halo, ${name} 👋`, `Hello, ${name} 👋`)}
        </h1>
        {profileData && (
          <div className="flex flex-wrap gap-2 mt-3">
            {taaruf !== "—" && (
              <span className={`px-2.5 py-1 rounded-full border text-[11.5px] font-bold ${taaruf === "ready" ? "bg-amber-50 text-amber-700 border-amber-200" : taaruf === "preparing" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                {taarufLabel}
              </span>
            )}
            {status !== "—" && (
              <span className="px-2.5 py-1 rounded-full border text-[11.5px] font-bold bg-slate-50 text-slate-700 border-slate-200">
                {statusLabel}
              </span>
            )}
            {hasPaket && (
              <span className="px-2.5 py-1 rounded-full border text-[11.5px] font-bold text-white" style={{ background: "#1B3A6B", borderColor: "#1B3A6B" }}>
                {paketLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <ActionCard
          href="/dashboard/profile"
          icon={<User className="w-5 h-5" />}
          iconBg="#EFF6FF" iconColor="#1B3A6B"
          title={l("Profil Saya", "My Profile")}
          desc={l("Lihat data lengkap profil kamu.", "View your full profile details.")}
        />
        <ActionCard
          href="/dashboard/profile?stranger=1"
          icon={<Eye className="w-5 h-5" />}
          iconBg="#FFF7ED" iconColor="#C2410C"
          title={l("Tampilan Orang Lain", "Stranger View")}
          desc={l("Lihat profil kamu seperti yang dilihat orang lain.", "See your profile as others would see it.")}
        />
      </div>

      {/* How it works */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8"
        style={{ boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>

        <div className="flex items-center gap-2 mb-1">
          <HeartHandshake className="w-4 h-4" style={{ color: "#C4294A" }} />
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#C4294A" }}>
            {l("Bagaimana Jodohmu Bekerja", "How Jodohmu Works")}
          </p>
        </div>
        <h2 className="text-lg font-bold mb-6" style={{ color: "#0F172A" }}>
          {l("Perjalanan menuju pernikahan yang barakah, langkah demi langkah.", "Your journey to a blessed marriage, step by step.")}
        </h2>

        <div className="flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-4">
              {/* timeline */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: step.iconBg, color: step.iconColor }}>
                  <span className="w-4 h-4 flex">{step.icon}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 my-2" style={{ background: "#E2E8F0" }} />
                )}
              </div>
              {/* content */}
              <div className={`pb-${i < STEPS.length - 1 ? "6" : "0"} flex-1`} style={{ paddingBottom: i < STEPS.length - 1 ? 24 : 0 }}>
                <p className="text-[13.5px] font-bold mb-1" style={{ color: "#0F172A" }}>{step.title[lang]}</p>
                <p className="text-[13px] leading-relaxed" style={{ color: "#64748B" }}>{step.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[13px]" style={{ color: "#64748B" }}>
            {l("Ada pertanyaan? Tim kami siap membantu.", "Have questions? Our team is ready to help.")}
          </p>
          <a
            href="https://wa.me/6281122210303?text=Assalamualaikum%2C%20saya%20ingin%20bertanya%20tentang%20proses%20Jodohmu."
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white shrink-0 transition hover:opacity-90"
            style={{ background: "linear-gradient(to right, #C4294A, #1B3A6B)" }}>
            <MessageCircle className="w-4 h-4" />
            {l("Hubungi Tim Kami", "Contact Our Team")}
          </a>
        </div>
      </div>

    </div>
  );
}

function ActionCard({ href, icon, iconBg, iconColor, title, desc }: {
  href: string; icon: React.ReactNode; iconBg: string; iconColor: string; title: string; desc: string;
}) {
  return (
    <Link href={href}
      className="group flex items-start gap-3 rounded-2xl bg-white border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ boxShadow: "0 1px 4px rgba(15,23,42,0.06)", textDecoration: "none" }}>
      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-[14px] font-bold" style={{ color: "#0F172A" }}>{title}</p>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: "#94A3B8" }} />
        </div>
        <p className="text-[12.5px]" style={{ color: "#64748B" }}>{desc}</p>
      </div>
    </Link>
  );
}
