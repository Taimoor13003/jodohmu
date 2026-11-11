import type { Metadata } from "next";
import { InternationalPricing, internationalPricingSchema, internationalShareImage } from "@/components/pricing/international-pricing";
import { languageAlternates, siteUrl } from "@/lib/i18n-routes";

const title = "International Packages — Marry an Indonesian Partner";
const description =
  "Matchmaking for people abroad seeking a verified Indonesian spouse. Facilitated video introductions, then meet in Indonesia. From $1,200.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} | Jodohmu`,
    description,
    url: `${siteUrl}/en/pricing/international`,
    type: "website",
    locale: "en_US",
    images: [internationalShareImage("International matchmaking with Jodohmu")],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | Jodohmu`,
    description,
    images: [internationalShareImage("International matchmaking with Jodohmu").url],
  },
  alternates: languageAlternates("/pricing/international", "en"),
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(internationalPricingSchema("en")) }} />
      <InternationalPricing lang="en" />
    </>
  );
}
