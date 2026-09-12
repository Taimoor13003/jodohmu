import { adminDb } from "@/lib/firebase-admin";
import { SHARES_COLLECTION, evaluateShare, readShare } from "@/lib/shares";
import type { SharePurpose } from "@/lib/share-types";

/**
 * What a link unfurl (WhatsApp, Meet, Slack…) may know about a link.
 * Read-only: never counts as an open, never exposes candidate names or data.
 */
export interface SharePreview {
  live: boolean;
  purpose: SharePurpose;
  recipientLabel: string;
  profileCount: number;
}

const FALLBACK: SharePreview = { live: false, purpose: "matchmaking", recipientLabel: "", profileCount: 0 };

export async function loadSharePreview(token: string): Promise<SharePreview> {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return FALLBACK;
  try {
    const snap = await adminDb().collection(SHARES_COLLECTION).doc(token).get();
    if (!snap.exists) return FALLBACK;
    const share = readShare(snap.data()!);
    if (evaluateShare(share, Date.now(), true) !== "active") return FALLBACK;
    return {
      live: true,
      purpose: share.purpose,
      recipientLabel: share.recipientLabel.slice(0, 60),
      profileCount: share.candidateIds.length,
    };
  } catch {
    return FALLBACK;
  }
}

export function previewCopy(preview: SharePreview) {
  if (!preview.live) {
    return {
      title: "Perkenalan pribadi dari Jodohmu",
      description: "Profil kandidat Jodohmu dibagikan secara pribadi, terbatas, dan penuh amanah.",
    };
  }
  const count = preview.profileCount > 1 ? `${preview.profileCount} profil pilihan` : "Satu profil pilihan";
  if (preview.purpose === "promotion") {
    return {
      title: "Profil pilihan dari Jodohmu",
      description: `${count} dari Jodohmu — ta'aruf yang terarah, terverifikasi, dan menjaga kehormatan setiap kandidat.`,
    };
  }
  return {
    title: preview.recipientLabel ? `Perkenalan pribadi untuk ${preview.recipientLabel}` : "Perkenalan pribadi dari Jodohmu",
    description: `${count} telah disiapkan khusus untuk Anda oleh tim Jodohmu. Rahasia dan terbatas — buka untuk melihat perkenalan lengkap.`,
  };
}
