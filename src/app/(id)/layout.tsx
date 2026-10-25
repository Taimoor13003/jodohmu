import type { Metadata } from "next";
import "../globals.css";
import "leaflet/dist/leaflet.css";
import { SiteRoot } from "@/components/layout/site-root";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

// Root layout for every Indonesian URL (and the app pages). English pages have
// their own root layout in src/app/(en) so they can render <html lang="en">.

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jodohmu — Jasa Perjodohan Serius di Indonesia",
    template: "%s | Jodohmu",
  },
  description:
    "Jasa perjodohan hybrid (online dan tatap muka) dengan perkenalan terpandu, penyaringan keluarga, dan pendampingan terarah bagi lajang siap nikah di seluruh Indonesia.",
  keywords: [
    "Jodohmu",
    "jasa perjodohan",
    "perjodohan terpandu",
    "cari jodoh serius",
    "matchmaking Indonesia",
    "pendampingan pernikahan",
    "marriage matchmaking Indonesia",
  ],
  verification: {
    google: "zoe-2544eLiXzE6RJLS4dfDl3qU6sxqs6kGXKPUEa24",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  // NOTE: Do NOT set a global `alternates.canonical` here. In the App Router,
  // child pages inherit it, which would point every page's canonical at the
  // homepage and make Google treat them as duplicates (deindexing them).
  // Each page sets its own self-referential canonical instead.
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Jodohmu — Jasa Perjodohan Serius di Indonesia",
    description:
      "Jasa perjodohan hybrid (online dan tatap muka) dengan perkenalan terpandu, penyaringan keluarga, dan pendampingan terarah bagi lajang siap nikah di Indonesia.",
    siteName: "Jodohmu",
    images: [
      {
        url: `${siteUrl}/jodohmu-logo.png`,
        width: 512,
        height: 512,
        alt: "Jodohmu logo",
      },
    ],
    locale: "id_ID",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jodohmu — Perjodohan Serius di Indonesia",
    description:
      "Jasa perjodohan hybrid dengan perkenalan terpandu untuk lajang siap nikah di Indonesia.",
    images: [`${siteUrl}/jodohmu-logo.png`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/jodohmu-logo.png", type: "image/png", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/jodohmu-logo.png",
    apple: { url: "/jodohmu-logo.png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteRoot lang="id">{children}</SiteRoot>;
}
