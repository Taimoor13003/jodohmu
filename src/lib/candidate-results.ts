/* ──────────────────────────────────────────────────────────────────────
   The team's assessment results as a candidate sees them: read-only,
   without the team's working notes (see candidate-private.ts).
   ────────────────────────────────────────────────────────────────────── */

type Text = { id: string; en: string };
export type ResultSectionKey = "psych" | "background" | "identity" | "assessment";
export type ResultStatus = "done" | "in_progress" | "not_done";
export type Tone = "good" | "caution" | "bad" | "neutral";

export interface ResultField {
  key: string;
  label: Text;
  kind?: "date" | "option" | "long";
}

export interface ResultSection {
  key: ResultSectionKey;
  statusKey: string;
  /** the one value that sums the result up */
  headlineKey: string;
  /** free-text result from the old dashboard, still shown if present */
  legacyKey?: string;
  fields: ResultField[];
}

export const RESULT_SECTIONS: Record<ResultSectionKey, ResultSection> = {
  psych: {
    key: "psych",
    statusKey: "psychTestStatus",
    headlineKey: "psychTestRecommendation",
    legacyKey: "psychTestResult",
    fields: [
      { key: "psychTestDate",               label: { id: "Tanggal", en: "Date" }, kind: "date" },
      { key: "psychTestProvider",           label: { id: "Provider", en: "Provider" } },
      { key: "psychTestPersonalityType",    label: { id: "Tipe kepribadian", en: "Personality type" } },
      { key: "psychTestEmotionalReadiness", label: { id: "Kesiapan emosi", en: "Emotional readiness" }, kind: "option" },
      { key: "psychTestAttachmentStyle",    label: { id: "Attachment style", en: "Attachment style" }, kind: "option" },
      { key: "psychTestConflictStyle",      label: { id: "Gaya menghadapi konflik", en: "Conflict style" } },
      { key: "psychTestCommunicationStyle", label: { id: "Gaya komunikasi", en: "Communication style" } },
      { key: "psychTestMarriageReadiness",  label: { id: "Kesiapan menikah", en: "Marriage readiness" }, kind: "option" },
      { key: "psychTestRecommendation",     label: { id: "Rekomendasi", en: "Recommendation" }, kind: "option" },
    ],
  },
  background: {
    key: "background",
    statusKey: "bgCheckStatus",
    headlineKey: "bgCheckOverallResult",
    legacyKey: "bgCheckResult",
    fields: [
      { key: "bgCheckDate",             label: { id: "Tanggal", en: "Date" }, kind: "date" },
      { key: "bgCheckFamilyBackground", label: { id: "Latar keluarga", en: "Family background" }, kind: "long" },
      { key: "bgCheckFinancialStatus",  label: { id: "Status keuangan", en: "Financial status" }, kind: "option" },
      { key: "bgCheckCriminalRecord",   label: { id: "Catatan kriminal", en: "Criminal record" }, kind: "option" },
      { key: "bgCheckSocialMediaCheck", label: { id: "Media sosial", en: "Social media" }, kind: "option" },
      { key: "bgCheckReferenceResult",  label: { id: "Referensi", en: "References" }, kind: "option" },
      { key: "bgCheckOverallResult",    label: { id: "Hasil keseluruhan", en: "Overall result" }, kind: "option" },
    ],
  },
  identity: {
    key: "identity",
    statusKey: "idCheckStatus",
    headlineKey: "idCheckOverallResult",
    fields: [
      { key: "idCheckDate",          label: { id: "Tanggal", en: "Date" }, kind: "date" },
      { key: "ktpVerified",          label: { id: "KTP terverifikasi", en: "KTP verified" }, kind: "option" },
      { key: "passportVerified",     label: { id: "Paspor terverifikasi", en: "Passport verified" }, kind: "option" },
      { key: "idCheckVerifiedBy",    label: { id: "Diverifikasi oleh", en: "Verified by" } },
      { key: "idCheckOverallResult", label: { id: "Hasil keseluruhan", en: "Overall result" }, kind: "option" },
    ],
  },
  assessment: {
    key: "assessment",
    statusKey: "jodohmuCriteriaStatus",
    headlineKey: "jodohmuCriteriaRecommendation",
    legacyKey: "jodohmuAssessmentResult",
    fields: [
      { key: "jodohmuCriteriaDate",              label: { id: "Tanggal", en: "Date" }, kind: "date" },
      { key: "jodohmuCriteriaAssessor",          label: { id: "Penilai", en: "Assessor" } },
      { key: "jodohmuCriteriaRecommendation",    label: { id: "Rekomendasi", en: "Recommendation" }, kind: "option" },
      { key: "jodohmuCriteriaPsychological",     label: { id: "Psikologis", en: "Psychological" }, kind: "long" },
      { key: "jodohmuCriteriaReligious",         label: { id: "Keagamaan", en: "Religious" }, kind: "long" },
      { key: "jodohmuCriteriaFinancial",         label: { id: "Keuangan", en: "Financial" }, kind: "long" },
      { key: "jodohmuCriteriaFamilyBackground",  label: { id: "Latar keluarga", en: "Family background" }, kind: "long" },
      { key: "jodohmuCriteriaPersonality",       label: { id: "Kepribadian", en: "Personality" }, kind: "long" },
      { key: "jodohmuCriteriaMarriageReadiness", label: { id: "Kesiapan menikah", en: "Marriage readiness" }, kind: "long" },
      { key: "jodohmuCriteriaConditions",        label: { id: "Syarat & catatan", en: "Conditions" }, kind: "long" },
    ],
  },
};

