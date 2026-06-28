"use client";
import { ClipboardList } from "lucide-react";
import { ResultPage } from "../_result-page";

export default function AssessmentPage() {
  return (
    <ResultPage
      dataKey="jodohmuAssessmentResult"
      title={{ id: "Jodohmu Assessment", en: "Jodohmu Assessment" }}
      lockedMsg={{ id: "Assessment belum tersedia.", en: "Assessment not yet available." }}
      icon={<ClipboardList className="w-full h-full" />}
      iconBg="#FFFBEB" iconColor="#B45309"
      renderContent={(data, lang) => (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{lang === "id" ? "Hasil" : "Result"}</p>
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
            {String(data.jodohmuAssessmentResult)}
          </p>
        </div>
      )}
    />
  );
}
