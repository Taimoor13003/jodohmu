"use client";
import { ShieldCheck } from "lucide-react";
import { ResultPage } from "../_result-page";

export default function BackgroundCheckPage() {
  return (
    <ResultPage
      section="background"
      title={{ id: "Hasil Background Check", en: "Background Check Result" }}
      lockedMsg={{ id: "Background check belum selesai.", en: "Background check not yet complete." }}
      icon={<ShieldCheck className="w-full h-full" />}
      iconBg="#F0F9FF" iconColor="#0369A1"
    />
  );
}
