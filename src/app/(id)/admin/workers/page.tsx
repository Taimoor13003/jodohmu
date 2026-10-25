"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TEAM_PERMISSIONS, TEAM_POSITIONS, togglePermission } from "@/lib/calldesk";

interface UserRow {
  uid: string;
  name: string;
  email: string;
  role: string;
  position: string | null;
  permissions: string[];
  pending?: boolean;
  createdAt: Date | null;
}

/* Position + Call Desk access for one worker; saves immediately on change */
function TeamAccess({ worker, onSaved }: { worker: UserRow; onSaved: (next: UserRow) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (position: string | null, permissions: string[]) => {
    setSaving(true);
    setError(null);
    try {
      const current = auth.currentUser;
      if (!current) throw new Error("Not authenticated");
      const token = await current.getIdToken();
      const res = await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(worker.pending
          ? { inviteEmail: worker.email, position, permissions }
          : { uid: worker.uid, position, permissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      onSaved({ ...worker, position: data.position, permissions: data.permissions });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (permission: string) => save(worker.position, togglePermission(worker.permissions, permission));

  return (
    <div className="min-w-[210px] space-y-2">
      <select
        value={worker.position ?? ""}
        disabled={saving}
        onChange={e => save(e.target.value || null, worker.permissions)}
        className="h-9 w-full max-w-[200px] rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700"
      >
        <option value="">No position</option>
        {TEAM_POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label.en}</option>)}
      </select>
      <div className="flex flex-col gap-1.5">
        {TEAM_PERMISSIONS.map(p => (
          <label key={p.value} title={p.hint.en} className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-xs text-slate-600">
            <input
              type="checkbox"
              checked={worker.permissions.includes(p.value)}
              disabled={saving}
              onChange={() => toggle(p.value)}
              className="h-3.5 w-3.5 accent-[#0b3a86]"
            />
            {p.label.en}
          </label>
        ))}
      </div>
      {error && <p className="text-xs font-semibold text-[#9B2242]">{error}</p>}
    </div>
  );
}

export default function WorkersPage() {
  const { role, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", note: "", position: "", permissions: [] as string[], method: "google" as "google" | "password" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const current = auth.currentUser;
      if (!current) return;
      const token = await current.getIdToken();
      const res = await fetch("/api/admin/list-users?role=worker", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setUsers(
        (data.users as Array<{ uid: string; name: string; email: string; role: string; position?: string | null; permissions?: string[]; pending?: boolean; createdAt: string | null }>).map(u => ({
          ...u,
          position: u.position ?? null,
          permissions: u.permissions ?? [],
          createdAt: u.createdAt ? new Date(u.createdAt) : null,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role, fetchUsers]);

  const cancelInvite = async (email: string) => {
    if (!window.confirm(`Cancel the invite for ${email}?`)) return;
    const current = auth.currentUser;
    if (!current) return;
    const token = await current.getIdToken();
    const res = await fetch(`/api/admin/team?inviteEmail=${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setUsers(prev => prev.filter(u => !(u.pending && u.email === email)));
  };

  const reset = () => {
    setForm({ name: "", email: "", password: "", note: "", position: "", permissions: [], method: "google" });
    setStatus("idle");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const current = auth.currentUser;
      if (!current) throw new Error("Not authenticated");
      const token = await current.getIdToken();
      // Google invites need no password: the person becomes a worker on their first Google sign-in
      const res = form.method === "google"
        ? await fetch("/api/admin/team", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: form.name, email: form.email, position: form.position || null, permissions: form.permissions }),
          })
        : await fetch("/api/admin/create-user", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              role: "worker",
              name: form.name,
              email: form.email,
              password: form.password,
              details: { note: form.note },
              position: form.position || null,
              permissions: form.permissions,
            }),
          });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create worker");
      }
      setStatus("success");
      await fetchUsers();
      setTimeout(() => { setDialogOpen(false); reset(); }, 1200);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#0b3a86] border-t-transparent animate-spin" />
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
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-[#0b3a86] flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0b3a86]">Workers</h1>
          <p className="text-muted-foreground">Internal team members. Set each person&apos;s position and what they can access.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) reset(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-[#9B2242] to-[#0b3a86] text-white gap-2">
              <UserPlus className="h-4 w-4" /> Add worker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#0b3a86]">Add Worker</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#0b3a86]">Full Name</label>
                <Input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required placeholder="Full name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#0b3a86]">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required placeholder="worker@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#0b3a86]">Sign-in method</label>
                <div className="grid grid-cols-2 gap-2">
                  {([["google", "Google (no password)"], ["password", "Email + password"]] as const).map(([value, text]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, method: value })}
                      className={`rounded-md border px-3 py-2 text-sm font-semibold ${form.method === value ? "border-[#0b3a86] bg-[#0b3a86] text-white" : "border-input text-slate-600"}`}
                    >
                      {text}
                    </button>
                  ))}
                </div>
                {form.method === "google" && (
                  <p className="text-xs text-muted-foreground">They sign in with Google using this email and get worker access automatically.</p>
                )}
              </div>
              {form.method === "password" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#0b3a86]">Temporary Password</label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required placeholder="Temporary password"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#0b3a86]">Position</label>
                <select
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                >
                  <option value="">No position</option>
                  {TEAM_POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label.en}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#0b3a86]">Access</label>
                {TEAM_PERMISSIONS.map(p => (
                  <label key={p.value} className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-[#0b3a86]"
                      checked={form.permissions.includes(p.value)}
                      onChange={() => setForm({ ...form, permissions: togglePermission(form.permissions, p.value) })}
                    />
                    <span>{p.label.en}<span className="block text-xs text-muted-foreground">{p.hint.en}</span></span>
                  </label>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#0b3a86]">Note (optional)</label>
                <Textarea
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  placeholder="Role, department, notes..."
                  rows={2}
                />
              </div>
              <Button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-full bg-gradient-to-r from-[#9B2242] to-[#0b3a86] text-white"
              >
                {status === "loading" ? "Saving..." : form.method === "google" ? "Invite worker" : "Create worker"}
              </Button>
              {status === "success" && <p className="text-sm font-semibold text-[#0b3a86]">{form.method === "google" ? "Invite saved." : "Worker created."}</p>}
              {status === "error" && error && <p className="text-sm font-semibold text-[#9B2242]">{error}</p>}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No workers found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Position &amp; access</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.uid}>
                    <TableCell className="font-medium">
                      {u.name}
                      {u.pending && (
                        <span className="mt-1 block w-fit rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                          Waiting for first Google sign-in
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <TeamAccess worker={u} onSaved={next => setUsers(prev => prev.map(row => row.uid === next.uid ? next : row))} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {u.createdAt ? u.createdAt.toLocaleDateString() : "—"}
                      {u.pending && (
                        <button type="button" onClick={() => cancelInvite(u.email)} className="mt-1 block text-xs font-semibold text-[#9B2242] hover:underline">
                          Cancel invite
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
