"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import {
  LayoutDashboard, User, Globe, LogOut,
  ChevronLeft, Menu,
  Brain, ShieldCheck, ClipboardList, History, Stars, Lock,
} from "lucide-react";
import LogoIcon from "@/assets/jodohmu-logo.png";
import { ChatWidget } from "@/components/chat/ChatWidget";

const TOPBAR_H  = 52;
const SIDEBAR_W = 240;

type Lang = "id" | "en";
type D = Record<string, unknown>;

const MAIN_NAV = [
  { href: "/dashboard",         exact: true,  color: "#C4294A", bg: "#FFF1F2", icon: <LayoutDashboard className="w-full h-full" />, label: { id: "Beranda",     en: "Dashboard"  } },
  { href: "/dashboard/profile", exact: false, color: "#1B3A6B", bg: "#EFF6FF", icon: <User            className="w-full h-full" />, label: { id: "Profil Saya", en: "My Profile" } },
];

const RESULT_NAV = [
  {
    href: "/dashboard/psych-test",
    color: "#7C3AED", bg: "#F5F3FF",
    icon: <Brain className="w-full h-full" />,
    label: { id: "Tes Psikolog", en: "Psych Test" },
    lockKey: "psychTestResult",
    toast: { id: "Hasil tes psikolog belum tersedia. Hubungi tim kami.", en: "Psych test result not yet available. Please contact our team." },
  },
  {
    href: "/dashboard/background-check",
    color: "#0369A1", bg: "#F0F9FF",
    icon: <ShieldCheck className="w-full h-full" />,
    label: { id: "Background Check", en: "Background Check" },
    lockKey: "bgCheckResult",
    toast: { id: "Background check belum selesai. Hubungi tim kami.", en: "Background check not yet complete. Please contact our team." },
  },
  {
    href: "/dashboard/assessment",
    color: "#B45309", bg: "#FFFBEB",
    icon: <ClipboardList className="w-full h-full" />,
    label: { id: "Jodohmu Assessment", en: "Jodohmu Assessment" },
    lockKey: "jodohmuAssessmentResult",
    toast: { id: "Assessment belum tersedia. Hubungi tim kami.", en: "Assessment not yet available. Please contact our team." },
  },
  {
    href: "/dashboard/taaruf-history",
    color: "#C4294A", bg: "#FFF1F2",
    icon: <History className="w-full h-full" />,
    label: { id: "Riwayat Ta'aruf", en: "Past Ta'aruf" },
    lockKey: "pastTaarufResults",
    toast: { id: "Belum ada riwayat ta'aruf. Hubungi tim kami.", en: "No ta'aruf history yet. Please contact our team." },
  },
  {
    href: "/dashboard/matches",
    color: "#059669", bg: "#F0FDF4",
    icon: <Stars className="w-full h-full" />,
    label: { id: "Rekomendasi Match", en: "Recommended Matches" },
    lockKey: "recommendedMatches",
    toast: { id: "Belum ada rekomendasi match. Hubungi tim kami.", en: "No recommended matches yet. Please contact our team." },
  },
];

