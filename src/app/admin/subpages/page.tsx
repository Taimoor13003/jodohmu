"use client";

import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import SubpagesScreen from "@/components/admin/subpages-screen";

// Our public accounts: admins, and workers an admin has given "Manage social media"
export default function SubpagesPage() {
  const { role, permissions, loading } = useAuth();
  const { lang } = useLanguage();
  if (loading) return null;
  if (role !== "admin" && !(role === "worker" && permissions.includes("social"))) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center text-sm text-slate-500">
        {lang === "id" ? "Minta admin memberi Anda akses Kelola media sosial." : "Ask an admin to give you Manage social media access."}
      </div>
    );
  }
  return <Suspense fallback={null}><SubpagesScreen /></Suspense>;
}
