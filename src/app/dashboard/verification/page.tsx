"use client";
import { Fingerprint } from "lucide-react";
import { ResultPage } from "../_result-page";

export default function VerificationPage() {
  return (
    <ResultPage
      section="identity"
      title={{ id: "Verifikasi Identitas", en: "Identity Verification" }}
      lockedMsg={{ id: "Verifikasi identitas belum selesai.", en: "Identity verification isn't complete yet." }}
      icon={<Fingerprint className="w-full h-full" />}
      iconBg="#F0FDFA" iconColor="#0F766E"
    />
  );
}
