import { Metadata } from "next";
import { TermsContent } from "./terms-content";
import { languageAlternates } from "@/lib/i18n-routes";


export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description: "Syarat dan ketentuan layanan Jodohmu — perjodohan yang dijalankan dengan amanah menuju pernikahan yang serius.",
  alternates: languageAlternates("/terms", "id"),
};

export default function TermsAndConditions() {
  return <TermsContent />;
}