function isLocked(data: D, key: string): boolean {
  const v = data[key];
  if (v === null || v === undefined || v === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

function Sidebar({ open, onClose, onMouseEnter, onMouseLeave, lang, data }: {
  open: boolean; onClose: () => void;
  onMouseEnter: () => void; onMouseLeave: () => void;
  lang: Lang; data: D;
}) {
  const pathname = usePathname();

  const WA = "https://wa.me/6281122210303?text=Assalamualaikum%2C%20saya%20ingin%20bertanya%20tentang%20akun%20Jodohmu%20saya.";

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: "fixed", top: TOPBAR_H, left: 0,
        width: SIDEBAR_W, height: `calc(100vh - ${TOPBAR_H}px)`,
        background: "#fff", borderRight: "1px solid #E2E8F0",
        display: "flex", flexDirection: "column",
        zIndex: 45,
        transform: open ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
        transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: open ? "4px 0 24px rgba(0,0,0,0.10)" : "none",
        overflow: "hidden",
      }}>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}>

        {/* main nav */}
        <nav style={{ padding: "8px 8px 4px", display: "flex", flexDirection: "column", gap: 2 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.8px", textTransform: "uppercase", padding: "6px 8px 4px" }}>
            {lang === "id" ? "Menu" : "Navigation"}
          </p>
          {MAIN_NAV.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 10,
                  background: active ? "#EEF2F7" : "transparent",
                  color: active ? "#0F172A" : "#64748B",
                  fontWeight: active ? 700 : 500, fontSize: 13,
                  textDecoration: "none", transition: "background 0.15s",
                }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: active ? item.bg : "transparent",
                  color: active ? item.color : "#CBD5E1",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background 0.15s, color 0.15s",
                }}>
                  <span style={{ width: 15, height: 15, display: "flex" }}>{item.icon}</span>
                </div>
                <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label[lang]}</span>
                {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.color }} />}
              </Link>
            );
          })}
        </nav>

        {/* divider */}
        <div style={{ height: 1, background: "#F1F5F9", margin: "4px 12px" }} />

        {/* result nav */}
        <nav style={{ padding: "4px 8px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.8px", textTransform: "uppercase", padding: "6px 8px 4px" }}>
            {lang === "id" ? "Hasil & Match" : "Results & Matches"}
          </p>
          {RESULT_NAV.map(item => {
            const active = pathname.startsWith(item.href);
            const locked = isLocked(data, item.lockKey);

            if (locked) {
              return (
                <button key={item.href}
                  onClick={() => {
                    toast.info(item.toast[lang], {
                      description: lang === "id"
                        ? <a href={WA} target="_blank" rel="noopener noreferrer" style={{ color: "#C4294A", fontWeight: 600 }}>Hubungi Tim Kami →</a>
                        : <a href={WA} target="_blank" rel="noopener noreferrer" style={{ color: "#C4294A", fontWeight: 600 }}>Contact Our Team →</a>,
                      duration: 5000,
                    });
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 10,
                    background: "transparent", color: "#CBD5E1",
                    fontWeight: 500, fontSize: 13,
                    textDecoration: "none", border: "none", cursor: "pointer",
                    textAlign: "left", width: "100%",
                  }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: "#F8FAFC", color: "#CBD5E1",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ width: 15, height: 15, display: "flex" }}>{item.icon}</span>
                  </div>
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label[lang]}</span>
                  <Lock style={{ width: 12, height: 12, color: "#CBD5E1", flexShrink: 0 }} />
                </button>
              );
            }

            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 10,
                  background: active ? "#EEF2F7" : "transparent",
                  color: active ? "#0F172A" : "#64748B",
                  fontWeight: active ? 700 : 500, fontSize: 13,
                  textDecoration: "none", transition: "background 0.15s",
                }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: active ? item.bg : "transparent",
                  color: active ? item.color : "#CBD5E1",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <span style={{ width: 15, height: 15, display: "flex" }}>{item.icon}</span>
                </div>
                <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label[lang]}</span>
                {active && <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.color }} />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* close button */}
      <button onClick={onClose}
        style={{
          height: 44, flexShrink: 0, borderTop: "1px solid #E2E8F0",
          background: "transparent", cursor: "pointer",
          display: "flex", alignItems: "center",
          gap: 6, padding: "0 18px",
          color: "#94A3B8", fontSize: 12, fontWeight: 500,
          transition: "background 0.15s", border: "none",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
        <ChevronLeft style={{ width: 15, height: 15 }} />
        <span>{lang === "id" ? "Tutup" : "Close"}</span>
      </button>
    </div>
  );
}

