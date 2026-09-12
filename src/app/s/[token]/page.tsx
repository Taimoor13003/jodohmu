import type { Metadata } from "next";
import { loadSharePreview, previewCopy } from "@/lib/share-preview";
import ShareView from "./ShareView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const { title, description } = previewCopy(await loadSharePreview(params.token));
  return {
    title: { absolute: `${title} — Jodohmu` },
    description,
    robots: { index: false, follow: false, nocache: true, noarchive: true, nosnippet: true, noimageindex: true },
    openGraph: {
      type: "website",
      siteName: "Jodohmu",
      locale: "id_ID",
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function SharedProfilePage({ params }: { params: { token: string } }) {
  return <ShareView token={params.token} />;
}
