import { ageFromDob } from "@/lib/age";
import type { Figure, IconKey } from "@/lib/social-figures";

/* Posting client profiles to Jodohmu's niche Instagram pages as faceless cards.
   Shared by the admin screens (live preview) and the server (the images and the post). */

export const SOCIAL_POSTS = "social_posts";

export type SocialPageKey = "nikahin_foreigner" | "nikah_lagiyuk" | "taaruf_sekarang" | "temu_chindo" | "kristenmatch";
export type SocialLang = "id" | "en";
// "classic": one Indonesian card. "hello": the @nikahin_foreigner Canva look, an intro slide with a silhouette plus a profile slide.
export type TemplateKey = "classic" | "hello";

export const SOCIAL_PAGES: {
  key: SocialPageKey;
  handle: string;
  label: string;
  accent: string;
  template: TemplateKey;
  lang: SocialLang;
  // Only pages the Meta system user has been given can post; the rest show as "not connected yet"
  connected: boolean;
  hashtags: string;
}[] = [
  { key: "nikahin_foreigner", handle: "nikahin_foreigner", label: "WNI & WNA", accent: "#761410", template: "hello", lang: "en", connected: true, hashtags: "#nikahbedanegara #mixedmarriage #internationalmarriage #cariJodoh #perkenalan" },
  { key: "nikah_lagiyuk", handle: "nikah_lagiyuk", label: "Janda / duda", accent: "#9B2242", template: "classic", lang: "id", connected: false, hashtags: "#nikahlagi #jandaduda #cariJodoh #perkenalan" },
  { key: "taaruf_sekarang", handle: "taaruf_sekarang", label: "Muslim", accent: "#0F6B4F", template: "classic", lang: "id", connected: false, hashtags: "#cariJodohMuslim #nikahsyari #perkenalan" },
  { key: "temu_chindo", handle: "temu_chindo", label: "Chindo", accent: "#B4232C", template: "classic", lang: "id", connected: false, hashtags: "#chindo #cariJodoh #perkenalan" },
  { key: "kristenmatch", handle: "kristenmatch.indo", label: "Kristen", accent: "#1D4E89", template: "classic", lang: "id", connected: false, hashtags: "#jodohkristen #cariJodoh #perkenalan" },
];

export const findPage = (key: string) => SOCIAL_PAGES.find((p) => p.key === key) ?? null;
export const slideCount = (pageKey: SocialPageKey) => (findPage(pageKey)?.template === "hello" ? 2 : 1);

type Profile = Record<string, unknown>;
type Bi = { id: string; en: string };

const text = (value: unknown) => {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return "";
  const v = value.trim();
  return v === "—" || v === "-" ? "" : v;
};
const capitalize = (v: string) => (v ? v.charAt(0).toUpperCase() + v.slice(1) : v);
const titleCase = (v: string) => v.toLowerCase().split(" ").map(capitalize).join(" ");

// Which pages a profile fits; the team still chooses
export function suggestPages(p: Profile): SocialPageKey[] {
  const nationality = text(p.nationalityCustom) || text(p.nationality);
  const marital = text(p.maritalStatus).toLowerCase();
  const religion = text(p.religion).toLowerCase();
  const ethnicity = `${text(p.ethnicity)} ${text(p.ethnicityCustom)}`.toLowerCase();
  const out: SocialPageKey[] = [];
  if (nationality && !/^indonesia/i.test(nationality)) out.push("nikahin_foreigner");
  if (["divorced", "widowed"].includes(marital)) out.push("nikah_lagiyuk");
  if (religion === "islam") out.push("taaruf_sekarang");
  if (/chin|tionghoa|chindo/.test(ethnicity)) out.push("temu_chindo");
  if (/kristen|christ|katolik|catholic/.test(religion)) out.push("kristenmatch");
  return out;
}

// The silhouette a profile gets unless the team picks another
export function figureFor(p: Profile): Figure {
  if (text(p.gender) === "male") return /islam|muslim/i.test(text(p.religion)) ? "man_peci_beard" : "man";
  return ["yes", "yes_full"].includes(text(p.hijab).toLowerCase()) ? "hijab" : "woman";
}
export type FigureChoice = "auto" | Figure;

