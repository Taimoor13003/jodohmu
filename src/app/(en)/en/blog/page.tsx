import type { Metadata } from "next";
import { BlogPage } from "@/components/blog/blog-page";
import { languageAlternates, siteUrl } from "@/lib/i18n-routes";

export const metadata: Metadata = {
  title: "Jodohmu Blog — Guides to Finding a Partner for Marriage",
  description:
    "Guides for people who want to marry: finding a serious partner, marrying an Indonesian, family involvement, verified introductions and how Jodohmu works.",
  openGraph: {
    title: "Jodohmu Blog — Guides to Finding a Partner for Marriage",
    description: "Guides on finding a serious partner, marrying an Indonesian and family-friendly introductions.",
    url: `${siteUrl}/en/blog`,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Jodohmu Blog",
    description: "Guides on finding a serious partner for marriage, in Indonesia and abroad.",
  },
  alternates: languageAlternates("/blog", "en"),
};

export default function Page() {
  return <BlogPage />;
}
