"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Link2, ListChecks, Plus, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShareList } from "@/components/admin/share-panel";
import ShareBuilder from "@/components/admin/share-builder";
import { authFetch } from "@/components/admin/share-api";
import type { SharePurpose, ShareSummary } from "@/lib/share-types";

type StateFilter = "all" | ShareSummary["state"];

const C = {
  bg: "#EEF2F7", card: "#FFFFFF", border: "#E2E8F0",
  text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8",
  navy: "#1B3A6B", rose: "#C4294A",
};

const STATE_FILTERS: { key: StateFilter; id: string; en: string }[] = [
  { key: "all", id: "Semua", en: "All" },
  { key: "active", id: "Aktif", en: "Active" },
  { key: "expired", id: "Kedaluwarsa", en: "Expired" },
  { key: "exhausted", id: "Habis", en: "Used up" },
  { key: "revoked", id: "Dicabut", en: "Revoked" },
];

export default function AdminSharesPage() {
  const { role, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "id";
  const t = (id: string, en: string) => (l === "id" ? id : en);

  const [shares, setShares] = useState<ShareSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<StateFilter>("all");
  const [purposeFilter, setPurposeFilter] = useState<"all" | SharePurpose>("all");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await authFetch<{ shares: ShareSummary[] }>("/api/admin/shares");
      setShares(json.shares);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load links");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "admin" || role === "worker") load();
  }, [role, load]);

  const counts = useMemo(() => {
    const base: Record<StateFilter, number> = { all: shares.length, active: 0, expired: 0, exhausted: 0, revoked: 0 };
    for (const s of shares) base[s.state] += 1;
    return base;
  }, [shares]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return shares.filter(s => {
      if (stateFilter !== "all" && s.state !== stateFilter) return false;
      if (purposeFilter !== "all" && s.purpose !== purposeFilter) return false;
      if (!term) return true;
      return (
        s.recipientLabel.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        Object.values(s.candidateNames).some(n => n.toLowerCase().includes(term))
      );
    });
  }, [shares, stateFilter, purposeFilter, search]);

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: C.rose, borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (role !== "admin" && role !== "worker") {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="rounded-2xl border bg-white px-6 py-10 text-center" style={{ borderColor: C.border }}>
          <p className="text-[14px] font-semibold" style={{ color: C.body }}>{t("Halaman ini hanya untuk tim Jodohmu.", "This page is for the Jodohmu team only.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div className="mx-auto max-w-5xl px-4 py-6 pb-16 md:px-5">
        <div className="mb-6 flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#EFF6FF" }}>
            <Link2 className="h-4 w-4" style={{ color: C.navy }} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[21px] font-extrabold" style={{ color: C.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {t("Tautan Profil", "Profile Links")}
            </h1>
            <p className="text-[13px]" style={{ color: C.label }}>
              {t("Setiap profil yang dikirim ke luar: siapa yang melihat, berapa kali, dan apa jawaban mereka.", "Every profile sent out: who viewed it, how often, and what they answered.")}
            </p>
          </div>
          {role === "admin" && (
            <Link href="/admin/shares/questions" className="flex items-center gap-1.5 rounded-lg border bg-white px-3.5 py-2 text-[13px] font-bold" style={{ borderColor: C.border, color: C.body }}>
              <ListChecks className="h-4 w-4" /> {t("Pertanyaan bawaan", "Default questions")}
            </Link>
          )}
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.rose})` }}>
            <Plus className="h-4 w-4" /> {t("Buat tautan", "Create link")}
          </button>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {STATE_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStateFilter(f.key)}
              className="rounded-full border px-3.5 py-1.5 text-[12px] font-semibold"
              style={stateFilter === f.key ? { background: C.navy, borderColor: C.navy, color: "#fff" } : { background: "#fff", borderColor: C.border, color: C.label }}
            >
              {l === "id" ? f.id : f.en} · {counts[f.key]}
            </button>
          ))}
          <select
            value={purposeFilter}
            onChange={e => setPurposeFilter(e.target.value as "all" | SharePurpose)}
            className="h-8 rounded-full border bg-white px-3 text-[12px] font-semibold"
            style={{ borderColor: C.border, color: C.label }}
          >
            <option value="all">{t("Semua tujuan", "All purposes")}</option>
            <option value="matchmaking">{t("Perjodohan", "Matchmaking")}</option>
            <option value="promotion">{t("Promosi", "Promotion")}</option>
          </select>
          <div className="flex-1" />
          <div className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5" style={{ borderColor: C.border }}>
            <Search className="h-3.5 w-3.5" style={{ color: C.muted }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("Cari penerima, kandidat, kode…", "Search recipient, candidate, code…")}
              className="w-52 bg-transparent text-[12.5px] focus:outline-none"
              style={{ color: C.body }}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: C.rose, borderTopColor: "transparent" }} />
          </div>
        ) : (
          <ShareList shares={visible} lang={l} onChanged={next => setShares(prev => prev.map(s => (s.id === next.id ? next : s)))} />
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-3 sm:p-8" style={{ background: "rgba(15,23,42,0.55)" }}>
          <div className="my-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-white" style={{ boxShadow: "0 24px 64px rgba(15,23,42,0.28)" }}>
            <div className="flex items-center gap-3 border-b px-6 py-4" style={{ borderColor: C.border }}>
              <h2 className="flex-1 text-[15px] font-extrabold" style={{ color: C.text }}>{t("Buat tautan profil", "Create a profile link")}</h2>
              <button onClick={() => setCreating(false)} className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ borderColor: C.border }} aria-label="Close">
                <X className="h-4 w-4" style={{ color: C.muted }} />
              </button>
            </div>
            <ShareBuilder
              lang={l}
              onCancel={() => setCreating(false)}
              onCreated={share => {
                setShares(prev => [share, ...prev]);
                setCreating(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
