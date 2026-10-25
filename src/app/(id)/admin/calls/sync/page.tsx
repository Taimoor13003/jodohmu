"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { callDeskFetch } from "@/components/admin/calldesk/shared";

type Status = { syncedThrough: string | null; runs: number; lastRunBy: string | null };
type Contact = { id: string; name: string; phone: string; city: string; source: string; status: string; quality: string | null; adId: string | null; assignedName: string | null };
type Result = { written: boolean; report: string[]; problems: string[]; cursorMoved: boolean };

// Admin-only page for the on-demand CRM sync: review a plan built from chats and call recordings, then apply it
export default function CrmSyncPage() {
  const { role, loading } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [plan, setPlan] = useState("");
  const [previewed, setPreviewed] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await callDeskFetch<Status>("/api/admin/calldesk?sync=status"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }, []);

  useEffect(() => { if (role === "admin") loadStatus(); }, [role, loadStatus]);

  const run = async (write: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const parsed = JSON.parse(plan);
      const data = await callDeskFetch<Result>("/api/admin/calldesk", { method: "POST", body: JSON.stringify({ action: "sync", plan: parsed, write }) });
      setResult(data);
      setPreviewed(write ? null : plan);
      if (write) await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const loadContacts = async () => {
    setBusy(true);
    try {
      setContacts((await callDeskFetch<{ contacts: Contact[] }>("/api/admin/calldesk?sync=contacts")).contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;
  if (role !== "admin") return <p className="p-6 text-sm text-slate-500">Only admins can run the CRM sync.</p>;

  const button = "flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold disabled:opacity-50";
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      <Link href="/admin/calls" className="inline-flex items-center gap-1 text-sm font-bold text-[#1B3A6B] hover:underline"><ArrowLeft className="h-4 w-4" /> Call Desk</Link>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#C4294A]">Call Desk</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">CRM sync</h1>
        <p className="mt-1 text-sm text-slate-500">
          Last synced through: <span id="sync-cursor" className="font-semibold text-slate-800">{status?.syncedThrough ?? "never"}</span>
          {status?.lastRunBy ? ` · by ${status.lastRunBy}` : ""} · {status?.runs ?? 0} runs
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Current contacts {contacts ? `(${contacts.length})` : ""}</h2>
          <button type="button" disabled={busy} onClick={loadContacts} className={`${button} border border-slate-200 text-slate-700`}>Load contacts</button>
        </div>
        {contacts && (
          <div className="mt-3 max-h-80 overflow-auto">
            <table id="sync-contacts" className="w-full text-xs">
              <thead className="text-left text-slate-400"><tr><th className="py-1">Name</th><th>Phone</th><th>City</th><th>Source</th><th>Status</th><th>Quality</th><th>Ad</th><th>Assigned</th></tr></thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {contacts.map((c) => (
                  <tr key={c.id} data-id={c.id}><td className="py-1">{c.name}</td><td>{c.phone}</td><td>{c.city}</td><td>{c.source}</td><td>{c.status}</td><td>{c.quality ?? ""}</td><td>{c.adId ?? ""}</td><td>{c.assignedName ?? ""}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">Plan</h2>
        <textarea
          id="sync-plan"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          rows={12}
          placeholder='{"syncedThrough": "…", "contacts": [ … ]}'
          className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-mono text-xs"
        />
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={busy || !plan.trim()} onClick={() => run(false)} className={`${button} bg-[#1B3A6B] text-white`}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}Preview
          </button>
          {/* Applying is only possible for exactly the plan that was just previewed */}
          <button type="button" disabled={busy || previewed !== plan || Boolean(result?.problems.length)} onClick={() => run(true)} className={`${button} bg-[#C4294A] text-white`}>
            Apply
          </button>
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
      </section>

      {result && (
        <section id="sync-result" className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-900">{result.written ? "Applied" : "Preview — nothing written yet"}</h2>
          {result.problems.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-sm text-rose-700">{result.problems.map((p) => <li key={p}>{p}</li>)}</ul>
          )}
          <pre className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-700">{result.report.join("\n\n") || "Nothing to change."}</pre>
          {result.written && <p className="mt-2 text-xs text-slate-500">{result.cursorMoved ? "Sync time moved forward." : "Sync time not moved."}</p>}
        </section>
      )}
    </div>
  );
}
