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
  locationArea:              { id: "Daerah / Kecamatan",       en: "Area / District" },
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
  currentlyLivingWith:       { id: "Tinggal Bersama",          en: "Living With" },
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
  roleExpectationsHusband:   { id: "Harapan pada Suami",       en: "Expectations from a Husband" },
  roleExpectationsWife:      { id: "Harapan pada Istri",       en: "Expectations from a Wife" },
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
  Islam: { id: "Islam", en: "Islam" },
  Christian: { id: "Kristen", en: "Christian" },
  christian_protestant: { id: "Kristen Protestan", en: "Christian — Protestant" },
  Catholic: { id: "Katolik", en: "Catholic" },
  christian_catholic: { id: "Katolik", en: "Catholic" },
  Hindu: { id: "Hindu", en: "Hindu" },
  hindu: { id: "Hindu", en: "Hindu" },
  Buddhist: { id: "Buddha", en: "Buddhist" },
  buddhist: { id: "Buddha", en: "Buddhist" },
  Other: { id: "Lainnya", en: "Other" },
  other: { id: "Lainnya", en: "Other" },
  no_preference: { id: "Tidak ada preferensi", en: "No preference" },
  no_pref: { id: "Tidak masalah", en: "No preference" },
  prefer_not_say: { id: "Tidak ingin berbagi", en: "Prefer not to say" },
  prefer_not_to_say: { id: "Tidak ingin berbagi", en: "Prefer not to say" },
  flexible: { id: "Fleksibel", en: "Flexible" },
  conditional: { id: "Tergantung kondisi", en: "Depends" },
  mostly: { id: "Sebagian besar", en: "Mostly" },
  weekly: { id: "Mingguan", en: "Weekly" },
  limited: { id: "Terbatas", en: "Limited" },
  comfortable: { id: "Nyaman", en: "Comfortable" },
  good: { id: "Baik", en: "Good" },
  occasional: { id: "Kadang-kadang", en: "Occasionally" },
  regular: { id: "Rutin", en: "Regularly" },
  /* practice */
  very_devout: { id: "Sangat taat", en: "Very devout" },
  cultural: { id: "Secara budaya", en: "Cultural" },
  spiritual: { id: "Spiritual", en: "Spiritual" },
  "5x_always": { id: "5 waktu, selalu", en: "5× daily, always" },
  "5x_mostly": { id: "5 waktu, hampir selalu", en: "5× daily, mostly" },
  friday_only: { id: "Shalat Jumat", en: "Fridays only" },
  fluent_tajweed: { id: "Lancar dengan tajwid", en: "Fluent with tajweed" },
  can_read: { id: "Bisa membaca", en: "Can read" },
  learning: { id: "Masih belajar", en: "Still learning" },
  cannot_read: { id: "Belum bisa membaca", en: "Cannot read yet" },
  very_strict: { id: "Sangat ketat", en: "Very strict" },
  not_comfortable: { id: "Lebih nyaman terpisah", en: "Prefers separation" },
  limited_professional: { id: "Terbatas, urusan pekerjaan", en: "Professional settings only" },
  yes_always: { id: "Ya, selalu", en: "Yes, always" },
  yes_in_progress: { id: "Sedang berproses", en: "Working toward it" },
  yes_sometimes: { id: "Kadang-kadang", en: "Sometimes" },
  yes_trimmed: { id: "Ya, tipis", en: "Yes, trimmed" },
  converting: { id: "Sedang berproses", en: "Working toward it" },
  yes_father: { id: "Ya, ayah", en: "Yes — father" },
  yes_brother: { id: "Ya, saudara laki-laki", en: "Yes — brother" },
  yes_other: { id: "Ya, wali lainnya", en: "Yes — another guardian" },
  wali_hakim: { id: "Wali hakim", en: "Wali hakim" },
  in_process: { id: "Dalam proses", en: "In process" },
  /* polygamy */
  understand_but_difficult: { id: "Memahami, namun berat secara pribadi", en: "Understands it, but personally difficult" },
  open_if_right: { id: "Terbuka bila adil dan syaratnya terpenuhi", en: "Open if the conditions are right" },
  not_considering: { id: "Tidak mempertimbangkan", en: "Not considering it" },
  open_future: { id: "Terbuka di masa depan", en: "Open to it in the future" },
  actively_considering: { id: "Sedang mempertimbangkan", en: "Actively considering it" },
  /* work & income */
  employed_full: { id: "Karyawan penuh waktu", en: "Employed, full time" },
  employed_part: { id: "Karyawan paruh waktu", en: "Employed, part time" },
  freelance: { id: "Pekerja lepas", en: "Freelance" },
  retired: { id: "Pensiun", en: "Retired" },
  under_3m: { id: "Di bawah Rp 3.000.000", en: "Under IDR 3,000,000" },
  "3m_7m": { id: "Rp 3.000.000 – Rp 7.000.000", en: "IDR 3,000,000 – 7,000,000" },
  "7m_15m": { id: "Rp 7.000.000 – Rp 15.000.000", en: "IDR 7,000,000 – 15,000,000" },
  "15m_30m": { id: "Rp 15.000.000 – Rp 30.000.000", en: "IDR 15,000,000 – 30,000,000" },
  "30m_plus": { id: "Di atas Rp 30.000.000", en: "Over IDR 30,000,000" },
  below_5m: { id: "Di bawah Rp 5.000.000", en: "Under IDR 5,000,000" },
  "5m_10m": { id: "Rp 5.000.000 – Rp 10.000.000", en: "IDR 5,000,000 – 10,000,000" },
  "10m_20m": { id: "Rp 10.000.000 – Rp 20.000.000", en: "IDR 10,000,000 – 20,000,000" },
  "20m_50m": { id: "Rp 20.000.000 – Rp 50.000.000", en: "IDR 20,000,000 – 50,000,000" },
  above_50m: { id: "Di atas Rp 50.000.000", en: "Over IDR 50,000,000" },
  /* lifestyle */
  strong_introvert: { id: "Sangat introvert", en: "Strong introvert" },
  introverted: { id: "Introvert", en: "Introvert" },
  extroverted: { id: "Ekstrovert", en: "Extrovert" },
  strong_extrovert: { id: "Sangat ekstrovert", en: "Strong extrovert" },
  "4_5x": { id: "4–5 kali seminggu", en: "4–5× a week" },
  "2_3x": { id: "2–3 kali seminggu", en: "2–3× a week" },
  once_week: { id: "Seminggu sekali", en: "Once a week" },
  /* home & family */
  alone: { id: "Sendiri", en: "Alone" },
  with_parents: { id: "Orang tua", en: "Parents" },
  with_mother: { id: "Ibu", en: "Mother" },
  with_father: { id: "Ayah", en: "Father" },
  with_siblings: { id: "Saudara", en: "Siblings" },
  with_family: { id: "Keluarga", en: "Family" },
  with_children: { id: "Anak", en: "Children" },
  with_roommates: { id: "Teman", en: "Roommates" },
  full_mine: { id: "Bersama saya", en: "With me" },
  shared: { id: "Diasuh bersama", en: "Shared custody" },
  ex_has_custody: { id: "Bersama mantan pasangan", en: "With the other parent" },
  children_adults: { id: "Sudah dewasa", en: "Already adults" },
  custody_self: { id: "Bersama saya", en: "With me" },
  custody_ex: { id: "Bersama mantan pasangan", en: "With the other parent" },
  custody_shared: { id: "Diasuh bersama", en: "Shared custody" },
  /* marriage goals */
  "3_months": { id: "Dalam 3 bulan", en: "Within 3 months" },
  "1_2_years": { id: "1–2 tahun", en: "1–2 years" },
  large: { id: "Besar", en: "Large" },
  separate: { id: "Terpisah", en: "Separate" },
  separate_contribute: { id: "Terpisah, sama-sama berkontribusi", en: "Separate, both contribute" },
  discuss: { id: "Terbuka untuk didiskusikan", en: "Open to discuss" },
  mutual: { id: "Diputuskan bersama", en: "Decided together" },
  wife_leads: { id: "Istri memimpin", en: "Wife leads" },
  domain_based: { id: "Sesuai bidang masing-masing", en: "Each leads their own area" },
  discussed_case_by_case: { id: "Dibahas per situasi", en: "Case by case" },
  /* partner criteria */
  required: { id: "Wajib", en: "Required" },
  preferred: { id: "Lebih disukai", en: "Preferred" },
  must_be_muslim: { id: "Harus Muslim", en: "Must be Muslim" },
  same_religion: { id: "Harus seagama", en: "Same religion" },
  people_of_book: { id: "Muslim atau Ahli Kitab", en: "Muslim or People of the Book" },
  open: { id: "Terbuka", en: "Open" },
  yes_fully: { id: "Ya, terbuka", en: "Yes, fully open" },
  prefer_same: { id: "Lebih suka sesuku, tapi terbuka", en: "Prefers the same, but open" },
  same_only: { id: "Hanya sesuku", en: "Same ethnicity only" },
  divorced_no_kids: { id: "Cerai, tanpa anak", en: "Divorced, no children" },
  divorced_with_kids: { id: "Cerai, dengan anak", en: "Divorced, with children" },
  widowed_no_kids: { id: "Ditinggal wafat, tanpa anak", en: "Widowed, no children" },
  widowed_with_kids: { id: "Ditinggal wafat, dengan anak", en: "Widowed, with children" },
  phd_masters: { id: "S2 / S3", en: "Master's or PhD" },
  bachelors_min: { id: "Minimal S1", en: "Bachelor's minimum" },
  any_educated: { id: "Bebas, asal berpendidikan", en: "Any, as long as educated" },
  same_city: { id: "Sekota", en: "Same city" },
  "Same City": { id: "Sekota", en: "Same city" },
  diff_city_ok: { id: "Lain kota tidak masalah", en: "Different city is fine" },
  relocate_ok: { id: "Bersedia pindah", en: "Willing to relocate" },
  /* origin */
  indonesian: { id: "Indonesia", en: "Indonesian" },
  Indonesian: { id: "Indonesia", en: "Indonesian" },
  javanese: { id: "Jawa", en: "Javanese" },
  Javanese: { id: "Jawa", en: "Javanese" },
  sundanese: { id: "Sunda", en: "Sundanese" },
  Sundanese: { id: "Sunda", en: "Sundanese" },
};

