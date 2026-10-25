"use client";
import { History } from "lucide-react";
import { ResultPage } from "../_result-page";

interface TaarufEntry { date?: string; notes?: string; outcome?: string; }

export default function TaarufHistoryPage() {
  return (
    <ResultPage
      dataKey="pastTaarufResults"
      title={{ id: "Riwayat Ta'aruf", en: "Past Ta'aruf Results" }}
      lockedMsg={{ id: "Belum ada riwayat ta'aruf.", en: "No ta'aruf history yet." }}
      icon={<History className="w-full h-full" />}
      iconBg="#FFF1F2" iconColor="#C4294A"
      renderContent={(data, lang) => {
        const entries = Array.isArray(data.pastTaarufResults)
          ? data.pastTaarufResults as TaarufEntry[]
          : [{ notes: String(data.pastTaarufResults) }];
        return (
          <div className="flex flex-col gap-4">
            {entries.map((e, i) => (
              <div key={i} className="rounded-xl border border-slate-100 p-4 flex flex-col gap-2">
                {e.date && <p className="text-xs font-bold text-slate-400">{e.date}</p>}
                {e.outcome && (
                  <span className="inline-flex self-start px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                    {e.outcome}
                  </span>
                )}
                {e.notes && <p className="text-sm text-slate-700 leading-relaxed">{e.notes}</p>}
                {!e.date && !e.outcome && !e.notes && (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{JSON.stringify(e)}</p>
                )}
              </div>
            ))}
            <p className="text-xs text-slate-400 text-right">
              {lang === "id" ? `${entries.length} riwayat` : `${entries.length} record${entries.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        );
      }}
    />
  );
}
