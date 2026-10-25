import type { Metadata } from "next";
import HomePage from "@/components/home/home-page";
import { languageAlternates, siteUrl } from "@/lib/i18n-routes";

export const metadata: Metadata = {
  title: { absolute: "Jodohmu — Serious Marriage Matchmaking in Indonesia" },
  description:
    "Hybrid (online and in-person) marriage matchmaking with guided introductions, family involvement and verified candidates, for singles of every faith in Indonesia and abroad who are ready to marry.",
  openGraph: {
    title: "Jodohmu — Serious Marriage Matchmaking in Indonesia",
    description:
      "Guided introductions, family involvement and verified candidates for marriage-minded singles in Indonesia and abroad.",
    url: `${siteUrl}/en`,
    type: "website",
    locale: "en_US",
    siteName: "Jodohmu",
    images: [{ url: `${siteUrl}/jodohmu-logo.png`, width: 512, height: 512, alt: "Jodohmu — Matchmaking Service" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jodohmu — Serious Marriage Matchmaking in Indonesia",
    description: "Guided introductions for marriage-minded singles of every faith, in Indonesia and abroad.",
    images: [`${siteUrl}/jodohmu-logo.png`],
  },
  alternates: languageAlternates("/", "en"),
};

export default function Page() {
  return <HomePage />;
}
