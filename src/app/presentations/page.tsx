import type { Metadata } from "next";
import { PresentationsPage } from "@/components/presentations/presentations-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Presentations",
  description: "Explore Jodohmu presentations and learn about our guided matchmaking services.",
  alternates: { canonical: `${siteUrl}/presentations` },
};

export default function Page() {
  return <PresentationsPage />;
}
