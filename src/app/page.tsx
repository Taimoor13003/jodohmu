import type { Metadata } from "next";
import HomePage from "@/components/home/home-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jodohmu.com";

export const generateMetadata = (): Metadata => {
  const titleEn = "Jodohmu | Offline Marriage Matchmaking & Ta'aruf in Indonesia";
  const titleId = "Jodohmu | Perjodohan Offline & Ta'aruf Serius di Indonesia";
  const descriptionEn =
    "Offline, faith-aligned marriage matchmaking with ta'aruf facilitation, family-friendly vetting, and guided introductions for serious singles across Indonesia.";
  const descriptionId =
    "Perjodohan offline yang halal dengan fasilitasi ta'aruf, penyaringan keluarga, dan perkenalan terarah bagi lajang siap nikah di seluruh Indonesia.";

  const mergedDescription = `${descriptionEn} ${descriptionId}`;

  return {
    title: `${titleEn} | ${titleId}`,
    description: mergedDescription,
    openGraph: {
      title: titleEn,
      description: mergedDescription,
      url: siteUrl,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: titleEn,
      description: mergedDescription,
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        en: `${siteUrl}/`,
        id: `${siteUrl}/id`,
      },
    },
  };
};

export default function Page() {
  return <HomePage />;
}
