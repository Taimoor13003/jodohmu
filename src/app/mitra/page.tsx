import type { Metadata } from "next";
import { MitraPage } from "@/components/mitra/mitra-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Program Mitra",
  description:
    "Jadilah Mitra Jodohmu. Bantu orang-orang di sekitar Anda menemukan pasangan hidup lewat pendampingan yang manusiawi, terhormat, dan melibatkan keluarga — dan jadilah bagian dari lahirnya keluarga-keluarga baru.",
  alternates: {
    canonical: `${siteUrl}/mitra`,
  },
  openGraph: {
    title: "Program Mitra | Jodohmu",
    description:
      "Bantu orang-orang di sekitar Anda menemukan pasangan hidup dengan cara yang serius dan terhormat. Daftar menjadi Mitra Jodohmu.",
    url: `${siteUrl}/mitra`,
    type: "website",
  },
};

export default function Page() {
  return <MitraPage />;
}
