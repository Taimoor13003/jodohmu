import type { Metadata } from "next";
import { Playfair_Display, Nunito, Roboto } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { PublicShell } from "@/components/layout/public-shell";

const GA_MEASUREMENT_ID = "G-8XHZM9P9F3";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", weight: ["400", "500", "700"], display: "swap" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

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
  const whatsappHref = `https://wa.me/6281122210303?text=${encodeURIComponent(
    "Halo, saya ingin menjadwalkan panggilan dengan tim Jodohmu."
  )}`;

  return (
    <html lang="id" className={`${playfair.variable} ${nunito.variable} ${roboto.variable}`}>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <PublicShell whatsappHref={whatsappHref}>
              {children}
            </PublicShell>
          </AuthProvider>
        </LanguageProvider>
        <Toaster richColors position="top-center" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              {
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "WebSite",
                    "@id": `${siteUrl}#website`,
                    url: siteUrl,
                    name: "Jodohmu",
                    inLanguage: "id",
                    publisher: { "@id": `${siteUrl}#organization` },
                  },
                  {
                    "@type": "LocalBusiness",
                    "@id": `${siteUrl}#organization`,
                    name: "Jodohmu",
                    url: siteUrl,
                    logo: `${siteUrl}/jodohmu-logo.png`,
                    image: `${siteUrl}/jodohmu-logo.png`,
                    description:
                      "Jasa perjodohan hybrid (online dan tatap muka) dengan perkenalan terpandu dan pelibatan keluarga untuk lajang siap nikah di seluruh Indonesia.",
                    address: {
                      "@type": "PostalAddress",
                      addressCountry: "ID",
                    },
                    areaServed: "Indonesia",
                    serviceType: [
                      "Marriage matchmaking",
                      "Guided introductions",
                      "Family-friendly matchmaking",
                    ],
                    inLanguage: ["id", "en"],
                    knowsLanguage: ["id", "en"],
                    telephone: "+62 811 222 10303",
                    email: "info@jodohmu.com",
                    sameAs: [
                      "https://www.facebook.com/profile.php?id=61583458260206",
                      "https://www.instagram.com/jodohmu_official/",
                      "https://www.tiktok.com/@jodohmu.official",
                      "https://www.youtube.com/@jodohmu_official",
                    ],
                  },
                  {
                    "@type": "Service",
                    "@id": `${siteUrl}#service`,
                    serviceType: "Marriage matchmaking and guided introduction facilitation",
                    provider: { "@id": `${siteUrl}#organization` },
                    areaServed: "Indonesia",
                    url: siteUrl,
                    description:
                      "Perkenalan yang dikurasi, pendampingan menyeluruh, dan verifikasi kandidat yang mengutamakan keamanan untuk lajang yang serius menikah.",
                    inLanguage: ["id", "en"],
                  },
                ],
              },
              null,
              2
            ),
          }}
        />
      </body>
    </html>
  );
}
