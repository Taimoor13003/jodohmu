"use client";

import { useAuth } from "@/context/AuthContext";
import { CallDeskApp } from "@/components/admin/calldesk/calldesk-app";

export default function CallDeskPage() {
  const { role, permissions, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0b3a86] border-t-transparent" />
      </div>
    );
  }

  if (role !== "admin" && !(role === "worker" && permissions.includes("calldesk"))) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-lg font-bold text-slate-900">No access</h1>
          <p className="mt-1 text-sm text-slate-500">Ask an admin to turn on Call Desk access for your account.</p>
        </div>
      </div>
    );
  }

  return <CallDeskApp />;
}
