import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing/pricing-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export const metadata: Metadata = {
  title: "Harga Jodohmu — Paket Perjodohan Offline & Ta'aruf di Indonesia",
  description:
    "Biaya registrasi, paket Sidiq Basic, Standard, VIP Silver, dan VIP Gold — lengkap dengan jalur upgrade dan bonus keberhasilan sukarela. Mak comblang nyata tanpa biaya tersembunyi.",
  openGraph: {
    title: "Harga Jodohmu — Paket Perjodohan Offline & Ta'aruf",
    description:
      "Biaya registrasi, paket Sidiq Basic, Standard, VIP Silver, dan VIP Gold — mak comblang nyata tanpa biaya tersembunyi.",
    url: `${siteUrl}/pricing`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Harga Jodohmu — Paket Perjodohan Halal",
    description:
      "Paket transparan untuk perjodohan halal dengan jalur upgrade dan bonus keberhasilan sukarela.",
  },
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
};

export default function Page() {
  return <PricingPage />;
}
