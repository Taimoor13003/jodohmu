import type { Metadata } from "next";
import { TermsContent } from "@/app/(id)/terms/terms-content";
import { languageAlternates } from "@/lib/i18n-routes";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "The terms of Jodohmu's service — matchmaking carried out with integrity toward a serious marriage.",
  alternates: languageAlternates("/terms", "en"),
};

export default function Page() {
  return <TermsContent />;
}
