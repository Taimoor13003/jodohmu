/* ──────────────────────────────────────────────────────────────────────
   What a profile link is allowed to expose, and to whom.

   Pure data + pure functions with no server-only imports, so the admin
   builder (client preview) and the API routes (server) share one
   definition of "what this viewer may see".
   ────────────────────────────────────────────────────────────────────── */

export interface ShareSection {
  key: string;
  labelId: string;
  labelEn: string;
  fields: string[];
}

/**
 * Recipient-facing fields, grouped for the builder. Deliberately narrower
 * than the admin editor: internal notes, CRM, background checks and contact
 * details are not listed at all, so they can never be selected into a link.
 * The name is controlled separately per audience (`showName`).
 */
export const SHARE_SECTIONS: ShareSection[] = [
  {
    key: "ringkasan",
    labelId: "Ringkasan",
    labelEn: "Summary",
    fields: ["age", "gender", "location", "occupation", "educations", "openToTaaruf", "maritalStatus"],
  },
  { key: "tentang-saya", labelId: "Tentang Saya", labelEn: "About", fields: ["aboutMe"] },
  {
    key: "data-pribadi",
    labelId: "Data Pribadi",
    labelEn: "Personal Details",
    fields: ["height", "weight", "bloodType", "nationality", "ethnicity", "birthPlace", "currentlyLivingWith"],
  },
  {
    key: "profil-agama",
    labelId: "Profil Agama",
    labelEn: "Religious Profile",
    fields: ["religion", "religiousPracticeLevel", "prayerHabit", "quranReading", "hijab", "beard", "islamicKnowledgeLevel", "halalLifestyleStrictness", "polygamyView", "waliAvailability"],
  },
  {
    key: "gaya-hidup",
    labelId: "Gaya Hidup",
    labelEn: "Lifestyle",
    fields: ["smokingStatus", "alcoholUse", "exerciseFrequency", "socialPreference", "viewsOnMixedSocializing", "familyOriented"],
  },
  { key: "karir", labelId: "Karir", labelEn: "Career", fields: ["employmentStatus", "incomeRange"] },
  {
    key: "keluarga",
    labelId: "Keluarga",
    labelEn: "Family",
    fields: ["siblingCount", "childOrder", "maleSiblingCount", "femaleSiblingCount", "childrenCount", "childrenLivingWith"],
  },
  {
    key: "tujuan",
    labelId: "Tujuan Pernikahan",
    labelEn: "Marriage Goals",
    fields: ["maritalTimeline", "weddingPreference", "financialManagementStyle", "decisionMakingStyle"],
  },
  { key: "harapan", labelId: "Harapan", labelEn: "Expectations", fields: ["roleExpectationsHusband", "roleExpectationsWife"] },
  {
    key: "kriteria",
    labelId: "Kriteria Pasangan",
    labelEn: "Partner Criteria",
    fields: ["preferredMinAge", "preferredMaxAge", "preferredReligion", "prefReligionLevel", "prefHijabBeard", "preferredEducationLevel", "openToDivorcedOrWidowed", "openToDifferentEthnicity", "preferredLocationOfSpouse", "preferredPersonalityTraits", "spouseDealBreakers"],
  },
];

export const SHAREABLE_FIELDS: string[] = Array.from(new Set(SHARE_SECTIONS.flatMap(s => s.fields)));
const SHAREABLE_SET = new Set(SHAREABLE_FIELDS);

export function isShareableField(field: unknown): field is string {
  return typeof field === "string" && SHAREABLE_SET.has(field);
}

/* ── audiences ──────────────────────────────────────────────────────── */

/**
 * public    — opened without signing in
 * member    — signed in with any account (incl. leads created from the link)
 * candidate — a registered candidate the team has already onboarded
 * Team members (admin/worker) always resolve to the highest tier.
 */
export type AudienceTier = "public" | "member" | "candidate";
export const AUDIENCE_TIERS: AudienceTier[] = ["public", "member", "candidate"];

export interface AudienceRule {
  fields: string[];
  showName: boolean;
  showPhotos: boolean;
}
export type Audiences = Record<AudienceTier, AudienceRule>;

