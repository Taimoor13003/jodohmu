"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { UserPlus, ExternalLink } from "lucide-react";
import Link from "next/link";

interface UserRow {
  uid: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  personStatus: string | null;
  createdAt: Date | null;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  new_lead:                { label: "New Lead",              className: "bg-amber-50 text-amber-700 border-amber-200" },
  awaiting_discovery_call: { label: "Discovery Call Pending", className: "bg-sky-50 text-sky-700 border-sky-200" },
};

const LEAD_STATUSES = new Set(["new_lead", "awaiting_discovery_call"]);

export default function CandidatesPage() {
  const { role, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "leads">("all");
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const current = auth.currentUser;
      if (!current) return;
      const token = await current.getIdToken();
      const res = await fetch("/api/admin/list-users?role=candidate", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setUsers(
        (data.users as Array<{ uid: string; name: string; email: string; role: string; phone: string | null; personStatus: string | null; createdAt: string | null }>).map(u => ({
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

  const leadCount = users.filter(u => LEAD_STATUSES.has(u.personStatus ?? "")).length;
  const visibleUsers = filter === "leads" ? users.filter(u => LEAD_STATUSES.has(u.personStatus ?? "")) : users;

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role, fetchUsers]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#9B2242] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (role !== "admin") {
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
                      <TableCell>
                        {badge ? (
                          <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap ${badge.className}`}>
                            {badge.label}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {u.createdAt ? u.createdAt.toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/candidates/${u.uid}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B2242] hover:underline"
                        >
                          View profile <ExternalLink className="h-3 w-3" />
                        </Link>
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
