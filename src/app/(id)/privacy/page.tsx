import { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";
import { languageAlternates } from "@/lib/i18n-routes";


export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi Jodohmu — cara kami menjaga dan melindungi data pribadi Anda selama proses perjodohan dan perkenalan.",
  alternates: languageAlternates("/privacy", "id"),
};

export default function PrivacyPolicy() {
  return <PrivacyContent />;
}
