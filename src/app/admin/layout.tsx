"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users, Briefcase, UserCheck, MessageCircle,
  Globe, LogOut, Menu, Bell, MessageSquareText,
} from "lucide-react";
import LogoIcon from "@/assets/jodohmu-logo.png";

interface AdminNotification {
  id: string;
  uid: string;
  name: string;
  phone: string | null;
  waLink: string | null;
  city: string | null;
  read: boolean;
  createdAt: string | null;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/* ── notification bell ── */
function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) return;
    try {
      const token = await current.getIdToken();
      const res = await fetch("/api/admin/notifications", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json() as { notifications: AdminNotification[]; unreadCount: number };
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    const current = auth.currentUser;
    if (!current) return;
    const token = await current.getIdToken();
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    const current = auth.currentUser;
    if (!current) return;
    const token = await current.getIdToken();
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ markAllRead: true }),
    });
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: 34, height: 34, borderRadius: 9, position: "relative",
          background: "transparent", border: "1px solid #E2E8F0", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B",
        }}
        title="Notifications"
      >
        <Bell style={{ width: 16, height: 16 }} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8,
            background: "#C4294A", color: "#fff", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: 42, right: 0, width: 340, maxHeight: 420, overflowY: "auto",
          background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0",
          boxShadow: "0 12px 32px rgba(15,23,42,0.15)", zIndex: 60,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: 11.5, fontWeight: 700, color: "#0b3a86", background: "transparent", border: "none", cursor: "pointer" }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: "24px 14px", textAlign: "center", fontSize: 12.5, color: "#94A3B8" }}>
              No notifications yet.
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id}
                onClick={() => { markRead(n.id); setOpen(false); router.push(`/admin/candidates/${n.uid}`); }}
                style={{
                  display: "flex", gap: 10, padding: "12px 14px", cursor: "pointer",
                  background: n.read ? "transparent" : "#FFF7ED",
                  borderBottom: "1px solid #F8FAFC",
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: "#EEF2F7", color: "#9B2242",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MessageSquareText style={{ width: 14, height: 14 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>
                    {n.name} {!n.read && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#C4294A", marginLeft: 4 }} />}
                  </p>
                  <p style={{ fontSize: 11.5, color: "#64748B", marginBottom: 4 }}>
                    New profile — discovery call not done yet{n.city ? ` · ${n.city}` : ""}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {n.waLink && (
                      <a href={n.waLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                        style={{ fontSize: 11, fontWeight: 700, color: "#059669", textDecoration: "none" }}>
                        Message on WhatsApp →
                      </a>
                    )}
                    <span style={{ fontSize: 10.5, color: "#CBD5E1" }}>{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── constants ── */
const TOPBAR_H  = 52;
const SIDEBAR_W = 220;

const NAV = [
  { href: "/admin/candidates", label: "Kandidat",      icon: <UserCheck      className="w-full h-full" />, color: "#C4294A", bg: "#FFF1F2" },
  { href: "/admin/chat",       label: "Chat",           icon: <MessageCircle  className="w-full h-full" />, color: "#0369A1", bg: "#EFF6FF" },
  { href: "/admin/workers",    label: "Workers",        icon: <Briefcase      className="w-full h-full" />, color: "#14B8A6", bg: "#F0FDFA" },
  { href: "/admin/users",      label: "Semua Pengguna", icon: <Users          className="w-full h-full" />, color: "#6366F1", bg: "#EEF2FF" },
];

/* ── sidebar ── */
function Sidebar({ open, onClose, onSidebarEnter, onSidebarLeave, onLogout, role }: {
  open: boolean; onClose: () => void;
  onSidebarEnter: () => void; onSidebarLeave: () => void;
  onLogout: () => void;
  role: string;
}) {
  const pathname = usePathname();
  const nav = role === "worker" ? NAV.filter(item => item.href === "/admin/candidates" || item.href === "/admin/chat") : NAV;

  return (
    <div
      onMouseEnter={onSidebarEnter}
      onMouseLeave={onSidebarLeave}
      style={{
        position: "fixed",
        top: TOPBAR_H,
        left: 0,
        width: SIDEBAR_W,
        height: `calc(100vh - ${TOPBAR_H}px)`,
        background: "#fff",
        borderRight: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        zIndex: 45,
        transform: open ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
        transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: open ? "4px 0 24px rgba(0,0,0,0.10)" : "none",
        overflow: "hidden",
      }}
    >
      {/* Section label */}
      <div style={{ padding: "14px 16px 6px", flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.8px", textTransform: "uppercase" }}>
          Navigasi
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "6px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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
              <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>
              {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          height: 44, flexShrink: 0,
          borderTop: "1px solid #E2E8F0",
          background: "transparent",
          cursor: "pointer",
          display: "flex", alignItems: "center",
          gap: 8, padding: "0 16px",
          color: "#94A3B8", fontSize: 12.5, fontWeight: 500,
          transition: "background 0.15s, color 0.15s",
          width: "100%",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#FFF1F2"; e.currentTarget.style.color = "#C4294A"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; }}
      >
        <LogOut style={{ width: 15, height: 15, flexShrink: 0 }} />
        <span>Logout</span>
      </button>
    </div>
  );
}

/* ── topbar ── */
function Topbar({ onToggle, onMenuHover, onMenuLeave }: {
  onToggle: () => void;
  onMenuHover: () => void;
  onMenuLeave: () => void;
}) {
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
      {/* Sidebar toggle — opens on click or hover */}
      <button
        onClick={onToggle}
        onMouseEnter={onMenuHover}
        onMouseLeave={onMenuLeave}
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
        onFocus={e => (e.currentTarget.style.background = "#F8FAFC")}
        onBlur={e => (e.currentTarget.style.background = "transparent")}
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

      <NotificationBell />

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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();
  const openTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = () => {
    if (openTimerRef.current)  clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  // close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

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

  // sidebar mouse enter/leave handlers
  const handleSidebarEnter = () => {
    if (openTimerRef.current)  clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };
  const handleSidebarLeave = () => {
    closeTimerRef.current = setTimeout(() => setOpen(false), 250);
  };

  return (
    <div style={{ background: "#EEF2F7", minHeight: "100vh" }}>
      <Topbar onToggle={toggle} onMenuHover={handleMenuHover} onMenuLeave={handleMenuLeave} />

      {/* Backdrop — darkens the content area when sidebar is open */}
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

      <Sidebar
        open={open}
        onClose={close}
        onSidebarEnter={handleSidebarEnter}
        onSidebarLeave={handleSidebarLeave}
        onLogout={async () => { await signOut(auth); router.push("/login"); }}
        role={role}
      />

      {/* Main content — always full width, never pushed by sidebar */}
      <div style={{
        paddingTop: TOPBAR_H,
        minHeight: "100vh",
      }}>
        {children}
      </div>
    </div>
  );
}
