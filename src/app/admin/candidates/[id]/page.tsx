"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import MenAvatar   from "@/assets/men-avatar.png";
import WomenAvatar from "@/assets/women-avatar.png";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import {
  MapPin, Briefcase, GraduationCap, CheckCircle2, Heart,
  Brain, ClipboardList, ChevronLeft, ChevronRight, Eye, EyeOff,
  AlertTriangle, CheckCircle, Fingerprint, Award,
  Pencil, Save, X, UserPlus, Trash2, Clock, Star, ToggleLeft,
  BookOpen, Shield, Leaf, Target, Users, CalendarDays,
  ArrowLeft, LayoutList, Plus, Download, FileText,
} from "lucide-react";

/* ── palette ─────────────────────────────────────────────────────────── */
const C = {
  bg:      "#EEF2F7",
  card:    "#FFFFFF",
  tile:    "#F8FAFC",
  border:  "#E2E8F0",
  div:     "#F8FAFC",
  primary: "#1B3A6B",
  text:    "#0F172A",
  body:    "#64748B",
  muted:   "#94A3B8",
  empty:   "#CBD5E1",
  label:   "#475569",
  accent:  "#C4294A",
  g1:      "#1B3A6B",
  g2:      "#C4294A",
  iconBg:  "#EEF2F7",
};

/* ── types ────────────────────────────────────────────────────────────── */
type D = Record<string, unknown>;
type Lang = "id" | "en";
type SectionMeta = { updatedByName: string; updatedAt: string };
interface WorkerRow { uid: string; name: string; email: string }

/* ── section → field map ─────────────────────────────────────────────── */
const SF: Record<string, string[]> = {
  "tentang-saya":    ["aboutMe"],
  "nilai-keyakinan": ["quranReading","islamicKnowledgeLevel","halalLifestyleStrictness","viewsOnMixedSocializing"],
  "gaya-hidup":      ["smokingStatus","alcoholUse","drugUse","exerciseFrequency","socialPreference","dietaryRestrictions"],
  "tujuan":          ["maritalTimeline","weddingPreference","financialManagementStyle","decisionMakingStyle"],
  "profil-agama":    ["religion","religiousPracticeLevel","prayerHabit","quranReading","hijab","beard","waliAvailability","maharExpectation","maharBudget","polygamyView"],
  "data-pribadi":    ["age","gender","dateOfBirth","nationality","ethnicity","height","weight","bloodType","birthPlace","currentlyLivingWith","whatsappNumber","ownHealthCondition"],
  "karir":           ["occupation","employmentStatus","incomeRange","propertyStatus","hasDebts","financialGoalsAfterMarriage"],
  "kriteria":        ["preferredMinAge","preferredMaxAge","preferredReligion","prefReligionLevel","prefHijabBeard","prefMazhab","preferredEducationLevel","prefPreviousStatus","openToDivorcedOrWidowed","openToDifferentEthnicity","preferredLocationOfSpouse","prefDomicile","prefWorkStatus","prefJobField","prefMinIncome","prefMinHeight","prefMaxHeight","prefBodyType","prefChildrenFromPrevious","prefMaxChildren","prefLivingWithFamily","prefPersonalityType","prefSmokingAcceptance","prefWifeCareer","prefHealthCondition","preferredPersonalityTraits","physicalPreferences","spouseDealBreakers"],
  "harapan":         ["roleExpectationsHusband","roleExpectationsWife"],
  "catatan-tim":     ["salesLeadNotes","profileMakerNotes","imamNotes","psychologistNotes","receptionistNotes","internalTeamNotes","emotionalReadinessAssessment","backgroundCheckerNotes"],
  "sidebar-quick":   ["location","gender","personStatus","openToTaaruf","occupation","educations","maritalStatus"],
  "crm-internal":    ["lastContact","nextFollowUp","paket","pic","sumberLead","targetWaktuMenikah"],
  "status-profil":   ["profileStatus","personStatus","openToTaaruf","catatanPersiapan","paket","targetWaktuMenikah","pic","sumberLead","profileActivatedAt","profileActivatedBy","profileNotes","photoVisibility"],
  "keluarga-saudara":["siblingCount","childOrder","maleSiblingCount","femaleSiblingCount"],
  "keluarga-anak":   ["childrenCount","childrenLivingWith","childCustody"],
  "wali":            ["waliName","waliContact","waliRelationship"],
  "tes-psikologi":   ["psychTestStatus","psychTestDate","psychTestProvider","psychTestPersonalityType","psychTestEmotionalReadiness","psychTestAttachmentStyle","psychTestConflictStyle","psychTestCommunicationStyle","psychTestMarriageReadiness","psychTestRecommendation","psychTestNotes"],
  "background-check":["bgCheckStatus","bgCheckDate","bgCheckFamilyBackground","bgCheckFinancialStatus","bgCheckCriminalRecord","bgCheckSocialMediaCheck","bgCheckReferenceResult","bgCheckOverallResult","bgCheckNotes"],
  "identity-check":  ["idCheckStatus","idCheckDate","ktpVerified","ktpNumber","passportVerified","idCheckVerifiedBy","idCheckOverallResult","idCheckNotes"],
  "kriteria-jodohmu":["jodohmuCriteriaStatus","jodohmuCriteriaDate","jodohmuCriteriaAssessor","jodohmuCriteriaPsychological","jodohmuCriteriaReligious","jodohmuCriteriaFinancial","jodohmuCriteriaFamilyBackground","jodohmuCriteriaPersonality","jodohmuCriteriaMarriageReadiness","jodohmuCriteriaRecommendation","jodohmuCriteriaConditions","jodohmuCriteriaSpecialNotes"],
};

/* ── value translations ──────────────────────────────────────────────── */
const V: Record<string, Record<Lang, string>> = {
  male:                      { id: "Laki-laki",             en: "Male" },
  female:                    { id: "Perempuan",              en: "Female" },
  active:                    { id: "Aktif",                  en: "Active" },
  inactive:                  { id: "Tidak Aktif",            en: "Inactive" },
  pending:                   { id: "Menunggu",               en: "Pending" },
  suspended:                 { id: "Ditangguhkan",           en: "Suspended" },
  yes:                       { id: "Ya",                     en: "Yes" },
  no:                        { id: "Tidak",                  en: "No" },
  never:                     { id: "Tidak pernah",           en: "Never" },
  occasionally:              { id: "Kadang-kadang",          en: "Occasionally" },
  regularly:                 { id: "Rutin",                  en: "Regularly" },
  quit:                      { id: "Sudah berhenti",         en: "Quit" },
  rarely:                    { id: "Jarang",                 en: "Rarely" },
  sometimes:                 { id: "Kadang",                 en: "Sometimes" },
  daily:                     { id: "Setiap hari",            en: "Daily" },
  introvert:                 { id: "Introvert",              en: "Introvert" },
  extrovert:                 { id: "Ekstrovert",             en: "Extrovert" },
  ambivert:                  { id: "Ambivert",               en: "Ambivert" },
  none:                      { id: "Tidak ada",              en: "None" },
  halal_only:                { id: "Halal saja",             en: "Halal only" },
  vegetarian:                { id: "Vegetarian",             en: "Vegetarian" },
  vegan:                     { id: "Vegan",                  en: "Vegan" },
  always:                    { id: "Selalu",                 en: "Always" },
  mostly:                    { id: "Sebagian besar",         en: "Mostly" },
  weekly:                    { id: "Mingguan",               en: "Weekly" },
  basic:                     { id: "Dasar",                  en: "Basic" },
  intermediate:              { id: "Menengah",               en: "Intermediate" },
  advanced:                  { id: "Lanjutan",               en: "Advanced" },
  strict:                    { id: "Ketat",                  en: "Strict" },
  moderate:                  { id: "Moderat",                en: "Moderate" },
  relaxed:                   { id: "Santai",                 en: "Relaxed" },
  avoid:                     { id: "Menghindari",            en: "Avoid" },
  limited:                   { id: "Terbatas",               en: "Limited" },
  comfortable:               { id: "Nyaman",                 en: "Comfortable" },
  asap:                      { id: "Sesegera mungkin",       en: "As soon as possible" },
  "6_months":                { id: "6 Bulan",                en: "6 Months" },
  "1_year":                  { id: "1 Tahun",                en: "1 Year" },
  "2_years":                 { id: "2 Tahun",                en: "2 Years" },
  "3_plus_years":            { id: "3+ Tahun",               en: "3+ Years" },
  not_sure:                  { id: "Belum pasti",            en: "Not sure" },
  simple:                    { id: "Sederhana",              en: "Simple" },
  grand:                     { id: "Mewah",                  en: "Grand" },
  no_preference:             { id: "Tidak ada preferensi",   en: "No preference" },
  joint:                     { id: "Bersama",                en: "Joint" },
  separate:                  { id: "Terpisah",               en: "Separate" },
  husband_manages:           { id: "Suami kelola",           en: "Husband manages" },
  wife_manages:              { id: "Istri kelola",           en: "Wife manages" },
  discussed:                 { id: "Didiskusikan",           en: "Discussed" },
  husband_leads:             { id: "Suami memimpin",         en: "Husband leads" },
  wife_leads:                { id: "Istri memimpin",         en: "Wife leads" },
  discussed_case_by_case:    { id: "Kasus per kasus",        en: "Case by case" },
  conditional:               { id: "Kondisional",            en: "Conditional" },
  Islam:                     { id: "Islam",                  en: "Islam" },
  Christian:                 { id: "Kristen",                en: "Christian" },
  Catholic:                  { id: "Katolik",                en: "Catholic" },
  Hindu:                     { id: "Hindu",                  en: "Hindu" },
  Buddhist:                  { id: "Buddha",                 en: "Buddhist" },
  Other:                     { id: "Lainnya",                en: "Other" },
  very_practicing:           { id: "Sangat taat",            en: "Very practicing" },
  practicing:                { id: "Taat",                   en: "Practicing" },
  not_practicing:            { id: "Tidak taat",             en: "Not practicing" },
  yes_full:                  { id: "Ya, penuh",              en: "Yes, full" },
  yes_sometimes:             { id: "Kadang",                 en: "Sometimes" },
  converting:                { id: "Dalam proses",           en: "Converting" },
  in_process:                { id: "Dalam proses",           en: "In process" },
  accept:                    { id: "Menerima",               en: "Accept" },
  not_accept:                { id: "Tidak terima",           en: "Not accept" },
  employed:                  { id: "Karyawan",               en: "Employed" },
  self_employed:             { id: "Wiraswasta",             en: "Self-employed" },
  business_owner:            { id: "Pemilik usaha",          en: "Business owner" },
  unemployed:                { id: "Tidak bekerja",          en: "Unemployed" },
  student:                   { id: "Pelajar/Mahasiswa",      en: "Student" },
  retired:                   { id: "Pensiun",                en: "Retired" },
  below_5m:                  { id: "Di bawah 5 Juta",        en: "Below 5M IDR" },
  "5m_10m":                  { id: "5–10 Juta",              en: "5–10M IDR" },
  "10m_20m":                 { id: "10–20 Juta",             en: "10–20M IDR" },
  "20m_50m":                 { id: "20–50 Juta",             en: "20–50M IDR" },
  above_50m:                 { id: "Di atas 50 Juta",        en: "Above 50M IDR" },
  prefer_not_to_say:         { id: "Tidak ingin berbagi",    en: "Prefer not to say" },
  own:                       { id: "Milik sendiri",          en: "Own" },
  rent:                      { id: "Sewa",                   en: "Rent" },
  family_home:               { id: "Rumah keluarga",         en: "Family home" },
  company_provided:          { id: "Fasilitas kantor",       en: "Company provided" },
  single:                    { id: "Lajang",                 en: "Single" },
  divorced:                  { id: "Cerai",                  en: "Divorced" },
  widowed:                   { id: "Janda/Duda",             en: "Widowed" },
  low:                       { id: "Rendah",                 en: "Low" },
  medium:                    { id: "Sedang",                 en: "Medium" },
  high:                      { id: "Tinggi",                 en: "High" },
  secure:                    { id: "Aman",                   en: "Secure" },
  anxious:                   { id: "Cemas",                  en: "Anxious" },
  avoidant:                  { id: "Menghindar",             en: "Avoidant" },
  disorganized:              { id: "Tidak teratur",          en: "Disorganized" },
  approved:                  { id: "Disetujui",              en: "Approved" },
  needs_counseling:          { id: "Perlu konseling",        en: "Needs counseling" },
  not_recommended:           { id: "Tidak direkomendasikan", en: "Not recommended" },
  stable:                    { id: "Stabil",                 en: "Stable" },
  unstable:                  { id: "Tidak stabil",           en: "Unstable" },
  flagged:                   { id: "Ditandai",               en: "Flagged" },
  clean:                     { id: "Bersih",                 en: "Clean" },
  cleared:                   { id: "Disetujui",              en: "Cleared" },
  verified:                  { id: "Terverifikasi",          en: "Verified" },
  unverified:                { id: "Tidak terverifikasi",    en: "Unverified" },
  partial:                   { id: "Sebagian",               en: "Partial" },
  not_verified:              { id: "Tidak terverifikasi",    en: "Not verified" },
  not_applicable:            { id: "Tidak berlaku",          en: "Not applicable" },
  not_approved:              { id: "Tidak disetujui",        en: "Not approved" },
  not_done:                  { id: "Belum dilakukan",        en: "Not done" },
  in_progress:               { id: "Sedang berjalan",        en: "In progress" },
  done:                      { id: "Selesai",                en: "Done" },
  A: { id: "A", en: "A" }, B: { id: "B", en: "B" }, AB: { id: "AB", en: "AB" }, O: { id: "O", en: "O" },
  /* account status */
  not_registered:   { id: "Belum Terdaftar",                     en: "Not Registered" },
  registered:       { id: "Terdaftar",                           en: "Registered" },
  id_verified:      { id: "KTP Terverifikasi",                   en: "ID Verified" },
  bg_checked:       { id: "Background Check Selesai",            en: "BG Check Completed" },
  psych_assessed:   { id: "Psikotest Selesai",                   en: "Psych Assessment Done" },
  /* person status */
  new_lead:             { id: "Mencari Pasangan",                  en: "Searching Matches" },
  registered_looking:   { id: "Mencari Pasangan",                  en: "Searching Matches" },
  matched:              { id: "Dipertemukan",                    en: "Matched" },
  in_taaruf:            { id: "Dalam Ta'aruf",                   en: "In Ta'aruf" },
  family_meeting:       { id: "Pertemuan Keluarga",              en: "Family Meeting Stage" },
  closed_success:       { id: "Selesai — Menikah",               en: "Closed — Success" },
  closed_withdrawn:     { id: "Selesai — Mundur",                en: "Closed — Withdrawn" },
  /* open taaruf */
  ready:            { id: "Open to Ta'aruf",                     en: "Open to Ta'aruf" },
  preparing:        { id: "Persiapan Ta'aruf",                   en: "Preparing for Ta'aruf" },
  /* paket */
  not_selected:     { id: "Belum Pilih Paket",                   en: "No Plan Selected" },
  pearl:            { id: "Pearl",                               en: "Pearl" },
  ruby:             { id: "Ruby",                                en: "Ruby" },
  diamond:          { id: "Diamond",                             en: "Diamond" },
  safar:            { id: "Safar",                               en: "Safar" },
  amanah:           { id: "Amanah",                             en: "Amanah" },
  custom:           { id: "Custom",                             en: "Custom" },
  /* target waktu menikah */
  under_3m:         { id: "< 3 bulan",                          en: "< 3 months" },
  "3_6m":           { id: "3–6 bulan",                          en: "3–6 months" },
  "6_12m":          { id: "6–12 bulan",                         en: "6–12 months" },
  "1yr_plus":       { id: "1 tahun+",                           en: "1 year+" },
  /* pic */
  tia:              { id: "Tia",                                 en: "Tia" },
  abi:              { id: "Abi",                                 en: "Abi" },
  tia_abi:          { id: "Tia & Abi",                          en: "Tia & Abi" },
  /* sumber lead */
  threads_form:     { id: "Form Threads",                        en: "Threads Form" },
  website_form:     { id: "Form Website",                        en: "Website Form" },
  instagram:        { id: "Instagram",                           en: "Instagram" },
  mitra_referral:   { id: "Mitra Referral",                     en: "Partner Referral" },
  dm_langsung:      { id: "DM Langsung",                        en: "Direct DM" },
  lainnya:          { id: "Lainnya",                             en: "Other" },
  custody_self:   { id: "Sendiri",                          en: "Self" },
  custody_ex:     { id: "Mantan Pasangan",                  en: "Ex-Partner" },
  custody_shared: { id: "Bersama",                          en: "Shared" },
  visible_all:    { id: "Terlihat oleh Semua Pool",         en: "Visible to All Pool" },
  after_match:    { id: "Hanya Setelah Match Disetujui",    en: "After Match Approved" },
  /* partner preference values */
  no_pref:          { id: "Tidak Masalah",                       en: "No Preference" },
  required:         { id: "Wajib",                               en: "Required" },
  preferred:        { id: "Preferensi",                          en: "Preferred" },
  nu:               { id: "Nahdlatul Ulama (NU)",                en: "Nahdlatul Ulama (NU)" },
  muhammadiyah:     { id: "Muhammadiyah",                        en: "Muhammadiyah" },
  salafi:           { id: "Salafi / Wahabi",                     en: "Salafi / Wahhabi" },
  netral:           { id: "Netral",                              en: "Neutral" },
  single_only:      { id: "Lajang Saja",                        en: "Single Only" },
  open_divorced:    { id: "Terbuka Cerai / Janda-Duda",         en: "Open to Divorced/Widowed" },
  open_all:         { id: "Terbuka Semua Status",                en: "Open to All" },
  same_city:        { id: "Sekota",                              en: "Same City" },
  diff_city_ok:     { id: "Lain Kota OK",                       en: "Different City OK" },
  relocate_ok:      { id: "Bersedia Pindah",                    en: "Willing to Relocate" },
  must_work:        { id: "Wajib Bekerja",                      en: "Must Be Working" },
  slim_build:       { id: "Langsing / Kurus",                   en: "Slim" },
  average_build:    { id: "Rata-rata",                          en: "Average Build" },
  athletic_build:   { id: "Atletis / Sehat",                    en: "Athletic" },
  max_certain:      { id: "Ya, maks. tertentu",                 en: "Yes, up to a max" },
  flexible:         { id: "Fleksibel",                          en: "Flexible" },
  accepted:         { id: "Diterima",                           en: "Accepted" },
  not_accepted:     { id: "Tidak Diterima",                     en: "Not Accepted" },
  continue_work:    { id: "Lanjut Bekerja",                     en: "Continue Working" },
  stay_home:        { id: "Di Rumah / Fokus Keluarga",          en: "Stay at Home" },
  depends:          { id: "Tergantung",                         en: "Depends" },
};

