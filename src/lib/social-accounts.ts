/* Jodohmu's public accounts. Each one is the same handle on Instagram, Threads and Facebook
   (a Threads profile is made from its Instagram account). X allows only letters, numbers and _ and at most
   15 characters, so xHandle is the X name; "Connect X" refuses any other account. Safe to use in the browser. */

export type SocialAccountKey = "nikahin_foreigner" | "nikah_lagiyuk" | "taaruf_sekarang" | "temu_chindo" | "kristenmatch" | "poligami_indonesia" | "asanikah" | "jodohmu";

export const SOCIAL_ACCOUNTS: { key: SocialAccountKey; handle: string; xHandle: string; label: string; accent: string }[] = [
  { key: "nikahin_foreigner", handle: "nikahin_foreigner", xHandle: "nikahinforeign", label: "WNI & WNA", accent: "#761410" },
  { key: "nikah_lagiyuk", handle: "nikah_lagiyuk", xHandle: "nikah_lagiyuk", label: "Janda / duda", accent: "#C8502F" },
  { key: "taaruf_sekarang", handle: "taaruf_sekarang", xHandle: "taarufsekarang_", label: "Muslim", accent: "#3E5A4C" },
  { key: "temu_chindo", handle: "temu_chindo", xHandle: "temu_chindo", label: "Chindo", accent: "#B4232C" },
  { key: "kristenmatch", handle: "kristenmatch.indo", xHandle: "kristenmatchid", label: "Kristen", accent: "#1D4E89" },
  { key: "poligami_indonesia", handle: "poligami.indonesia", xHandle: "poligami_indo", label: "Poligami Indonesia", accent: "#6B4A2B" },
  { key: "asanikah", handle: "asanikah.pk", xHandle: "asanikah_pk", label: "Pakistan", accent: "#0F3D33" },
  { key: "jodohmu", handle: "jodohmu_official", xHandle: "jodohmu_id", label: "Jodohmu", accent: "#C4294A" },
];

export const findSocialAccount = (key: string) => SOCIAL_ACCOUNTS.find((a) => a.key === key) ?? null;
