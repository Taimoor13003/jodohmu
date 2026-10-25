import type { Metadata } from "next";
import { InternationalPricing } from "@/components/pricing/international-pricing";
import { languageAlternates } from "@/lib/i18n-routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Paket Internasional",
  description:
    "Layanan perjodohan internasional Jodohmu bagi WNA yang serius mencari pasangan Indonesia terverifikasi — dijalankan dengan terhormat, didampingi penuh, dan dengan niat yang sungguh-sungguh.",
  openGraph: {
    title: "Paket Internasional | Jodohmu",
    description:
      "Perjodohan internasional Jodohmu bagi WNA yang mencari pasangan Indonesia terverifikasi — didampingi penuh dan serius.",
    url: `${siteUrl}/pricing/international`,
    type: "website",
    locale: "id_ID",
  },
  alternates: languageAlternates("/pricing/international", "id"),
};

export default function InternationalPricingPage() {
  return <InternationalPricing lang="id" />;
}
