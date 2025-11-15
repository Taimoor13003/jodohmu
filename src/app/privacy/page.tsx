import { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy - Jodohmu",
  description: "Privacy policy for Jodohmu - Find your soulmate with care, faith, and sincerity.",
};

export default function PrivacyPolicy() {
  return <PrivacyContent />;
}
