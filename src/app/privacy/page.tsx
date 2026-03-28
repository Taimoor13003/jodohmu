import { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export const metadata: Metadata = {
  title: "Privacy Policy - Jodohmu",
  description: "Privacy policy for Jodohmu - Find your soulmate with care, faith, and sincerity.",
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPolicy() {
  return <PrivacyContent />;
}
