import type { Metadata } from "next";
import { CareersPage } from "@/components/careers/careers-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join the Jodohmu team in Bandung. We are hiring Appointment Setters, Sales Consultants, and Operations Assistants. Commission-based and part-time roles available.",
  alternates: {
    canonical: `${siteUrl}/careers`,
  },
  openGraph: {
    title: "Careers | Jodohmu",
    description:
      "Join the Jodohmu team in Bandung. We are hiring Appointment Setters, Sales Consultants, and Operations Assistants.",
    url: `${siteUrl}/careers`,
    type: "website",
  },
};

export default function Page() {
  return <CareersPage />;
}
