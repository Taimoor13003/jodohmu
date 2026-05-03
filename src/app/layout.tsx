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
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Jodohmu | Offline Marriage Matching & Ta'aruf Facilitation in Indonesia",
    description:
      "Offline, faith-aligned matchmaking and ta'aruf facilitation for serious singles in Indonesia. Guided introductions, safety-first process, and family-friendly vetting.",
    siteName: "Jodohmu",
    images: [
      {
        url: `${siteUrl}/favicon.svg`,
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
    images: [`${siteUrl}/favicon.svg`],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", rel: "shortcut icon", type: "image/svg+xml" },
    ],
    apple: { url: "/favicon.svg" },
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
    <html lang="en" className={`${playfair.variable} ${nunito.variable}`}>
      <head>
        <link rel="preload" as="image" href="/hero/jodohmu-hero.svg" />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <Header />
            <main id="main-content" role="main">
              {children}
            </main>
            <Footer />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                fill="currentColor"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M19.11 17.21c-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.36.98 2.67 1.12 2.86.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.55.58.65.2 1.24.17 1.7.1.52-.08 1.61-.66 1.84-1.3.23-.64.23-1.18.16-1.3-.07-.11-.25-.18-.52-.32z" />
                <path d="M16 3C8.82 3 3 8.82 3 16c0 2.28.6 4.51 1.74 6.47L3 29l6.69-1.74A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.56c-2.04 0-4.04-.54-5.78-1.57l-.41-.24-3.97 1.03 1.06-3.87-.27-.42A10.7 10.7 0 0 1 5.3 16C5.3 10.08 10.08 5.3 16 5.3S26.7 10.08 26.7 16 21.92 26.56 16 26.56z" />
              </svg>
            </a>
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
