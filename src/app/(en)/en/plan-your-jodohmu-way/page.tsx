import type { Metadata } from "next";
import { JodohmuWayPlanner } from "@/components/planner/jodohmu-way-planner";
import { languageAlternates, siteUrl } from "@/lib/i18n-routes";

export const metadata: Metadata = {
  title: "Plan Your Jodohmu Way",
  description: "Build a private matchmaking plan around the Jodohmu services that matter most to you.",
  openGraph: {
    title: "Plan Your Jodohmu Way | Jodohmu",
    description: "Choose the support you need and build your own Jodohmu journey.",
    url: `${siteUrl}/en/plan-your-jodohmu-way`,
    type: "website",
    locale: "en_US",
  },
  alternates: languageAlternates("/plan-your-jodohmu-way", "en"),
};

export default function Page() {
  return <JodohmuWayPlanner />;
}
