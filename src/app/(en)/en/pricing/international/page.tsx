import type { Metadata } from "next";
import { InternationalPricing } from "@/components/pricing/international-pricing";
import { languageAlternates, siteUrl } from "@/lib/i18n-routes";

export const metadata: Metadata = {
  title: "International Packages — Marry an Indonesian Partner",
  description:
    "Jodohmu's international matchmaking service for people outside Indonesia seeking a verified Indonesian spouse — conducted with dignity, full facilitation and serious intent.",
  openGraph: {
    title: "International Packages | Jodohmu",
    description:
      "International matchmaking for people outside Indonesia seeking a verified Indonesian spouse — full facilitation and serious intent.",
    url: `${siteUrl}/en/pricing/international`,
    type: "website",
    locale: "en_US",
  },
  alternates: languageAlternates("/pricing/international", "en"),
};

export default function Page() {
  return <InternationalPricing lang="en" />;
}
