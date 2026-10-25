import type { Metadata } from "next";
import { CareersPage } from "@/components/careers/careers-page";
import { languageAlternates, siteUrl } from "@/lib/i18n-routes";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the Jodohmu team. Open roles: Appointment Setter, Sales Consultant and Operations Assistant, with remote, part-time and commission-based options.",
  openGraph: {
    title: "Careers | Jodohmu",
    description: "Join the Jodohmu team: Appointment Setter, Sales Consultant and Operations Assistant roles.",
    url: `${siteUrl}/en/careers`,
    type: "website",
    locale: "en_US",
  },
  alternates: languageAlternates("/careers", "en"),
};

export default function Page() {
  return <CareersPage />;
}
