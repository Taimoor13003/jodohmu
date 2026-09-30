"use client";

import { useAuth } from "@/context/AuthContext";
import { MitraDesk } from "@/components/admin/mitra/mitra-desk";

// Potential and signed referral partners. Admins, and workers an admin has given Mitra access.
export default function MitraAdminPage() {
  const { role, permissions, loading } = useAuth();

  if (loading) return null;
  if (role !== "admin" && !(role === "worker" && permissions.includes("mitra"))) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-lg font-bold text-slate-900">No access</h1>
          <p className="mt-1 text-sm text-slate-500">Ask an admin to give you Mitra access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-[#C4294A]">Admin</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Mitra</h1>
      <p className="mt-1 text-sm text-slate-500">Calon mitra yang perlu dihubungi, dan mitra yang sudah bergabung.</p>
      <div className="mt-5">
        <MitraDesk />
      </div>
    </div>
  );
}
