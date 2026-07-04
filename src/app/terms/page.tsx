import { Metadata } from "next";
import { TermsContent } from "./terms-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description: "Syarat dan ketentuan layanan Jodohmu — perjodohan offline dan ta'aruf yang dijalankan dengan amanah menuju pernikahan yang serius.",
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
};

export default function TermsAndConditions() {
  return <TermsContent />;
}