const MARITAL: Record<string, Bi> = {
  single: { id: "Belum menikah", en: "Single" }, never_married: { id: "Belum menikah", en: "Single" },
  divorced: { id: "Cerai", en: "Divorced" }, widowed: { id: "Cerai mati", en: "Widowed" }, married: { id: "Menikah", en: "Married" },
};
const EDUCATION: Record<string, Bi> = {
  sd: { id: "SD", en: "Primary School" }, smp: { id: "SMP", en: "Junior High School" },
  sma: { id: "SMA / SMK", en: "High School" }, smk: { id: "SMA / SMK", en: "High School" },
  diploma: { id: "Diploma", en: "Diploma" }, d3: { id: "D3", en: "Diploma" }, d4: { id: "D4", en: "Bachelor's Degree" },
  s1: { id: "S1", en: "Bachelor's Degree" }, s1_d4: { id: "S1 / D4", en: "Bachelor's Degree" },
  s2: { id: "S2", en: "Master's Degree" }, s3: { id: "S3", en: "Doctorate" },
};

const RELIGION: Record<string, Bi> = {
  islam: { id: "Islam", en: "Islam" }, kristen: { id: "Kristen", en: "Christian" }, protestan: { id: "Kristen", en: "Christian" },
  katolik: { id: "Katolik", en: "Catholic" }, hindu: { id: "Hindu", en: "Hindu" }, buddha: { id: "Buddha", en: "Buddhist" },
  konghucu: { id: "Konghucu", en: "Confucian" },
};

// Every detail a card can carry. The template decides which ones it offers and in what order.
export const FIELD_DEFS = {
  name: { label: { id: "Nama", en: "Name" }, cardLabel: { id: "Nama", en: "Name" }, icon: null },
  headline: { label: { id: "Judul (jenis kelamin & usia)", en: "Title (gender & age)" }, cardLabel: { id: "", en: "" }, icon: null },
  from: { label: { id: "Asal (\"from …\")", en: "From (country)" }, cardLabel: { id: "Asal", en: "From" }, icon: null },
  gender: { label: { id: "Jenis kelamin", en: "Gender" }, cardLabel: { id: "Jenis kelamin", en: "Gender" }, icon: "female" },
  age: { label: { id: "Usia", en: "Age" }, cardLabel: { id: "Usia", en: "Age" }, icon: "cake" },
  city: { label: { id: "Domisili", en: "City" }, cardLabel: { id: "Domisili", en: "City" }, icon: "pin" },
  nationality: { label: { id: "Kewarganegaraan", en: "Nationality" }, cardLabel: { id: "Kewarganegaraan", en: "Nationality" }, icon: "flag" },
  occupation: { label: { id: "Pekerjaan", en: "Job" }, cardLabel: { id: "Pekerjaan", en: "Job" }, icon: "briefcase" },
  education: { label: { id: "Pendidikan", en: "Education" }, cardLabel: { id: "Pendidikan", en: "Education" }, icon: "cap" },
  marital: { label: { id: "Status", en: "Marital status" }, cardLabel: { id: "Status", en: "Status" }, icon: "rings" },
  religion: { label: { id: "Agama", en: "Religion" }, cardLabel: { id: "Agama", en: "Religion" }, icon: "sparkles" },
  ethnicity: { label: { id: "Suku", en: "Ethnicity" }, cardLabel: { id: "Suku", en: "Ethnicity" }, icon: "flag" },
  height: { label: { id: "Tinggi badan", en: "Height" }, cardLabel: { id: "Tinggi", en: "Height" }, icon: "ruler" },
  intro: { label: { id: "Kalimat singkat", en: "Short intro" }, cardLabel: { id: "", en: "" }, icon: null },
} satisfies Record<string, { label: Bi; cardLabel: Bi; icon: IconKey | null }>;
export type SocialFieldKey = keyof typeof FIELD_DEFS;
export type FieldMode = "show" | "custom" | "hide";
export type FieldChoice = { mode: FieldMode; custom: string };
export type FieldChoices = Record<SocialFieldKey, FieldChoice>;

// The details each template offers, in card order, and how each starts
const TEMPLATE_FIELDS: Record<TemplateKey, [SocialFieldKey, FieldMode][]> = {
  classic: [
    ["name", "hide"], ["headline", "show"], ["age", "hide"], ["city", "show"], ["nationality", "show"], ["occupation", "show"],
    ["education", "show"], ["marital", "show"], ["religion", "show"], ["ethnicity", "hide"], ["height", "hide"], ["intro", "custom"],
  ],
  // Mirrors the Canva template: intro slide "Hi! I'm 27 y.o / from Indonesia", then Gender, Nationality, Age, Status, Education
  hello: [
    ["name", "hide"], ["from", "show"], ["gender", "show"], ["nationality", "show"], ["age", "show"], ["marital", "show"],
    ["education", "show"], ["city", "hide"], ["occupation", "hide"], ["religion", "hide"], ["height", "hide"], ["intro", "custom"],
  ],
};

