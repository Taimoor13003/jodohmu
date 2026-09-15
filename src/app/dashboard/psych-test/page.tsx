"use client";
import { Brain } from "lucide-react";
import { ResultPage } from "../_result-page";

export default function PsychTestPage() {
  return (
    <ResultPage
      section="psych"
      title={{ id: "Hasil Tes Psikolog", en: "Psychologist Test Result" }}
      lockedMsg={{ id: "Hasil tes psikolog belum tersedia.", en: "Psychologist test result not yet available." }}
      icon={<Brain className="w-full h-full" />}
      iconBg="#F5F3FF" iconColor="#7C3AED"
    />
  );
}
