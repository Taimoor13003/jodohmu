"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";
import { Lock, MessageCircle } from "lucide-react";

const WA = "https://wa.me/6281122210303?text=Assalamualaikum%2C%20saya%20ingin%20bertanya%20tentang%20akun%20Jodohmu%20saya.";

type D = Record<string, unknown>;
type Lang = "id" | "en";

interface ResultPageProps {
  dataKey: string;
  title: { id: string; en: string };
  lockedMsg: { id: string; en: string };
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  renderContent: (data: D, lang: Lang) => React.ReactNode;
}

export function ResultPage({ dataKey, title, lockedMsg, icon, iconBg, iconColor, renderContent }: ResultPageProps) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const l = (id: string, en: string) => lang === "id" ? id : en;

  const [data, setData] = useState<D | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const token = await getIdToken(auth.currentUser!);
      const res = await fetch("/api/candidate/me", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const { data: d } = await res.json() as { data: D | null };
        setData(d);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const value = data?.[dataKey];
  const locked = !value || (Array.isArray(value) && value.length === 0) || value === "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: iconColor }} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>
          <span className="w-5 h-5 flex">{icon}</span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: "#0F172A" }}>{title[lang]}</h1>
      </div>

      {locked ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 flex flex-col items-center text-center gap-5" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#F8FAFC" }}>
            <Lock className="w-7 h-7 text-slate-300" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-700 mb-1">{lockedMsg[lang]}</p>
            <p className="text-sm text-slate-400">
              {l("Fitur ini akan tersedia setelah tim Jodohmu menyelesaikan proses.", "This will be available once the Jodohmu team completes the process.")}
            </p>
          </div>
          <a href={WA} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(to right, #C4294A, #1B3A6B)" }}>
            <MessageCircle className="w-4 h-4" />
            {l("Hubungi Tim Kami", "Contact Our Team")}
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
          {renderContent(data!, lang)}
        </div>
      )}
    </div>
  );
}
