"use client";
import { ClipboardList } from "lucide-react";
import { ResultPage } from "../_result-page";

export default function AssessmentPage() {
  return (
    <ResultPage
      section="assessment"
      title={{ id: "Jodohmu Assessment", en: "Jodohmu Assessment" }}
      lockedMsg={{ id: "Assessment belum tersedia.", en: "Assessment not yet available." }}
      icon={<ClipboardList className="w-full h-full" />}
      iconBg="#FFFBEB" iconColor="#B45309"
    />
  );
}
