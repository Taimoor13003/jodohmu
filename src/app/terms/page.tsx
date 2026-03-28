import { Metadata } from "next";
import { TermsContent } from "./terms-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export const metadata: Metadata = {
  title: "Terms and Conditions - Jodohmu",
  description: "Terms and conditions for Jodohmu - Find your soulmate with care, faith, and sincerity.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
};

export default function TermsAndConditions() {
  return <TermsContent />;
}
