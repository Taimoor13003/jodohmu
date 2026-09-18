import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Hubungi Kami — Konsultasi Perjodohan",
  description:
    "Hubungi tim Jodohmu untuk konsultasi perjodohan dan perkenalan terpandu. Bagikan detail Anda dan tim kami akan menghubungi Anda secara personal.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "Hubungi Jodohmu — Konsultasi Perjodohan",
    description:
      "Hubungi tim Jodohmu untuk konsultasi perjodohan dan perkenalan terpandu di Indonesia.",
    url: `${siteUrl}/contact`,
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
