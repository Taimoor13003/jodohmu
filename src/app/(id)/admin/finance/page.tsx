"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { jakartaDay, type CallDeskContact } from "@/lib/calldesk";
import { callDeskFetch } from "@/components/admin/calldesk/shared";
import { FinanceView } from "@/components/admin/calldesk/finance";

// Company finances: client payments against expenses. Admins only.
export default function FinancePage() {
  const { role, loading } = useAuth();
  const [contacts, setContacts] = useState<CallDeskContact[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const today = jakartaDay();
      const data = await callDeskFetch<{ contacts: CallDeskContact[] }>(`/api/admin/calldesk?from=${today}&to=${today}`);
      setContacts(data.contacts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);

  useEffect(() => { if (role === "admin") load(); }, [role, load]);

  if (loading) return null;
  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-lg font-bold text-slate-900">No access</h1>
          <p className="mt-1 text-sm text-slate-500">Only admins can see the company finances.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-[#C4294A]">Admin</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Keuangan</h1>
      <p className="mt-1 text-sm text-slate-500">Pendapatan dari klien dan semua pengeluaran perusahaan.</p>
      <div className="mt-5">
        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p>
          : contacts ? <FinanceView contacts={contacts} />
          : <Loader2 className="h-6 w-6 animate-spin text-[#1B3A6B]" />}
      </div>
    </div>
  );
}
