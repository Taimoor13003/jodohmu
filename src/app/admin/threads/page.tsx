"use client";

import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import ThreadsScreen from "@/components/admin/threads-screen";

// Speaking on our Threads accounts is admin-only
export default function ThreadsPage() {
  const { role, loading } = useAuth();
  const { lang } = useLanguage();
  if (loading) return null;
  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-lg p-8 text-center text-sm text-slate-500">
        {lang === "id" ? "Hanya admin yang bisa mengelola Threads." : "Only admins can manage Threads."}
      </div>
    );
  }
  return <Suspense fallback={null}><ThreadsScreen /></Suspense>;
}
