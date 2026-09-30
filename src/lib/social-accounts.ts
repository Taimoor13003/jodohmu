/* Jodohmu's public accounts. Each one is the same handle on Instagram, Threads and Facebook
   (a Threads profile is made from its Instagram account). Safe to use in the browser. */

export type SocialAccountKey = "nikahin_foreigner" | "nikah_lagiyuk" | "taaruf_sekarang" | "temu_chindo" | "kristenmatch" | "jodohmu";

export const SOCIAL_ACCOUNTS: { key: SocialAccountKey; handle: string; label: string; accent: string }[] = [
  { key: "nikahin_foreigner", handle: "nikahin_foreigner", label: "WNI & WNA", accent: "#761410" },
  { key: "nikah_lagiyuk", handle: "nikah_lagiyuk", label: "Janda / duda", accent: "#9B2242" },
  { key: "taaruf_sekarang", handle: "taaruf_sekarang", label: "Muslim", accent: "#3E5A4C" },
  { key: "temu_chindo", handle: "temu_chindo", label: "Chindo", accent: "#B4232C" },
  { key: "kristenmatch", handle: "kristenmatch.indo", label: "Kristen", accent: "#1D4E89" },
  { key: "jodohmu", handle: "jodohmu_official", label: "Jodohmu", accent: "#C4294A" },
];

export const findSocialAccount = (key: string) => SOCIAL_ACCOUNTS.find((a) => a.key === key) ?? null;