/* ── field dropdown options ──────────────────────────────────────────── */
const OPTS: Record<string, string[]> = {
  gender:                      ["male","female"],
  profileStatus:               ["not_registered","registered","id_verified","bg_checked","psych_assessed","inactive"],
  personStatus:                ["registered_looking","matched","in_taaruf","family_meeting","closed_success","closed_withdrawn"],
  openToTaaruf:                ["ready","preparing","no"],
  paket:                       ["not_selected","pearl","ruby","diamond","safar","amanah","custom"],
  targetWaktuMenikah:          ["under_3m","3_6m","6_12m","1yr_plus","not_sure"],
  pic:                         ["tia","abi","tia_abi"],
  sumberLead:                  ["threads_form","website_form","instagram","mitra_referral","dm_langsung","lainnya"],
  smokingStatus:               ["never","occasionally","regularly","quit"],
  alcoholUse:                  ["never","occasionally","regularly"],
  drugUse:                     ["never","occasionally","regularly"],
  exerciseFrequency:           ["never","rarely","sometimes","regularly","daily"],
  socialPreference:            ["introvert","extrovert","ambivert"],
  dietaryRestrictions:         ["none","halal_only","vegetarian","vegan"],
  prayerHabit:                 ["always","mostly","sometimes","rarely","never"],
  quranReading:                ["daily","weekly","occasionally","rarely","never"],
  islamicKnowledgeLevel:       ["basic","intermediate","advanced"],
  halalLifestyleStrictness:    ["strict","moderate","relaxed"],
  viewsOnMixedSocializing:     ["avoid","limited","comfortable"],
  maritalTimeline:             ["asap","6_months","1_year","2_years","3_plus_years","not_sure"],
  weddingPreference:           ["simple","moderate","grand","no_preference"],
  financialManagementStyle:    ["joint","separate","husband_manages","wife_manages","discussed"],
  decisionMakingStyle:         ["joint","husband_leads","wife_leads","discussed_case_by_case"],
  preferredReligion:           ["Islam","Christian","Catholic","Hindu","Buddhist","Other","no_preference"],
  openToDivorcedOrWidowed:     ["yes","no","conditional"],
  openToDifferentEthnicity:    ["yes","no"],
  religion:                    ["Islam","Christian","Catholic","Hindu","Buddhist","Other"],
  religiousPracticeLevel:      ["very_practicing","practicing","moderate","not_practicing"],
  hijab:                       ["yes_full","yes_sometimes","no","converting"],
  beard:                       ["yes","no","sometimes"],
  waliAvailability:            ["yes","no","in_process"],
  polygamyView:                ["accept","not_accept","conditional"],
  employmentStatus:            ["employed","self_employed","business_owner","unemployed","student","retired"],
  incomeRange:                 ["below_5m","5m_10m","10m_20m","20m_50m","above_50m","prefer_not_to_say"],
  propertyStatus:              ["own","rent","family_home","company_provided"],
  hasDebts:                    ["yes","no"],
  maritalStatus:               ["single","divorced","widowed"],
  bloodType:                   ["A","B","AB","O"],
  ktpVerified:                 ["yes","no"],
  passportVerified:            ["yes","no","not_applicable"],
  psychTestEmotionalReadiness: ["low","medium","high"],
  psychTestAttachmentStyle:    ["secure","anxious","avoidant","disorganized"],
  psychTestMarriageReadiness:  ["low","medium","high"],
  psychTestRecommendation:     ["approved","needs_counseling","not_recommended"],
  bgCheckFinancialStatus:      ["stable","unstable","flagged"],
  bgCheckCriminalRecord:       ["clean","flagged","pending"],
  bgCheckSocialMediaCheck:     ["clean","flagged"],
  bgCheckReferenceResult:      ["verified","unverified","partial"],
  bgCheckOverallResult:        ["cleared","flagged","pending"],
  idCheckOverallResult:        ["verified","partial","not_verified"],
  jodohmuCriteriaRecommendation: ["approved","conditional","not_approved"],
  childCustody:   ["custody_self","custody_ex","custody_shared"],
  photoVisibility:["visible_all","after_match"],
  /* partner preferences — new fields */
  prefReligionLevel:        ["very_practicing","practicing","moderate","no_pref"],
  prefHijabBeard:           ["required","preferred","no_pref"],
  prefMazhab:               ["nu","muhammadiyah","salafi","netral","lainnya"],
  prefPreviousStatus:       ["single_only","open_divorced","open_all"],
  prefDomicile:             ["same_city","diff_city_ok","relocate_ok"],
  prefWorkStatus:           ["must_work","no_pref"],
  prefBodyType:             ["slim_build","average_build","athletic_build","no_pref"],
  prefChildrenFromPrevious: ["accepted","not_accepted","max_certain"],
  prefLivingWithFamily:     ["yes","no","flexible"],
  prefPersonalityType:      ["introvert","extrovert","ambivert","no_pref"],
  prefSmokingAcceptance:    ["accepted","not_accepted"],
  prefWifeCareer:           ["continue_work","stay_home","flexible"],
  prefHealthCondition:      ["accepted","not_accepted","depends"],
};

/* Education levels */
const EDU_LEVELS: Array<{ value: string; id: string; en: string }> = [
  { value: "sd",       id: "SD",            en: "Primary School" },
  { value: "smp",      id: "SMP",           en: "Junior High" },
  { value: "sma_smk",  id: "SMA / SMK",     en: "Senior High / Vocational" },
  { value: "d3",       id: "D3",            en: "Diploma" },
  { value: "s1_d4",    id: "S1 / D4",       en: "Bachelor" },
  { value: "s2",       id: "S2",            en: "Master" },
  { value: "s3",       id: "S3",            en: "Doctorate" },
  { value: "pesantren",id: "Pesantren",     en: "Islamic Boarding School" },
  { value: "lainnya",  id: "Lainnya",       en: "Other" },
];
function dispEduLevel(v: string, lang: Lang): string {
  const found = EDU_LEVELS.find(e => e.value === v);
  return found ? found[lang] : v;
}
const MAJORS: Array<{ value: string; id: string; en: string }> = [
  { value: "teknik",          id: "Teknik",                    en: "Engineering" },
  { value: "informatika",     id: "Informatika & IT",          en: "Computer Science & IT" },
  { value: "ekonomi_bisnis",  id: "Ekonomi & Bisnis",          en: "Economics & Business" },
  { value: "kedokteran",      id: "Kedokteran & Kesehatan",    en: "Medicine & Health" },
  { value: "farmasi",         id: "Farmasi",                   en: "Pharmacy" },
  { value: "hukum",           id: "Hukum",                     en: "Law" },
  { value: "agama_dakwah",    id: "Agama & Dakwah",            en: "Islamic Studies & Dakwah" },
  { value: "psikologi",       id: "Psikologi",                 en: "Psychology" },
  { value: "sosial_politik",  id: "Ilmu Sosial & Politik",     en: "Social & Political Science" },
  { value: "komunikasi",      id: "Ilmu Komunikasi",           en: "Communication" },
  { value: "pendidikan",      id: "Pendidikan & Keguruan",     en: "Education & Teaching" },
  { value: "pertanian",       id: "Pertanian & Lingkungan",    en: "Agriculture & Environment" },
  { value: "seni_desain",     id: "Seni & Desain",             en: "Arts & Design" },
  { value: "arsitektur",      id: "Arsitektur",                en: "Architecture" },
  { value: "matematika_sains",id: "Matematika & Sains",        en: "Mathematics & Science" },
  { value: "pariwisata",      id: "Pariwisata & Perhotelan",   en: "Hospitality & Tourism" },
  { value: "lainnya",         id: "Lainnya",                   en: "Other" },
];
function dispMajor(v: string, lang: Lang): string {
  const found = MAJORS.find(m => m.value === v);
  return found ? found[lang] : v;
}
type EduEntry = { level: string; major: string };
function getEducations(d: D): EduEntry[] {
  return Array.isArray(d.educations) ? (d.educations as EduEntry[]) : [];
}
function getProfileStatuses(d: D): string[] {
  if (Array.isArray(d.profileStatus)) return d.profileStatus as string[];
  if (d.profileStatus && typeof d.profileStatus === "string") return [d.profileStatus];
  return [];
}

/* Plans that include background check / psych assessment */
const PLAN_HAS_BGCHECK  = new Set(["ruby","diamond"]);
const PLAN_HAS_PSYCH    = new Set(["ruby","diamond"]);
const PLAN_HAS_IDCHECK  = new Set(["pearl","ruby","diamond"]);
const PLAN_LABELS: Record<string, string> = {
  ruby: "Ruby", diamond: "Diamond", pearl: "Pearl", safar: "Safar", amanah: "Amanah",
};

/* ── UI string translations ──────────────────────────────────────────── */
const T: Record<Lang, Record<string, string>> = {
  id: {
    back: "Kembali ke Kandidat", save: "Simpan", cancel: "Batal", saving: "…",
    not_filled: "Belum diisi.", not_set: "Belum diset",
    assign: "Tugaskan", pick_worker: "Pilih worker…",
    workers_title: "Workers Ditugaskan", no_workers: "Belum ada worker yang ditugaskan.",
    open_taaruf: "Open Ta'aruf", not_open: "Tidak Open Ta'aruf", taaruf_not_set: "Taaruf: belum diset",
    activated_by: "Diaktifkan oleh", assessment_div: "Penilaian & Verifikasi",
    years: "Tahun", admin_badge: "Admin", not_done_sfx: "belum dilakukan",
    s_tentang: "Tentang Saya", s_gaya: "Gaya Hidup", s_nilai: "Nilai & Kepribadian",
    s_preferensi: "Preferensi Pasangan", s_tujuan: "Tujuan Pernikahan",
    s_pribadi: "Data Pribadi", s_karir: "Karir & Keuangan", s_agama: "Profil Agama",
    s_kriteria: "Kriteria Pasangan Ideal", s_harapan: "Harapan dalam Pernikahan",
    s_catatan: "Catatan Tim", s_status: "Status Profil",
    s_psikologi: "Tes Psikologi", s_bgcheck: "Background Check",
    s_identity: "Verifikasi Identitas", s_jodohmu: "Penilaian Kriteria Jodohmu",
    f_strengths: "Kekuatan dalam pernikahan", f_growth: "Pertumbuhan diri", f_goals: "Tujuan jangka panjang",
    f_smoking: "Rokok", f_alcohol: "Alkohol", f_exercise: "Olahraga", f_social: "Sosial",
    f_prayer: "Shalat", f_quran: "Quran", f_islamic: "Ilmu Islam", f_halal: "Gaya Hidup Halal",
    f_pref_religion: "Agama", f_pref_minage: "Usia min", f_pref_maxage: "Usia maks",
    f_pref_divorced: "Status sebelumnya", f_pref_ethnicity: "Beda etnis",
    f_timeline: "Target Waktu", f_wedding: "Preferensi Pernikahan",
    f_finance: "Keuangan", f_decision: "Pengambilan Keputusan",
    f_age: "Usia", f_gender: "Jenis Kelamin", f_dob: "Tgl Lahir",
    f_nationality: "Kebangsaan", f_ethnicity: "Suku",
    f_height: "Tinggi", f_weight: "Berat", f_bloodtype: "Gol. Darah",
    f_occupation: "Pekerjaan", f_emp_status: "Status Kerja",
    f_income: "Penghasilan", f_property: "Properti", f_debts: "Hutang",
    f_religion: "Agama", f_practice: "Ibadah", f_prayer2: "Shalat",
    f_hijab: "Hijab", f_beard: "Jenggot", f_polygamy: "Poligami", f_mahar: "Mahar",
    f_pref_education: "Pendidikan", f_pref_location: "Lokasi", f_pref_age_range: "Rentang Usia",
    f_personality_sought: "Kepribadian yang Dicari", f_deal_breaker: "Deal-Breaker Mutlak",
    c_sales: "Sales Lead", c_matchmaker: "Matchmaker", c_imam: "Imam / Ustaz",
    c_psikolog: "Psikolog", c_receptionist: "Penerimaan", c_internal: "Tim Internal",
    sp_status: "Status Akun", sp_person_status: "Status Proses", sp_taaruf: "Open Taaruf",
    sp_paket: "Paket", sp_pic: "PIC", sp_sumber: "Sumber Lead",
    sp_target: "Target Waktu Menikah", sp_catatan_persiapan: "Catatan Persiapan",
    sp_last_contact: "Kontak Terakhir", sp_next_followup: "Follow-up Berikutnya",
    sp_activated_by: "Diaktifkan Oleh", sp_activated_at: "Tanggal Aktivasi", sp_notes: "Catatan",
    ps_date: "Tanggal", ps_provider: "Provider", ps_personality: "Tipe Kepribadian",
    ps_emotional: "Kesiapan Emosi", ps_attachment: "Attachment Style",
    ps_conflict: "Gaya Konflik", ps_communication: "Komunikasi",
    ps_marriage: "Kesiapan Nikah", ps_recommendation: "Rekomendasi", ps_notes: "Catatan",
    bg_date: "Tanggal", bg_family: "Latar Keluarga", bg_financial: "Status Keuangan",
    bg_criminal: "Kriminal", bg_social: "Media Sosial",
    bg_reference: "Referensi", bg_result: "Hasil", bg_notes: "Catatan",
    id_date: "Tanggal", id_ktp: "KTP Terverifikasi", id_ktp_num: "No. KTP",
    id_passport: "Paspor", id_verified_by: "Diverifikasi Oleh",
    id_result: "Hasil", id_notes: "Catatan",
    j_date: "Tanggal", j_assessor: "Penilai", j_recommendation: "Rekomendasi",
    j_dimensions: "Detail Dimensi", j_psych: "Psikologis", j_religious: "Keagamaan",
    j_financial: "Keuangan", j_family: "Latar Keluarga",
    j_personality: "Kepribadian", j_marriage: "Kesiapan Nikah",
    j_conditions: "Syarat / Kondisi", j_special: "Catatan Khusus",
    j_special_ph: "Hal-hal penting yang perlu diketahui…",
    s_keluarga: "Keluarga", s_wali: "Wali / Guardian",
    f_own_health: "Kondisi Kesehatan",
    f_birth_place: "Lahir Di", f_living_with: "Tinggal Dengan", f_whatsapp: "Nomor WhatsApp",
    f_sibling_count: "Jumlah Saudara", f_child_order: "Anak Ke-",
    f_male_siblings: "Saudara Laki-laki", f_female_siblings: "Saudara Perempuan",
    f_children_count: "Jumlah Anak", f_children_living: "Anak Tinggal Dengan",
    f_child_custody: "Hak Asuh", f_wali_name: "Nama Wali",
    f_wali_contact: "Kontak Wali", f_wali_rel: "Hubungan dengan Wali",
    f_photo_visibility: "Visibilitas Foto",
    s_pipeline: "Pipeline & Tracking", f_last_contact: "Kontak Terakhir", f_next_followup: "Follow-up Berikutnya",
    k_saudara: "Saudara Kandung", k_anak: "Anak (jika pernah menikah)",
    k_pref_agama: "Agama & Keimanan", k_pref_demografi: "Demografi",
    k_pref_edu_karir: "Pendidikan & Pekerjaan", k_pref_fisik: "Fisik",
    k_pref_keluarga: "Keluarga & Anak", k_pref_karakter: "Karakter & Gaya Hidup",
    k_pref_kesehatan: "Kesehatan",
    f_pref_religion_lvl: "Tingkat Keagamaan", f_pref_hijab_beard: "Jilbab / Jenggot",
    f_pref_mazhab: "Mazhab / Organisasi", f_pref_prev_status: "Status Sebelumnya",
    f_pref_domicile: "Domisili Preferensi", f_pref_work_status: "Status Pekerjaan",
    f_pref_job_field: "Bidang Pekerjaan", f_pref_min_income: "Penghasilan Minimal (Internal)",
    f_pref_min_height: "Tinggi Min (cm)", f_pref_max_height: "Tinggi Maks (cm)",
    f_pref_body_type: "Preferensi Bentuk Tubuh", f_pref_children_prev: "Anak dari Pernikahan Sebelumnya",
    f_pref_max_children: "Maks. Jumlah Anak Diterima", f_pref_family_living: "Tinggal dengan Keluarga",
    f_pref_personality_type: "Tipe Kepribadian", f_pref_smoking_acc: "Merokok",
    f_pref_wife_career: "Karir Istri Setelah Menikah", f_pref_health: "Kondisi Kesehatan",
    toast_saved: "Berhasil disimpan", toast_error: "Gagal menyimpan. Coba lagi.",
  },
  en: {
    back: "Back to Candidates", save: "Save", cancel: "Cancel", saving: "…",
    not_filled: "Not filled in.", not_set: "Not set",
    assign: "Assign", pick_worker: "Select worker…",
    workers_title: "Assigned Workers", no_workers: "No workers assigned yet.",
    open_taaruf: "Open to Ta'aruf", not_open: "Not Open to Ta'aruf", taaruf_not_set: "Taaruf: not set",
    activated_by: "Activated by", assessment_div: "Assessments & Verification",
    years: "Years", admin_badge: "Admin", not_done_sfx: "not done",
    s_tentang: "About Me", s_gaya: "Lifestyle", s_nilai: "Values & Personality",
    s_preferensi: "Partner Preferences", s_tujuan: "Marriage Goals",
    s_pribadi: "Personal Info", s_karir: "Career & Finance", s_agama: "Religious Profile",
    s_kriteria: "Ideal Partner Criteria", s_harapan: "Marriage Expectations",
    s_catatan: "Team Notes", s_status: "Profile Status",
    s_psikologi: "Psychology Test", s_bgcheck: "Background Check",
    s_identity: "Identity Verification", s_jodohmu: "Jodohmu Criteria Assessment",
    f_strengths: "Strengths in marriage", f_growth: "Personal growth", f_goals: "Long-term life goals",
    f_smoking: "Smoking", f_alcohol: "Alcohol", f_exercise: "Exercise", f_social: "Social",
    f_prayer: "Prayer", f_quran: "Quran", f_islamic: "Islamic knowledge", f_halal: "Halal lifestyle",
    f_pref_religion: "Religion", f_pref_minage: "Min age", f_pref_maxage: "Max age",
    f_pref_divorced: "Previous status", f_pref_ethnicity: "Diff. ethnicity",
    f_timeline: "Timeline", f_wedding: "Wedding preference",
    f_finance: "Finance", f_decision: "Decision making",
    f_age: "Age", f_gender: "Gender", f_dob: "Date of birth",
    f_nationality: "Nationality", f_ethnicity: "Ethnicity",
    f_height: "Height", f_weight: "Weight", f_bloodtype: "Blood type",
    f_occupation: "Occupation", f_emp_status: "Employment status",
    f_income: "Income", f_property: "Property", f_debts: "Debts",
    f_religion: "Religion", f_practice: "Practice level", f_prayer2: "Prayer",
    f_hijab: "Hijab", f_beard: "Beard", f_polygamy: "Polygamy view", f_mahar: "Dowry (Mahar)",
    f_pref_education: "Education", f_pref_location: "Location", f_pref_age_range: "Age range",
    f_personality_sought: "Personality sought", f_deal_breaker: "Absolute Deal-Breakers",
    c_sales: "Sales Lead", c_matchmaker: "Matchmaker", c_imam: "Imam / Ustaz",
    c_psikolog: "Psychologist", c_receptionist: "Receptionist", c_internal: "Internal Team",
    sp_status: "Account Status", sp_person_status: "Person Status", sp_taaruf: "Open to Taaruf",
    sp_paket: "Plan Tier", sp_pic: "PIC", sp_sumber: "Lead Source",
    sp_target: "Marriage Timeline", sp_catatan_persiapan: "Preparation Notes",
    sp_last_contact: "Last Contact", sp_next_followup: "Next Follow-up",
    sp_activated_by: "Activated By", sp_activated_at: "Activation Date", sp_notes: "Notes",
    ps_date: "Date", ps_provider: "Provider", ps_personality: "Personality type",
    ps_emotional: "Emotional readiness", ps_attachment: "Attachment style",
    ps_conflict: "Conflict style", ps_communication: "Communication",
    ps_marriage: "Marriage readiness", ps_recommendation: "Recommendation", ps_notes: "Notes",
    bg_date: "Date", bg_family: "Family background", bg_financial: "Financial status",
    bg_criminal: "Criminal record", bg_social: "Social media",
    bg_reference: "References", bg_result: "Overall result", bg_notes: "Notes",
    id_date: "Date", id_ktp: "KTP verified", id_ktp_num: "KTP number",
    id_passport: "Passport", id_verified_by: "Verified by",
    id_result: "Overall result", id_notes: "Notes",
    j_date: "Date", j_assessor: "Assessor", j_recommendation: "Recommendation",
    j_dimensions: "Dimension Details", j_psych: "Psychological", j_religious: "Religious",
    j_financial: "Financial", j_family: "Family background",
    j_personality: "Personality", j_marriage: "Marriage readiness",
    j_conditions: "Conditions", j_special: "Special Notes",
    j_special_ph: "Important things to know…",
    k_pref_agama: "Religion & Faith", k_pref_demografi: "Demographics",
    k_pref_edu_karir: "Education & Work", k_pref_fisik: "Physical",
    k_pref_keluarga: "Family & Children", k_pref_karakter: "Character & Lifestyle",
    k_pref_kesehatan: "Health",
    f_pref_religion_lvl: "Religiosity Level", f_pref_hijab_beard: "Hijab / Beard",
    f_pref_mazhab: "Mazhab / Organisation", f_pref_prev_status: "Previous Status",
    f_pref_domicile: "Domicile Preference", f_pref_work_status: "Work Status",
    f_pref_job_field: "Job Field", f_pref_min_income: "Min Income (Internal)",
    f_pref_min_height: "Min Height (cm)", f_pref_max_height: "Max Height (cm)",
    f_pref_body_type: "Body Type Preference", f_pref_children_prev: "Children from Prev. Marriage",
    f_pref_max_children: "Max Children Accepted", f_pref_family_living: "Living with Family",
    f_pref_personality_type: "Personality Type", f_pref_smoking_acc: "Smoking",
    f_pref_wife_career: "Wife's Career After Marriage", f_pref_health: "Health Conditions",
    s_keluarga: "Family", s_wali: "Guardian / Wali",
    f_own_health: "Health Condition",
    f_birth_place: "Place of Birth", f_living_with: "Currently Living With", f_whatsapp: "WhatsApp Number",
    f_sibling_count: "No. of Siblings", f_child_order: "Birth Order",
    f_male_siblings: "Male Siblings", f_female_siblings: "Female Siblings",
    f_children_count: "No. of Children", f_children_living: "Children Live With",
    f_child_custody: "Child Custody", f_wali_name: "Guardian Name",
    f_wali_contact: "Guardian Contact", f_wali_rel: "Relationship to Guardian",
    f_photo_visibility: "Photo Visibility",
    s_pipeline: "Pipeline & Tracking", f_last_contact: "Last Contact", f_next_followup: "Next Follow-up",
    k_saudara: "Siblings", k_anak: "Children (if previously married)",
    toast_saved: "Saved successfully", toast_error: "Failed to save. Please try again.",
  },
};

