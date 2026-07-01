import type { Metadata } from "next";
import { Playfair_Display, Nunito, Roboto } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
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
    default: "Jodohmu — Jasa Perjodohan Offline & Ta'aruf Serius di Indonesia",
    template: "%s | Jodohmu",
  },
  description:
    "Jasa perjodohan offline yang halal dengan fasilitasi ta'aruf, penyaringan keluarga, dan perkenalan terarah bagi lajang siap nikah di seluruh Indonesia.",
  keywords: [
    "Jodohmu",
    "jasa perjodohan offline",
    "ta'aruf",
    "cari jodoh serius",
    "perjodohan halal",
    "matchmaking Indonesia",
    "pendampingan pernikahan",
    "nikah offline",
    "cari pasangan halal",
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
    title: "Jodohmu — Jasa Perjodohan Offline & Ta'aruf di Indonesia",
    description:
      "Jasa perjodohan offline yang halal dengan fasilitasi ta'aruf, penyaringan keluarga, dan perkenalan terarah bagi lajang siap nikah di Indonesia.",
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
    title: "Jodohmu — Perjodohan Offline & Ta'aruf di Indonesia",
    description:
      "Jasa perjodohan offline yang halal dengan fasilitasi ta'aruf untuk lajang siap nikah di Indonesia.",
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
    "Assalamualaikum, saya ingin konsultasi dengan tim Jodohmu."
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
                    "@type": "LocalBusiness",
                    "@id": `${siteUrl}#organization`,
                    name: "Jodohmu",
                    url: siteUrl,
                    logo: `${siteUrl}/favicon.ico`,
                    description:
                      "Offline, faith-aligned marriage matchmaking and ta'aruf facilitation for serious singles across Indonesia.",
                    areaServed: "Indonesia",
                    serviceType: [
                      "Offline marriage matching",
                      "Ta'aruf facilitation",
                      "Family-friendly matchmaking",
                    ],
                    inLanguage: ["en", "id"],
                    telephone: "+62 811 222 10303",
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
                    serviceType: "Offline marriage matchmaking and ta'aruf facilitation",
                    provider: { "@id": `${siteUrl}#organization` },
                    areaServed: "Indonesia",
                    url: siteUrl,
                    description:
                      "Curated offline introductions, guided ta'aruf, and safety-first verification for serious marriage-seeking singles.",
                    inLanguage: ["en", "id"],
                  },
                  {
                    "@type": "FAQPage",
                    "@id": `${siteUrl}#faq`,
                    mainEntity: [
                      {
                        "@type": "Question",
                        name: "How does Jodohmu facilitate offline matchmaking and ta'aruf?",
                        acceptedAnswer: {
                          "@type": "Answer",
                          text:
                            "We curate serious matches, arrange guided introductions, and support ta'aruf that aligns with faith and family expectations.",
                        },
                        inLanguage: ["en", "id"],
                      },
                      {
                        "@type": "Question",
                        name: "Is Jodohmu focused on serious, marriage-intent candidates?",
                        acceptedAnswer: {
                          "@type": "Answer",
                          text:
                            "Yes. We vet candidates for marriage intent, encourage family involvement, and provide a structured process for commitment-focused singles.",
                        },
                        inLanguage: ["en", "id"],
                      },
                      {
                        "@type": "Question",
                        name: "Do you operate across Indonesia?",
                        acceptedAnswer: {
                          "@type": "Answer",
                          text:
                            "Yes. We serve clients across Indonesia and can tailor introductions to your city or preferred regions.",
                        },
                        inLanguage: ["en", "id"],
                      },
                    ],
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
