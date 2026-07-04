import type { Metadata } from "next";
import { CareersPage } from "@/components/careers/careers-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Karier",
  description:
    "Bergabunglah dengan tim Jodohmu di Bandung. Kami membuka lowongan Appointment Setter, Konsultan Penjualan, dan Asisten Operasional — tersedia peran paruh waktu dan berbasis komisi.",
  alternates: {
    canonical: `${siteUrl}/careers`,
  },
  openGraph: {
    title: "Karier | Jodohmu",
    description:
      "Bergabunglah dengan tim Jodohmu di Bandung. Kami membuka lowongan Appointment Setter, Konsultan Penjualan, dan Asisten Operasional.",
    url: `${siteUrl}/careers`,
    type: "website",
  },
};

export default function Page() {
  return <CareersPage />;
}
