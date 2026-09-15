/* ──────────────────────────────────────────────────────────────────────
   Labels for the recipient-facing profile view. Pure data — no imports —
   so it can be used from client components on both sides of the feature.
   ────────────────────────────────────────────────────────────────────── */

export type Lang = "id" | "en";

export const FIELD_LABELS: Record<string, Record<Lang, string>> = {
  fullName:                  { id: "Nama",                     en: "Name" },
  age:                       { id: "Usia",                     en: "Age" },
  gender:                    { id: "Jenis Kelamin",            en: "Gender" },
  location:                  { id: "Domisili",                 en: "Location" },
  occupation:                { id: "Pekerjaan",                en: "Occupation" },
  educations:                { id: "Pendidikan",               en: "Education" },
  openToTaaruf:              { id: "Status Perkenalan",        en: "Introduction Status" },
  maritalStatus:             { id: "Status Pernikahan",        en: "Marital Status" },
  aboutMe:                   { id: "Tentang Saya",             en: "About Me" },
  height:                    { id: "Tinggi Badan",             en: "Height" },
  weight:                    { id: "Berat Badan",              en: "Weight" },
  bloodType:                 { id: "Golongan Darah",           en: "Blood Type" },
  nationality:               { id: "Kebangsaan",               en: "Nationality" },
  ethnicity:                 { id: "Suku",                     en: "Ethnicity" },
  birthPlace:                { id: "Tempat Lahir",             en: "Place of Birth" },
  currentlyLivingWith:       { id: "Tinggal Bersama",          en: "Currently Living With" },
  religion:                  { id: "Agama",                    en: "Religion" },
  religiousPracticeLevel:    { id: "Tingkat Ibadah",           en: "Practice Level" },
  prayerHabit:               { id: "Kebiasaan Shalat",         en: "Prayer Habit" },
  quranReading:              { id: "Membaca Al-Qur'an",        en: "Qur'an Reading" },
  hijab:                     { id: "Hijab",                    en: "Hijab" },
  beard:                     { id: "Jenggot",                  en: "Beard" },
  islamicKnowledgeLevel:     { id: "Ilmu Agama",               en: "Islamic Knowledge" },
  halalLifestyleStrictness:  { id: "Gaya Hidup Halal",         en: "Halal Lifestyle" },
  polygamyView:              { id: "Pandangan Poligami",       en: "View on Polygamy" },
  waliAvailability:          { id: "Ketersediaan Wali",        en: "Wali Available" },
  smokingStatus:             { id: "Merokok",                  en: "Smoking" },
  alcoholUse:                { id: "Alkohol",                  en: "Alcohol" },
  exerciseFrequency:         { id: "Olahraga",                 en: "Exercise" },
  socialPreference:          { id: "Preferensi Sosial",        en: "Social Preference" },
  viewsOnMixedSocializing:   { id: "Pergaulan Campur",         en: "Mixed Socializing" },
  familyOriented:            { id: "Orientasi Keluarga",       en: "Family Oriented" },
  jobPosition:               { id: "Jabatan",                  en: "Job Position" },
  jobDescription:            { id: "Deskripsi Pekerjaan",      en: "Job Description" },
  employmentStatus:          { id: "Status Pekerjaan",         en: "Employment Status" },
  incomeRange:               { id: "Rentang Penghasilan",      en: "Income Range" },
  siblingCount:              { id: "Jumlah Saudara",           en: "Siblings" },
  childOrder:                { id: "Anak Ke-",                 en: "Birth Order" },
  maleSiblingCount:          { id: "Saudara Laki-laki",        en: "Brothers" },
  femaleSiblingCount:        { id: "Saudara Perempuan",        en: "Sisters" },
  childrenCount:             { id: "Jumlah Anak",              en: "Children" },
  childrenLivingWith:        { id: "Anak Tinggal Dengan",      en: "Children Live With" },
  maritalTimeline:           { id: "Target Waktu Menikah",     en: "Marriage Timeline" },
  weddingPreference:         { id: "Preferensi Pernikahan",    en: "Wedding Preference" },
  financialManagementStyle:  { id: "Pengelolaan Keuangan",     en: "Financial Management" },
  decisionMakingStyle:       { id: "Pengambilan Keputusan",    en: "Decision Making" },
  roleExpectationsHusband:   { id: "Harapan pada Suami",       en: "Expectations of a Husband" },
  roleExpectationsWife:      { id: "Harapan pada Istri",       en: "Expectations of a Wife" },
  preferredMinAge:           { id: "Usia Minimum",             en: "Minimum Age" },
  preferredMaxAge:           { id: "Usia Maksimum",            en: "Maximum Age" },
  preferredReligion:         { id: "Agama Pasangan",           en: "Partner's Religion" },
  prefReligionLevel:         { id: "Tingkat Keagamaan",        en: "Religiosity" },
  prefHijabBeard:            { id: "Hijab / Jenggot",          en: "Hijab / Beard" },
  preferredEducationLevel:   { id: "Pendidikan",               en: "Education" },
  openToDivorcedOrWidowed:   { id: "Terbuka Cerai / Janda",    en: "Open to Divorced / Widowed" },
  openToDifferentEthnicity:  { id: "Terbuka Beda Suku",        en: "Open to Different Ethnicity" },
  preferredLocationOfSpouse: { id: "Lokasi Pasangan",          en: "Partner's Location" },
  preferredPersonalityTraits:{ id: "Sifat yang Dicari",        en: "Personality Sought" },
  spouseDealBreakers:        { id: "Deal-Breaker",             en: "Deal-Breakers" },
};

