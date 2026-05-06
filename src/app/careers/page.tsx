import type { Metadata } from "next";
import { CareersPage } from "@/components/careers/careers-page";

export const metadata: Metadata = {
  title: "Careers | Jodohmu",
  description:
    "Join the Jodohmu team in Bandung. We are hiring Appointment Setters, Sales Consultants, and Operations Assistants. Commission-based and part-time roles available.",
};

export default function Page() {
  return <CareersPage />;
}
