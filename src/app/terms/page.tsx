import { Metadata } from "next";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = {
  title: "Terms and Conditions - Jodohmu",
  description: "Terms and conditions for Jodohmu - Find your soulmate with care, faith, and sincerity.",
};

export default function TermsAndConditions() {
  return <TermsContent />;
}