/** Fields rendered as full-width prose rather than a label/value row. */
export const LONG_FORM_FIELDS = new Set([
  "aboutMe",
  "jobDescription",
  "roleExpectationsHusband",
  "roleExpectationsWife",
  "preferredPersonalityTraits",
  "spouseDealBreakers",
]);

const VALUE_LABELS: Record<string, Record<Lang, string>> = {
  male: { id: "Laki-laki", en: "Male" },
  female: { id: "Perempuan", en: "Female" },
  ready: { id: "Siap Diperkenalkan", en: "Open to Introductions" },
  preparing: { id: "Sedang Bersiap", en: "Getting Ready" },
  no: { id: "Tidak", en: "No" },
  yes: { id: "Ya", en: "Yes" },
  never: { id: "Tidak pernah", en: "Never" },
  occasionally: { id: "Kadang-kadang", en: "Occasionally" },
  regularly: { id: "Rutin", en: "Regularly" },
  quit: { id: "Sudah berhenti", en: "Quit" },
  rarely: { id: "Jarang", en: "Rarely" },
  sometimes: { id: "Kadang", en: "Sometimes" },
  daily: { id: "Setiap hari", en: "Daily" },
  always: { id: "Selalu", en: "Always" },
  introvert: { id: "Introvert", en: "Introvert" },
  extrovert: { id: "Ekstrovert", en: "Extrovert" },
  ambivert: { id: "Ambivert", en: "Ambivert" },
  basic: { id: "Dasar", en: "Basic" },
  intermediate: { id: "Menengah", en: "Intermediate" },
  advanced: { id: "Lanjutan", en: "Advanced" },
  strict: { id: "Ketat", en: "Strict" },
  moderate: { id: "Moderat", en: "Moderate" },
  relaxed: { id: "Santai", en: "Relaxed" },
  avoid: { id: "Menghindari", en: "Avoid" },
  asap: { id: "Sesegera mungkin", en: "As soon as possible" },
  "6_months": { id: "6 Bulan", en: "6 Months" },
  "1_year": { id: "1 Tahun", en: "1 Year" },
  "2_years": { id: "2 Tahun", en: "2 Years" },
  "3_plus_years": { id: "3+ Tahun", en: "3+ Years" },
  not_sure: { id: "Belum pasti", en: "Not sure" },
  simple: { id: "Sederhana", en: "Simple" },
  grand: { id: "Mewah", en: "Grand" },
  husband_manages: { id: "Suami kelola", en: "Husband manages" },
  wife_manages: { id: "Istri kelola", en: "Wife manages" },
  discussed: { id: "Didiskusikan bersama", en: "Discussed together" },
  husband_leads: { id: "Suami memimpin", en: "Husband leads" },
  very_practicing: { id: "Sangat taat", en: "Very practicing" },
  practicing: { id: "Taat", en: "Practicing" },
  not_practicing: { id: "Tidak taat", en: "Not practicing" },
  employed: { id: "Karyawan", en: "Employed" },
  self_employed: { id: "Wiraswasta", en: "Self-employed" },
  business_owner: { id: "Pemilik usaha", en: "Business owner" },
  unemployed: { id: "Tidak bekerja", en: "Unemployed" },
  student: { id: "Pelajar", en: "Student" },
  single: { id: "Lajang", en: "Single" },
  divorced: { id: "Cerai", en: "Divorced" },
  widowed: { id: "Janda / Duda", en: "Widowed" },
  islam: { id: "Islam", en: "Islam" },
};

const EDUCATION_LEVELS: Record<string, Record<Lang, string>> = {
  sd: { id: "SD", en: "Elementary" },
  smp: { id: "SMP", en: "Junior High" },
  sma: { id: "SMA", en: "High School" },
  d3: { id: "D3", en: "Associate's" },
  s1_d4: { id: "S1/D4", en: "Bachelor's" },
  s2: { id: "S2", en: "Master's" },
  s3: { id: "S3", en: "PhD" },
};

export function fieldLabel(field: string, lang: Lang): string {
  return FIELD_LABELS[field]?.[lang] ?? field;
}

/** Renders any stored profile value as display text, or null when empty. */
export function displayValue(value: unknown, lang: Lang): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (Array.isArray(value)) {
    const parts = value
      .map(entry => {
        if (entry && typeof entry === "object" && "level" in entry) {
          const e = entry as { level?: string; major?: string };
          const level = e.level ? EDUCATION_LEVELS[e.level]?.[lang] ?? e.level : "";
          return [level, e.major].filter(Boolean).join(" — ");
        }
        return typeof entry === "string" ? VALUE_LABELS[entry]?.[lang] ?? entry : String(entry);
      })
      .filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  }

  if (typeof value === "boolean") return value ? VALUE_LABELS.yes[lang] : VALUE_LABELS.no[lang];
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  return VALUE_LABELS[trimmed]?.[lang] ?? trimmed;
}
