"use client";
import { Brain } from "lucide-react";
import { ResultPage } from "../_result-page";

export default function PsychTestPage() {
  return (
    <ResultPage
      dataKey="psychTestResult"
      title={{ id: "Hasil Tes Psikolog", en: "Psychologist Test Result" }}
      lockedMsg={{ id: "Hasil tes psikolog belum tersedia.", en: "Psychologist test result not yet available." }}
      icon={<Brain className="w-full h-full" />}
      iconBg="#F5F3FF" iconColor="#7C3AED"
      renderContent={(data, lang) => (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{lang === "id" ? "Hasil" : "Result"}</p>
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
            {String(data.psychTestResult)}
          </p>
        </div>
      )}
    />
  );
}
