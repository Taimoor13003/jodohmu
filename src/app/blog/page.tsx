import type { Metadata } from "next";
import { BlogPage } from "@/components/blog/blog-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com";

export const metadata: Metadata = {
  title: "Blog Jodohmu — Panduan Ta'aruf & Perjodohan Offline di Indonesia",
  description:
    "Artikel siap nikah tentang ta'aruf halal, perjodohan offline, kandidat terverifikasi, dan pertemuan ramah keluarga di Indonesia.",
  openGraph: {
    title: "Blog Jodohmu — Panduan Ta'aruf & Perjodohan Offline",
    description:
      "Artikel tentang ta'aruf halal, perjodohan offline, dan pertemuan ramah keluarga di Indonesia.",
    url: `${siteUrl}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Blog Jodohmu — Panduan Ta'aruf & Perjodohan",
    description:
      "Artikel siap nikah tentang ta'aruf halal dan perjodohan offline di Indonesia.",
  },
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
};

export default function Page() {
  return <BlogPage />;
}
