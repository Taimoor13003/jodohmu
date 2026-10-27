import { Playfair_Display, Nunito, Roboto } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { PublicShell } from "@/components/layout/public-shell";
import { WhatsAppClickTracker } from "@/components/analytics/whatsapp-click-tracker";
import { siteUrl, type Lang } from "@/lib/i18n-routes";

const GA_MEASUREMENT_ID = "G-8XHZM9P9F3";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto", weight: ["400", "500", "700"], display: "swap" });

const copy = {
  id: {
    whatsapp: "Halo, saya ingin menjadwalkan panggilan dengan tim Jodohmu.",
    organization:
      "Jasa perjodohan hybrid (online dan tatap muka) dengan perkenalan terpandu dan pelibatan keluarga untuk lajang siap nikah dari semua keyakinan, di seluruh Indonesia dan klien internasional yang ingin bertemu pasangan Indonesia.",
    service:
      "Perkenalan yang dikurasi, pendampingan menyeluruh, dan verifikasi kandidat yang mengutamakan keamanan untuk lajang yang serius menikah.",
  },
  en: {
    whatsapp: "Hello, I'd like to schedule a call with the Jodohmu team.",
    organization:
      "Hybrid (online and in-person) marriage matchmaking with guided introductions and family involvement, for marriage-minded singles of every faith across Indonesia and for international clients who want to meet an Indonesian partner.",
    service:
      "Curated introductions, end-to-end guidance and safety-first candidate verification for singles who are serious about marriage.",
  },
};

// The <html> shell shared by the Indonesian and English root layouts
export function SiteRoot({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const text = copy[lang];
  const homeUrl = lang === "en" ? `${siteUrl}/en` : siteUrl;
  const whatsappHref = `https://wa.me/628138858595?text=${encodeURIComponent(text.whatsapp)}`;

  return (
    <html lang={lang} className={`${playfair.variable} ${nunito.variable} ${roboto.variable}`}>
      <body>
        <LanguageProvider routeLang={lang}>
          <AuthProvider>
            <PublicShell whatsappHref={whatsappHref}>
              {children}
            </PublicShell>
          </AuthProvider>
        </LanguageProvider>
        <Toaster richColors position="top-center" />
        <WhatsAppClickTracker />
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
                    "@id": `${homeUrl}#website`,
                    url: homeUrl,
                    name: "Jodohmu",
                    inLanguage: lang,
                    publisher: { "@id": `${siteUrl}#organization` },
                  },
                  {
                    "@type": "LocalBusiness",
                    "@id": `${siteUrl}#organization`,
                    name: "Jodohmu",
                    url: siteUrl,
                    logo: `${siteUrl}/jodohmu-logo.png`,
                    image: `${siteUrl}/jodohmu-logo.png`,
                    description: text.organization,
                    address: {
                      "@type": "PostalAddress",
                      addressCountry: "ID",
                    },
                    areaServed: lang === "en" ? ["Indonesia", "Worldwide"] : "Indonesia",
                    serviceType: [
                      "Marriage matchmaking",
                      "Guided introductions",
                      "Family-friendly matchmaking",
                    ],
                    inLanguage: ["id", "en"],
                    knowsLanguage: ["id", "en"],
                    telephone: "+62 813 885 8595",
                    email: "info@jodohmu.com",
                    sameAs: [
                      "https://www.facebook.com/profile.php?id=61583458260206",
                      "https://www.instagram.com/jodohmu_official/",
                      "https://www.tiktok.com/@jodohmu.official",
                      "https://www.youtube.com/@jodohmu_official",
                      "https://www.linkedin.com/company/jodohmu",
                    ],
                  },
                  {
                    "@type": "Service",
                    "@id": `${siteUrl}#service`,
                    serviceType: "Marriage matchmaking and guided introduction facilitation",
                    provider: { "@id": `${siteUrl}#organization` },
                    areaServed: ["Indonesia", "Worldwide"],
                    audience: { "@type": "Audience", audienceType: "Single adults of every faith who are serious about marriage" },
                    url: homeUrl,
                    description: text.service,
                    inLanguage: lang,
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