export const fieldsFor = (pageKey: SocialPageKey) =>
  TEMPLATE_FIELDS[findPage(pageKey)?.template ?? "classic"].map(([key, defaultMode]) => ({ key, defaultMode, ...FIELD_DEFS[key] }));

export const defaultChoices = (pageKey: SocialPageKey): FieldChoices => {
  const all = Object.fromEntries(Object.keys(FIELD_DEFS).map((k) => [k, { mode: "hide" as FieldMode, custom: "" }])) as FieldChoices;
  for (const f of fieldsFor(pageKey)) all[f.key] = { mode: f.defaultMode, custom: "" };
  return all;
};

// What each detail says when shown as stored, tidied up for a public card in the page's language
export function autoValues(p: Profile, lang: SocialLang = "id"): Record<SocialFieldKey, string> {
  const age = ageFromDob(p.dateOfBirth) ?? (Number(text(p.age)) || null);
  const g = text(p.gender);
  const gender = g === "male" ? (lang === "en" ? "Male" : "Laki-laki") : g === "female" ? (lang === "en" ? "Female" : "Perempuan") : "";
  const educationLevel = (text(p.educationLevel) || text((p.educations as { level?: string }[] | undefined)?.[0]?.level)).toLowerCase();
  const height = text(p.height);
  const nationality = text(p.nationalityCustom) || text(p.nationality);
  const indonesian = /^indonesia/i.test(nationality);
  const marital = text(p.maritalStatus).toLowerCase();
  return {
    name: text(p.fullName) || text(p.name),
    headline: [gender, age ? `${age} tahun` : ""].filter(Boolean).join(", "),
    from: indonesian ? "Indonesia" : capitalize(nationality),
    gender,
    age: age ? (lang === "en" ? String(age) : `${age} tahun`) : "",
    city: titleCase(text(p.location)),
    nationality: indonesian ? (lang === "en" ? "Indonesian" : "Indonesia") : capitalize(nationality),
    occupation: capitalize(text(p.occupation)),
    education: EDUCATION[educationLevel]?.[lang] ?? capitalize(educationLevel),
    marital: MARITAL[marital]?.[lang] ?? capitalize(marital),
    religion: RELIGION[text(p.religion).toLowerCase()]?.[lang] ?? capitalize(text(p.religion).toLowerCase()),
    ethnicity: capitalize(text(p.ethnicityCustom) || text(p.ethnicity)),
    height: /^\d{3}$/.test(height) ? `${height} cm` : height,
    intro: "",
  };
}

export function resolveField(choice: FieldChoice | undefined, auto: string) {
  if (!choice || choice.mode === "hide") return "";
  return choice.mode === "custom" ? choice.custom.trim().slice(0, 140) : auto;
}

export type CardRow = { key: SocialFieldKey; label: string; value: string; icon: IconKey | null };
export type CardContent = {
  template: TemplateKey;
  lang: SocialLang;
  page: { handle: string; label: string; accent: string };
  code: string;
  title: string;
  name: string;
  age: string;
  from: string;
  intro: string;
  figure: Figure;
  rows: CardRow[];
};

// Short, stable reference for a profile, so people can ask about it without a name
export function profileCode(candidateId: string) {
  let h = 2166136261;
  for (const ch of candidateId) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `JDM-${(h >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-4)}`;
}

const rowIcon = (key: SocialFieldKey, value: string, profile: Profile): IconKey | null => {
  // follows the words on the card, so a custom "Male" gets the male sign
  if (key === "gender") return /^(male|man|laki)/i.test(value) ? "male" : /^(female|woman|perempuan|wanita)/i.test(value) ? "female" : text(profile.gender) === "male" ? "male" : "female";
  if (key === "religion") return /islam|muslim/i.test(value) ? "moon" : /kristen|christ|katolik|catholic/i.test(value) ? "church" : "sparkles";
  return FIELD_DEFS[key].icon;
};