/** The same stored code means different things on different fields. */
const FIELD_VALUE_LABELS: Record<string, Record<string, Record<Lang, string>>> = {
  hijab: { yes_full: { id: "Ya, selalu", en: "Yes, always" } },
  beard: { yes_full: { id: "Ya, lebat", en: "Yes, full" } },
  polygamyView: {
    not_open: { id: "Tidak bersedia", en: "Not open to it" },
    yes: { id: "Terbuka", en: "Open to it" },
    no: { id: "Tidak bersedia", en: "Not open to it" },
  },
  openToDivorcedOrWidowed: {
    not_open: { id: "Hanya lajang", en: "Single only" },
    yes: { id: "Terbuka", en: "Open" },
    no: { id: "Hanya lajang", en: "Single only" },
  },
  financialManagementStyle: { joint: { id: "Dikelola bersama", en: "Managed jointly" } },
  decisionMakingStyle: { joint: { id: "Diputuskan bersama", en: "Decided together" } },
  weddingPreference: { moderate: { id: "Sedang", en: "Moderate" } },
};

/** Stored options for "living with" — shared by every editor so the value always translates. */
export const LIVING_WITH_OPTIONS = [
  "alone", "with_parents", "with_mother", "with_father", "with_siblings", "with_family", "with_children", "with_roommates", "other",
] as const;

