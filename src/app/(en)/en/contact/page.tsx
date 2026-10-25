import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/contact-page";
import { languageAlternates, siteUrl } from "@/lib/i18n-routes";

export const metadata: Metadata = {
  title: "Contact Us — Matchmaking Consultation",
  description:
    "Contact the Jodohmu team about matchmaking and guided introductions. Share your details and we will get in touch with you personally.",
  openGraph: {
    title: "Contact Jodohmu — Matchmaking Consultation",
    description: "Contact the Jodohmu team about matchmaking and guided introductions in Indonesia and abroad.",
    url: `${siteUrl}/en/contact`,
    type: "website",
    locale: "en_US",
  },
  alternates: languageAlternates("/contact", "en"),
};

export default function Page() {
  return <ContactPage />;
}
