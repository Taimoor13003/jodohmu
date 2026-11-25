"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { UserPlus, ExternalLink, MessageCircle } from "lucide-react";
import { SOCIAL_PAGES } from "@/lib/social";
import Link from "next/link";

interface UserRow {
  uid: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  personStatus: string | null;
  createdAt: Date | null;
  location: string | null;
  age: string | number | null;
  gender: string | null;
  canEdit: boolean;
}

const STATUS_OPTIONS: { value: string; id: string; en: string; className: string }[] = [
  { value: "new_lead",                id: "Lead Baru",                  en: "New Lead",               className: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "awaiting_discovery_call", id: "Menunggu Discovery Call",    en: "Discovery Call Pending", className: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "registered_looking",      id: "Mencari Pasangan",           en: "Searching Matches",      className: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "matched",                 id: "Sudah Dipasangkan",          en: "Matched",                className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "in_taaruf",               id: "Dalam Perkenalan",           en: "In Introduction",        className: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "family_meeting",          id: "Tahap Pertemuan Keluarga",   en: "Family Meeting Stage",   className: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "closed_success",          id: "Selesai — Berhasil",         en: "Closed — Success",       className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "closed_withdrawn",        id: "Selesai — Mundur",           en: "Closed — Withdrawn",     className: "bg-gray-100 text-gray-500 border-gray-200" },
];

const STATUS_BADGE: Record<string, { className: string }> = Object.fromEntries(
  STATUS_OPTIONS.map(s => [s.value, { className: s.className }])
);

const LEAD_STATUSES = new Set(["new_lead", "awaiting_discovery_call"]);