/* ── helpers ─────────────────────────────────────────────────────────── */
function raw(data: D, key: string): string {
  const val = data[key];
  return val && String(val).trim() ? String(val) : "—";
}
function disp(s: string, lang: Lang): string {
  if (!s || s === "—") return "—";
  const entry = V[s];
  if (entry) return entry[lang];
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function isDone(data: D, key: string) { return data[key] === "done"; }

/* ── not-done placeholder ────────────────────────────────────────────── */
function NotDone({ label, lang }: { label: string; lang: Lang }) {
  return (
    <div className="flex items-center gap-2.5 py-5 px-1" style={{ color: "#94A3B8" }}>
      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
      <span className="text-[13px] font-medium">{label} {T[lang].not_done_sfx}</span>
    </div>
  );
}

/* ── result badge ────────────────────────────────────────────────────── */
function ResultBadge({ value, lang }: { value: string; lang: Lang }) {
  const v = value.toLowerCase();
  const ok  = v.includes("approved") || v.includes("cleared") || v.includes("verified") || v === "clean" || v === "yes";
  const bad = v.includes("flagged") || v.includes("not_approved") || v.includes("not_recommended") || v === "no";
  const mid = v.includes("pending") || v.includes("conditional") || v.includes("in_progress") || v.includes("needs");
  const cls = ok  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : bad ? "bg-red-50 text-red-600 border-red-200"
            : mid ? "bg-amber-50 text-amber-700 border-amber-200"
            :       "bg-gray-50 text-gray-500 border-gray-200";
  const Ic  = ok ? CheckCircle : bad ? AlertTriangle : Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11.5px] font-semibold ${cls}`}>
      <Ic className="w-3 h-3" /> {disp(value, lang)}
    </span>
  );
}

/* ── section edit toolbar ────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EditBar({ sk, canEdit, isEditing, isSaving, meta, onEdit, onSave, onCancel, lang }: {
  sk: string; canEdit: boolean; isEditing: boolean; isSaving: boolean;
  meta?: SectionMeta; onEdit: () => void; onSave: () => void; onCancel: () => void; lang: Lang;
}) {
  const t = T[lang];
  return (
    <div className="flex items-center gap-2 shrink-0">
      {canEdit && !isEditing && (
        <button onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#f0ede6]"
          style={{ color: C.muted }}>
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
      {isEditing && (
        <div className="flex items-center gap-1.5">
          <button onClick={onCancel}
            className="flex items-center gap-1 text-[11.5px] font-semibold px-3 py-1.5 rounded-full border transition-colors"
            style={{ borderColor: C.border, color: C.muted, background: "white" }}>
            <X className="w-3 h-3" /> {t.cancel}
          </button>
          <button onClick={onSave} disabled={isSaving}
            className="flex items-center gap-1 text-[11.5px] font-semibold text-white px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            style={{ background: C.primary }}>
            <Save className="w-3 h-3" /> {isSaving ? t.saving : t.save}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── gender avatar placeholder ───────────────────────────────────────── */
function GenderAvatar({ gender }: { gender: string; size?: number }) {
  const src = gender === "female" ? WomenAvatar : MenAvatar;
  return <Image src={src} alt="" className="w-full h-full object-cover object-top" />;
}

/* ── card wrapper ────────────────────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white ${className}`} style={{ border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: "0 2px 8px rgba(15,23,42,0.07), 0 1px 2px rgba(15,23,42,0.04)" }}>
      {children}
    </div>
  );
}

/* ── ghost / collapsed card for empty sections ───────────────────────── */
function GhostCard({ title, icon, iconColor, iconBg, onAdd, lang }: {
  title: string; icon?: React.ReactNode; iconColor?: string; iconBg?: string;
  onAdd: () => void; lang: Lang;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-dashed cursor-pointer group transition-all hover:border-slate-300 hover:bg-slate-50/60"
      style={{ borderColor: "#CBD5E1", background: "#F8FAFC" }}
      onClick={onAdd}
    >
      {icon && (
        <div className="shrink-0 flex items-center justify-center opacity-35" style={{ width: 30, height: 30, borderRadius: 9, background: iconBg ?? "#F1F5F9" }}>
          <span style={{ width: 14, height: 14, color: iconColor ?? "#94A3B8", display: "flex" }}>{icon}</span>
        </div>
      )}
      <span className="text-[12.5px] font-semibold opacity-40" style={{ color: "#475569" }}>{title}</span>
      <div className="flex-1" />
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg border opacity-50 group-hover:opacity-80 transition-opacity" style={{ color: "#64748B", borderColor: "#CBD5E1", background: "#fff" }}>
        {lang === "id" ? "+ Tambah" : "+ Add"}
      </span>
    </div>
  );
}

