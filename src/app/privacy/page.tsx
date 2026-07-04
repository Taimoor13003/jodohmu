import { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi Jodohmu — cara kami menjaga dan melindungi data pribadi Anda selama proses perjodohan dan ta'aruf.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPolicy() {
  return <PrivacyContent />;
}