function Topbar({ onToggle, onMenuHover, onMenuLeave }: {
  onToggle: () => void;
  onMenuHover: () => void;
  onMenuLeave: () => void;
}) {
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: TOPBAR_H, background: "#fff", borderBottom: "1px solid #E2E8F0",
      display: "flex", alignItems: "center", padding: "0 16px", gap: 12, zIndex: 50,
    }}>
      <button
        onClick={onToggle}
        onMouseEnter={onMenuHover}
        onMouseLeave={onMenuLeave}
        style={{
          width: 34, height: 34, borderRadius: 9, background: "transparent",
          border: "1px solid #E2E8F0", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#64748B", flexShrink: 0, transition: "background 0.15s",
        }}
        onFocus={e => (e.currentTarget.style.background = "#F8FAFC")}
        onBlur={e => (e.currentTarget.style.background = "transparent")}>
        <Menu style={{ width: 16, height: 16 }} />
      </button>
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image src={LogoIcon} alt="Jodohmu" height={28} style={{ width: "auto" }} priority />
      </Link>
      <div style={{ flex: 1 }} />
      <button onClick={() => setLang(lang === "id" ? "en" : "id")}
        style={{
          display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700,
          padding: "5px 12px", borderRadius: 20, border: "1px solid #E2E8F0",
          background: "#F8FAFC", color: "#1B3A6B", cursor: "pointer",
        }}>
        <Globe style={{ width: 13, height: 13 }} />
        {lang === "id" ? "EN" : "ID"}
      </button>
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "linear-gradient(135deg, #C4294A, #1B3A6B)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
              {user.displayName
                ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                : (user.email?.[0] ?? "U").toUpperCase()}
            </span>
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#64748B", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.displayName ?? user.email}
          </span>
          <button
            onClick={async () => { await signOut(auth); router.push("/login"); }}
            style={{
              width: 30, height: 30, borderRadius: 8, border: "1px solid #E2E8F0",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#94A3B8", transition: "background 0.15s, color 0.15s",
            }}
            title="Logout"
            onMouseEnter={e => { e.currentTarget.style.background = "#FFF1F2"; e.currentTarget.style.color = "#C4294A"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; }}>
            <LogOut style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [candidateData, setCandidateData] = useState<D>({});
  const { lang } = useLanguage();
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const openTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = () => {
    if (openTimerRef.current)  clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (role === "admin" || role === "worker") { router.replace("/admin"); return; }
  }, [user, role, loading, router]);

  // close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const fetchCandidate = useCallback(async () => {
    if (!user) return;
    try {
      const token = await getIdToken(user);
      const res = await fetch("/api/candidate/me", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const { data } = await res.json() as { data: D | null };
        setCandidateData(data ?? {});
      }
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { fetchCandidate(); }, [fetchCandidate]);

  const close = () => { clearAllTimers(); setOpen(false); };

  // toggle clears all pending timers first so hover can't re-open after a click-close
  const toggle = () => { clearAllTimers(); setOpen(prev => !prev); };

  // hover on ☰ button: cancel any pending close, schedule open
  const handleMenuHover = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = setTimeout(() => setOpen(true), 150);
  };
  const handleMenuLeave = () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
  };

  // sidebar mouse enter/leave: cancel open timer, schedule close
  const handleSidebarEnter = () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };
  const handleSidebarLeave = () => {
    closeTimerRef.current = setTimeout(() => setOpen(false), 250);
  };

  return (
    <div style={{ background: "#EEF2F7", minHeight: "100vh" }}>
      <Topbar onToggle={toggle} onMenuHover={handleMenuHover} onMenuLeave={handleMenuLeave} />

      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          top: TOPBAR_H,
          background: "rgba(15, 23, 42, 0.45)",
          zIndex: 40,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.22s ease",
        }}
      />

      <Sidebar open={open} onClose={close} onMouseEnter={handleSidebarEnter} onMouseLeave={handleSidebarLeave} lang={lang} data={candidateData} />

      {/* Main content — always full width */}
      <div style={{ paddingTop: TOPBAR_H, minHeight: "100vh" }}>
        {children}
      </div>
      <ChatWidget />
    </div>
  );
}
