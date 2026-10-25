import type { Metadata } from "next";
import { PricingPage } from "@/components/pricing/pricing-page";
import { languageAlternates, siteUrl } from "@/lib/i18n-routes";

export const metadata: Metadata = {
  title: "Jodohmu Pricing — Matchmaking Packages for Marriage",
  description:
    "Compare the Pearl, Ruby and Diamond packages: human matchmakers, verified profiles and planned Joble meetings for people of every faith who are ready to marry.",
  openGraph: {
    title: "Jodohmu Pricing — Human Matchmaking, No Swiping",
    description: "Guidance toward marriage for every faith, with verified profiles and Joble meetings planned together.",
    url: `${siteUrl}/en/pricing`,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Jodohmu Pricing — Human Matchmaking, No Swiping",
    description: "Transparent packages for a partner search guided by people, not a swipe algorithm.",
  },
  alternates: languageAlternates("/pricing", "en"),
};

export default function Page() {
  return (
    <div className="pricing-fonts">
      <PricingPage />
    </div>
  );
}
