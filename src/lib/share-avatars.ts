/* ──────────────────────────────────────────────────────────────────────
   Stand-in portraits for profiles shared without photos. The team picks
   one per profile; the default follows what the candidate already told us.
   Pure data so both the builder (client) and the API (server) can use it.
   ────────────────────────────────────────────────────────────────────── */

export const AVATAR_VARIANTS = ["muslimah", "woman", "man_peci", "man_beard", "man"] as const;
export type AvatarVariant = (typeof AVATAR_VARIANTS)[number];

export const AVATAR_LABELS: Record<AvatarVariant, { id: string; en: string }> = {
  muslimah: { id: "Berhijab", en: "With hijab" },
  woman: { id: "Tanpa hijab", en: "Without hijab" },
  man_peci: { id: "Berpeci", en: "With peci" },
  man_beard: { id: "Berjenggot", en: "With beard" },
  man: { id: "Laki-laki", en: "Man" },
};

export const FEMALE_AVATARS: AvatarVariant[] = ["muslimah", "woman"];
export const MALE_AVATARS: AvatarVariant[] = ["man_peci", "man_beard", "man"];

export function isAvatarVariant(value: unknown): value is AvatarVariant {
  return typeof value === "string" && (AVATAR_VARIANTS as readonly string[]).includes(value);
}

/** Sensible starting point from the candidate's own answers. */
export function defaultAvatarFor(candidate: Record<string, unknown>): AvatarVariant {
  const gender = typeof candidate.gender === "string" ? candidate.gender : "";
  if (gender === "female") return candidate.hijab === "no" ? "woman" : "muslimah";
  if (candidate.beard === "yes") return "man_beard";
  return "man";
}

export function avatarsForGender(gender: unknown): AvatarVariant[] {
  return gender === "female" ? FEMALE_AVATARS : MALE_AVATARS;
}