/* ── section header inside card ──────────────────────────────────────── */
function SH({ title, icon, iconColor, iconBg, sk, canEdit, editing, saving, meta, onEdit, onSave, onCancel, lang }: {
  title: string; icon?: React.ReactNode; iconColor?: string; iconBg?: string;
  sk: string; canEdit: boolean; editing: string | null; saving: string | null;
  meta?: SectionMeta; onEdit: () => void; onSave: () => void; onCancel: () => void; lang: Lang;
}) {
  const isEditing = editing === sk;
  const isSaving  = saving  === sk;
  return (
    <div className="flex items-center gap-3 pb-3.5 mb-4 group" style={{ borderBottom: `1px solid ${C.border}` }}>
      {icon && (
        <div className="shrink-0 flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 10, background: iconBg ?? C.iconBg }}>
          <span style={{ width: 16, height: 16, color: iconColor ?? C.body, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="font-extrabold" style={{ fontSize: 13, color: C.text, letterSpacing: "0.1px" }}>{title}</span>
      </div>
      <EditBar sk={sk} canEdit={canEdit} isEditing={isEditing} isSaving={isSaving} meta={meta} onEdit={onEdit} onSave={onSave} onCancel={onCancel} lang={lang} />
    </div>
  );
}

/* ── field row ───────────────────────────────────────────────────────── */
function FR({ label, value, fieldKey, isEditing, onChange, long, select, lang = "id" }: {
  label: string; value: string; fieldKey: string;
  isEditing: boolean; onChange: (k: string, v: string) => void;
  long?: boolean; select?: string[]; lang?: Lang;
}) {
  const empty = value === "—";
  const displayVal = select ? disp(value, lang) : value;
  return (
    <div className="flex items-start gap-3 py-[10px] last:border-0" style={{ borderBottom: `1px solid ${C.div}` }}>
      <span className="text-[12px] font-medium shrink-0 pt-0.5" style={{ color: C.body, width: 118 }}>{label}</span>
      {isEditing
        ? select
          ? <select className="flex-1 text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none bg-white" style={{ borderColor: C.border, color: C.text }} value={value === "—" ? "" : value} onChange={e => onChange(fieldKey, e.target.value)}>
              <option value="">—</option>
              {select.map(o => <option key={o} value={o}>{disp(o, lang)}</option>)}
            </select>
          : long
            ? <textarea rows={3} className="flex-1 text-[13px] rounded-lg px-2.5 py-1.5 border resize-none focus:outline-none" style={{ borderColor: C.border, color: C.text }} value={value === "—" ? "" : value} onChange={e => onChange(fieldKey, e.target.value)} placeholder="—" />
            : <input className="flex-1 text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }} value={value === "—" ? "" : value} onChange={e => onChange(fieldKey, e.target.value)} placeholder="—" />
        : <span className="flex-1" style={{ fontSize: 13, fontWeight: empty ? 400 : 700, color: empty ? C.empty : C.text, fontStyle: empty ? "italic" : "normal" }}>{displayVal}</span>
      }
    </div>
  );
}

/* ── info chip ───────────────────────────────────────────────────────── */
function Chip({ label, value, isEditing, fieldKey, onChange, select, lang = "id" }: {
  label: string; value: string; isEditing: boolean; fieldKey: string;
  onChange: (k: string, v: string) => void; select?: string[]; lang?: Lang;
}) {
  const displayVal = select ? disp(value, lang) : value;
  return (
    <div className="rounded-xl p-3.5" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>{label}</p>
      {isEditing
        ? select
          ? <select className="w-full text-[13px] font-semibold bg-transparent border-0 focus:outline-none" style={{ color: C.text }} value={value === "—" ? "" : value} onChange={e => onChange(fieldKey, e.target.value)}>
              <option value="">—</option>
              {select.map(o => <option key={o} value={o}>{disp(o, lang)}</option>)}
            </select>
          : <input className="w-full text-[13px] font-semibold bg-transparent border-0 focus:outline-none border-b" style={{ color: C.text, borderColor: C.border }} value={value === "—" ? "" : value} onChange={e => onChange(fieldKey, e.target.value)} placeholder="—" />
        : <p className="text-[13px] font-semibold leading-snug" style={{ color: value === "—" ? C.muted : C.text }}>{displayVal}</p>
      }
    </div>
  );
}

/* ── status toggle pills ─────────────────────────────────────────────── */
function statusColor(v: string) {
  if (v === "not_registered") return `bg-gray-100 text-gray-500 border-gray-200`;
  if (v === "registered")     return `bg-blue-50 text-blue-700 border-blue-200`;
  if (v === "id_verified")    return `bg-indigo-50 text-indigo-700 border-indigo-200`;
  if (v === "bg_checked")     return `bg-teal-50 text-teal-700 border-teal-200`;
  if (v === "psych_assessed") return `bg-purple-50 text-purple-700 border-purple-200`;
  if (v === "inactive")       return `bg-red-50 text-red-500 border-red-200`;
  /* legacy */
  if (v === "active")    return `bg-emerald-50 text-emerald-700 border-emerald-200`;
  if (v === "pending")   return `bg-amber-50 text-amber-700 border-amber-200`;
  if (v === "suspended") return `bg-red-50 text-red-600 border-red-200`;
  return `bg-gray-100 text-gray-500 border-gray-200`;
}
function personStatusColor(v: string) {
  if (v === "new_lead" || v === "registered_looking") return `bg-amber-50 text-amber-700 border-amber-200`;
  if (v === "matched")            return `bg-indigo-50 text-indigo-700 border-indigo-200`;
  if (v === "in_taaruf")          return `bg-violet-50 text-violet-700 border-violet-200`;
  if (v === "family_meeting")     return `bg-rose-50 text-rose-700 border-rose-200`;
  if (v === "closed_success")     return `bg-emerald-50 text-emerald-700 border-emerald-200`;
  if (v === "closed_withdrawn")   return `bg-gray-100 text-gray-500 border-gray-200`;
  return `bg-gray-100 text-gray-400 border-gray-200`;
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════ */
export default function AdminCandidateProfile({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user, role, loading: authLoading } = useAuth();

  const { lang }                         = useLanguage();
  const [data,         setData]         = useState<D>({});
  const [meta,         setMeta]         = useState<{ name?: string; email?: string }>({});
  const [sectionMeta,  setSectionMeta]  = useState<Record<string, SectionMeta>>({});
  const [canEdit,      setCanEdit]      = useState(false);
  const [pageLoading,  setPageLoading]  = useState(true);
  const [fetchError,   setFetchError]   = useState<string | null>(null);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionDraft,   setSectionDraft]   = useState<D>({});
  const [savingSection,  setSavingSection]  = useState<string | null>(null);

  const [workers,         setWorkers]         = useState<WorkerRow[]>([]);
  const [assignedWorkers, setAssignedWorkers] = useState<string[]>([]);
  const [selectedWorker,  setSelectedWorker]  = useState("");
  const [assignMsg,       setAssignMsg]       = useState<string | null>(null);

  const [cvModal,  setCvModal]  = useState(false);
  const [cvLang,   setCvLang]   = useState<Lang>(lang);
  const [cvPhoto,  setCvPhoto]  = useState(true);

  const [lightboxIdx,    setLightboxIdx]    = useState<number | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const t = T[lang];

  const getToken = async () => {
    const c = auth.currentUser;
    if (!c) throw new Error("Not authenticated");
    return c.getIdToken();
  };

  const fetchProfile = useCallback(async () => {
    setPageLoading(true); setFetchError(null);
    try {
      const token = await getToken();
      const res   = await fetch(`/api/admin/candidate/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const json  = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      const d = json.data ?? {};
      setData(d);
      setMeta(json.meta ?? {});
      setCanEdit(json.canEdit ?? false);
      setAssignedWorkers(d.assignedWorkers ?? []);
      const sm: Record<string, SectionMeta> = {};
      if (d._sectionMeta && typeof d._sectionMeta === "object") {
        for (const [k, v] of Object.entries(d._sectionMeta as Record<string, { updatedByName: string; updatedAt: { _seconds?: number } | string }>)) {
          const at  = v.updatedAt;
          const iso = typeof at === "string" ? at : (at?._seconds ? new Date(at._seconds * 1000).toISOString() : "");
          if (iso) sm[k] = { updatedByName: v.updatedByName ?? "—", updatedAt: iso };
        }
      }
      setSectionMeta(sm);
    } catch (err) { setFetchError(err instanceof Error ? err.message : "Error"); }
    finally { setPageLoading(false); }
  }, [id]);

  const fetchWorkers = useCallback(async () => {
    try {
      const token = await getToken();
      const res   = await fetch("/api/admin/list-users?role=worker", { headers: { Authorization: `Bearer ${token}` } });
      const json  = await res.json();
      if (res.ok) setWorkers(json.users ?? []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!authLoading && user) { fetchProfile(); if (role === "admin") fetchWorkers(); }
  }, [authLoading, user, role, fetchProfile, fetchWorkers]);

  const startEdit = (sk: string) => {
    const draft: D = {};
    (SF[sk] ?? []).forEach(f => {
      if (f === "profileStatus") draft[f] = getProfileStatuses(data);
      else if (f === "educations") draft[f] = getEducations(data);
      else draft[f] = raw(data, f);
    });
    setSectionDraft(draft);
    setEditingSection(sk);
  };
  const cancelEdit = () => { setEditingSection(null); setSectionDraft({}); };
  const ch = (k: string, val: unknown) => setSectionDraft(prev => ({ ...prev, [k]: val }));

  const saveEdit = async (sk: string) => {
    setSavingSection(sk);
    try {
      const token = await getToken();
      const res   = await fetch(`/api/admin/candidate/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...sectionDraft, _sectionKey: sk }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setData(prev => ({ ...prev, ...sectionDraft }));
      setSectionMeta(prev => ({
        ...prev,
        [sk]: { updatedByName: user?.displayName ?? meta.email ?? "Admin", updatedAt: new Date().toISOString() },
      }));
      setEditingSection(null); setSectionDraft({});
      toast.success(t.toast_saved);
    } catch (err) {
      console.error(err);
      toast.error(t.toast_error);
    }
    finally { setSavingSection(null); }
  };

  const g    = (sk: string, key: string): string => editingSection === sk ? ((sectionDraft[key] as string) ?? raw(data, key)) : raw(data, key);
  const gdsp = (sk: string, key: string) => disp(g(sk, key), lang);
  const sp   = (sk: string) => ({
    sk, canEdit, editing: editingSection, saving: savingSection,
    meta: sectionMeta[sk], lang,
    onEdit: () => startEdit(sk), onSave: () => saveEdit(sk), onCancel: cancelEdit,
  });
  const ep = (sk: string) => ({ isEditing: editingSection === sk, onChange: ch, lang });

  const assignWorker = async () => {
    if (!selectedWorker) return;
    try {
      const next  = assignedWorkers.concat(selectedWorker).filter((w, i, a) => a.indexOf(w) === i);
      const token = await getToken();
      await fetch(`/api/admin/candidate/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assignedWorkers: next }),
      });
      setAssignedWorkers(next); setSelectedWorker("");
      setAssignMsg(lang === "id" ? "Berhasil ditugaskan." : "Assigned successfully.");
      setTimeout(() => setAssignMsg(null), 2500);
    } catch { setAssignMsg(lang === "id" ? "Gagal." : "Failed."); }
  };
  const removeWorker = async (uid: string) => {
    const next  = assignedWorkers.filter(w => w !== uid);
    const token = await getToken();
    await fetch(`/api/admin/candidate/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ assignedWorkers: next }),
    });
    setAssignedWorkers(next);
  };

  const deletePhoto = async (idx: number) => {
    const currentPhotos = Array.isArray(data.photoUrls) ? data.photoUrls as string[] : [];
    if (!confirm(lang === "id" ? "Hapus foto ini?" : "Delete this photo?")) return;
    const newUrls = currentPhotos.filter((_, i) => i !== idx);
    try {
      const token = await getToken();
      await fetch(`/api/admin/candidate/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ photoUrls: newUrls }),
      });
      setData(prev => ({ ...prev, photoUrls: newUrls }));
      if (lightboxIdx !== null) {
        if (newUrls.length === 0) setLightboxIdx(null);
        else setLightboxIdx(Math.min(lightboxIdx, newUrls.length - 1));
      }
      toast.success(lang === "id" ? "Foto dihapus." : "Photo deleted.");
    } catch {
      toast.error(lang === "id" ? "Gagal menghapus foto." : "Delete failed.");
    }
  };

  const uploadPhoto = async (file: File) => {
    const currentPhotos = Array.isArray(data.photoUrls) ? data.photoUrls as string[] : [];
    if (currentPhotos.length >= 10) { toast.error(lang === "id" ? "Maksimal 10 foto." : "Max 10 photos."); return; }
    setUploadingPhoto(true);
    try {
      const token = await getToken();
      const form = new FormData();
      form.append("file", file);
      form.append("folder", `candidates/${id}`);
      const upRes = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      if (!upRes.ok) throw new Error("Upload failed");
      const { url } = await upRes.json() as { url: string };
      const newUrls = [...currentPhotos, url];
      await fetch(`/api/admin/candidate/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ photoUrls: newUrls }),
      });
      setData(prev => ({ ...prev, photoUrls: newUrls }));
      toast.success(lang === "id" ? "Foto berhasil diunggah." : "Photo uploaded.");
    } catch {
      toast.error(lang === "id" ? "Gagal mengunggah foto." : "Upload failed.");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const generateTaarufCV = () => {
    const l = cvLang;
    const cv = l === "id" ? {
      title: "CV Ta'aruf", confid: "RAHASIA", candidate: "Profil Kandidat", years: "Tahun",
      about: "Tentang Saya", personal: "Informasi Pribadi", dob: "Tgl Lahir",
      nationality: "Kebangsaan", ethnicity: "Suku", height: "Tinggi", weight: "Berat",
      blood: "Gol. Darah", marital: "Status Nikah", eduCareer: "Pendidikan & Karir",
      education: "Pendidikan", occupation: "Pekerjaan", employment: "Status Kerja",
      religious: "Profil Agama", religion: "Agama", practice: "Ibadah",
      prayer: "Shalat", quran: "Al-Qur'an", hijab: "Hijab", beard: "Jenggot",
      polygamy: "Poligami", lifestyle: "Gaya Hidup", smoking: "Rokok",
      alcohol: "Alkohol", exercise: "Olahraga", diet: "Diet",
      marriage: "Tujuan Pernikahan", timeline: "Target Waktu",
      wedding: "Pesta Nikah", finance: "Keuangan", decision: "Keputusan",
      criteria: "Kriteria Pasangan", ageRange: "Usia", prefReligion: "Agama",
      prefEthnicity: "Beda Etnis", prefDivorced: "Status Lama", prefLocation: "Lokasi",
      personality: "Kepribadian Dicari", dealbreakers: "Deal Breaker",
      expectations: "Harapan dalam Pernikahan",
      footer: "Dokumen Rahasia — Disiapkan oleh Jodohmu",
    } : {
      title: "Taaruf CV", confid: "CONFIDENTIAL", candidate: "Candidate Profile", years: "yrs old",
      about: "About Me", personal: "Personal Info", dob: "Date of Birth",
      nationality: "Nationality", ethnicity: "Ethnicity", height: "Height", weight: "Weight",
      blood: "Blood Type", marital: "Marital Status", eduCareer: "Education & Career",
      education: "Education", occupation: "Occupation", employment: "Employment",
      religious: "Religious Profile", religion: "Religion", practice: "Practice Level",
      prayer: "Prayer Habit", quran: "Quran", hijab: "Hijab", beard: "Beard",
      polygamy: "Polygamy View", lifestyle: "Lifestyle", smoking: "Smoking",
      alcohol: "Alcohol", exercise: "Exercise", diet: "Diet",
      marriage: "Marriage Goals", timeline: "Timeline",
      wedding: "Wedding Pref.", finance: "Finance", decision: "Decisions",
      criteria: "Partner Criteria", ageRange: "Age", prefReligion: "Religion",
      prefEthnicity: "Ethnicity Mix", prefDivorced: "Prev. Status", prefLocation: "Location",
      personality: "Personality Sought", dealbreakers: "Deal Breakers",
      expectations: "Marriage Expectations",
      footer: "Confidential — Prepared by Jodohmu",
    };

    const esc = (s: string) => !s || s === "—" ? "" : String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const dv = (key: string) => {
      const v = raw(data, key);
      return v === "—" ? "" : disp(v, l);
    };

    const trunc = (s: string, n: number) =>
      !s || s === "—" ? "" : (s.length > n ? s.slice(0, n) + "…" : s);

    const origin = window.location.origin;
    const photoUrl = cvPhoto && photos[0] ? photos[0] : null;
    const candidateName = esc(meta.name ?? raw(data, "name")) || "—";
    const age = raw(data, "age");
    const gender = raw(data, "gender");
    const educations = getEducations(data);

    const strengthsVal = esc(trunc(raw(data,"strengthsInMarriage"), 220));
    const expectationsVal = esc(trunc(raw(data, gender === "male" ? "roleExpectationsWife" : "roleExpectationsHusband"), 220));
    const personalityVal = esc(trunc(raw(data,"preferredPersonalityTraits"), 160));
    const dealbreakersVal = esc(trunc(raw(data,"spouseDealBreakers"), 130));
    const genDate = new Date().toLocaleDateString(l === "id" ? "id-ID" : "en-GB", { day:"numeric", month:"long", year:"numeric" });
    const genderLabel = gender.toLowerCase();
    const genderSuffix = genderLabel.includes("female") || genderLabel.includes("wanita") || genderLabel.includes("perempuan") || genderLabel.includes("akhwat")
      ? (l === "id" ? "Akhwat" : "Akhwat")
      : genderLabel.includes("male") || genderLabel.includes("pria") || genderLabel.includes("laki") || genderLabel.includes("ikhwan")
      ? (l === "id" ? "Ikhwan" : "Ikhwan")
      : "";


    const allCriteriaItems = [
      { lbl: l === "id" ? "Rentang Usia" : "Age Range",
        val: raw(data,"preferredMinAge") !== "—" && raw(data,"preferredMaxAge") !== "—"
          ? `${raw(data,"preferredMinAge")}–${raw(data,"preferredMaxAge")}` : "" },
      { lbl: l === "id" ? "Agama" : "Religion",       val: dv("preferredReligion") },
      { lbl: l === "id" ? "Tingkat Agama" : "Religiosity", val: dv("prefReligionLevel") },
      { lbl: l === "id" ? "Pendidikan" : "Education", val: dv("preferredEducationLevel") },
      { lbl: l === "id" ? "Status Lama" : "Prev. Status", val: dv("prefPreviousStatus") },
      { lbl: l === "id" ? "Lokasi" : "Location",      val: raw(data,"preferredLocationOfSpouse") !== "—" ? esc(raw(data,"preferredLocationOfSpouse")) : "" },
      { lbl: l === "id" ? "Beda Etnis" : "Diff. Ethnicity", val: dv("openToDifferentEthnicity") },
    ];

    const flowerUrl = `${origin}/pricing-bg-flower.png`;

    const ICO_PERSON = "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4z";
    const ICO_STAR   = "M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.7l4-.6L8 1.5z";
    const ICO_HEART  = "M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z";
    const ICO_USERS  = "M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM1 14s-1 0-1-1 1-4 5-4c.6 0 1.1.1 1.6.2A5.7 5.7 0 005 13.5H1zM5 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z";
    const ICO_PHONE  = "M3.654 1.328a.678.678 0 00-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 004.168 6.608 17.6 17.6 0 006.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 00-.063-1.015l-2.307-1.794a.678.678 0 00-.58-.122l-2.19.547a1.745 1.745 0 01-1.657-.459L5.482 8.062a1.745 1.745 0 01-.46-1.657l.548-2.19a.678.678 0 00-.122-.58L3.654 1.328z";
    const ICO_EDU    = "M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0l7.5-3a.5.5 0 0 0 .025-.917l-7.5-3.5zM16 8.5l-7.5 3-7.5-3V12l7.5 3 7.5-3V8.5z";

    // Shared section-header builder: filled dark circle + spaced title + line + ◆
    const sh = (ico: string, title: string, prefix = "sh") =>
      `<div class="${prefix}"><div class="${prefix}-ic"><svg width="9" height="9" viewBox="0 0 16 16" fill="#fff"><path d="${ico}"/></svg></div><span class="${prefix}-t">${title}</span><div class="${prefix}-ln"><span class="${prefix}-d">◆</span></div></div>`;

    // Single-line contact item: small icon + value text
    const ci = (ico: string, val: string) => {
      const filled = val && val !== "—";
      return `<div class="ci"><div class="ci-ic"><svg width="8" height="8" viewBox="0 0 16 16" fill="${filled ? "#8B6D2C" : "#C4AE82"}"><path d="${ico}"/></svg></div><span class="ci-v${filled ? "" : " em"}">${filled ? val : "—"}</span></div>`;
    };

    // Bullet list item
    const bli = (label: string, val: string) => {
      const filled = val && val !== "—";
      return `<li class="${filled ? "" : "em"}"><span class="bk">${label}:</span> ${filled ? val : "—"}</li>`;
    };

    // Right column field row (dot + label/value stacked)
    const rfr = (label: string, val: string) => {
      const filled = val && val !== "—";
      return `<div class="rfr"><div class="rfr-dot"></div><div class="rfr-b"><span class="rfr-l">${label}</span><span class="rfr-v${filled ? "" : " em"}">${filled ? val : "—"}</span></div></div>`;
    };

    const html = `<!DOCTYPE html>
<html lang="${l}">
<head>
<meta charset="UTF-8">
<title>${cv.title} — ${candidateName}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4 portrait;margin:0}
body{font-family:Arial,'Helvetica Neue',sans-serif;width:210mm;height:297mm;overflow:hidden;print-color-adjust:exact;-webkit-print-color-adjust:exact;background:#EAE6DC}
.page{width:210mm;height:297mm;display:flex;flex-direction:column}
.main{flex:1;display:flex;min-height:0;overflow:hidden}
/* ── LEFT SIDEBAR ── */
.lc{width:70mm;flex-shrink:0;background:#EAE6DC;display:flex;flex-direction:column;overflow:hidden;padding-bottom:14px}
.pa{display:flex;flex-direction:column;align-items:center;padding:22px 14px 12px}
.pr{width:96px;height:96px;border-radius:50%;overflow:hidden;border:3px solid #C4AE82;flex-shrink:0;background:#D8CEBC}
.pr img{width:100%;height:100%;object-fit:cover;object-position:top}
.pi{width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#D4C4A0,#B8A070);display:flex;align-items:center;justify-content:center;font-size:32pt;color:#fff;font-weight:700;border:3px solid #C4AE82}
.cn{font-size:15pt;font-weight:400;color:#1A1208;font-family:Georgia,serif;margin-top:8px;text-align:center;letter-spacing:0.2px;line-height:1.1}
.ct{font-size:5.8pt;font-weight:700;letter-spacing:2.5px;color:#8B6D2C;text-align:center;text-transform:uppercase;margin-top:3px}
/* Diamond divider */
.ds{display:flex;align-items:center;gap:5px;padding:0 14px;margin:6px 0 10px}
.ds-l{flex:1;height:1px;background:#C4AE82}
.ds-d{color:#8B6D2C;font-size:7pt}
/* Left section */
.ls{padding:0 14px;margin-bottom:10px}
/* Shared section header — dark filled circle + uppercase title + line + diamond */
.sh{display:flex;align-items:center;gap:7px;margin-bottom:8px}
.sh-ic{width:18px;height:18px;border-radius:50%;background:#8B6D2C;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sh-t{font-size:6pt;font-weight:700;letter-spacing:2px;color:#5C4010;text-transform:uppercase;white-space:nowrap}
.sh-ln{flex:1;height:1px;background:#C4AE82;position:relative}
.sh-d{position:absolute;right:-3px;top:-5.5px;font-size:7pt;color:#8B6D2C;line-height:1}
/* Contact items */
.ci{display:flex;align-items:center;gap:7px;margin-bottom:5px}
.ci-ic{width:14px;height:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.ci-v{font-size:7pt;color:#2A2010;line-height:1.3}
.ci-v.em{color:#B4A888;font-style:italic}
/* About me text */
.at{font-size:7pt;color:#2A2010;line-height:1.6;text-align:justify}
.at.em{color:#B4A888;font-style:italic}
/* Bullet list */
.bl{list-style:none;padding:0;margin:0}
.bl li{display:flex;align-items:flex-start;gap:5px;margin-bottom:4px;font-size:6.8pt;color:#2A2010;line-height:1.35}
.bl li::before{content:"•";color:#8B6D2C;font-size:8pt;flex-shrink:0;margin-top:-1px;line-height:1.35}
.bl li.em{color:#B4A888;font-style:italic}
.bk{font-weight:600}
/* ── RIGHT COLUMN ── */
.rc{flex:1;background:#FDFCF8;display:flex;flex-direction:column;padding:18px 18px 12px;gap:11px;position:relative;overflow:hidden}
.wm{position:absolute;bottom:-10px;right:-10px;width:145px;height:145px;opacity:0.05;pointer-events:none;z-index:0;transform:scaleX(-1)}
/* Right section header — same style as left (.sh) */
.rh{display:flex;align-items:center;gap:7px;margin-bottom:8px;position:relative;z-index:1}
.rh-ic{width:18px;height:18px;border-radius:50%;background:#8B6D2C;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rh-t{font-size:6pt;font-weight:700;letter-spacing:2px;color:#5C4010;text-transform:uppercase;white-space:nowrap}
.rh-ln{flex:1;height:1px;background:#C4AE82;position:relative}
.rh-d{position:absolute;right:-3px;top:-5.5px;font-size:7pt;color:#8B6D2C;line-height:1}
/* Timeline entry */
.te{display:flex;gap:8px;margin-bottom:6px;position:relative;z-index:1}
.te-dot{width:8px;height:8px;border-radius:50%;background:#8B6D2C;flex-shrink:0;margin-top:3px}
.te-body{flex:1}
.te-top{display:flex;justify-content:space-between;align-items:flex-start;gap:4px}
.te-title{font-size:7.5pt;font-weight:700;color:#1A1208}
.te-sub{font-size:6.5pt;color:#8B6D2C;font-style:italic;margin-top:1px}
.te-sub.em{color:#B4A888}
/* Right field rows (dot + stacked label+value) */
.rfr-wrap{display:flex;flex-wrap:wrap;gap:5px 14px;padding-left:14px;position:relative;z-index:1}
.rfr{display:flex;align-items:flex-start;gap:5px}
.rfr-dot{width:5px;height:5px;border-radius:50%;background:#C4AE82;flex-shrink:0;margin-top:4px}
.rfr-b{display:flex;flex-direction:column}
.rfr-l{font-size:5.2pt;color:#A09070;letter-spacing:0.5px;text-transform:uppercase;font-weight:700;line-height:1.2}
.rfr-v{font-size:7pt;color:#1A1208;line-height:1.3}
.rfr-v.em{color:#B4A888;font-style:italic}
/* Tags */
.tg-wrap{display:flex;flex-wrap:wrap;gap:3px;padding-left:14px;margin-bottom:4px;position:relative;z-index:1}
.tg{display:inline-block;background:#EAE6DC;border-radius:3px;padding:2px 7px;font-size:6.3pt;color:#2A2010}
.tg.em{color:#B4A888}
.tg-l{color:#8B6D2C;font-weight:700}
/* Text blocks */
.tb{font-size:7pt;color:#2A2010;line-height:1.6;padding-left:14px;position:relative;z-index:1}
.tb.em{color:#B4A888;font-style:italic}
.tb-sm{font-size:6.8pt;color:#2A2010;line-height:1.5;padding-left:14px;position:relative;z-index:1;margin-top:3px}
.tb-sm.em{color:#B4A888;font-style:italic}
/* Footer */
.ft{background:#E4E0D6;border-top:1.5px solid #C4AE82;padding:6px 18px;display:flex;align-items:center;gap:10px;flex-shrink:0}
.ft-orn{flex-shrink:0}
.ft-sep{width:1px;height:26px;background:#C4AE82;flex-shrink:0}
.ft-txt{flex:1;font-size:6.3pt;color:#4A3820;font-style:italic;font-family:Georgia,serif;line-height:1.5}
.ft-brand{text-align:right;flex-shrink:0}
.ft-bn{font-size:7pt;font-weight:700;color:#8B6D2C;letter-spacing:0.5px}
.ft-bd{font-size:5pt;color:#A09070;margin-top:1px}
@media print{html,body{width:210mm;height:297mm}body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style>
</head>
<body>
<div class="page">
<div class="main">

<!-- LEFT SIDEBAR -->
<div class="lc">
  <div class="pa">
    ${photoUrl
      ? `<div class="pr"><img src="${photoUrl}" alt="${candidateName}"></div>`
      : `<div class="pi">${(candidateName[0] || "?").toUpperCase()}</div>`}
    <div class="cn">${candidateName}</div>
    <div class="ct">${genderSuffix || (l === "id" ? "Kandidat" : "Candidate")}</div>
  </div>
  <div class="ds"><div class="ds-l"></div><div class="ds-d">◆</div><div class="ds-l"></div></div>

  <!-- KONTAK -->
  <div class="ls">
    ${sh(ICO_PHONE, l === "id" ? "Kontak" : "Contact")}
    ${ci(ICO_PHONE, raw(data,"whatsappNumber") !== "—" ? esc(raw(data,"whatsappNumber")) : "")}
    ${ci("M8 1a5 5 0 0 0-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 0 0-5-5zm0 6.5A1.5 1.5 0 1 1 8 4a1.5 1.5 0 0 1 0 3z", raw(data,"location") !== "—" ? esc(raw(data,"location")) : "")}
    ${ci(ICO_PERSON, age !== "—" ? `${esc(age)} ${cv.years}` : "")}
    ${ci(ICO_USERS, dv("maritalStatus"))}
  </div>

  <!-- TENTANG SAYA -->
  <div class="ls">
    ${sh(ICO_PERSON, l === "id" ? "Tentang Saya" : "About Me")}
    <p class="at${strengthsVal ? "" : " em"}">${strengthsVal || (l === "id" ? "Belum diisi." : "Not filled in.")}</p>
  </div>

  <!-- PROFIL AGAMA -->
  <div class="ls">
    ${sh(ICO_STAR, l === "id" ? "Profil Agama" : "Religion")}
    <ul class="bl">
      ${bli(l === "id" ? "Agama" : "Religion", esc(dv("religion")))}
      ${bli(l === "id" ? "Ketaatan" : "Practice", esc(dv("religiousPracticeLevel")))}
      ${bli(l === "id" ? "Komunitas" : "Community", raw(data,"islamicOrganization") !== "—" ? esc(raw(data,"islamicOrganization")) : "")}
      ${bli(l === "id" ? "Catatan" : "Notes", esc(trunc(raw(data,"religionNotes"), 50)))}
    </ul>
  </div>

  <!-- GAYA HIDUP -->
  <div class="ls">
    ${sh(ICO_USERS, l === "id" ? "Gaya Hidup" : "Lifestyle")}
    <ul class="bl">
      ${bli(l === "id" ? "Rokok" : "Smoking", esc(dv("smokingStatus")))}
      ${bli(l === "id" ? "Olahraga" : "Exercise", esc(dv("exerciseFrequency")))}
      ${bli(l === "id" ? "Diet" : "Diet", esc(dv("dietaryRestrictions")))}
      ${bli(l === "id" ? "Sosial" : "Social", esc(dv("socialPreference")))}
    </ul>
  </div>
</div>

<!-- RIGHT COLUMN -->
<div class="rc">
  <img src="${flowerUrl}" class="wm" alt="">

  <!-- PENDIDIKAN & KARIR -->
  <div>
    <div class="rh"><div class="rh-ic"><svg width="9" height="9" viewBox="0 0 16 16" fill="#fff"><path d="${ICO_EDU}"/></svg></div><span class="rh-t">${l === "id" ? "Pendidikan &amp; Karir" : "Education &amp; Career"}</span><div class="rh-ln"><span class="rh-d">◆</span></div></div>
    ${educations.length
      ? educations.map(edu => `<div class="te"><div class="te-dot"></div><div class="te-body"><div class="te-top"><span class="te-title">${esc(dispEduLevel(edu.level, l))}</span></div><div class="te-sub${edu.major ? "" : " em"}">${edu.major ? esc(edu.major) : "—"}</div></div></div>`).join("")
      : `<div class="te"><div class="te-dot"></div><div class="te-body"><span class="te-title" style="color:#B4A888;font-style:italic">—</span></div></div>`}
    ${raw(data,"occupation") !== "—"
      ? `<div class="te"><div class="te-dot"></div><div class="te-body"><div class="te-top"><span class="te-title">${esc(raw(data,"occupation"))}</span></div><div class="te-sub${dv("employmentStatus") ? "" : " em"}">${dv("employmentStatus") || "—"}${raw(data,"incomeRange") !== "—" ? " · " + esc(dv("incomeRange")) : ""}</div></div></div>`
      : `<div class="te"><div class="te-dot"></div><div class="te-body"><span class="te-title" style="color:#B4A888;font-style:italic">${l === "id" ? "Pekerjaan belum diisi" : "Occupation not filled"}</span></div></div>`}
  </div>

  <!-- TUJUAN PERNIKAHAN -->
  <div>
    <div class="rh"><div class="rh-ic"><svg width="9" height="9" viewBox="0 0 16 16" fill="#fff"><path d="${ICO_HEART}"/></svg></div><span class="rh-t">${l === "id" ? "Tujuan Pernikahan" : "Marriage Goals"}</span><div class="rh-ln"><span class="rh-d">◆</span></div></div>
    <div class="rfr-wrap">
      ${rfr(l === "id" ? "Target Waktu" : "Timeline", esc(dv("maritalTimeline")))}
      ${rfr(l === "id" ? "Pesta Nikah" : "Wedding", esc(dv("weddingPreference")))}
      ${rfr(l === "id" ? "Keuangan" : "Finance", esc(dv("financialManagementStyle")))}
      ${rfr(l === "id" ? "Keputusan" : "Decisions", esc(dv("decisionMakingStyle")))}
    </div>
  </div>

  <!-- KRITERIA PASANGAN -->
  <div>
    <div class="rh"><div class="rh-ic"><svg width="9" height="9" viewBox="0 0 16 16" fill="#fff"><path d="${ICO_USERS}"/></svg></div><span class="rh-t">${cv.criteria}</span><div class="rh-ln"><span class="rh-d">◆</span></div></div>
    <div class="tg-wrap">${allCriteriaItems.map(c => `<span class="tg${c.val ? "" : " em"}"><span class="tg-l">${c.lbl}: </span>${c.val ? esc(c.val) : "—"}</span>`).join("")}</div>
    <p class="tb-sm${personalityVal ? "" : " em"}">${personalityVal ? `<strong style="color:#8B6D2C">${cv.personality}:</strong> ${personalityVal}` : `${cv.personality}: —`}</p>
    <p class="tb-sm${dealbreakersVal ? "" : " em"}">${dealbreakersVal ? `<strong style="color:#8B6D2C">${cv.dealbreakers}:</strong> ${dealbreakersVal}` : `${cv.dealbreakers}: —`}</p>
  </div>

  <!-- HARAPAN DALAM PERNIKAHAN -->
  <div>
    <div class="rh"><div class="rh-ic"><svg width="9" height="9" viewBox="0 0 16 16" fill="#fff"><path d="${ICO_STAR}"/></svg></div><span class="rh-t">${cv.expectations}</span><div class="rh-ln"><span class="rh-d">◆</span></div></div>
    <p class="tb${expectationsVal ? "" : " em"}">${expectationsVal || "—"}</p>
  </div>

  <!-- TIM TA'ARUF -->
  <div style="margin-top:auto">
    <div class="rh"><div class="rh-ic"><svg width="9" height="9" viewBox="0 0 16 16" fill="#fff"><path d="${ICO_PHONE}"/></svg></div><span class="rh-t">${l === "id" ? "Tim Ta'aruf" : "Ta'aruf Team"}</span><div class="rh-ln"><span class="rh-d">◆</span></div></div>
    <p class="tb">${l === "id" ? "Jika berminat, silakan hubungi tim ta'aruf Jodohmu yang bertugas." : "If interested, please contact the Jodohmu ta'aruf team in charge."}</p>
  </div>
</div>

</div>

<!-- FOOTER -->
<div class="ft">
  <svg class="ft-orn" width="28" height="28" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12.5" stroke="#C4AE82" stroke-width="1.2"/>
    <circle cx="14" cy="14" r="7.5" stroke="#C4AE82" stroke-width="0.8"/>
    <line x1="14" y1="2" x2="14" y2="26" stroke="#C4AE82" stroke-width="0.6" opacity="0.5"/>
    <line x1="2" y1="14" x2="26" y2="14" stroke="#C4AE82" stroke-width="0.6" opacity="0.5"/>
    <line x1="6" y1="6" x2="22" y2="22" stroke="#C4AE82" stroke-width="0.5" opacity="0.4"/>
    <line x1="22" y1="6" x2="6" y2="22" stroke="#C4AE82" stroke-width="0.5" opacity="0.4"/>
    <circle cx="14" cy="14" r="2.5" fill="#C4AE82"/>
  </svg>
  <div class="ft-sep"></div>
  <div class="ft-txt">${cv.footer}</div>
  <div class="ft-brand">
    <div class="ft-bn">Jodohmu</div>
    <div class="ft-bd">${genDate}</div>
  </div>
</div>

</div>
<script>
var imgs=document.querySelectorAll('img'),tot=imgs.length,ld=0;
function dp(){ld++;if(ld>=tot)setTimeout(function(){window.print()},400)}
if(tot===0)setTimeout(function(){window.print()},300);
else imgs.forEach(function(i){if(i.complete)dp();else{i.onload=dp;i.onerror=dp}});
</script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=870,height=1100");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
    setCvModal(false);
  };

  if (authLoading || pageLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: `${C.g2} transparent ${C.g2} ${C.g2}` }} />
    </div>
  );
  if (fetchError) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.bg }}>
      <div className="bg-white p-6 shadow-sm text-sm font-medium" style={{ borderRadius: 14, border: `1px solid ${C.border}`, color: C.primary }}>{fetchError}</div>
    </div>
  );

  const name       = meta.name ?? raw(data, "name");
  const age        = raw(data, "age");
  const photos     = Array.isArray(data.photoUrls) ? data.photoUrls as string[] : [];
  const gender     = raw(data, "gender");
  const isAdmin    = role === "admin";
  const workerMap  = Object.fromEntries(workers.map(w => [w.uid, w]));
  const unassigned = workers.filter(w => !assignedWorkers.includes(w.uid));
  const profStatuses = getProfileStatuses(data);
  const openTaaruf   = raw(data, "openToTaaruf");
  const paket        = raw(data, "paket");

  /* returns true if any field in the section has a non-empty value */
  const hasData = (sk: string) => (SF[sk] ?? []).some(f => raw(data, f) !== "—");

  /* ── assessment section renderer ────────────────────────────────────── */
  function AssessmentCard({ sk, title, icon, accent, doneKey, children, locked, lockedTiers }: {
    sk: string; title: string; icon: React.ReactNode; accent: string;
    doneKey: string; children: React.ReactNode; locked?: boolean; lockedTiers?: string[];
  }) {
    const isE  = editingSection === sk;
    const isS  = savingSection === sk;
    const sm   = sectionMeta[sk];
    const done = isDone(data, doneKey) || (isE && sectionDraft[doneKey] === "done");
    const STATUS_OPTS = doneKey === "idCheckStatus" ? ["not_done","done"] : ["not_done","in_progress","done"];
    const tierLabel = (lockedTiers ?? []).map(t => PLAN_LABELS[t] ?? t).join(" / ");
    return (
      <Card>
        <div className={`p-6 ${locked ? "opacity-50 pointer-events-none select-none" : ""}`}>
          <div className="flex items-start justify-between mb-4 group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}18`, color: accent }}>
                <span className="w-[20px] h-[20px]">{icon}</span>
              </div>
              <div>
                <h3 className="text-[13px] font-extrabold" style={{ color: C.text }}>{title}</h3>
                {locked && lockedTiers && (
                  <p className="text-[10.5px] font-semibold mt-0.5" style={{ color: "#94A3B8" }}>
                    {lang === "id" ? `🔒 Tersedia di paket ${tierLabel}` : `🔒 Available on ${tierLabel} plan`}
                  </p>
                )}
              </div>
            </div>
            {!locked && <EditBar sk={sk} canEdit={canEdit} isEditing={isE} isSaving={isS} meta={sm} onEdit={() => startEdit(sk)} onSave={() => saveEdit(sk)} onCancel={cancelEdit} lang={lang} />}
          </div>
          {!locked && isE && (
            <div className="mb-4 flex gap-2 flex-wrap">
              {STATUS_OPTS.map(s => (
                <button key={s} onClick={() => ch(doneKey, s)}
                  className={`px-3 py-1.5 rounded-full border text-[11.5px] font-semibold transition-colors ${sectionDraft[doneKey] === s ? (s === "done" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : s === "in_progress" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-100 text-gray-500 border-gray-300") : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                  {disp(s, lang)}
                </button>
              ))}
            </div>
          )}
          {locked ? <NotDone label={title} lang={lang} /> : (!done && !isE ? <NotDone label={title} lang={lang} /> : children)}
        </div>
      </Card>
    );
  }

  /* ── render ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "var(--font-roboto)" }}>

      {/* ── PAGE TOPNAV ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-5 pt-5 pb-2 flex items-center gap-3">
        <Link href="/admin/candidates"
          className="flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-white"
          style={{ color: C.muted, borderColor: C.border }}>
          <ArrowLeft style={{ width: 13, height: 13 }} />
          {t.back}
        </Link>
        <div style={{ flex: 1 }} />
        <button onClick={() => setCvModal(true)}
          className="flex items-center gap-1.5 text-[12.5px] font-semibold px-3.5 py-1.5 rounded-lg border transition-colors hover:bg-white"
          style={{ color: C.body, borderColor: C.border, background: "white" }}>
          <FileText style={{ width: 13, height: 13 }} />
          {lang === "id" ? "CV Ta'aruf" : "Taaruf CV"}
        </button>
        <Link href={`/admin/candidates/${id}/crm`}
          className="flex items-center gap-1.5 text-[12.5px] font-bold px-4 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #1B3A6B, #2563EB)" }}>
          <LayoutList style={{ width: 13, height: 13 }} />
          CRM
        </Link>
      </div>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-5 py-5 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT SIDEBAR ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[290px] shrink-0 lg:sticky lg:top-[68px] lg:self-start flex flex-col gap-4">
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 4px 20px rgba(15,23,42,0.05)", overflow: "hidden" }}>
              {/* Photo + name header */}
              <div className="flex flex-col items-center px-5 pt-7 pb-5" style={{ borderBottom: `1px solid ${C.div}` }}>
                <div className="mb-4 p-[3px] rounded-full" style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g2})` }}>
                  <div className="rounded-full overflow-hidden cursor-pointer" style={{ width: 112, height: 112, background: C.card }}
                    onClick={() => photos.length > 0 && setLightboxIdx(0)}>
                    {photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photos[0]} alt={name} className="w-full h-full object-cover object-top hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ background: C.bg }}>
                        <GenderAvatar gender={gender} size={112} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h1 className="font-extrabold leading-tight" style={{ fontSize: 20, color: C.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
                    {name}
                  </h1>
                  <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0" style={{ background: C.g1 }}>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {age !== "—" && <p className="text-[13px] font-semibold" style={{ color: C.body }}>{age} {t.years}</p>}
                  {gender !== "—" && (
                    <span className="px-2 py-[2px] rounded-full text-[11px] font-bold border"
                      style={gender === "female"
                        ? { background: "#FFF1F2", color: "#C4294A", borderColor: "#FECDD3" }
                        : { background: "#EFF6FF", color: "#1B3A6B", borderColor: "#BFDBFE" }}>
                      {disp(gender, lang)}
                    </span>
                  )}
                </div>
              </div>

              {/* Editable quick info */}
              {editingSection === "sidebar-quick" ? (
                <div className="px-5 py-4 flex flex-col gap-3" style={{ borderBottom: `1px solid ${C.div}` }}>
                  {/* Location */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{lang === "id" ? "Lokasi" : "Location"}</p>
                    <input className="w-full text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.body, background: C.bg }}
                      value={(sectionDraft.location as string) ?? ""} onChange={e => ch("location", e.target.value)} placeholder="—" />
                  </div>
                  {/* Gender */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{t.f_gender}</p>
                    <div className="flex gap-1.5">
                      {OPTS.gender.map(s => (
                        <button key={s} onClick={() => ch("gender", s)}
                          className={`px-3 py-1 rounded-full border text-[11px] font-semibold transition-colors ${sectionDraft.gender === s
                            ? s === "female" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                          {disp(s, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Person Status */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{t.sp_person_status}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {OPTS.personStatus.map(s => (
                        <button key={s} onClick={() => ch("personStatus", s)}
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-colors ${sectionDraft.personStatus === s ? personStatusColor(s) : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                          {disp(s, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Open to Taaruf */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{t.sp_taaruf}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {OPTS.openToTaaruf.map(s => (
                        <button key={s} onClick={() => ch("openToTaaruf", s)}
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-colors ${sectionDraft.openToTaaruf === s ? (s === "ready" ? "bg-amber-50 text-amber-700 border-amber-200" : s === "preparing" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-gray-100 text-gray-500 border-gray-300") : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                          {disp(s, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Occupation */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{lang === "id" ? "Pekerjaan" : "Occupation"}</p>
                    <input className="w-full text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.body, background: C.bg }}
                      value={(sectionDraft.occupation as string) ?? ""} onChange={e => ch("occupation", e.target.value)} placeholder="—" />
                  </div>
                  {/* Education — list builder */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{lang === "id" ? "Pendidikan" : "Education"}</p>
                    <div className="flex flex-col gap-2">
                      {((sectionDraft.educations as EduEntry[]) ?? []).map((edu, i) => (
                        <div key={i} className="rounded-xl border p-2.5 flex flex-col gap-1.5 relative" style={{ borderColor: C.border, background: C.bg }}>
                          <button onClick={() => ch("educations", (sectionDraft.educations as EduEntry[]).filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 w-5 h-5 rounded flex items-center justify-center hover:bg-red-50 transition-colors" style={{ color: C.muted }}>
                            <X style={{ width: 11, height: 11 }} />
                          </button>
                          <select className="text-[12px] rounded-lg px-2 py-1.5 border focus:outline-none w-full pr-6" style={{ borderColor: C.border, color: C.text, background: "#fff" }}
                            value={edu.level} onChange={e => {
                              const list = [...(sectionDraft.educations as EduEntry[])];
                              list[i] = { ...list[i], level: e.target.value };
                              ch("educations", list);
                            }}>
                            <option value="">—</option>
                            {EDU_LEVELS.map(l => <option key={l.value} value={l.value}>{l[lang]}</option>)}
                          </select>
                          <select className="text-[12px] rounded-lg px-2 py-1.5 border focus:outline-none w-full" style={{ borderColor: C.border, color: C.text, background: "#fff" }}
                            value={edu.major} onChange={e => {
                              const list = [...(sectionDraft.educations as EduEntry[])];
                              list[i] = { ...list[i], major: e.target.value };
                              ch("educations", list);
                            }}>
                            <option value="">—</option>
                            {MAJORS.map(m => <option key={m.value} value={m.value}>{m[lang]}</option>)}
                          </select>
                        </div>
                      ))}
                      <button onClick={() => ch("educations", [...((sectionDraft.educations as EduEntry[]) ?? []), { level: "s1_d4", major: "" }])}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors hover:bg-slate-50 self-start"
                        style={{ color: C.muted, borderColor: C.border }}>
                        <Plus style={{ width: 10, height: 10 }} />
                        {lang === "id" ? "Tambah" : "Add"}
                      </button>
                    </div>
                  </div>
                  {/* Marital Status */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{lang === "id" ? "Status Nikah" : "Marital Status"}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {OPTS.maritalStatus.map(s => (
                        <button key={s} onClick={() => ch("maritalStatus", s)}
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-colors ${sectionDraft.maritalStatus === s ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                          {disp(s, lang)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Save / Cancel */}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => saveEdit("sidebar-quick")} disabled={savingSection === "sidebar-quick"}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-bold text-white transition-opacity"
                      style={{ background: C.g1, opacity: savingSection === "sidebar-quick" ? 0.6 : 1 }}>
                      <Save style={{ width: 12, height: 12 }} />
                      {savingSection === "sidebar-quick" ? t.saving : t.save}
                    </button>
                    <button onClick={cancelEdit}
                      className="flex items-center justify-center px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors"
                      style={{ borderColor: C.border, color: C.muted, background: C.bg }}>
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Display: location + badges */}
                  <div className="px-5 pt-4 pb-3 flex flex-col items-center gap-2" style={{ borderBottom: `1px solid ${C.div}` }}>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" style={{ color: C.muted }} />
                      <span style={{ fontSize: 12, color: C.muted }}>{raw(data,"location") !== "—" ? raw(data,"location") : <span style={{ fontStyle: "italic" }}>{t.not_filled}</span>}</span>
                    </div>
                    {/* Taaruf status */}
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <span className={`px-2.5 py-[3px] rounded-full border text-[11px] font-bold ${openTaaruf === "ready" ? "bg-amber-50 text-amber-700 border-amber-200" : openTaaruf === "preparing" ? "bg-sky-50 text-sky-700 border-sky-200" : openTaaruf === "no" ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                        <Heart className="w-2.5 h-2.5 fill-current inline mr-0.5" />
                        {openTaaruf === "no" ? t.not_open : openTaaruf !== "—" ? disp(openTaaruf, lang) : t.taaruf_not_set}
                      </span>
                      {raw(data,"personStatus") !== "—" && (
                        <span className={`px-2.5 py-[3px] rounded-full border text-[11px] font-bold ${personStatusColor(raw(data,"personStatus"))}`}>
                          {disp(raw(data,"personStatus"), lang)}
                        </span>
                      )}
                    </div>
                    {/* Paket badge */}
                    {paket && paket !== "—" && paket !== "not_selected"
                      ? <span className="px-2.5 py-[3px] rounded-full border text-[11px] font-extrabold" style={{ background: "#1B3A6B", color: "#fff", borderColor: "#1B3A6B" }}>{disp(paket, lang)}</span>
                      : <span className="px-2.5 py-[3px] rounded-full border text-[11px] font-semibold bg-gray-100 text-gray-400 border-gray-200">{disp("not_selected", lang)}</span>
                    }
                    {/* Marriage timeline */}
                    {raw(data,"maritalTimeline") !== "—" && (
                      <span className="px-2.5 py-[3px] rounded-full border text-[11px] font-semibold bg-purple-50 text-purple-700 border-purple-200">
                        {disp(raw(data,"maritalTimeline"), lang)}
                      </span>
                    )}
                    {canEdit && (
                      <button onClick={() => startEdit("sidebar-quick")}
                        className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:bg-slate-50"
                        style={{ color: C.muted, borderColor: C.border }}>
                        <Pencil style={{ width: 10, height: 10 }} />
                        {lang === "id" ? "Edit Info" : "Edit Info"}
                      </button>
                    )}
                  </div>

                  {/* Quick info */}
                  <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.div}` }}>
                    <div className="flex flex-col gap-2.5">
                      {raw(data,"occupation") !== "—" && (
                        <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: C.body }}>
                          <span style={{ width: 14, height: 14, color: C.muted, flexShrink: 0, display: "flex" }}><Briefcase className="w-full h-full" /></span>
                          {disp(raw(data,"occupation"), lang)}
                        </div>
                      )}
                      {getEducations(data).map((edu, i) => (
                        <div key={i} className="flex items-start gap-2" style={{ fontSize: 12.5, color: C.body }}>
                          <span style={{ width: 14, height: 14, color: C.muted, flexShrink: 0, display: "flex", marginTop: 2 }}><GraduationCap className="w-full h-full" /></span>
                          <span>
                            <span className="font-semibold">{dispEduLevel(edu.level, lang)}</span>
                            {edu.major && <span style={{ color: C.muted }}> — {dispMajor(edu.major, lang)}</span>}
                          </span>
                        </div>
                      ))}
                      {raw(data,"maritalStatus") !== "—" && (
                        <div className="flex items-center gap-2" style={{ fontSize: 12.5, color: C.body }}>
                          <span style={{ width: 14, height: 14, color: C.muted, flexShrink: 0, display: "flex" }}><Heart className="w-full h-full" /></span>
                          {disp(raw(data,"maritalStatus"), lang)}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* UID */}
              <div className="px-5 py-3">
                <p className="text-[10px] font-mono break-all" style={{ color: C.muted }}>{id}</p>
              </div>
            </div>

            {/* Short intro */}
            {raw(data,"strengthsInMarriage") !== "—" && (
              <Card>
                <div className="p-4">
                  <p className="text-[13px] leading-relaxed italic" style={{ color: C.body }}>
                    &ldquo;{raw(data,"strengthsInMarriage")}&rdquo;
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* ── RIGHT CONTENT ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* ── Tentang Saya ────────────────────────────────────────── */}
            {!hasData("tentang-saya") && editingSection !== "tentang-saya"
              ? <GhostCard title={t.s_tentang} icon={<Shield className="w-full h-full" />} iconColor="#6366F1" iconBg="#EEF2FF" onAdd={() => startEdit("tentang-saya")} lang={lang} />
              : <Card>
              <div className="p-6 group">
                <SH title={t.s_tentang} icon={<Shield className="w-full h-full" />} iconColor="#6366F1" iconBg="#EEF2FF" {...sp("tentang-saya")} />
                {editingSection === "tentang-saya"
                  ? <textarea rows={5} className="w-full text-[14px] leading-relaxed rounded-xl px-3.5 py-2.5 border resize-none focus:outline-none" style={{ borderColor: C.border, color: C.body, background: C.bg }}
                      value={(sectionDraft.aboutMe as string) ?? ""} onChange={e => ch("aboutMe", e.target.value)} placeholder="—" />
                  : <p className="text-[14px] leading-relaxed" style={{ color: raw(data,"aboutMe") === "—" ? C.muted : C.body }}>
                      {raw(data,"aboutMe") !== "—" ? raw(data,"aboutMe") : t.not_filled}
                    </p>
                }
              </div>
            </Card>
            }

            {/* ── 2-col: Gaya Hidup, Nilai ────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gaya Hidup */}
              <Card>
                <div className="p-6 group">
                  <SH title={t.s_gaya} icon={<Leaf className="w-full h-full" />} iconColor="#10B981" iconBg="#ECFDF5" {...sp("gaya-hidup")} />
                  <div className="space-y-2.5">
                    {[
                      { k:"smokingStatus",    l: t.f_smoking },
                      { k:"alcoholUse",       l: t.f_alcohol },
                      { k:"exerciseFrequency",l: t.f_exercise },
                      { k:"socialPreference", l: t.f_social },
                    ].map(f => (
                      <div key={f.k}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>{f.l}</p>
                        {editingSection === "gaya-hidup"
                          ? <select className="w-full text-[12.5px] border-b focus:outline-none bg-transparent mt-0.5" style={{ borderColor: C.border, color: C.body }} value={(sectionDraft[f.k] as string) ?? ""} onChange={e => ch(f.k, e.target.value)}>
                              <option value="">—</option>
                              {(OPTS[f.k] ?? []).map(o => <option key={o} value={o}>{disp(o, lang)}</option>)}
                            </select>
                          : <p className="text-[12.5px] font-medium mt-0.5" style={{ color: gdsp("gaya-hidup",f.k) === "—" ? C.muted : C.text }}>{gdsp("gaya-hidup",f.k)}</p>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Nilai & Kepribadian */}
              {!hasData("nilai-keyakinan") && editingSection !== "nilai-keyakinan"
                ? <GhostCard title={t.s_nilai} icon={<Star className="w-full h-full" />} iconColor="#F59E0B" iconBg="#FFFBEB" onAdd={() => startEdit("nilai-keyakinan")} lang={lang} />
                : <Card>
                <div className="p-6 group">
                  <SH title={t.s_nilai} icon={<Star className="w-full h-full" />} iconColor="#F59E0B" iconBg="#FFFBEB" {...sp("nilai-keyakinan")} />
                  <div className="space-y-2.5">
                    {[
                      { k:"quranReading",            l: t.f_quran },
                      { k:"islamicKnowledgeLevel",   l: t.f_islamic },
                      { k:"halalLifestyleStrictness",l: t.f_halal },
                    ].map(f => (
                      <div key={f.k}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: C.muted }}>{f.l}</p>
                        {editingSection === "nilai-keyakinan"
                          ? <select className="w-full text-[12.5px] border-b focus:outline-none bg-transparent mt-0.5" style={{ borderColor: C.border, color: C.body }} value={(sectionDraft[f.k] as string) ?? ""} onChange={e => ch(f.k, e.target.value)}>
                              <option value="">—</option>
                              {(OPTS[f.k] ?? []).map(o => <option key={o} value={o}>{disp(o, lang)}</option>)}
                            </select>
                          : <p className="text-[12.5px] font-medium mt-0.5" style={{ color: gdsp("nilai-keyakinan",f.k) === "—" ? C.muted : C.text }}>{gdsp("nilai-keyakinan",f.k)}</p>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              }

            </div>

            {/* ── Tujuan ──────────────────────────────────────────────── */}
            {!hasData("tujuan") && editingSection !== "tujuan"
              ? <GhostCard title={t.s_tujuan} icon={<Target className="w-full h-full" />} iconColor="#8B5CF6" iconBg="#F5F3FF" onAdd={() => startEdit("tujuan")} lang={lang} />
              : <Card>
              <div className="p-6 group">
                <SH title={t.s_tujuan} icon={<Target className="w-full h-full" />} iconColor="#8B5CF6" iconBg="#F5F3FF" {...sp("tujuan")} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { k:"maritalTimeline",          l: t.f_timeline },
                    { k:"weddingPreference",         l: t.f_wedding },
                    { k:"financialManagementStyle",  l: t.f_finance },
                    { k:"decisionMakingStyle",       l: t.f_decision },
                  ].map(f => (
                    <Chip key={f.k} label={f.l} value={g("tujuan",f.k)} fieldKey={f.k} select={OPTS[f.k]} {...ep("tujuan")} />
                  ))}
                </div>
              </div>
            </Card>
            }

            {/* ── Data Pribadi + Karir ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <div className="p-6 group">
                  <SH title={t.s_pribadi} icon={<Shield className="w-full h-full" />} iconColor="#3B82F6" iconBg="#EFF6FF" {...sp("data-pribadi")} />
                  <FR label={t.f_age}         value={g("data-pribadi","age")}         fieldKey="age"         {...ep("data-pribadi")} />
                  <FR label={t.f_gender}      value={g("data-pribadi","gender")}       fieldKey="gender"      select={OPTS.gender}    {...ep("data-pribadi")} />
                  <FR label={t.f_dob}         value={g("data-pribadi","dateOfBirth")}  fieldKey="dateOfBirth" {...ep("data-pribadi")} />
                  <FR label={t.f_nationality} value={g("data-pribadi","nationality")}  fieldKey="nationality" {...ep("data-pribadi")} />
                  <FR label={t.f_ethnicity}   value={g("data-pribadi","ethnicity")}    fieldKey="ethnicity"   {...ep("data-pribadi")} />
                  <FR label={t.f_height}      value={g("data-pribadi","height")}       fieldKey="height"      {...ep("data-pribadi")} />
                  <FR label={t.f_weight}      value={g("data-pribadi","weight")}       fieldKey="weight"      {...ep("data-pribadi")} />
                  <FR label={t.f_bloodtype}       value={g("data-pribadi","bloodType")}           fieldKey="bloodType"           select={OPTS.bloodType} {...ep("data-pribadi")} />
                  <FR label={t.f_birth_place}     value={g("data-pribadi","birthPlace")}          fieldKey="birthPlace"          {...ep("data-pribadi")} />
                  <FR label={t.f_living_with}     value={g("data-pribadi","currentlyLivingWith")} fieldKey="currentlyLivingWith" {...ep("data-pribadi")} />
                  <FR label={t.f_whatsapp}        value={g("data-pribadi","whatsappNumber")}      fieldKey="whatsappNumber"      {...ep("data-pribadi")} />
                  <FR label={t.f_own_health}      value={g("data-pribadi","ownHealthCondition")}  fieldKey="ownHealthCondition"  long {...ep("data-pribadi")} />
                </div>
              </Card>
              <div className="flex flex-col gap-4">
                {!hasData("karir") && editingSection !== "karir"
                  ? <GhostCard title={t.s_karir} icon={<Briefcase className="w-full h-full" />} iconColor="#14B8A6" iconBg="#F0FDFA" onAdd={() => startEdit("karir")} lang={lang} />
                  : <Card>
                      <div className="p-6 group">
                        <SH title={t.s_karir} icon={<Briefcase className="w-full h-full" />} iconColor="#14B8A6" iconBg="#F0FDFA" {...sp("karir")} />
                        <FR label={t.f_occupation} value={g("karir","occupation")}       fieldKey="occupation"       {...ep("karir")} />
                        <FR label={t.f_emp_status} value={g("karir","employmentStatus")} fieldKey="employmentStatus" select={OPTS.employmentStatus} {...ep("karir")} />
                        <FR label={t.f_income}     value={g("karir","incomeRange")}      fieldKey="incomeRange"      select={OPTS.incomeRange}      {...ep("karir")} />
                        <FR label={t.f_property}   value={g("karir","propertyStatus")}   fieldKey="propertyStatus"   select={OPTS.propertyStatus}   {...ep("karir")} />
                        <FR label={t.f_debts}      value={g("karir","hasDebts")}         fieldKey="hasDebts"         select={OPTS.hasDebts}         {...ep("karir")} />
                      </div>
                    </Card>
                }
                {!hasData("profil-agama") && editingSection !== "profil-agama"
                  ? <GhostCard title={t.s_agama} icon={<BookOpen className="w-full h-full" />} iconColor="#22C55E" iconBg="#F0FDF4" onAdd={() => startEdit("profil-agama")} lang={lang} />
                  : <Card>
                      <div className="p-6 group">
                        <SH title={t.s_agama} icon={<BookOpen className="w-full h-full" />} iconColor="#22C55E" iconBg="#F0FDF4" {...sp("profil-agama")} />
                        <FR label={t.f_religion} value={g("profil-agama","religion")}               fieldKey="religion"               select={OPTS.religion}               {...ep("profil-agama")} />
                        <FR label={t.f_practice} value={g("profil-agama","religiousPracticeLevel")} fieldKey="religiousPracticeLevel" select={OPTS.religiousPracticeLevel} {...ep("profil-agama")} />
                        <FR label={t.f_prayer2}  value={g("profil-agama","prayerHabit")}            fieldKey="prayerHabit"            select={OPTS.prayerHabit}            {...ep("profil-agama")} />
                        {gender !== "male" && <FR label={t.f_hijab}   value={g("profil-agama","hijab")}  fieldKey="hijab"  select={OPTS.hijab}  {...ep("profil-agama")} />}
                        {gender === "male" && <FR label={t.f_beard}   value={g("profil-agama","beard")}  fieldKey="beard"  select={OPTS.beard}  {...ep("profil-agama")} />}
                        <FR label={t.f_polygamy} value={g("profil-agama","polygamyView")} fieldKey="polygamyView" select={OPTS.polygamyView} {...ep("profil-agama")} />
                        <FR label={t.f_mahar}    value={raw(data,"maharExpectation") !== "—" ? raw(data,"maharExpectation") : raw(data,"maharBudget")} fieldKey="maharExpectation" {...ep("profil-agama")} />
                      </div>
                    </Card>
                }
              </div>
            </div>

            {/* ── Keluarga ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!hasData("keluarga-saudara") && editingSection !== "keluarga-saudara"
                ? <GhostCard title={`${t.s_keluarga} — ${t.k_saudara}`} icon={<Users className="w-full h-full" />} iconColor="#F59E0B" iconBg="#FFFBEB" onAdd={() => startEdit("keluarga-saudara")} lang={lang} />
                : <Card>
                    <div className="p-6 group">
                      <SH title={t.s_keluarga} icon={<Users className="w-full h-full" />} iconColor="#F59E0B" iconBg="#FFFBEB" {...sp("keluarga-saudara")} />
                      <p className="text-[9.5px] font-extrabold uppercase tracking-widest mb-2 mt-1" style={{ color: "#94A3B8" }}>{t.k_saudara}</p>
                      <FR label={t.f_sibling_count}   value={g("keluarga-saudara","siblingCount")}       fieldKey="siblingCount"       {...ep("keluarga-saudara")} />
                      <FR label={t.f_child_order}     value={g("keluarga-saudara","childOrder")}         fieldKey="childOrder"         {...ep("keluarga-saudara")} />
                      <FR label={t.f_male_siblings}   value={g("keluarga-saudara","maleSiblingCount")}   fieldKey="maleSiblingCount"   {...ep("keluarga-saudara")} />
                      <FR label={t.f_female_siblings} value={g("keluarga-saudara","femaleSiblingCount")} fieldKey="femaleSiblingCount" {...ep("keluarga-saudara")} />
                    </div>
                  </Card>
              }
              {!hasData("keluarga-anak") && editingSection !== "keluarga-anak"
                ? <GhostCard title={`${t.s_keluarga} — ${t.k_anak}`} icon={<Users className="w-full h-full" />} iconColor="#F59E0B" iconBg="#FFFBEB" onAdd={() => startEdit("keluarga-anak")} lang={lang} />
                : <Card>
                    <div className="p-6 group">
                      <SH title={t.s_keluarga} icon={<Users className="w-full h-full" />} iconColor="#F59E0B" iconBg="#FFFBEB" {...sp("keluarga-anak")} />
                      <p className="text-[9.5px] font-extrabold uppercase tracking-widest mb-2 mt-1" style={{ color: "#94A3B8" }}>{t.k_anak}</p>
                      <FR label={t.f_children_count}  value={g("keluarga-anak","childrenCount")}      fieldKey="childrenCount"      {...ep("keluarga-anak")} />
                      <FR label={t.f_children_living} value={g("keluarga-anak","childrenLivingWith")} fieldKey="childrenLivingWith" {...ep("keluarga-anak")} />
                      <FR label={t.f_child_custody}   value={g("keluarga-anak","childCustody")}       fieldKey="childCustody"       select={OPTS.childCustody} {...ep("keluarga-anak")} />
                    </div>
                  </Card>
              }
            </div>

            {/* ── Wali / Guardian ──────────────────────────────────────── */}
            {!hasData("wali") && editingSection !== "wali"
              ? <GhostCard title={t.s_wali} icon={<Shield className="w-full h-full" />} iconColor="#6366F1" iconBg="#EEF2FF" onAdd={() => startEdit("wali")} lang={lang} />
              : <Card>
                  <div className="p-6 group">
                    <SH title={t.s_wali} icon={<Shield className="w-full h-full" />} iconColor="#6366F1" iconBg="#EEF2FF" {...sp("wali")} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
                      <FR label={t.f_wali_name}    value={g("wali","waliName")}         fieldKey="waliName"         {...ep("wali")} />
                      <FR label={t.f_wali_contact} value={g("wali","waliContact")}      fieldKey="waliContact"      {...ep("wali")} />
                      <FR label={t.f_wali_rel}     value={g("wali","waliRelationship")} fieldKey="waliRelationship" {...ep("wali")} />
                    </div>
                  </div>
                </Card>
            }

            {/* ── Kriteria Pasangan Ideal ──────────────────────────────── */}
            {!hasData("kriteria") && editingSection !== "kriteria"
              ? <GhostCard title={t.s_kriteria} icon={<Target className="w-full h-full" />} iconColor="#A855F7" iconBg="#FAF5FF" onAdd={() => startEdit("kriteria")} lang={lang} />
              : <Card>
              <div className="p-6 group">
                <SH title={t.s_kriteria} icon={<Target className="w-full h-full" />} iconColor="#A855F7" iconBg="#FAF5FF" {...sp("kriteria")} />

                {/* helper: inline sub-section divider */}
                {(() => {
                  const Cat = ({ label, color = "#6366F1" }: { label: string; color?: string }) => (
                    <div className="flex items-center gap-2 mt-5 mb-2">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-widest shrink-0" style={{ color }}>{label}</span>
                      <div className="flex-1 h-px" style={{ background: C.div }} />
                    </div>
                  );

                  return (
                    <>
                      {/* ── 1. Agama & Keimanan ── */}
                      <Cat label={t.k_pref_agama} color="#059669" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Chip label={t.f_pref_religion}     value={g("kriteria","preferredReligion")}  fieldKey="preferredReligion"  select={OPTS.preferredReligion}  {...ep("kriteria")} />
                        <Chip label={t.f_pref_religion_lvl} value={g("kriteria","prefReligionLevel")}  fieldKey="prefReligionLevel"  select={OPTS.prefReligionLevel}  {...ep("kriteria")} />
                        <Chip label={t.f_pref_hijab_beard}  value={g("kriteria","prefHijabBeard")}     fieldKey="prefHijabBeard"     select={OPTS.prefHijabBeard}     {...ep("kriteria")} />
                        <Chip label={t.f_pref_mazhab}       value={g("kriteria","prefMazhab")}         fieldKey="prefMazhab"         select={OPTS.prefMazhab}         {...ep("kriteria")} />
                      </div>

                      {/* ── 2. Demografi ── */}
                      <Cat label={t.k_pref_demografi} color="#2563EB" />
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Age range — custom chip */}
                        <div className="rounded-xl p-3.5" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>{t.f_pref_age_range}</p>
                          {editingSection === "kriteria"
                            ? <div className="flex items-center gap-1.5">
                                <input className="w-14 text-[12px] font-semibold bg-transparent border-b focus:outline-none" style={{ color: C.text, borderColor: C.border }} value={(sectionDraft.preferredMinAge as string) ?? ""} onChange={e => ch("preferredMinAge", e.target.value)} placeholder="Min" />
                                <span className="text-[12px]" style={{ color: C.muted }}>–</span>
                                <input className="w-14 text-[12px] font-semibold bg-transparent border-b focus:outline-none" style={{ color: C.text, borderColor: C.border }} value={(sectionDraft.preferredMaxAge as string) ?? ""} onChange={e => ch("preferredMaxAge", e.target.value)} placeholder="Maks" />
                              </div>
                            : <p className="text-[13px] font-semibold" style={{ color: C.text }}>{g("kriteria","preferredMinAge")}–{g("kriteria","preferredMaxAge")}</p>
                          }
                        </div>
                        <Chip label={t.f_pref_prev_status}  value={g("kriteria","prefPreviousStatus")}       fieldKey="prefPreviousStatus"       select={OPTS.prefPreviousStatus}       {...ep("kriteria")} />
                        <Chip label={t.f_pref_ethnicity}    value={g("kriteria","openToDifferentEthnicity")} fieldKey="openToDifferentEthnicity" select={OPTS.openToDifferentEthnicity} {...ep("kriteria")} />
                        <Chip label={t.f_pref_location}     value={g("kriteria","preferredLocationOfSpouse")} fieldKey="preferredLocationOfSpouse" {...ep("kriteria")} />
                        <Chip label={t.f_pref_domicile}     value={g("kriteria","prefDomicile")}              fieldKey="prefDomicile"              select={OPTS.prefDomicile}             {...ep("kriteria")} />
                      </div>

                      {/* ── 3. Pendidikan & Pekerjaan ── */}
                      <Cat label={t.k_pref_edu_karir} color="#D97706" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Education level — custom chip using EDU_LEVELS */}
                        <div className="rounded-xl p-3.5" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>{t.f_pref_education}</p>
                          {editingSection === "kriteria"
                            ? <select className="w-full text-[13px] font-semibold bg-transparent border-0 focus:outline-none" style={{ color: C.text }} value={(sectionDraft.preferredEducationLevel as string) ?? ""} onChange={e => ch("preferredEducationLevel", e.target.value)}>
                                <option value="">—</option>
                                {EDU_LEVELS.map(l => <option key={l.value} value={l.value}>{l[lang]}</option>)}
                                <option value="no_pref">{disp("no_pref", lang)}</option>
                              </select>
                            : <p className="text-[13px] font-semibold leading-snug" style={{ color: g("kriteria","preferredEducationLevel") === "—" ? C.muted : C.text }}>
                                {g("kriteria","preferredEducationLevel") === "—" ? "—" : dispEduLevel(g("kriteria","preferredEducationLevel"), lang) || disp(g("kriteria","preferredEducationLevel"), lang)}
                              </p>
                          }
                        </div>
                        <Chip label={t.f_pref_work_status}  value={g("kriteria","prefWorkStatus")} fieldKey="prefWorkStatus" select={OPTS.prefWorkStatus} {...ep("kriteria")} />
                        {/* Job field — text */}
                        <div className="rounded-xl p-3.5" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>{t.f_pref_job_field}</p>
                          {editingSection === "kriteria"
                            ? <input className="w-full text-[13px] font-semibold bg-transparent border-0 focus:outline-none border-b" style={{ color: C.text, borderColor: C.border }} value={(sectionDraft.prefJobField as string) ?? ""} onChange={e => ch("prefJobField", e.target.value)} placeholder="—" />
                            : <p className="text-[13px] font-semibold leading-snug" style={{ color: g("kriteria","prefJobField") === "—" ? C.muted : C.text }}>{g("kriteria","prefJobField")}</p>
                          }
                        </div>
                        {/* Min income — internal, text */}
                        <div className="rounded-xl p-3.5" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-amber-600">{t.f_pref_min_income}</p>
                          {editingSection === "kriteria"
                            ? <input className="w-full text-[13px] font-semibold bg-transparent border-0 focus:outline-none border-b border-amber-200" style={{ color: C.text }} value={(sectionDraft.prefMinIncome as string) ?? ""} onChange={e => ch("prefMinIncome", e.target.value)} placeholder="—" />
                            : <p className="text-[13px] font-semibold leading-snug" style={{ color: g("kriteria","prefMinIncome") === "—" ? "#D97706" : C.text }}>{g("kriteria","prefMinIncome")}</p>
                          }
                        </div>
                      </div>

                      {/* ── 4. Fisik ── */}
                      <Cat label={t.k_pref_fisik} color="#DB2777" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Height range */}
                        <div className="rounded-xl p-3.5" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>{t.f_pref_min_height} / {t.f_pref_max_height}</p>
                          {editingSection === "kriteria"
                            ? <div className="flex items-center gap-1.5">
                                <input className="w-14 text-[12px] font-semibold bg-transparent border-b focus:outline-none" style={{ color: C.text, borderColor: C.border }} value={(sectionDraft.prefMinHeight as string) ?? ""} onChange={e => ch("prefMinHeight", e.target.value)} placeholder="Min" />
                                <span className="text-[12px]" style={{ color: C.muted }}>–</span>
                                <input className="w-14 text-[12px] font-semibold bg-transparent border-b focus:outline-none" style={{ color: C.text, borderColor: C.border }} value={(sectionDraft.prefMaxHeight as string) ?? ""} onChange={e => ch("prefMaxHeight", e.target.value)} placeholder="Maks" />
                              </div>
                            : <p className="text-[13px] font-semibold" style={{ color: C.text }}>
                                {g("kriteria","prefMinHeight") !== "—" || g("kriteria","prefMaxHeight") !== "—"
                                  ? `${g("kriteria","prefMinHeight")} – ${g("kriteria","prefMaxHeight")} cm`
                                  : "—"}
                              </p>
                          }
                        </div>
                        <Chip label={t.f_pref_body_type} value={g("kriteria","prefBodyType")} fieldKey="prefBodyType" select={OPTS.prefBodyType} {...ep("kriteria")} />
                        {/* Physical prefs — free text */}
                        <div className="md:col-span-2 rounded-xl p-3.5" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>{lang === "id" ? "Catatan Fisik Lainnya" : "Other Physical Notes"}</p>
                          {editingSection === "kriteria"
                            ? <textarea rows={1} className="w-full text-[12.5px] bg-transparent resize-none focus:outline-none" style={{ color: C.body }} value={(sectionDraft["physicalPreferences"] as string) ?? ""} onChange={e => ch("physicalPreferences", e.target.value)} placeholder="—" />
                            : <p className="text-[12.5px] leading-snug" style={{ color: g("kriteria","physicalPreferences") === "—" ? C.muted : C.body }}>{g("kriteria","physicalPreferences")}</p>
                          }
                        </div>
                      </div>

                      {/* ── 5. Keluarga & Anak ── */}
                      <Cat label={t.k_pref_keluarga} color="#7C3AED" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Chip label={t.f_pref_children_prev} value={g("kriteria","prefChildrenFromPrevious")} fieldKey="prefChildrenFromPrevious" select={OPTS.prefChildrenFromPrevious} {...ep("kriteria")} />
                        {/* Max children — text */}
                        <div className="rounded-xl p-3.5" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: C.muted }}>{t.f_pref_max_children}</p>
                          {editingSection === "kriteria"
                            ? <input className="w-full text-[13px] font-semibold bg-transparent border-0 focus:outline-none border-b" style={{ color: C.text, borderColor: C.border }} value={(sectionDraft.prefMaxChildren as string) ?? ""} onChange={e => ch("prefMaxChildren", e.target.value)} placeholder="—" />
                            : <p className="text-[13px] font-semibold" style={{ color: g("kriteria","prefMaxChildren") === "—" ? C.muted : C.text }}>{g("kriteria","prefMaxChildren")}</p>
                          }
                        </div>
                        <Chip label={t.f_pref_family_living} value={g("kriteria","prefLivingWithFamily")} fieldKey="prefLivingWithFamily" select={OPTS.prefLivingWithFamily} {...ep("kriteria")} />
                      </div>

                      {/* ── 6. Karakter & Gaya Hidup ── */}
                      <Cat label={t.k_pref_karakter} color="#0891B2" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <Chip label={t.f_pref_personality_type} value={g("kriteria","prefPersonalityType")}  fieldKey="prefPersonalityType"  select={OPTS.prefPersonalityType}  {...ep("kriteria")} />
                        <Chip label={t.f_pref_smoking_acc}      value={g("kriteria","prefSmokingAcceptance")} fieldKey="prefSmokingAcceptance" select={OPTS.prefSmokingAcceptance} {...ep("kriteria")} />
                        <Chip label={t.f_pref_wife_career}      value={g("kriteria","prefWifeCareer")}        fieldKey="prefWifeCareer"        select={OPTS.prefWifeCareer}        {...ep("kriteria")} />
                      </div>
                      <div className="rounded-xl p-4 mb-3" style={{ background: C.bg }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>{t.f_personality_sought}</p>
                        {editingSection === "kriteria"
                          ? <textarea rows={2} className="w-full text-[13px] bg-transparent resize-none focus:outline-none" style={{ color: C.body }} value={(sectionDraft["preferredPersonalityTraits"] as string) ?? ""} onChange={e => ch("preferredPersonalityTraits", e.target.value)} placeholder="—" />
                          : <p className="text-[13px]" style={{ color: g("kriteria","preferredPersonalityTraits") === "—" ? C.muted : C.body }}>{g("kriteria","preferredPersonalityTraits")}</p>
                        }
                      </div>

                      {/* ── 7. Kesehatan ── */}
                      <Cat label={t.k_pref_kesehatan} color="#64748B" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <Chip label={t.f_pref_health} value={g("kriteria","prefHealthCondition")} fieldKey="prefHealthCondition" select={OPTS.prefHealthCondition} {...ep("kriteria")} />
                      </div>

                      {/* ── Deal Breaker ── */}
                      <div className="rounded-xl p-4 border border-red-100 bg-red-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-red-500">{t.f_deal_breaker}</p>
                        {editingSection === "kriteria"
                          ? <textarea rows={2} className="w-full text-[13px] bg-transparent resize-none focus:outline-none text-red-700" value={(sectionDraft["spouseDealBreakers"] as string) ?? ""} onChange={e => ch("spouseDealBreakers", e.target.value)} placeholder="—" />
                          : <p className="text-[13px] text-red-700">{g("kriteria","spouseDealBreakers")}</p>
                        }
                      </div>
                    </>
                  );
                })()}
              </div>
            </Card>
            }

            {/* ── Harapan ──────────────────────────────────────────────── */}
            {!hasData("harapan") && editingSection !== "harapan"
              ? <GhostCard title={t.s_harapan} icon={<Heart className="w-full h-full" />} iconColor="#EC4899" iconBg="#FDF2F8" onAdd={() => startEdit("harapan")} lang={lang} />
              : <Card>
              <div className="p-6 group">
                <SH title={t.s_harapan} icon={<Heart className="w-full h-full" />} iconColor="#EC4899" iconBg="#FDF2F8" {...sp("harapan")} />
                {(() => {
                  const fk = gender === "male" ? "roleExpectationsWife" : "roleExpectationsHusband";
                  return editingSection === "harapan"
                    ? <textarea rows={4} className="w-full text-[14px] leading-relaxed rounded-xl px-3.5 py-2.5 border resize-none focus:outline-none" style={{ borderColor: C.border, color: C.body, background: C.bg }} value={(sectionDraft[fk] as string) ?? ""} onChange={e => ch(fk, e.target.value)} placeholder="—" />
                    : <p className="text-[14px] leading-relaxed" style={{ color: raw(data,fk) === "—" ? C.muted : C.body }}>{raw(data,fk) !== "—" ? `"${raw(data,fk)}"` : t.not_filled}</p>;
                })()}
              </div>
            </Card>
            }

            {/* ── Photo Grid ───────────────────────────────────────────── */}
            <div>
              {/* Visibility badge + add button header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {raw(data,"photoVisibility") === "after_match"
                    ? <><EyeOff className="w-3.5 h-3.5" style={{ color: C.muted }} /><span className="text-[11.5px] font-semibold" style={{ color: C.muted }}>{disp("after_match", lang)}</span></>
                    : raw(data,"photoVisibility") === "visible_all"
                      ? <><Eye className="w-3.5 h-3.5" style={{ color: "#059669" }} /><span className="text-[11.5px] font-semibold" style={{ color: "#059669" }}>{disp("visible_all", lang)}</span></>
                      : <><Eye className="w-3.5 h-3.5" style={{ color: C.muted }} /><span className="text-[11.5px] italic" style={{ color: C.muted }}>{lang === "id" ? "Visibilitas belum diset" : "Visibility not set"}</span></>
                  }
                </div>
                {canEdit && photos.length < 10 && (
                  <button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}
                    className="flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:bg-white disabled:opacity-50"
                    style={{ color: C.body, borderColor: C.border, background: C.card }}>
                    <Plus className="w-3 h-3" />
                    {uploadingPhoto ? (lang === "id" ? "Mengunggah…" : "Uploading…") : (lang === "id" ? "Tambah Foto" : "Add Photo")}
                  </button>
                )}
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
              </div>
              {photos.length > 0
                ? <div className="grid grid-cols-4 gap-2">
                    {photos.map((url, i) => (
                      <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden cursor-pointer relative group"
                        onClick={() => setLightboxIdx(i)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Photo ${i+1}`} className="w-full h-full object-cover object-top transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                        {canEdit && (
                          <button
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                            style={{ width: 26, height: 26, background: "rgba(0,0,0,0.55)", color: "#fff" }}
                            onClick={e => { e.stopPropagation(); deletePhoto(i); }}
                            title={lang === "id" ? "Hapus foto" : "Delete photo"}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                : <div className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-8 gap-2" style={{ borderColor: C.border, background: C.bg }}>
                    <GenderAvatar gender={gender} size={56} />
                    <p className="text-[12px] italic" style={{ color: C.muted }}>{lang === "id" ? "Belum ada foto" : "No photos yet"}</p>
                  </div>
              }
            </div>


            {/* ── Status Profil ─────────────────────────────────────────── */}
            <Card>
              <div className="p-6 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFF7ED", color: "#F97316" }}>
                      <ToggleLeft className="w-[20px] h-[20px]" />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-extrabold" style={{ color: C.text }}>{t.s_status}</h3>
                    </div>
                  </div>
                  <EditBar sk="status-profil" canEdit={canEdit} isEditing={editingSection==="status-profil"} isSaving={savingSection==="status-profil"} meta={sectionMeta["status-profil"]} onEdit={()=>startEdit("status-profil")} onSave={()=>saveEdit("status-profil")} onCancel={cancelEdit} lang={lang} />
                </div>
                {editingSection === "status-profil" ? (() => {
                  const draftPaket = (sectionDraft.paket as string) ?? paket;
                  const canBgCheck  = PLAN_HAS_BGCHECK.has(draftPaket);
                  const canPsych    = PLAN_HAS_PSYCH.has(draftPaket);
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Account Status — multi-select, gated by plan */}
                      <div className="sm:col-span-2">
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_status}</p>
                        <p className="text-[10px] mb-2" style={{ color: C.muted }}>{lang === "id" ? "Pilih semua yang berlaku" : "Select all that apply"}</p>
                        <div className="flex flex-wrap gap-2">
                          {OPTS.profileStatus.map(s => {
                            const locked = (s === "bg_checked" && !canBgCheck) || (s === "psych_assessed" && !canPsych);
                            const active = (sectionDraft.profileStatus as string[] ?? []).includes(s);
                            return (
                              <button key={s} onClick={() => {
                                if (locked) return;
                                const cur = sectionDraft.profileStatus as string[] ?? [];
                                ch("profileStatus", active ? cur.filter(x => x !== s) : [...cur, s]);
                              }} disabled={locked}
                                title={locked ? (lang === "id" ? "Tidak tersedia pada paket ini" : "Not available on this plan") : undefined}
                                className={`px-3 py-1.5 rounded-full border text-[11.5px] font-semibold transition-colors ${locked ? "opacity-35 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200" : active ? statusColor(s) : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                                {active && <CheckCircle className="w-3 h-3 inline mr-1" />}
                                {disp(s, lang)}{locked ? " 🔒" : ""}
                              </button>
                            );
                          })}
                        </div>
                        {!canBgCheck && !canPsych && (
                          <p className="text-[10.5px] mt-1.5" style={{ color: C.muted }}>
                            {lang === "id" ? "BG Check & Psikotest: tersedia di Ruby / Diamond" : "BG Check & Psych: available on Ruby / Diamond"}
                          </p>
                        )}
                      </div>
                      {/* Open Taaruf */}
                      <div className="sm:col-span-2">
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: C.muted }}>{t.sp_taaruf}</p>
                        <div className="flex flex-wrap gap-2">
                          {OPTS.openToTaaruf.map(s => (
                            <button key={s} onClick={() => ch("openToTaaruf", s)}
                              className={`px-3 py-1.5 rounded-full border text-[11.5px] font-semibold transition-colors ${sectionDraft.openToTaaruf === s ? (s === "ready" ? "bg-amber-50 text-amber-700 border-amber-200" : s === "preparing" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-gray-100 text-gray-500 border-gray-300") : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                              {disp(s, lang)}
                            </button>
                          ))}
                        </div>
                        {/* catatanPersiapan — only when preparing */}
                        {sectionDraft.openToTaaruf === "preparing" && (
                          <div className="mt-2">
                            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_catatan_persiapan}</p>
                            <textarea rows={2} className="w-full text-[12.5px] rounded-lg px-2.5 py-1.5 border resize-none focus:outline-none" style={{ borderColor: "#BAE6FD", color: C.text, background: "#F0F9FF" }}
                              value={(sectionDraft.catatanPersiapan as string) ?? ""} onChange={e => ch("catatanPersiapan", e.target.value)}
                              placeholder={lang === "id" ? "Fokus karir, healing, kondisi keluarga, dll…" : "Career-focused, healing, family circumstances, etc…"} />
                          </div>
                        )}
                      </div>
                      {/* Person Status */}
                      <div className="sm:col-span-2">
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-2" style={{ color: C.muted }}>{t.sp_person_status}</p>
                        <div className="flex flex-wrap gap-2">
                          {OPTS.personStatus.map(s => (
                            <button key={s} onClick={() => ch("personStatus", s)}
                              className={`px-3 py-1.5 rounded-full border text-[11.5px] font-semibold transition-colors ${sectionDraft.personStatus === s ? personStatusColor(s) : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                              {disp(s, lang)}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Paket — the gate for assessment unlocking */}
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_paket}</p>
                        <select className="w-full text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }} value={(sectionDraft.paket as string) ?? ""} onChange={e => ch("paket", e.target.value)}>
                          <option value="">—</option>
                          {OPTS.paket.map(o => <option key={o} value={o}>{disp(o, lang)}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_sumber}</p>
                        <select className="w-full text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }} value={(sectionDraft.sumberLead as string) ?? ""} onChange={e => ch("sumberLead", e.target.value)}>
                          <option value="">—</option>
                          {OPTS.sumberLead.map(o => <option key={o} value={o}>{disp(o, lang)}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_target}</p>
                        <select className="w-full text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }} value={(sectionDraft.targetWaktuMenikah as string) ?? ""} onChange={e => ch("targetWaktuMenikah", e.target.value)}>
                          <option value="">—</option>
                          {OPTS.targetWaktuMenikah.map(o => <option key={o} value={o}>{disp(o, lang)}</option>)}
                        </select>
                      </div>
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_pic}</p>
                        <input className="w-full text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }} value={(sectionDraft.pic as string) ?? ""} onChange={e => ch("pic", e.target.value)} placeholder="—" />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_activated_by}</p>
                        <input className="w-full text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }} value={(sectionDraft.profileActivatedBy as string) ?? ""} onChange={e => ch("profileActivatedBy", e.target.value)} placeholder="—" />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_activated_at}</p>
                        <input type="date" className="w-full text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }} value={(sectionDraft.profileActivatedAt as string) ?? ""} onChange={e => ch("profileActivatedAt", e.target.value)} />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.f_photo_visibility}</p>
                        <select className="w-full text-[13px] rounded-lg px-2.5 py-1.5 border focus:outline-none" style={{ borderColor: C.border, color: C.text }} value={(sectionDraft.photoVisibility as string) ?? ""} onChange={e => ch("photoVisibility", e.target.value)}>
                          <option value="">—</option>
                          {OPTS.photoVisibility.map(o => <option key={o} value={o}>{disp(o, lang)}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-[10.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_notes}</p>
                        <textarea rows={2} className="w-full text-[13px] rounded-lg px-2.5 py-1.5 border resize-none focus:outline-none" style={{ borderColor: C.border, color: C.text }} value={(sectionDraft.profileNotes as string) ?? ""} onChange={e => ch("profileNotes", e.target.value)} placeholder="—" />
                      </div>
                    </div>
                  );
                })() : (
                  <div className="space-y-3">
                    {/* Paket badge row — gates assessment unlocking */}
                    <div className="flex flex-wrap items-center gap-3 pb-2 border-b" style={{ borderColor: C.div }}>
                      <div>
                        <p className="text-[9.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_paket}</p>
                        {paket && paket !== "—" && paket !== "not_selected"
                          ? <span className="inline-flex items-center px-3 py-1 rounded-full border text-[12px] font-extrabold" style={{ background: "#1B3A6B", color: "#fff", borderColor: "#1B3A6B" }}>{disp(paket, lang)}</span>
                          : <span className="inline-flex items-center px-3 py-1 rounded-full border text-[12px] font-semibold bg-gray-100 text-gray-400 border-gray-200">{disp("not_selected", lang)}</span>
                        }
                      </div>
                      {raw(data,"sumberLead") !== "—" && (
                        <div>
                          <p className="text-[9.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_sumber}</p>
                          <span className="text-[12.5px] font-semibold" style={{ color: C.body }}>{disp(raw(data,"sumberLead"), lang)}</span>
                        </div>
                      )}
                      {raw(data,"pic") !== "—" && (
                        <div>
                          <p className="text-[9.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_pic}</p>
                          <span className="text-[12.5px] font-semibold" style={{ color: C.body }}>{raw(data,"pic")}</span>
                        </div>
                      )}
                      {raw(data,"targetWaktuMenikah") !== "—" && (
                        <div>
                          <p className="text-[9.5px] font-bold uppercase tracking-wide mb-1" style={{ color: C.muted }}>{t.sp_target}</p>
                          <span className="text-[12.5px] font-semibold" style={{ color: C.body }}>{disp(raw(data,"targetWaktuMenikah"), lang)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{t.sp_status}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {profStatuses.length > 0
                            ? profStatuses.map(s => (
                              <span key={s} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[12px] font-bold ${statusColor(s)}`}>
                                <CheckCircle className="w-3 h-3" />{disp(s, lang)}
                              </span>
                            ))
                            : <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[12px] font-bold bg-gray-100 text-gray-400 border-gray-200">{t.not_set}</span>
                          }
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{t.sp_taaruf}</p>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold ${openTaaruf === "ready" ? "bg-amber-50 text-amber-700 border-amber-200" : openTaaruf === "preparing" ? "bg-sky-50 text-sky-700 border-sky-200" : openTaaruf === "no" ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          {openTaaruf === "no" ? t.not_open : openTaaruf !== "—" ? disp(openTaaruf, lang) : t.taaruf_not_set}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: C.muted }}>{t.sp_person_status}</p>
                        {raw(data,"personStatus") !== "—"
                          ? <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold ${personStatusColor(raw(data,"personStatus"))}`}>{disp(raw(data,"personStatus"), lang)}</span>
                          : <span className="text-[12.5px] italic" style={{ color: C.muted }}>{t.not_set}</span>
                        }
                      </div>
                    </div>
                    {/* catatanPersiapan — visible only when openToTaaruf = preparing */}
                    {openTaaruf === "preparing" && raw(data,"catatanPersiapan") !== "—" && (
                      <p className="text-[13px] rounded-xl px-3.5 py-2.5" style={{ background: "#F0F9FF", color: C.body, borderLeft: "3px solid #BAE6FD" }}>
                        {raw(data,"catatanPersiapan")}
                      </p>
                    )}
                    {raw(data,"profileActivatedBy") !== "—" && (
                      <p className="text-[12.5px]" style={{ color: C.muted }}>
                        {t.activated_by} <span className="font-semibold" style={{ color: C.body }}>{raw(data,"profileActivatedBy")}</span>
                        {raw(data,"profileActivatedAt") !== "—" ? ` · ${raw(data,"profileActivatedAt")}` : ""}
                      </p>
                    )}
                    {raw(data,"profileNotes") !== "—" && (
                      <p className="text-[13px] rounded-xl px-3.5 py-2.5" style={{ background: C.bg, color: C.body }}>{raw(data,"profileNotes")}</p>
                    )}
                    {raw(data,"photoVisibility") !== "—" && (
                      <p className="text-[12.5px]" style={{ color: C.muted }}>
                        {t.f_photo_visibility}: <span className="font-semibold" style={{ color: C.body }}>{disp(raw(data,"photoVisibility"), lang)}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* ── ASSESSMENTS DIVIDER ──────────────────────────────────── */}
            <div className="flex items-center gap-4 my-1">
              <div className="flex-1 h-px" style={{ background: C.border }} />
              <span className="font-bold uppercase" style={{ fontSize: 10.5, color: C.muted, letterSpacing: "0.8px" }}>{t.assessment_div}</span>
              <div className="flex-1 h-px" style={{ background: C.border }} />
            </div>

            {/* ── Tes Psikologi ────────────────────────────────────────── */}
            <AssessmentCard sk="tes-psikologi" title={t.s_psikologi} icon={<Brain className="w-full h-full" />} accent="#7c3aed" doneKey="psychTestStatus" locked={!PLAN_HAS_PSYCH.has(paket)} lockedTiers={["ruby","diamond"]}>
              <div className="space-y-0">
                <FR label={t.ps_date}          value={g("tes-psikologi","psychTestDate")}              fieldKey="psychTestDate"              {...ep("tes-psikologi")} />
                <FR label={t.ps_provider}       value={g("tes-psikologi","psychTestProvider")}          fieldKey="psychTestProvider"          {...ep("tes-psikologi")} />
                <FR label={t.ps_personality}    value={g("tes-psikologi","psychTestPersonalityType")}   fieldKey="psychTestPersonalityType"   {...ep("tes-psikologi")} />
                <FR label={t.ps_emotional}      value={g("tes-psikologi","psychTestEmotionalReadiness")} fieldKey="psychTestEmotionalReadiness" select={OPTS.psychTestEmotionalReadiness} {...ep("tes-psikologi")} />
                <FR label={t.ps_attachment}     value={g("tes-psikologi","psychTestAttachmentStyle")}   fieldKey="psychTestAttachmentStyle"   select={OPTS.psychTestAttachmentStyle} {...ep("tes-psikologi")} />
                <FR label={t.ps_conflict}       value={g("tes-psikologi","psychTestConflictStyle")}     fieldKey="psychTestConflictStyle"     {...ep("tes-psikologi")} />
                <FR label={t.ps_communication}  value={g("tes-psikologi","psychTestCommunicationStyle")} fieldKey="psychTestCommunicationStyle" {...ep("tes-psikologi")} />
                <FR label={t.ps_marriage}       value={g("tes-psikologi","psychTestMarriageReadiness")} fieldKey="psychTestMarriageReadiness" select={OPTS.psychTestMarriageReadiness} {...ep("tes-psikologi")} />
                <FR label={t.ps_recommendation} value={g("tes-psikologi","psychTestRecommendation")}    fieldKey="psychTestRecommendation"    select={OPTS.psychTestRecommendation}  {...ep("tes-psikologi")} />
                {editingSection !== "tes-psikologi" && raw(data,"psychTestRecommendation") !== "—" && (
                  <div className="pt-2"><ResultBadge value={raw(data,"psychTestRecommendation")} lang={lang} /></div>
                )}
                <FR label={t.ps_notes}          value={g("tes-psikologi","psychTestNotes")}             fieldKey="psychTestNotes"             {...ep("tes-psikologi")} long />
              </div>
            </AssessmentCard>

            {/* ── Background Check ─────────────────────────────────────── */}
            <AssessmentCard sk="background-check" title={t.s_bgcheck} icon={<ClipboardList className="w-full h-full" />} accent="#0b3a86" doneKey="bgCheckStatus" locked={!PLAN_HAS_BGCHECK.has(paket)} lockedTiers={["ruby","diamond"]}>
              <div className="space-y-0">
                <FR label={t.bg_date}      value={g("background-check","bgCheckDate")}             fieldKey="bgCheckDate"            {...ep("background-check")} />
                <FR label={t.bg_family}    value={g("background-check","bgCheckFamilyBackground")} fieldKey="bgCheckFamilyBackground" {...ep("background-check")} long />
                <FR label={t.bg_financial} value={g("background-check","bgCheckFinancialStatus")}  fieldKey="bgCheckFinancialStatus"  select={OPTS.bgCheckFinancialStatus}  {...ep("background-check")} />
                <FR label={t.bg_criminal}  value={g("background-check","bgCheckCriminalRecord")}   fieldKey="bgCheckCriminalRecord"   select={OPTS.bgCheckCriminalRecord}   {...ep("background-check")} />
                <FR label={t.bg_social}    value={g("background-check","bgCheckSocialMediaCheck")} fieldKey="bgCheckSocialMediaCheck" select={OPTS.bgCheckSocialMediaCheck} {...ep("background-check")} />
                <FR label={t.bg_reference} value={g("background-check","bgCheckReferenceResult")}  fieldKey="bgCheckReferenceResult"  select={OPTS.bgCheckReferenceResult}  {...ep("background-check")} />
                <FR label={t.bg_result}    value={g("background-check","bgCheckOverallResult")}    fieldKey="bgCheckOverallResult"    select={OPTS.bgCheckOverallResult}    {...ep("background-check")} />
                {editingSection !== "background-check" && raw(data,"bgCheckOverallResult") !== "—" && (
                  <div className="pt-2"><ResultBadge value={raw(data,"bgCheckOverallResult")} lang={lang} /></div>
                )}
                <FR label={t.bg_notes}     value={g("background-check","bgCheckNotes")}            fieldKey="bgCheckNotes"            {...ep("background-check")} long />
              </div>
            </AssessmentCard>

            {/* ── Identity Check ───────────────────────────────────────── */}
            <AssessmentCard sk="identity-check" title={t.s_identity} icon={<Fingerprint className="w-full h-full" />} accent="#0f766e" doneKey="idCheckStatus" locked={!PLAN_HAS_IDCHECK.has(paket)} lockedTiers={["pearl","ruby","diamond"]}>
              <div className="space-y-0">
                <FR label={t.id_date}        value={g("identity-check","idCheckDate")}          fieldKey="idCheckDate"          {...ep("identity-check")} />
                <FR label={t.id_ktp}         value={g("identity-check","ktpVerified")}          fieldKey="ktpVerified"          select={OPTS.ktpVerified}         {...ep("identity-check")} />
                <FR label={t.id_ktp_num}     value={g("identity-check","ktpNumber")}            fieldKey="ktpNumber"            {...ep("identity-check")} />
                <FR label={t.id_passport}    value={g("identity-check","passportVerified")}     fieldKey="passportVerified"     select={OPTS.passportVerified}    {...ep("identity-check")} />
                <FR label={t.id_verified_by} value={g("identity-check","idCheckVerifiedBy")}    fieldKey="idCheckVerifiedBy"    {...ep("identity-check")} />
                <FR label={t.id_result}      value={g("identity-check","idCheckOverallResult")} fieldKey="idCheckOverallResult" select={OPTS.idCheckOverallResult} {...ep("identity-check")} />
                {editingSection !== "identity-check" && raw(data,"idCheckOverallResult") !== "—" && (
                  <div className="pt-2"><ResultBadge value={raw(data,"idCheckOverallResult")} lang={lang} /></div>
                )}
                <FR label={t.id_notes}       value={g("identity-check","idCheckNotes")}         fieldKey="idCheckNotes"         {...ep("identity-check")} long />
              </div>
            </AssessmentCard>

            {/* ── Jodohmu Criteria ─────────────────────────────────────── */}
            <AssessmentCard sk="kriteria-jodohmu" title={t.s_jodohmu} icon={<Award className="w-full h-full" />} accent="#b45309" doneKey="jodohmuCriteriaStatus">
              <div>
                <div className="space-y-0 mb-4">
                  <FR label={t.j_date}          value={g("kriteria-jodohmu","jodohmuCriteriaDate")}           fieldKey="jodohmuCriteriaDate"           {...ep("kriteria-jodohmu")} />
                  <FR label={t.j_assessor}       value={g("kriteria-jodohmu","jodohmuCriteriaAssessor")}       fieldKey="jodohmuCriteriaAssessor"       {...ep("kriteria-jodohmu")} />
                  <FR label={t.j_recommendation} value={g("kriteria-jodohmu","jodohmuCriteriaRecommendation")} fieldKey="jodohmuCriteriaRecommendation" select={OPTS.jodohmuCriteriaRecommendation} {...ep("kriteria-jodohmu")} />
                  {editingSection !== "kriteria-jodohmu" && raw(data,"jodohmuCriteriaRecommendation") !== "—" && (
                    <div className="pt-2 pb-2"><ResultBadge value={raw(data,"jodohmuCriteriaRecommendation")} lang={lang} /></div>
                  )}
                </div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>{t.j_dimensions}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {[
                    { k:"jodohmuCriteriaPsychological",   l: t.j_psych },
                    { k:"jodohmuCriteriaReligious",       l: t.j_religious },
                    { k:"jodohmuCriteriaFinancial",       l: t.j_financial },
                    { k:"jodohmuCriteriaFamilyBackground",l: t.j_family },
                    { k:"jodohmuCriteriaPersonality",     l: t.j_personality },
                    { k:"jodohmuCriteriaMarriageReadiness",l: t.j_marriage },
                  ].map(f => (
                    <div key={f.k} className="rounded-xl p-3.5" style={{ background: "#fefce8", border: "1px solid #fef08a" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-amber-600">{f.l}</p>
                      {editingSection === "kriteria-jodohmu"
                        ? <textarea rows={2} className="w-full text-[12.5px] bg-transparent resize-none focus:outline-none" style={{ color: C.body }} value={(sectionDraft[f.k] as string) ?? ""} onChange={e => ch(f.k, e.target.value)} placeholder="—" />
                        : <p className="text-[12.5px] leading-relaxed" style={{ color: raw(data,f.k) === "—" ? C.muted : C.body }}>{raw(data,f.k)}</p>
                      }
                    </div>
                  ))}
                </div>
                <div className="rounded-xl p-4 mb-3" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>{t.j_conditions}</p>
                  {editingSection === "kriteria-jodohmu"
                    ? <textarea rows={2} className="w-full text-[13px] bg-transparent resize-none focus:outline-none" style={{ color: C.body }} value={(sectionDraft["jodohmuCriteriaConditions"] as string) ?? ""} onChange={e => ch("jodohmuCriteriaConditions", e.target.value)} placeholder="—" />
                    : <p className="text-[13px] leading-relaxed" style={{ color: raw(data,"jodohmuCriteriaConditions") === "—" ? C.muted : C.body }}>{raw(data,"jodohmuCriteriaConditions")}</p>
                  }
                </div>
                <div className="rounded-xl p-4" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>{t.j_special}</p>
                  {editingSection === "kriteria-jodohmu"
                    ? <textarea rows={3} className="w-full text-[13px] bg-transparent resize-none focus:outline-none" style={{ color: C.body }} value={(sectionDraft["jodohmuCriteriaSpecialNotes"] as string) ?? ""} onChange={e => ch("jodohmuCriteriaSpecialNotes", e.target.value)} placeholder={t.j_special_ph} />
                    : <p className="text-[13px] leading-relaxed" style={{ color: raw(data,"jodohmuCriteriaSpecialNotes") === "—" ? C.muted : C.body }}>{raw(data,"jodohmuCriteriaSpecialNotes")}</p>
                  }
                </div>
              </div>
            </AssessmentCard>

            {/* ── Team Section (Pipeline + Notes + Workers) ─────────────── */}
            <Card>
              <div className="p-6 flex flex-col gap-6">

                {/* Pipeline & Tracking */}
                <div className="group">
                  <SH title={t.s_pipeline} icon={<CalendarDays className="w-full h-full" />} iconColor="#0EA5E9" iconBg="#F0F9FF" {...sp("crm-internal")} />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8">
                    <FR label={t.f_last_contact}  value={g("crm-internal","lastContact")}         fieldKey="lastContact"        {...ep("crm-internal")} />
                    <FR label={t.f_next_followup} value={g("crm-internal","nextFollowUp")}        fieldKey="nextFollowUp"       {...ep("crm-internal")} />
                    <FR label={t.sp_sumber}        value={g("crm-internal","sumberLead")}         fieldKey="sumberLead"         select={OPTS.sumberLead}         {...ep("crm-internal")} />
                    <FR label={t.sp_target}        value={g("crm-internal","targetWaktuMenikah")} fieldKey="targetWaktuMenikah" select={OPTS.targetWaktuMenikah} {...ep("crm-internal")} />
                  </div>
                </div>

                <div className="h-px" style={{ background: C.div }} />

                {/* Team Notes */}
                <div className="group">
                  <SH title={t.s_catatan} icon={<Users className="w-full h-full" />} iconColor="#0EA5E9" iconBg="#F0F9FF" {...sp("catatan-tim")} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { k:"salesLeadNotes",   l: t.c_sales,        cls:"bg-amber-50 border border-amber-100" },
                      { k:"profileMakerNotes",l: t.c_matchmaker,   cls:"" },
                      { k:"imamNotes",        l: t.c_imam,         cls:"" },
                      { k:"psychologistNotes",l: t.c_psikolog,     cls:"" },
                      { k:"receptionistNotes",l: t.c_receptionist, cls:"" },
                      { k:"internalTeamNotes",l: t.c_internal,     cls:"" },
                    ].map(n => (
                      <div key={n.k} className={`rounded-xl p-3.5 ${n.cls || ""}`} style={!n.cls ? { borderColor: C.border, border: `1px solid ${C.border}`, background: C.bg } : {}}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>{n.l}</p>
                        {editingSection === "catatan-tim"
                          ? <textarea rows={2} className="w-full text-[12.5px] bg-transparent resize-none focus:outline-none" style={{ color: C.body }} value={(sectionDraft[n.k] as string) ?? ""} onChange={e => ch(n.k, e.target.value)} placeholder="—" />
                          : <p className="text-[12.5px] leading-relaxed" style={{ color: raw(data,n.k) === "—" ? C.muted : C.body }}>{raw(data,n.k)}</p>
                        }
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assigned Workers (admin only) */}
                {isAdmin && (
                  <>
                    <div className="h-px" style={{ background: C.div }} />
                    <div>
                      <h3 className="font-bold uppercase mb-3" style={{ fontSize: 11, color: C.label, letterSpacing: "0.7px" }}>{t.workers_title}</h3>
                      {assignedWorkers.length === 0
                        ? <p className="text-[13px] mb-3 italic" style={{ color: C.muted }}>{t.no_workers}</p>
                        : (
                          <div className="space-y-2 mb-3">
                            {assignedWorkers.map(uid => {
                              const w = workerMap[uid];
                              return (
                                <div key={uid} className="flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                                  <div>
                                    <p className="text-[13px] font-semibold" style={{ color: C.text }}>{w?.name ?? uid}</p>
                                    {w?.email && <p className="text-[11.5px]" style={{ color: C.muted }}>{w.email}</p>}
                                  </div>
                                  <button onClick={() => removeWorker(uid)} className="transition-colors hover:text-red-500" style={{ color: C.muted }}>
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )
                      }
                      {unassigned.length > 0 && (
                        <div className="flex items-center gap-2">
                          <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}
                            className="flex-1 h-9 rounded-xl border bg-white px-3 text-[13px] focus:outline-none" style={{ borderColor: C.border, color: C.text }}>
                            <option value="">{t.pick_worker}</option>
                            {unassigned.map(w => <option key={w.uid} value={w.uid}>{w.name} — {w.email}</option>)}
                          </select>
                          <button onClick={assignWorker} disabled={!selectedWorker}
                            className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2 rounded-xl disabled:opacity-40 transition-all"
                            style={{ background: `linear-gradient(135deg, ${C.g1}, ${C.g2})` }}>
                            <UserPlus className="w-3.5 h-3.5" /> {t.assign}
                          </button>
                        </div>
                      )}
                      {assignMsg && <p className="text-[12px] font-medium text-emerald-600 mt-2">{assignMsg}</p>}
                    </div>
                  </>
                )}

              </div>
            </Card>

          </div>{/* end right column */}
        </div>{/* end flex row */}
      </div>{/* end max-w container */}

      {/* ── PHOTO LIGHTBOX ──────────────────────────────────────────────── */}
      {lightboxIdx !== null && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.88)" }}
          onClick={() => setLightboxIdx(null)}>
          {/* Close */}
          <button className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
            onClick={() => setLightboxIdx(null)}>
            <X className="w-7 h-7" />
          </button>
          {/* Delete (admin only) */}
          {canEdit && (
            <button className="absolute top-4 right-14 flex items-center gap-1.5 text-white/60 hover:text-red-400 transition-colors z-10 text-[12.5px] font-semibold"
              onClick={e => { e.stopPropagation(); deletePhoto(lightboxIdx); }}>
              <Trash2 className="w-4 h-4" />
              {lang === "id" ? "Hapus" : "Delete"}
            </button>
          )}
          {/* Visibility badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
            {raw(data,"photoVisibility") === "after_match"
              ? <span className="flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-black/40 text-white/70"><EyeOff className="w-3.5 h-3.5" />{disp("after_match", lang)}</span>
              : raw(data,"photoVisibility") === "visible_all"
                ? <span className="flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-black/40 text-emerald-400"><Eye className="w-3.5 h-3.5" />{disp("visible_all", lang)}</span>
                : null
            }
          </div>
          {/* Prev */}
          {photos.length > 1 && (
            <button className="absolute left-4 text-white/70 hover:text-white transition-colors z-10 p-2"
              onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + photos.length) % photos.length); }}>
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {/* Image */}
          <div className="max-w-[min(90vw,560px)] max-h-[88vh] flex flex-col items-center gap-3"
            onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[lightboxIdx]} alt={`Photo ${lightboxIdx + 1}`}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl" />
            {photos.length > 1 && (
              <div className="flex gap-1.5">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setLightboxIdx(i)}
                    className="rounded-full transition-all"
                    style={{ width: i === lightboxIdx ? 20 : 7, height: 7, background: i === lightboxIdx ? "#fff" : "rgba(255,255,255,0.35)" }} />
                ))}
              </div>
            )}
          </div>
          {/* Next */}
          {photos.length > 1 && (
            <button className="absolute right-4 text-white/70 hover:text-white transition-colors z-10 p-2"
              onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % photos.length); }}>
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}

      {/* ── TAARUF CV MODAL ─────────────────────────────────────────────── */}
      {cvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setCvModal(false); }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="px-6 py-5" style={{ background: "linear-gradient(135deg, #1B3A6B, #1e4fc9)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.15)" }}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-[15px]">
                      {lang === "id" ? "Unduh CV Ta'aruf" : "Download Taaruf CV"}
                    </h2>
                    <p className="text-[11.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {meta.name ?? raw(data, "name")}
                    </p>
                  </div>
                </div>
                <button onClick={() => setCvModal(false)} style={{ color: "rgba(255,255,255,0.5)" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">

              {/* Language selector */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: C.muted }}>
                  {lang === "id" ? "Bahasa Dokumen" : "Document Language"}
                </p>
                <div className="flex gap-2">
                  {(["id","en"] as Lang[]).map(opt => (
                    <button key={opt} onClick={() => setCvLang(opt)}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] border transition-all"
                      style={{
                        background: cvLang === opt ? C.primary : "white",
                        color: cvLang === opt ? "white" : C.body,
                        borderColor: cvLang === opt ? C.primary : C.border,
                      }}>
                      {opt === "id" ? "Indonesia" : "English"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo toggle (only if candidate has photos) */}
              {photos.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: C.muted }}>
                    {lang === "id" ? "Foto Kandidat" : "Candidate Photo"}
                  </p>
                  <div className="flex gap-2">
                    {([true, false] as const).map(opt => (
                      <button key={String(opt)} onClick={() => setCvPhoto(opt)}
                        className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] border transition-all"
                        style={{
                          background: cvPhoto === opt ? (opt ? C.accent : C.primary) : "white",
                          color: cvPhoto === opt ? "white" : C.muted,
                          borderColor: cvPhoto === opt ? (opt ? C.accent : C.primary) : C.border,
                        }}>
                        {opt
                          ? (lang === "id" ? "Dengan Foto" : "With Photo")
                          : (lang === "id" ? "Tanpa Foto" : "No Photo")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info note */}
              <p className="text-[11px] leading-relaxed rounded-xl px-3.5 py-2.5" style={{ background: C.bg, color: C.muted }}>
                {lang === "id"
                  ? "Browser akan membuka dialog cetak. Pilih \"Simpan sebagai PDF\" untuk mengunduh."
                  : "Your browser will open a print dialog. Choose \"Save as PDF\" to download."}
              </p>
            </div>

            {/* Modal actions */}
            <div className="px-6 pb-5 flex gap-2.5">
              <button onClick={() => setCvModal(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-[13px] border transition-colors"
                style={{ borderColor: C.border, color: C.muted, background: "white" }}>
                {lang === "id" ? "Batal" : "Cancel"}
              </button>
              <button onClick={generateTaarufCV}
                className="flex-[2] py-2.5 rounded-xl font-bold text-[13px] text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #1B3A6B, #C4294A)" }}>
                <Download className="w-4 h-4" />
                {lang === "id" ? "Unduh PDF" : "Download PDF"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