export function buildCard(pageKey: SocialPageKey, candidateId: string, profile: Profile, choices: FieldChoices, figure: FigureChoice = "auto"): CardContent {
  const page = findPage(pageKey)!;
  const auto = autoValues(profile, page.lang);
  const value = (key: SocialFieldKey) => resolveField(choices[key], auto[key]);
  // "from" and "name" are the intro slide's words, not rows
  const rows = fieldsFor(pageKey)
    .filter((f) => f.cardLabel[page.lang] && !["name", "from"].includes(f.key))
    .map((f) => ({ key: f.key, label: f.cardLabel[page.lang], value: value(f.key), icon: rowIcon(f.key, value(f.key), profile) }))
    .filter((r) => r.value);
  return {
    template: page.template,
    lang: page.lang,
    page: { handle: page.handle, label: page.label, accent: page.accent },
    code: profileCode(candidateId),
    title: value("headline") || "Profil pilihan",
    name: value("name"),
    age: value("age"),
    from: value("from"),
    intro: value("intro"),
    figure: figure === "auto" ? figureFor(profile) : figure,
    rows,
  };
}

// The big words on the intro slide of the "hello" template
export function helloLines(card: CardContent) {
  const title = card.name ? `Hi! I’m ${card.name}` : card.age ? `Hi! I’m ${card.age} y.o` : "Hi there!";
  const sub = [card.name && card.age ? `${card.age} y.o` : "", card.from ? `from ${card.from}` : ""].filter(Boolean).join(" · ");
  return { title, sub };
}

export function defaultCaption(pageKey: SocialPageKey, card: CardContent) {
  const page = findPage(pageKey)!;
  if (page.template === "hello") {
    const { title, sub } = helloLines(card);
    return [
      `${title} ${sub} 👋`.replace(/\s+/g, " ").trim(),
      "",
      ...card.rows.map((r) => `• ${r.label}: ${r.value}`),
      ...(card.intro ? ["", `"${card.intro}"`] : []),
      "",
      `More info? DM us with code ${card.code}.`,
      `Info lebih lanjut? Kirim DM dengan kode ${card.code}.`,
      "",
      page.hashtags,
    ].join("\n");
  }
  return [
    `✨ ${card.name ? `${card.name} · ` : ""}${card.title}`,
    "",
    ...card.rows.map((r) => `• ${r.label}: ${r.value}`),
    ...(card.intro ? ["", `"${card.intro}"`] : []),
    "",
    `Tertarik berkenalan? Kirim DM dengan kode ${card.code}.`,
    "",
    page.hashtags,
  ].join("\n");
}

// The profile fields the cards and page suggestions read; the Subpages list sends only these
export const CARD_PROFILE_KEYS = [
  "fullName", "name", "gender", "dateOfBirth", "age", "location", "nationality", "nationalityCustom", "occupation",
  "educationLevel", "educations", "maritalStatus", "religion", "ethnicity", "ethnicityCustom", "height", "hijab",
] as const;

const FIGURE_NAMES: Record<Figure, string> = {
  man: "Man", man_peci: "Man with peci", man_peci_beard: "Man with peci & full beard", woman: "Woman, no hijab", hijab: "Woman in hijab",
};

// How the posted card differed from the template's usual card, in words, so the CRM can show it
export function describeChoices(pageKey: SocialPageKey, choices: FieldChoices, profile: Profile, figure: FigureChoice): string[] {
  const auto = autoValues(profile, findPage(pageKey)?.lang);
  const changes = fieldsFor(pageKey).flatMap((f) => {
    const choice = choices[f.key];
    if (!choice || (choice.mode === f.defaultMode && choice.mode !== "custom")) return [];
    if (choice.mode === "hide") return auto[f.key] ? [`${f.label.en}: hidden`] : [];
    if (choice.mode === "show") return auto[f.key] ? [`${f.label.en}: shown ("${auto[f.key]}")`] : [];
    const value = choice.custom.trim();
    if (!value) return f.key === "intro" ? [] : [`${f.label.en}: hidden (left empty)`];
    return value === auto[f.key] ? [] : [`${f.label.en}: "${value}"${auto[f.key] ? ` (was "${auto[f.key]}")` : ""}`];
  });
  if (findPage(pageKey)?.template === "hello" && figure !== "auto" && figure !== figureFor(profile)) {
    changes.push(`Silhouette: ${FIGURE_NAMES[figure]} (profile suggests ${FIGURE_NAMES[figureFor(profile)]})`);
  }
  return changes;
}
