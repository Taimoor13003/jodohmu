import type { Metadata } from "next";
import HomePage from "@/components/home/home-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Jodohmu — Jasa Perjodohan Offline & Ta'aruf Serius di Indonesia",
  description:
    "Perjodohan offline yang halal dengan fasilitasi ta'aruf, penyaringan keluarga, dan perkenalan terarah bagi lajang siap nikah di seluruh Indonesia. Offline marriage matchmaking for serious singles.",
  openGraph: {
    title: "Jodohmu — Jasa Perjodohan Offline & Ta'aruf Serius di Indonesia",
    description:
      "Perjodohan offline yang halal dengan fasilitasi ta'aruf, penyaringan keluarga, dan perkenalan terarah bagi lajang siap nikah di seluruh Indonesia.",
    url: siteUrl,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Jodohmu — Jasa Perjodohan & Ta'aruf Offline di Indonesia",
    description:
      "Perjodohan offline yang halal dengan fasilitasi ta'aruf untuk lajang siap nikah di Indonesia.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Page() {
  return <HomePage />;
}
