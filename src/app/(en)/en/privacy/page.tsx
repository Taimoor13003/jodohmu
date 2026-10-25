import type { Metadata } from "next";
import { PrivacyContent } from "@/app/(id)/privacy/privacy-content";
import { languageAlternates } from "@/lib/i18n-routes";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Jodohmu's privacy policy — how we protect your personal data throughout matchmaking and introductions.",
  alternates: languageAlternates("/privacy", "en"),
};

export default function Page() {
  return <PrivacyContent />;
}
