"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { UserPlus, ExternalLink, MessageCircle } from "lucide-react";
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

const STATUS_OPTIONS: { value: string; label: string; className: string }[] = [
  { value: "new_lead",                label: "New Lead",               className: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "awaiting_discovery_call", label: "Discovery Call Pending", className: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "registered_looking",      label: "Searching Matches",      className: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "matched",                 label: "Matched",                className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "in_taaruf",               label: "In Ta'aruf",             className: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "family_meeting",          label: "Family Meeting Stage",   className: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "closed_success",          label: "Closed — Success",       className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "closed_withdrawn",        label: "Closed — Withdrawn",     className: "bg-gray-100 text-gray-500 border-gray-200" },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = Object.fromEntries(
  STATUS_OPTIONS.map(s => [s.value, { label: s.label, className: s.className }])
);

const LEAD_STATUSES = new Set(["new_lead", "awaiting_discovery_call"]);

export default function CandidatesPage() {
  const { role, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "leads">("all");
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
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSavingStatusUid(null);
    }
  };

  const leadCount = users.filter(u => LEAD_STATUSES.has(u.personStatus ?? "")).length;

  const cityOptions = Array.from(
    new Set(users.map(u => u.location?.trim()).filter((v): v is string => !!v))
  ).sort((a, b) => a.localeCompare(b));

  const visibleUsers = users.filter(u => {
    if (filter === "leads" && !LEAD_STATUSES.has(u.personStatus ?? "")) return false;
    if (cityFilter !== "all" && (u.location ?? "").trim() !== cityFilter) return false;
    if (genderFilter !== "all" && (u.gender ?? "") !== genderFilter) return false;
    const age = u.age != null ? Number(u.age) : NaN;
    if (minAge && (Number.isNaN(age) || age < Number(minAge))) return false;
    if (maxAge && (Number.isNaN(age) || age > Number(maxAge))) return false;
    return true;
  });

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
          <CardHeader><CardTitle>Unauthorized</CardTitle></CardHeader>
          <CardContent>You need admin access to view this page.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#9B2242]">Candidates</h1>
          <p className="text-muted-foreground">All registered candidates in the matchmaking program.</p>
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
          Add candidate
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${filter === "all" ? "bg-[#0b3a86] text-white border-[#0b3a86]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
        >
          All ({users.length})
        </button>
        <button
          onClick={() => setFilter("leads")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${filter === "leads" ? "bg-[#9B2242] text-white border-[#9B2242]" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
        >
          New Leads ({leadCount})
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">City</label>
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-700"
          >
            <option value="all">All cities</option>
            {cityOptions.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Gender</label>
          <select
            value={genderFilter}
            onChange={e => setGenderFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-700"
          >
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Age range</label>
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
            Clear filters
          </button>
        )}

        <div className="ml-auto text-xs text-muted-foreground self-end pb-1.5">
          Showing {visibleUsers.length} of {users.length}
        </div>
      </div>

      <Card className="border-0 shadow-xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : visibleUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {filter === "leads" ? "No new leads right now." : "No candidates found."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
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
                      <TableCell className="text-muted-foreground capitalize">{u.gender ?? "—"}</TableCell>
                      <TableCell>
                        <select
                          value={u.personStatus ?? ""}
                          disabled={!u.canEdit || savingStatusUid === u.uid}
                          title={u.canEdit ? undefined : "Only the assigned worker or an admin can change this"}
                          onChange={e => updateStatus(u.uid, e.target.value)}
                          className={`px-2 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap disabled:opacity-50 ${badge ? badge.className : "bg-gray-100 text-gray-400 border-gray-200"}`}
                        >
                          {!u.personStatus && <option value="" disabled>— Set status —</option>}
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {u.createdAt ? u.createdAt.toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/candidates/${u.uid}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B2242] hover:underline"
                          >
                            View profile <ExternalLink className="h-3 w-3" />
                          </Link>
                          <Link
                            href={`/admin/chat?uid=${u.uid}&name=${encodeURIComponent(u.name)}`}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-[#0b3a86]"
                            title={`Chat with ${u.name}`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Link>
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