export function livingWithLabel(value: string, lang: Lang): string {
  return VALUE_LABELS[value]?.[lang] ?? value;
}

/** Fields that hold a score out of ten. */
const OUT_OF_TEN_FIELDS = new Set(["familyOriented"]);

/** Fields that store an education level code. */
const EDUCATION_LEVEL_FIELDS = new Set(["preferredEducationLevel"]);

/** "employed_full" → "Employed full", for codes nobody has written a label for yet. */
function humanizeCode(value: string): string {
  if (!/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(value)) return value;
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function labelFor(value: string, lang: Lang, field?: string): string {
  if (field) {
    const own = FIELD_VALUE_LABELS[field]?.[value]?.[lang];
    if (own) return own;
    if (EDUCATION_LEVEL_FIELDS.has(field) && EDUCATION_LEVELS[value]) return EDUCATION_LEVELS[value][lang];
    if (OUT_OF_TEN_FIELDS.has(field) && /^(10|[1-9])$/.test(value)) return `${value} / 10`;
  }
  return VALUE_LABELS[value]?.[lang] ?? humanizeCode(value);
}

const EDUCATION_LEVELS: Record<string, Record<Lang, string>> = {
  sd: { id: "SD", en: "Elementary" },
  smp: { id: "SMP", en: "Junior High" },
  sma: { id: "SMA", en: "High School" },
  sma_smk: { id: "SMA / SMK", en: "High School" },
  high_school: { id: "SMA", en: "High School" },
  d3: { id: "D3", en: "Associate's" },
  diploma: { id: "Diploma", en: "Diploma" },
  s1_d4: { id: "S1/D4", en: "Bachelor's" },
  bachelors: { id: "S1", en: "Bachelor's" },
  s2: { id: "S2", en: "Master's" },
  masters: { id: "S2", en: "Master's" },
  s3: { id: "S3", en: "PhD" },
  phd: { id: "S3", en: "PhD" },
  pesantren: { id: "Pesantren", en: "Pesantren" },
  lainnya: { id: "Lainnya", en: "Other" },
};

export function fieldLabel(field: string, lang: Lang): string {
  return FIELD_LABELS[field]?.[lang] ?? field;
}

/**
 * Renders any stored profile value as display text, or null when empty.
 * Pass the field so codes that are shared between fields read correctly.
 */
export function displayValue(value: unknown, lang: Lang, field?: string): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (Array.isArray(value)) {
    const parts = value
      .map(entry => {
        if (entry && typeof entry === "object" && "level" in entry) {
          const e = entry as { level?: string; major?: string };
          const level = e.level ? EDUCATION_LEVELS[e.level]?.[lang] ?? e.level : "";
          return [level, e.major].filter(Boolean).join(" — ");
        }
        return typeof entry === "string" ? labelFor(entry, lang, field) : String(entry);
      })
      .filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  }

  if (typeof value === "boolean") return value ? VALUE_LABELS.yes[lang] : VALUE_LABELS.no[lang];
  if (typeof value === "number") return labelFor(String(value), lang, field);
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || /^[-–—]$/.test(trimmed)) return null;
  // Long-form answers are the candidate's own words — never relabel them.
  if (field && LONG_FORM_FIELDS.has(field)) return trimmed;
  return labelFor(trimmed, lang, field);
}
