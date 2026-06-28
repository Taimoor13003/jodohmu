"use client";
import { Stars } from "lucide-react";
import { ResultPage } from "../_result-page";

interface MatchEntry { name?: string; age?: string; location?: string; notes?: string; }

export default function MatchesPage() {
  return (
    <ResultPage
      dataKey="recommendedMatches"
      title={{ id: "Rekomendasi Match", en: "Recommended Matches" }}
      lockedMsg={{ id: "Belum ada rekomendasi match dari tim kami.", en: "No recommended matches from our team yet." }}
      icon={<Stars className="w-full h-full" />}
      iconBg="#F0FDF4" iconColor="#059669"
      renderContent={(data, lang) => {
        const matches = Array.isArray(data.recommendedMatches)
          ? data.recommendedMatches as MatchEntry[]
          : [{ notes: String(data.recommendedMatches) }];
        return (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {lang === "id" ? `${matches.length} rekomendasi` : `${matches.length} match${matches.length !== 1 ? "es" : ""}`}
            </p>
            {matches.map((m, i) => (
              <div key={i} className="rounded-xl border border-slate-100 p-4 flex flex-col gap-1.5">
                {m.name && <p className="text-sm font-bold text-slate-800">{m.name}</p>}
                <div className="flex gap-3 text-xs text-slate-500">
                  {m.age && <span>{m.age} {lang === "id" ? "thn" : "yrs"}</span>}
                  {m.location && <span>· {m.location}</span>}
                </div>
                {m.notes && <p className="text-sm text-slate-600 leading-relaxed mt-1">{m.notes}</p>}
                {!m.name && !m.age && !m.notes && (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{JSON.stringify(m)}</p>
                )}
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
