import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing/pricing-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

const titleEn = "Jodohmu Pricing — Transparent Packages for Halal Matchmaking";
const titleId = "Harga Jodohmu — Paket Transparan untuk Perjodohan Halal";
const descEn =
  "Registration fee, Sidiq Basic, Standard, VIP Silver, and VIP Gold packages — all with upgrade paths and a voluntary success bonus. Real human matchmaking with no hidden costs.";
const descId =
  "Biaya registrasi, paket Sidiq Basic, Standard, VIP Silver, dan VIP Gold — lengkap dengan jalur upgrade dan bonus keberhasilan sukarela. Mak comblang nyata tanpa biaya tersembunyi.";

export const metadata: Metadata = {
  title: `${titleEn} | ${titleId}`,
  description: `${descEn} ${descId}`,
  openGraph: {
    title: titleEn,
    description: descEn,
    url: `${siteUrl}/pricing`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: titleEn,
    description: descEn,
  },
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
};

export default function Page() {
  return <PricingPage />;
}
