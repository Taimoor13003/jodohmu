import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing/pricing-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Harga Jodohmu — Paket Matchmaking untuk Pernikahan",
  description:
    "Pilih paket Pearl, Ruby, atau Diamond untuk pencarian pasangan hidup yang didampingi matchmaker manusia, profil terverifikasi, dan pertemuan Joble yang dirancang bersama.",
  openGraph: {
    title: "Harga Jodohmu — Matchmaking Manusia Tanpa Swipe",
    description:
      "Pendampingan menuju pernikahan untuk semua agama, dengan profil terverifikasi dan Joble yang dirancang bersama.",
    url: `${siteUrl}/pricing`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Harga Jodohmu — Matchmaking Manusia Tanpa Swipe",
    description:
      "Paket transparan untuk pencarian pasangan hidup yang didampingi manusia, bukan algoritma swipe.",
  },
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
};

export default function Page() {
  return (
    <div className="pricing-fonts">
      <PricingPage />
    </div>
  );
}