export default function CandidatesPage() {
  const { role, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const l = (id: string, en: string) => (lang === "en" ? en : id);
  const genderLabel = (g: string | null) => g === "male" ? l("Pria", "Male") : g === "female" ? l("Wanita", "Female") : (g ?? "—");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "leads" | "mine">("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [minAge, setMinAge] = useState<string>("");
  const [maxAge, setMaxAge] = useState<string>("");
  const [savingStatusUid, setSavingStatusUid] = useState<string | null>(null);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const current = auth.currentUser;
      if (!current) return;
      const token = await current.getIdToken();
      const res = await fetch(`/api/admin/list-users?role=candidate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setUsers(
        (data.users as Array<{ uid: string; name: string; email: string; role: string; phone: string | null; personStatus: string | null; createdAt: string | null; location: string | null; age: string | number | null; gender: string | null; canEdit?: boolean }>).map(u => ({
          canEdit: false,
          ...u,
          createdAt: u.createdAt ? new Date(u.createdAt) : null,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (uid: string, personStatus: string) => {
    const previous = users;
    setUsers(prev => prev.map(u => (u.uid === uid ? { ...u, personStatus } : u)));
    setSavingStatusUid(uid);
    try {
      const current = auth.currentUser;
      if (!current) throw new Error("Not signed in");
      const token = await current.getIdToken();
      const res = await fetch(`/api/admin/candidate/${uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ personStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update status");
    } catch (err) {
      console.error(err);
      setUsers(previous);
      alert(err instanceof Error ? err.message : l("Gagal mengubah status", "Failed to update status"));
    } finally {
      setSavingStatusUid(null);
    }
  };

  const leadCount = users.filter(u => LEAD_STATUSES.has(u.personStatus ?? "")).length;
  const mineCount = users.filter(u => u.canEdit).length;

  const cityOptions = Array.from(
    new Set(users.map(u => u.location?.trim()).filter((v): v is string => !!v))
  ).sort((a, b) => a.localeCompare(b));

  const visibleUsers = users.filter(u => {
    if (filter === "mine" && !u.canEdit) return false;
    if (filter === "leads" && !LEAD_STATUSES.has(u.personStatus ?? "")) return false;
    if (cityFilter !== "all" && (u.location ?? "").trim() !== cityFilter) return false;
    if (genderFilter !== "all" && (u.gender ?? "") !== genderFilter) return false;
    const age = u.age != null ? Number(u.age) : NaN;
    if (minAge && (Number.isNaN(age) || age < Number(minAge))) return false;
    if (maxAge && (Number.isNaN(age) || age > Number(maxAge))) return false;
    return true;
  }).sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));

  const hasActiveFilters = cityFilter !== "all" || genderFilter !== "all" || minAge !== "" || maxAge !== "";
  const resetFilters = () => {
    setCityFilter("all");
    setGenderFilter("all");
    setMinAge("");
    setMaxAge("");
  };

  useEffect(() => {
    if (role === "admin" || role === "worker") fetchUsers();
  }, [role, fetchUsers]);

  // Workers start on the clients they own, so a newly added one is right there
  useEffect(() => {
    if (role === "worker") setFilter("mine");
  }, [role]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#9B2242] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (role !== "admin" && role !== "worker") {
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader><CardTitle>{l("Tidak punya akses", "Unauthorized")}</CardTitle></CardHeader>
          <CardContent>{l("Halaman ini hanya untuk admin.", "You need admin access to view this page.")}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#9B2242]">{l("Kandidat", "Candidates")}</h1>
          <p className="text-muted-foreground">
            {role === "worker"
              ? l("Klien yang Anda tambahkan atau ditugaskan ke Anda ada di Klien saya. Terbaru di atas.", "Clients you added or are assigned to are under My clients. Newest first.")
              : l("Semua kandidat yang terdaftar di program perjodohan.", "All registered candidates in the matchmaking program.")}
          </p>
        </div>

        <button
          onClick={() => router.push("/admin/users?create=candidate")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 999, border: "none",
            background: "linear-gradient(135deg, #9B2242, #0b3a86)",
            color: "#fff", fontSize: 13.5, fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <UserPlus style={{ width: 16, height: 16 }} />
          {l("Tambah kandidat", "Add candidate")}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {role === "worker" && (
          <button
            onClick={() => setFilter("mine")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${filter === "mine" ? "bg-[#0b3a86] text-white border-[#0b3a86]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
          >
            {l("Klien saya", "My clients")} ({mineCount})
          </button>
        )}
        <button
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${filter === "all" ? "bg-[#0b3a86] text-white border-[#0b3a86]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
        >
          {l("Semua", "All")} ({users.length})
        </button>
        <button
          onClick={() => setFilter("leads")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${filter === "leads" ? "bg-[#9B2242] text-white border-[#9B2242]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
        >
          {l("Lead Baru", "New Leads")} ({leadCount})
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{l("Kota", "City")}</label>
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-700"
          >
            <option value="all">{l("Semua kota", "All cities")}</option>
            {cityOptions.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{l("Jenis kelamin", "Gender")}</label>
          <select
            value={genderFilter}
            onChange={e => setGenderFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-700"
          >
            <option value="all">{l("Semua", "All")}</option>
            <option value="male">{l("Pria", "Male")}</option>
            <option value="female">{l("Wanita", "Female")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{l("Rentang usia", "Age range")}</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minAge}
              onChange={e => setMinAge(e.target.value)}
              className="h-9 w-20 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-700"
            />
            <span className="text-slate-400 text-sm">–</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxAge}
              onChange={e => setMaxAge(e.target.value)}
              className="h-9 w-20 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-700"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50"
          >
            {l("Hapus filter", "Clear filters")}
          </button>
        )}

        <div className="ml-auto text-xs text-muted-foreground self-end pb-1.5">
          {l(`Menampilkan ${visibleUsers.length} dari ${users.length}`, `Showing ${visibleUsers.length} of ${users.length}`)}
        </div>
      </div>

      <Card className="border-0 shadow-xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">{l("Memuat…", "Loading…")}</div>
          ) : visibleUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {filter === "leads"
                ? l("Belum ada lead baru.", "No new leads right now.")
                : filter === "mine"
                  ? l("Anda belum menambahkan klien — pakai “Tambah kandidat” untuk membuatnya.", "You haven't added any clients yet — use “Add candidate” to create one.")
                  : l("Tidak ada kandidat.", "No candidates found.")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{l("Nama", "Name")}</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>{l("Telepon", "Phone")}</TableHead>
                  <TableHead>{l("Kota", "City")}</TableHead>
                  <TableHead>{l("Usia", "Age")}</TableHead>
                  <TableHead>{l("Gender", "Gender")}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>{l("Dibuat", "Created")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleUsers.map(u => {
                  const badge = u.personStatus ? STATUS_BADGE[u.personStatus] : null;
                  return (
                    <TableRow key={u.uid}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="text-muted-foreground">{u.phone ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.location ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.age ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground capitalize">{genderLabel(u.gender)}</TableCell>
                      <TableCell>
                        <select
                          value={u.personStatus ?? ""}
                          disabled={!u.canEdit || savingStatusUid === u.uid}
                          title={u.canEdit ? undefined : l("Hanya worker yang ditugaskan atau admin yang bisa mengubah ini", "Only the assigned worker or an admin can change this")}
                          onChange={e => updateStatus(u.uid, e.target.value)}
                          className={`px-2 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap disabled:opacity-50 ${badge ? badge.className : "bg-gray-100 text-gray-400 border-gray-200"}`}
                        >
                          {!u.personStatus && <option value="" disabled>{l("— Pilih status —", "— Set status —")}</option>}
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt[lang === "en" ? "en" : "id"]}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {u.createdAt ? u.createdAt.toLocaleDateString(lang === "en" ? "en-GB" : "id-ID") : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/candidates/${u.uid}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B2242] hover:underline"
                          >
                            {l("Lihat profil", "View profile")} <ExternalLink className="h-3 w-3" />
                          </Link>
                          <Link
                            href={`/admin/chat?uid=${u.uid}&name=${encodeURIComponent(u.name)}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-[#0b3a86]"
                            title={l(`Chat dengan ${u.name}`, `Chat with ${u.name}`)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Link>
                          {role === "admin" && (
                            <select
                              value=""
                              onChange={e => router.push(`/admin/subpages?page=${e.target.value}&profile=${u.uid}`)}
                              title={l("Posting profil ini ke salah satu subpage Instagram kami", "Post this profile on one of our Instagram subpages")}
                              className="h-7 rounded-full border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-500 hover:border-slate-300"
                            >
                              <option value="" disabled>{l("Posting ke subpage…", "Post to subpage…")}</option>
                              {SOCIAL_PAGES.map(p => (
                                <option key={p.key} value={p.key}>@{p.handle}{p.connected ? "" : l(" (belum terhubung)", " (not connected)")}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
