/* ──────────────────────────────────────────────────────────────────────
   Match suggestions: the team's backlog of "X would suit Y".
   A suggestion is made today, sent to the client later, and the client's
   reaction is written down so nobody suggests the same person twice.
   "client" = the person we send a profile to; "candidate" = the profile.
   ────────────────────────────────────────────────────────────────────── */

export const SUGGESTIONS_COLLECTION = "match_suggestions";

export const SUGGESTION_STATUSES = [
  "backlog", "sent", "interested", "not_interested", "introduced", "dropped",
] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export const STATUS_META: Record<SuggestionStatus, { id: string; en: string; color: string; bg: string; border: string }> = {
  backlog:        { id: "Belum dikirim",   en: "To send",        color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  sent:           { id: "Sudah dikirim",   en: "Sent",           color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  interested:     { id: "Tertarik",        en: "Interested",     color: "#047857", bg: "#ECFDF5", border: "#A7F3D0" },
  not_interested: { id: "Tidak tertarik",  en: "Not interested", color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
  introduced:     { id: "Sudah dikenalkan", en: "Introduced",    color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  dropped:        { id: "Dibatalkan",      en: "Dropped",        color: "#475569", bg: "#F1F5F9", border: "#E2E8F0" },
};

/** Who started it: the team's own idea, or the candidate asked us for this client's profile. */
export const SUGGESTION_ORIGINS = ["team", "candidate_request"] as const;
export type SuggestionOrigin = (typeof SUGGESTION_ORIGINS)[number];

export const ORIGIN_META: Record<SuggestionOrigin, { id: string; en: string; short: { id: string; en: string }; color: string; bg: string; border: string }> = {
  team:              { id: "Saran dari tim",                    en: "Suggested by the team",           short: { id: "Saran tim", en: "Team idea" },          color: "#475569", bg: "#F8FAFC", border: "#E2E8F0" },
  candidate_request: { id: "Kandidat yang meminta profil ini",  en: "Candidate asked for this profile", short: { id: "Diminta kandidat", en: "Candidate asked" }, color: "#BE185D", bg: "#FDF2F8", border: "#FBCFE8" },
};

export function isOrigin(v: unknown): v is SuggestionOrigin {
  return typeof v === "string" && (SUGGESTION_ORIGINS as readonly string[]).includes(v);
}

export interface SuggestionNote {
  id: string;
  text: string;
  byUid: string;
  byName: string;
  at: string;               // ISO
}

export interface SuggestionPerson {
  uid: string;
  name: string;
  gender: string | null;
  age: string | null;
  city: string | null;
  photo: string | null;
  /** Profile facts and partner preferences used to describe the person and check the fit. */
  facts?: Record<string, unknown>;
  linkActive?: boolean;
}

/** Fields copied into `facts` (team-only screens; never sent to the public). */
export const FACT_FIELDS = [
  "nationality", "ethnicity", "maritalStatus", "childrenCount", "occupation", "jobPosition", "employmentStatus",
  "incomeRange", "educations", "religion", "religiousPracticeLevel", "prayerHabit", "hijab", "beard", "height",
  "smokingStatus", "maritalTimeline", "aboutMe", "openToForeigner",
  "preferredMinAge", "preferredMaxAge", "preferredReligion", "prefReligionLevel", "prefPreviousStatus",
  "prefChildrenFromPrevious", "openToDivorcedOrWidowed", "prefMinHeight", "prefMaxHeight", "prefSmokingAcceptance",
  "preferredLocationOfSpouse", "prefDomicile", "preferredPersonalityTraits", "physicalPreferences", "spouseDealBreakers",
] as const;

export interface Suggestion {
  id: string;
  clientUid: string;
  candidateUid: string;
  client: SuggestionPerson;
  candidate: SuggestionPerson;
  status: SuggestionStatus;
  origin: SuggestionOrigin;
  reason: string;
  notes: SuggestionNote[];
  createdByName: string;
  createdAt: string | null;
  updatedAt: string | null;
  sentAt: string | null;
}

export function isStatus(v: unknown): v is SuggestionStatus {
  return typeof v === "string" && (SUGGESTION_STATUSES as readonly string[]).includes(v);
}
