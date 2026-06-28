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

interface UserRow {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | null;
}

export default function WorkersPage() {
  const { role, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", note: "" });

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
        (data.users as Array<{ uid: string; name: string; email: string; role: string; createdAt: string | null }>).map(u => ({
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

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role, fetchUsers]);

  const reset = () => {
    setForm({ name: "", email: "", password: "", note: "" });
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
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          role: "worker",
          name: form.name,
          email: form.email,
          password: form.password,
          details: { note: form.note },
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
          <p className="text-muted-foreground">Internal team members with profile management access.</p>
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
                <label className="text-sm font-semibold text-[#0b3a86]">Temporary Password</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required placeholder="Temporary password"
                />
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
                {status === "loading" ? "Creating..." : "Create worker"}
              </Button>
              {status === "success" && <p className="text-sm font-semibold text-[#0b3a86]">Worker created.</p>}
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
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.uid}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {u.createdAt ? u.createdAt.toLocaleDateString() : "—"}
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