const DEFAULT_MEMBER_SECTIONS = ["ringkasan", "tentang-saya", "profil-agama", "gaya-hidup", "tujuan", "kriteria"];

export function defaultAudiences(): Audiences {
  const summary = SHARE_SECTIONS[0].fields.filter(f => f !== "educations");
  const member = SHARE_SECTIONS.filter(s => DEFAULT_MEMBER_SECTIONS.includes(s.key)).flatMap(s => s.fields);
  return normalizeAudiences({
    public: { fields: summary, showName: false, showPhotos: false },
    member: { fields: member, showName: false, showPhotos: false },
    candidate: { fields: member, showName: false, showPhotos: false },
  });
}

/**
 * Drops unknown fields and makes tiers cumulative: whatever a lower tier may
 * see, every higher tier may see too. Keeps field order stable.
 */
export function normalizeAudiences(input: Audiences): Audiences {
  const out = {} as Audiences;
  let carried: AudienceRule = { fields: [], showName: false, showPhotos: false };
  for (const tier of AUDIENCE_TIERS) {
    const rule = input[tier] ?? carried;
    const wanted = new Set([...carried.fields, ...rule.fields].filter(isShareableField));
    const next: AudienceRule = {
      fields: SHAREABLE_FIELDS.filter(f => wanted.has(f)),
      showName: carried.showName || !!rule.showName,
      showPhotos: carried.showPhotos || !!rule.showPhotos,
    };
    out[tier] = next;
    carried = next;
  }
  return out;
}

export function tierRank(tier: AudienceTier): number {
  return AUDIENCE_TIERS.indexOf(tier);
}

/* ── projection ─────────────────────────────────────────────────────── */

export interface ProjectedProfile {
  slot: number;
  name: string;
  nameHidden: boolean;
  data: Record<string, unknown>;
  photos: { index: number; src: string }[];
  /** The link hides photos from this viewer (drives the "photo not shown" question). */
  photosHidden: boolean;
  /** How much more the highest tier would reveal — counts only, never values. */
  locked: { fields: number; photos: number; name: boolean };
}

export interface ProjectInput {
  slot: number;
  candidate: Record<string, unknown>;
  audiences: Audiences;
  tier: AudienceTier;
  /** Photo indexes chosen for this profile; null = all of them. */
  photoSelection: number[] | null;
  anonymousLabel: string;
  photoSrc: (index: number) => string;
}

function hasValue(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function selectedPhotoIndexes(candidate: Record<string, unknown>, selection: number[] | null): number[] {
  const stored = Array.isArray(candidate.photoUrls) ? (candidate.photoUrls as unknown[]) : [];
  return stored
    .map((url, i) => (typeof url === "string" && url ? i : -1))
    .filter(i => i >= 0 && (selection === null || selection.includes(i)));
}

export function candidateDisplayName(candidate: Record<string, unknown>): string {
  const full = candidate.fullName ?? candidate.name;
  return typeof full === "string" && full.trim() ? full.trim() : "";
}

/** The single source of truth for what one viewer sees of one profile. */
export function projectProfile(input: ProjectInput): ProjectedProfile {
  const { candidate, audiences, tier } = input;
  const rule = audiences[tier];
  const top = audiences.candidate;

  const data: Record<string, unknown> = {};
  for (const field of rule.fields) {
    if (hasValue(candidate[field])) data[field] = candidate[field];
  }

  const realName = candidateDisplayName(candidate);
  const nameHidden = !rule.showName || !realName;
  const photoIndexes = selectedPhotoIndexes(candidate, input.photoSelection);

  const lockedFields = top.fields.filter(f => !rule.fields.includes(f) && hasValue(candidate[f])).length;

  return {
    slot: input.slot,
    name: nameHidden ? input.anonymousLabel : realName,
    nameHidden,
    data,
    photos: rule.showPhotos ? photoIndexes.map(index => ({ index, src: input.photoSrc(index) })) : [],
    photosHidden: !rule.showPhotos || photoIndexes.length === 0,
    locked: {
      fields: lockedFields,
      photos: top.showPhotos && !rule.showPhotos ? photoIndexes.length : 0,
      name: top.showName && !rule.showName && !!realName,
    },
  };
}
