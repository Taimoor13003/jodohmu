"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users, Briefcase, UserCheck, MessageCircle,
  ChevronLeft, ChevronRight,
  Globe, LogOut, Menu,
} from "lucide-react";
import LogoIcon from "@/assets/jodohmu-logo.png";

/* ── constants ── */
const TOPBAR_H   = 52;
const SIDEBAR_W  = 220;
const SIDEBAR_COL = 60;

const NAV = [
  { href: "/admin/candidates", label: "Kandidat",      icon: <UserCheck      className="w-full h-full" />, color: "#C4294A", bg: "#FFF1F2" },
  { href: "/admin/chat",       label: "Chat",           icon: <MessageCircle  className="w-full h-full" />, color: "#0369A1", bg: "#EFF6FF" },
  { href: "/admin/workers",    label: "Workers",        icon: <Briefcase      className="w-full h-full" />, color: "#14B8A6", bg: "#F0FDFA" },
  { href: "/admin/users",      label: "Semua Pengguna", icon: <Users          className="w-full h-full" />, color: "#6366F1", bg: "#EEF2FF" },
];

/* ── sidebar ── */
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const w = collapsed ? SIDEBAR_COL : SIDEBAR_W;

  return (
    <div style={{
      position: "fixed",
      top: TOPBAR_H,
      left: 0,
      width: w,
      height: `calc(100vh - ${TOPBAR_H}px)`,
      background: "#fff",
      borderRight: "1px solid #E2E8F0",
      display: "flex",
      flexDirection: "column",
      zIndex: 40,
      transition: "width 0.2s ease",
      overflow: "hidden",
    }}>
      {/* Section label */}
      {!collapsed && (
        <div style={{ padding: "14px 16px 6px", flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.8px", textTransform: "uppercase" }}>
            Navigasi
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "6px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 10,
                background: active ? "#EEF2F7" : "transparent",
                color: active ? "#0F172A" : "#64748B",
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                textDecoration: "none",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "background 0.15s",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: active ? item.bg : "transparent",
                color: active ? item.color : "#CBD5E1",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s, color 0.15s",
              }}>
                <span style={{ width: 16, height: 16, display: "flex" }}>{item.icon}</span>
              </div>
              {!collapsed && (
                <>
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>
                  {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        style={{
          height: 44, flexShrink: 0,
          borderTop: "1px solid #E2E8F0",
          background: "transparent",
          cursor: "pointer",
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 6,
          padding: collapsed ? "0 12px" : "0 16px",
          color: "#94A3B8",
          fontSize: 12, fontWeight: 500,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        {collapsed
          ? <ChevronRight style={{ width: 16, height: 16 }} />
          : <><ChevronLeft style={{ width: 16, height: 16 }} /><span>Tutup sidebar</span></>
        }
      </button>
    </div>
  );
}

/* ── topbar ── */
function Topbar({ onToggle }: { onToggle: () => void }) {
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      height: TOPBAR_H,
      background: "#fff",
      borderBottom: "1px solid #E2E8F0",
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      gap: 12,
      zIndex: 50,
    }}>
      {/* Sidebar toggle */}
      <button
        onClick={onToggle}
        style={{
          width: 34, height: 34, borderRadius: 9,
          background: "transparent",
          border: "1px solid #E2E8F0",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#64748B",
          flexShrink: 0,
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <Menu style={{ width: 16, height: 16 }} />
      </button>

      {/* Logo */}
      <Link href="/admin/candidates" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image src={LogoIcon} alt="Jodohmu" height={28} style={{ width: "auto" }} priority />
      </Link>

      {/* Admin badge */}
      <span style={{
        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
        background: "#EEF2F7", color: "#1B3A6B",
      }}>
        Admin
      </span>

      <div style={{ flex: 1 }} />

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "id" ? "en" : "id")}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          fontSize: 12, fontWeight: 700,
          padding: "5px 12px", borderRadius: 20,
          border: "1px solid #E2E8F0",
          background: "#F8FAFC", color: "#1B3A6B",
          cursor: "pointer",
        }}
      >
        <Globe style={{ width: 13, height: 13 }} />
        {lang === "id" ? "EN" : "ID"}
      </button>

      {/* User + logout */}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "linear-gradient(135deg, #1B3A6B, #C4294A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
              {(user.displayName ?? user.email ?? "A")[0].toUpperCase()}
            </span>
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#64748B", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.displayName ?? user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: "1px solid #E2E8F0", background: "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#94A3B8", transition: "background 0.15s, color 0.15s",
            }}
            title="Logout"
            onMouseEnter={e => { e.currentTarget.style.background = "#FFF1F2"; e.currentTarget.style.color = "#C4294A"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; }}
          >
            <LogOut style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── layout ── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jm-admin-sidebar");
      if (saved !== null) setCollapsed(saved === "1");
    } catch {}
  }, []);

  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem("jm-admin-sidebar", next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const sw = collapsed ? SIDEBAR_COL : SIDEBAR_W;

  return (
    <div style={{ background: "#EEF2F7", minHeight: "100vh" }}>
      <Topbar onToggle={toggle} />
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div style={{
        marginLeft: sw,
        paddingTop: TOPBAR_H,
        transition: "margin-left 0.2s ease",
        minHeight: "100vh",
      }}>
        {children}
      </div>
    </div>
  );
}