const OPTION_TEXT: Record<string, Text & { tone: Tone }> = {
  yes:              { id: "Ya",                     en: "Yes",              tone: "good" },
  no:               { id: "Tidak",                  en: "No",               tone: "bad" },
  not_applicable:   { id: "Tidak berlaku",          en: "Not applicable",   tone: "neutral" },
  low:              { id: "Rendah",                 en: "Low",              tone: "bad" },
  medium:           { id: "Sedang",                 en: "Medium",           tone: "caution" },
  high:             { id: "Tinggi",                 en: "High",             tone: "good" },
  secure:           { id: "Secure",                 en: "Secure",           tone: "good" },
  anxious:          { id: "Anxious",                en: "Anxious",          tone: "caution" },
  avoidant:         { id: "Avoidant",               en: "Avoidant",         tone: "caution" },
  disorganized:     { id: "Disorganized",           en: "Disorganized",     tone: "caution" },
  approved:         { id: "Disetujui",              en: "Approved",         tone: "good" },
  needs_counseling: { id: "Perlu konseling",        en: "Needs counseling", tone: "caution" },
  not_recommended:  { id: "Belum direkomendasikan", en: "Not recommended",  tone: "bad" },
  stable:           { id: "Stabil",                 en: "Stable",           tone: "good" },
  unstable:         { id: "Kurang stabil",          en: "Unstable",         tone: "caution" },
  flagged:          { id: "Perlu perhatian",        en: "Needs attention",  tone: "bad" },
  clean:            { id: "Bersih",                 en: "Clear",            tone: "good" },
  pending:          { id: "Menunggu",               en: "Pending",          tone: "neutral" },
  verified:         { id: "Terverifikasi",          en: "Verified",         tone: "good" },
  unverified:       { id: "Belum terverifikasi",    en: "Unverified",       tone: "caution" },
  partial:          { id: "Sebagian",               en: "Partial",          tone: "caution" },
  cleared:          { id: "Lolos",                  en: "Cleared",          tone: "good" },
  not_verified:     { id: "Belum terverifikasi",    en: "Not verified",     tone: "bad" },
  conditional:      { id: "Bersyarat",              en: "Conditional",      tone: "caution" },
  not_approved:     { id: "Belum disetujui",        en: "Not approved",     tone: "bad" },
};

export function isResultSection(key: string): key is ResultSectionKey {
  return key in RESULT_SECTIONS;
}

function filled(v: unknown): boolean {
  return v !== null && v !== undefined && String(v).trim() !== "" && v !== "—";
}

export function resultStatus(data: Record<string, unknown>, key: ResultSectionKey): ResultStatus {
  const s = RESULT_SECTIONS[key];
  const status = data[s.statusKey];
  if (status === "done" || (s.legacyKey && filled(data[s.legacyKey]))) return "done";
  if (status === "in_progress") return "in_progress";
  return "not_done";
}

/** A result is shown once the team marks it done. */
export function resultAvailable(data: Record<string, unknown>, key: ResultSectionKey): boolean {
  return resultStatus(data, key) === "done";
}

export function formatResultValue(field: ResultField, value: unknown, lang: "id" | "en"): string | null {
  if (!filled(value)) return null;
  const v = String(value);
  if (field.kind === "option") return OPTION_TEXT[v]?.[lang] ?? v.replace(/_/g, " ");
  if (field.kind === "date") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { dateStyle: "long" });
  }
  return v;
}

export function optionTone(value: unknown): Tone {
  return OPTION_TEXT[String(value)]?.tone ?? "neutral";
}
