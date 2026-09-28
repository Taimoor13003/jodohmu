"use client";

import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import SubpagesScreen from "@/components/admin/subpages-screen";

// Posting to our public Instagram pages is admin-only
export default function SubpagesPage() {
  const { role, loading } = useAuth();
  const { lang } = useLanguage();
  if (loading) return null;
  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-lg p-8 text-center text-sm text-slate-500">
        {lang === "id" ? "Hanya admin yang bisa memposting ke subpage." : "Only admins can post to subpages."}
      </div>
    );
  }
  return <Suspense fallback={null}><SubpagesScreen /></Suspense>;
}
