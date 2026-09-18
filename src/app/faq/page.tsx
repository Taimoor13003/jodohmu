import type { Metadata } from "next";
import { FaqPage } from "@/components/faq/faq-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "FAQ Jodohmu — Pertanyaan Umum Perjodohan",
  description:
    "Jawaban tentang perkenalan terpandu, pelibatan keluarga, kandidat terverifikasi, dan pertemuan terarah di Indonesia.",
  openGraph: {
    title: "FAQ Jodohmu — Pertanyaan Umum Perjodohan",
    description:
      "Jawaban tentang perkenalan terpandu, pelibatan keluarga, dan pertemuan terarah di Indonesia.",
    url: `${siteUrl}/faq`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FAQ Jodohmu — Perjodohan",
    description:
      "Jawaban tentang perkenalan terpandu dan perjodohan serius di Indonesia.",
  },
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
};

export default function Page() {
  return <FaqPage />;
}
