import type { Metadata } from "next";
import { InternationalPricing, internationalPricingSchema, internationalShareImage } from "@/components/pricing/international-pricing";
import { languageAlternates, siteUrl } from "@/lib/i18n-routes";

const title = "Biro Jodoh Internasional untuk WNA — Paket & Harga";
const description =
  "Biro jodoh bagi WNA yang ingin menikah dengan pasangan Indonesia terverifikasi. Perkenalan online didampingi, bertemu di Indonesia. Mulai $1,200.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} | Jodohmu`,
    description,
    url: `${siteUrl}/pricing/international`,
    type: "website",
    locale: "id_ID",
    images: [internationalShareImage("Perjodohan internasional bersama Jodohmu")],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Jodohmu`,
    description,
    images: [internationalShareImage("Perjodohan internasional bersama Jodohmu").url],
  },
  alternates: languageAlternates("/pricing/international", "id"),
};

export default function InternationalPricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(internationalPricingSchema("id")) }} />
      <InternationalPricing lang="id" />
    </>
  );
}
