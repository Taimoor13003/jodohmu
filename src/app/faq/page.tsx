import type { Metadata } from "next";
import { FaqPage } from "@/components/faq/faq-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "FAQ Jodohmu — Pertanyaan Umum Perjodohan Offline & Ta'aruf",
  description:
    "Jawaban tentang ta'aruf halal, perkenalan offline, pelibatan keluarga, kandidat terverifikasi, dan pertemuan terarah di Indonesia.",
  openGraph: {
    title: "FAQ Jodohmu — Pertanyaan Umum Perjodohan & Ta'aruf",
    description:
      "Jawaban tentang ta'aruf halal, perkenalan offline, pelibatan keluarga, dan pertemuan terarah di Indonesia.",
    url: `${siteUrl}/faq`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FAQ Jodohmu — Perjodohan & Ta'aruf",
    description:
      "Jawaban tentang ta'aruf halal dan perjodohan offline di Indonesia.",
  },
  alternates: {
    canonical: `${siteUrl}/faq`,
  },
};

export default function Page() {
  return <FaqPage />;
}
