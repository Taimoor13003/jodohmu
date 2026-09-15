"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { getIdToken } from "firebase/auth";
import { ChevronRight, Clock3, Eye, Lock, MessageCircle } from "lucide-react";
import {
  RESULT_SECTIONS,
  formatResultValue,
  optionTone,
  resultStatus,
  type ResultSectionKey,
  type Tone,
} from "@/lib/candidate-results";

const WA = "https://wa.me/6281122210303?text=Assalamualaikum%2C%20saya%20ingin%20bertanya%20tentang%20akun%20Jodohmu%20saya.";

type D = Record<string, unknown>;
type Lang = "id" | "en";

const TONE_CLS: Record<Tone, string> = {
  good:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  caution: "bg-amber-50 text-amber-700 border-amber-200",
  bad:     "bg-rose-50 text-rose-700 border-rose-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

const SECTION_HREF: Record<ResultSectionKey, string> = {
  psych:      "/dashboard/psych-test",
  background: "/dashboard/background-check",
  identity:   "/dashboard/verification",
  assessment: "/dashboard/assessment",
};

/** One-line summary of a finished result, for cards elsewhere in the dashboard. */
export function ResultHeadline({ data, section, lang }: { data: D; section: ResultSectionKey; lang: Lang }) {
  const s = RESULT_SECTIONS[section];
  const field = s.fields.find(f => f.key === s.headlineKey);
  const text = field ? formatResultValue(field, data[s.headlineKey], lang) : null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {text && field ? (
        <span className={`rounded-full border px-2.5 py-1 text-[11.5px] font-bold ${TONE_CLS[optionTone(data[s.headlineKey])]}`}>
          {field.label[lang]}: {text}
        </span>
      ) : (
        <span className="text-[12.5px] text-slate-500">{lang === "id" ? "Hasil sudah tersedia." : "Your result is ready."}</span>
      )}
      <Link href={SECTION_HREF[section]} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#C4294A] hover:underline">
        {lang === "id" ? "Lihat detail" : "View details"}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

type ResultPageProps = {
  title: { id: string; en: string };
  lockedMsg: { id: string; en: string };
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
} & (
  | { section: ResultSectionKey }
  /** a single free-form field with its own renderer (matches, ta'aruf history) */
  | { dataKey: string; renderContent: (data: D, lang: Lang) => React.ReactNode }
);

/** Read-only view of something the Jodohmu team recorded. Candidates can't edit any of it. */
export function ResultPage(props: ResultPageProps) {
  const { title, lockedMsg, icon, iconBg, iconColor } = props;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: iconColor }} />
      </div>
    );
  }

  const custom = "dataKey" in props ? props : null;
  const customValue = custom ? data?.[custom.dataKey] : undefined;
  const s = RESULT_SECTIONS["section" in props ? props.section : "psych"];
  const status = custom
    ? (customValue === null || customValue === undefined || customValue === "" || (Array.isArray(customValue) && customValue.length === 0) ? "not_done" : "done")
    : data ? resultStatus(data, s.key) : "not_done";
  const rows = data && !custom
    ? s.fields
        .map(f => ({ field: f, text: formatResultValue(f, data[f.key], lang), raw: data[f.key] }))
        .filter(r => r.text)
    : [];
  const legacy = data && !custom && s.legacyKey && typeof data[s.legacyKey] === "string" ? String(data[s.legacyKey]).trim() : "";
  const headline = rows.find(r => r.field.key === s.headlineKey);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg, color: iconColor }}>
          <span className="w-5 h-5 flex">{icon}</span>
        </div>
        <h1 className="text-xl font-bold" style={{ color: "#0F172A" }}>{title[lang]}</h1>
      </div>

      {status !== "done" ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 flex flex-col items-center text-center gap-5" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: status === "in_progress" ? "#FFFBEB" : "#F8FAFC" }}>
            {status === "in_progress" ? <Clock3 className="w-7 h-7 text-amber-500" /> : <Lock className="w-7 h-7 text-slate-300" />}
          </div>
          <div>
            <p className="text-base font-semibold text-slate-700 mb-1">
              {status === "in_progress" ? l("Sedang diproses oleh tim Jodohmu.", "The Jodohmu team is working on this.") : lockedMsg[lang]}
            </p>
            <p className="text-sm text-slate-400">
              {l("Hasilnya akan muncul di sini setelah tim Jodohmu menyelesaikan proses.", "Your result will appear here once the Jodohmu team completes the process.")}
            </p>
          </div>
          <a href={WA} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(to right, #C4294A, #1B3A6B)" }}>
            <MessageCircle className="w-4 h-4" />
            {l("Hubungi Tim Kami", "Contact Our Team")}
          </a>
        </div>
      ) : custom ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
          {custom.renderContent(data!, lang)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-[12px] text-slate-500">
            <Eye className="h-3.5 w-3.5 shrink-0" />
            {l("Hanya untuk dilihat — diisi oleh tim Jodohmu.", "View only — recorded by the Jodohmu team.")}
          </div>

          <div className="p-5 sm:p-6">
            {headline && (
              <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{headline.field.label[lang]}</p>
                <span className={`inline-flex rounded-full border px-3 py-1 text-[13px] font-bold ${TONE_CLS[optionTone(headline.raw)]}`}>
                  {headline.text}
                </span>
              </div>
            )}

            {rows.filter(r => r !== headline).length > 0 && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {rows.filter(r => r !== headline).map(({ field, text, raw }) => (
                  <div key={field.key} className={field.kind === "long" ? "sm:col-span-2" : ""}>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{field.label[lang]}</dt>
                    <dd className="mt-1">
                      {field.kind === "option" ? (
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${TONE_CLS[optionTone(raw)]}`}>{text}</span>
                      ) : (
                        <span className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{text}</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {legacy && (
              <div className={rows.length ? "mt-5 border-t border-slate-100 pt-5" : ""}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{l("Ringkasan", "Summary")}</p>
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{legacy}</p>
              </div>
            )}

            {!rows.length && !legacy && (
              <p className="text-sm text-slate-500">
                {l("Proses sudah selesai. Hubungi tim kami untuk penjelasan hasilnya.", "This is complete. Contact our team to go through the result.")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
