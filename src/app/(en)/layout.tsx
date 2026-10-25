import type { Metadata } from "next";
import "../globals.css";
import "leaflet/dist/leaflet.css";
import { SiteRoot } from "@/components/layout/site-root";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

// Root layout for the English pages under /en. Each page sets its own
// canonical and hreflang through languageAlternates(); never set them here.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jodohmu — Serious Marriage Matchmaking in Indonesia",
    template: "%s | Jodohmu",
  },
  description:
    "Hybrid (online and in-person) marriage matchmaking with guided introductions, family involvement and verified candidates, for serious singles in Indonesia and abroad.",
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
  openGraph: {
    type: "website",
    url: `${siteUrl}/en`,
    title: "Jodohmu — Serious Marriage Matchmaking in Indonesia",
    description:
      "Hybrid (online and in-person) marriage matchmaking with guided introductions, family involvement and verified candidates.",
    siteName: "Jodohmu",
    images: [
      {
        url: `${siteUrl}/jodohmu-logo.png`,
        width: 512,
        height: 512,
        alt: "Jodohmu logo",
      },
    ],
    locale: "en_US",
    alternateLocale: ["id_ID"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jodohmu — Serious Marriage Matchmaking in Indonesia",
    description: "Guided introductions for marriage-minded singles of every faith, in Indonesia and abroad.",
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

export default function EnglishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteRoot lang="en">{children}</SiteRoot>;
}
