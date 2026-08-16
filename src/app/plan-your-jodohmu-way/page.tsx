import type { Metadata } from "next";
import { JodohmuWayPlanner } from "@/components/planner/jodohmu-way-planner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Plan Your Jodohmu Way",
  description: "Build a private matchmaking plan around the Jodohmu services that matter most to you.",
  alternates: {
    canonical: `${siteUrl}/plan-your-jodohmu-way`,
  },
  openGraph: {
    title: "Plan Your Jodohmu Way | Jodohmu",
    description: "Choose the support you need and build your own Jodohmu journey.",
    url: `${siteUrl}/plan-your-jodohmu-way`,
    type: "website",
  },
};

export default function PlanYourJodohmuWayPage() {
  return <JodohmuWayPlanner />;
}
