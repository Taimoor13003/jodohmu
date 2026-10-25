import type { Metadata } from "next";
import { JodohmuWayPlanner } from "@/components/planner/jodohmu-way-planner";
import { languageAlternates } from "@/lib/i18n-routes";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Rancang Jalan Jodohmu Anda",
  description: "Susun rencana perjodohan pribadi dari layanan Jodohmu yang paling penting bagi Anda, lengkap dengan estimasi biaya.",
  alternates: languageAlternates("/plan-your-jodohmu-way", "id"),
  openGraph: {
    title: "Rancang Jalan Jodohmu Anda | Jodohmu",
    description: "Pilih pendampingan yang Anda butuhkan dan susun perjalanan Jodohmu Anda sendiri.",
    url: `${siteUrl}/plan-your-jodohmu-way`,
    type: "website",
  },
};

export default function PlanYourJodohmuWayPage() {
  return <JodohmuWayPlanner />;
}
