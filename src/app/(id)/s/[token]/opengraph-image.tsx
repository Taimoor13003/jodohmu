import { OG_SIZE, brandCard } from "@/lib/og-card";
import { loadSharePreview } from "@/lib/share-preview";

/* Link unfurl card for WhatsApp / Meet / Slack. Deliberately never shows a
   candidate's photo or name: unfurls are cached by the messaging app and would
   outlive a revoked or expired link. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Perkenalan pribadi dari Jodohmu";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: { token: string } }) {
  const preview = await loadSharePreview(params.token);

  const eyebrow = !preview.live
    ? "JODOHMU"
    : preview.purpose === "promotion"
      ? "PROFIL PILIHAN JODOHMU"
      : "PERKENALAN PRIBADI";

  const lead = !preview.live ? "Perkenalan pribadi" : preview.purpose === "promotion" ? "Seseorang yang" : "Untuk";
  const emphasis = !preview.live
    ? "dari Jodohmu"
    : preview.purpose === "promotion"
      ? "layak Anda kenal"
      : preview.recipientLabel || "Anda";

  const sub = !preview.live
    ? "Perkenalan yang terarah dan menjaga kehormatan setiap kandidat."
    : preview.purpose === "promotion"
      ? "Perkenalan yang terarah, terverifikasi, dan penuh amanah."
      : `${preview.profileCount > 1 ? `${preview.profileCount} profil pilihan` : "Satu profil pilihan"}, disiapkan khusus oleh tim Jodohmu.`;

  const medallion = preview.live ? String(preview.profileCount) : "✦";
  const medallionLabel = preview.live ? (preview.profileCount > 1 ? "PROFIL" : "PROFIL") : "AMANAH";
  const footer = "Rahasia & terbatas  ·  jodohmu.com";

  return brandCard({ eyebrow, lead, emphasis, sub, footer, medallion, medallionLabel });
}
