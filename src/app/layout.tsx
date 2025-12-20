import type { Metadata } from "next";
import { Playfair_Display, Nunito } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Jodohmu | Offline Marriage Matching & Ta'aruf Facilitation in Indonesia",
  description:
    "Jodohmu connects serious singles through offline, faith-aligned marriage matching and ta'aruf facilitation across Indonesia. Get guided introductions, family-friendly vetting, and personalized matching.",
  keywords: [
    "Jodohmu",
    "jasa perjodohan offline",
    "ta'aruf",
    "pendampingan pernikahan",
    "perjodohan halal",
    "offline marriage matching",
    "serious matchmaking Indonesia",
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
  alternates: {
    canonical: siteUrl,
    languages: {
      en: `${siteUrl}/`,
      id: `${siteUrl}/id`,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Jodohmu | Offline Marriage Matching & Ta'aruf Facilitation in Indonesia",
    description:
      "Offline, faith-aligned matchmaking and ta'aruf facilitation for serious singles in Indonesia. Guided introductions, safety-first process, and family-friendly vetting.",
    siteName: "Jodohmu",
    images: [
      {
        url: `${siteUrl}/favicon.ico`,
        width: 256,
        height: 256,
        alt: "Jodohmu logo",
      },
    ],
    locale: "en_ID",
    alternateLocale: ["id_ID"],
  },
  twitter: {
    card: "summary",
    title: "Jodohmu | Offline Marriage Matching & Ta'aruf Facilitation",
    description:
      "Offline, faith-aligned matchmaking and ta'aruf facilitation for serious singles in Indonesia.",
    images: [`${siteUrl}/favicon.ico`],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hrefLangs = [
    { lang: "en", href: `${siteUrl}/` },
    { lang: "id", href: `${siteUrl}/id` },
  ];

  return (
    <html lang="en" className={`${playfair.variable} ${nunito.variable}`}>
      <head>
        {hrefLangs.map(({ lang, href }) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={href} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={siteUrl} />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <Header />
            <main id="main-content" role="main">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
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
