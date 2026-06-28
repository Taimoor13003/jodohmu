"use client";
import { ShieldCheck } from "lucide-react";
import { ResultPage } from "../_result-page";

export default function BackgroundCheckPage() {
  return (
    <ResultPage
      dataKey="bgCheckResult"
      title={{ id: "Hasil Background Check", en: "Background Check Result" }}
      lockedMsg={{ id: "Background check belum selesai.", en: "Background check not yet complete." }}
      icon={<ShieldCheck className="w-full h-full" />}
      iconBg="#F0F9FF" iconColor="#0369A1"
      renderContent={(data, lang) => (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{lang === "id" ? "Hasil" : "Result"}</p>
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
            {String(data.bgCheckResult)}
          </p>
        </div>
      )}
    />
  );
}
