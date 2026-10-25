import type { Metadata } from "next";
import { FaqPage } from "@/components/faq/faq-page";
import { languageAlternates, siteUrl } from "@/lib/i18n-routes";

export const metadata: Metadata = {
  title: "Jodohmu FAQ — Common Questions About Matchmaking",
  description:
    "Answers about guided introductions, family involvement, verified candidates, international clients and planned meetings in Indonesia.",
  openGraph: {
    title: "Jodohmu FAQ — Common Questions About Matchmaking",
    description: "Answers about guided introductions, family involvement and planned meetings in Indonesia.",
    url: `${siteUrl}/en/faq`,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Jodohmu FAQ",
    description: "Answers about guided introductions and serious matchmaking in Indonesia.",
  },
  alternates: languageAlternates("/faq", "en"),
};

export default function Page() {
  return <FaqPage />;
}
