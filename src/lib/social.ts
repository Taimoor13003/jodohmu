import { ageFromDob } from "@/lib/age";
import type { Figure, IconKey } from "@/lib/social-figures";
import type { SocialAccountKey } from "@/lib/social-accounts";

/* Posting client profiles to Jodohmu's niche Instagram pages as faceless cards.
   Shared by the admin screens (live preview) and the server (the images and the post). */

export const SOCIAL_POSTS = "social_posts";

export type SocialPageKey = "nikahin_foreigner" | "nikah_lagiyuk" | "taaruf_sekarang" | "temu_chindo" | "kristenmatch" | "poligami_indonesia";
export type SocialLang = "id" | "en";
// "classic": one Indonesian card. "hello": the @nikahin_foreigner Canva look, an intro slide with a silhouette plus a profile slide.
// "sakinah": the @taaruf_sekarang Canva look, sage fading to navy, "Hallo, saya dari …" intro slide plus a profile slide.
// "mahligai": the @poligami.indonesia look, light and modern with front-facing figures; rosewood for women, midnight blue for men.
export type TemplateKey = "classic" | "hello" | "sakinah" | "mahligai";
// A swipeable image post, or a short 9:16 video (pages whose template has a Reel design)
export type PostFormat = "carousel" | "reel";
// How long each template's Reel runs, and the second its intro gives way to the profile
export const REEL_TIMING: Partial<Record<TemplateKey, { seconds: number; cut: number }>> = {
  hello: { seconds: 14, cut: 7 },
  sakinah: { seconds: 12, cut: 6 },
};

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
  // Start of the profile code on this page's posts; each page has its own so the pages can't be linked
  codePrefix: string;
  // The page can post its card as a Reel as well as a carousel
  reel?: boolean;
}[] = [
  { key: "nikahin_foreigner", handle: "nikahin_foreigner", label: "WNI & WNA", accent: "#761410", template: "hello", lang: "en", connected: true, hashtags: "#nikahbedanegara #mixedmarriage #internationalmarriage #cariJodoh #perkenalan", codePrefix: "NF", reel: true },
  { key: "nikah_lagiyuk", handle: "nikah_lagiyuk", label: "Janda / duda", accent: "#9B2242", template: "classic", lang: "id", connected: false, hashtags: "#nikahlagi #jandaduda #cariJodoh #perkenalan", codePrefix: "NL" },
  { key: "taaruf_sekarang", handle: "taaruf_sekarang", label: "Muslim", accent: "#3E5A4C", template: "sakinah", lang: "id", connected: true, hashtags: "#cariJodohMuslim #nikahsyari #perkenalan", codePrefix: "TS", reel: true },
  { key: "temu_chindo", handle: "temu_chindo", label: "Chindo", accent: "#B4232C", template: "classic", lang: "id", connected: false, hashtags: "#chindo #cariJodoh #perkenalan", codePrefix: "TC" },
  { key: "kristenmatch", handle: "kristenmatch.indo", label: "Kristen", accent: "#1D4E89", template: "classic", lang: "id", connected: false, hashtags: "#jodohkristen #cariJodoh #perkenalan", codePrefix: "KM" },
  { key: "poligami_indonesia", handle: "poligami.indonesia", label: "Poligami Indonesia", accent: "#6B4A2B", template: "mahligai", lang: "id", connected: true, hashtags: "#poligami #nikahsyari #cariJodoh #perkenalan", codePrefix: "PI" },
];

export const findPage = (key: string) => SOCIAL_PAGES.find((p) => p.key === key) ?? null;
// Templates with an intro slide carry a silhouette the team can change
export const hasFigure = (pageKey: SocialPageKey) => findPage(pageKey)?.template !== "classic";
export const slideCount = (pageKey: SocialPageKey) => (hasFigure(pageKey) ? 2 : 1);
export const formatsFor = (pageKey: SocialPageKey): PostFormat[] => (findPage(pageKey)?.reel ? ["reel", "carousel"] : ["carousel"]);
export const reelTiming = (pageKey: SocialPageKey) => REEL_TIMING[findPage(pageKey)?.template ?? "classic"] ?? null;

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
  separated: { id: "Pisah", en: "Separated" }, divorced: { id: "Cerai", en: "Divorced" }, widowed: { id: "Cerai mati", en: "Widowed" }, married: { id: "Menikah", en: "Married" },
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
  // Not in the profile yet, so it is only ever typed in
  plan: { label: { id: "Rencana menikah", en: "Marriage plan" }, cardLabel: { id: "Rencana Menikah", en: "Marriage plan" }, icon: null },
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
  // Mirrors the Canva template: intro slide "Hallo, saya dari Jakarta / 41 Tahun", then Domisili, Status, Lulusan, Pekerjaan, Suku, Rencana Menikah
  sakinah: [
    ["name", "hide"], ["age", "show"], ["city", "show"], ["marital", "show"], ["education", "show"], ["occupation", "show"],
    ["ethnicity", "show"], ["plan", "custom"], ["religion", "hide"], ["height", "hide"], ["intro", "custom"],
  ],
  mahligai: [
    ["name", "hide"], ["age", "show"], ["city", "show"], ["marital", "show"], ["education", "show"], ["occupation", "show"],
    ["ethnicity", "show"], ["plan", "custom"], ["religion", "hide"], ["height", "hide"], ["intro", "custom"],
  ],
};
// Words a template uses on the card instead of the usual label
const CARD_LABELS: Partial<Record<TemplateKey, Partial<Record<SocialFieldKey, string>>>> = {
  sakinah: { education: "Lulusan" },
  mahligai: { education: "Lulusan" },
};
// Details that go on the intro slide (or the title) rather than in the list of rows
const NOT_ROWS: Record<TemplateKey, SocialFieldKey[]> = {
  classic: ["name", "from"],
  hello: ["name", "from"],
  sakinah: ["name", "from", "age"],
  mahligai: ["name", "from", "age"],
};

export const fieldsFor = (pageKey: SocialPageKey) => {
  const page = findPage(pageKey);
  const template = page?.template ?? "classic";
  return TEMPLATE_FIELDS[template].map(([key, defaultMode]) => {
    const own = CARD_LABELS[template]?.[key];
    const def = FIELD_DEFS[key];
    return { key, defaultMode, ...def, cardLabel: own ? { id: own, en: own } : def.cardLabel };
  });
};

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
    plan: "",
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

// Short, stable reference for a profile, so people can ask about it without a name.
// Different on every page, so the same client can't be matched across pages.
export function profileCode(candidateId: string, pageKey: SocialPageKey) {
  const page = findPage(pageKey);
  let h = 2166136261;
  for (const ch of `${candidateId}:${pageKey}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `${page?.codePrefix ?? "JDM"}-${(h >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(-4)}`;
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
  // The intro slide's words (name, "from", and for some templates age) are not rows
  const rows = fieldsFor(pageKey)
    .filter((f) => f.cardLabel[page.lang] && !NOT_ROWS[page.template].includes(f.key))
    .map((f) => ({ key: f.key, label: f.cardLabel[page.lang], value: value(f.key), icon: rowIcon(f.key, value(f.key), profile) }))
    .filter((r) => r.value);
  return {
    template: page.template,
    lang: page.lang,
    page: { handle: page.handle, label: page.label, accent: page.accent },
    code: profileCode(candidateId, pageKey),
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

// The words on the intro slide of the "sakinah" template: "Hallo, saya dari / Jakarta / 41 Tahun"
export function sakinahLines(card: CardContent) {
  const city = card.rows.find((r) => r.key === "city")?.value ?? "";
  const age = card.age.replace(/tahun/i, "Tahun");
  if (card.name) return { greeting: "Hallo, saya", big: card.name, sub: [age, city ? `dari ${city}` : ""].filter(Boolean).join(" · ") };
  if (city) return { greeting: "Hallo, saya dari", big: city, sub: age };
  return { greeting: "Hallo,", big: age ? `saya ${age}` : "salam kenal", sub: "" };
}

export function defaultCaption(pageKey: SocialPageKey, card: CardContent) {
  const page = findPage(pageKey)!;
  if (page.template === "sakinah" || page.template === "mahligai") {
    const { greeting, big, sub } = sakinahLines(card);
    return [
      `${greeting} ${big}${sub ? `, ${sub.toLowerCase()}` : ""} 👋`,
      "",
      ...card.rows.map((r) => `• ${r.label}: ${r.value}`),
      ...(card.intro ? ["", `"${card.intro}"`] : []),
      "",
      `Info lebih lanjut? DM kami segera dengan kode ${card.code}, yuk!`,
      "",
      page.hashtags,
    ].join("\n");
  }
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

/* Cards can be made for registered clients and for Call Desk leads. A lead's id carries this prefix
   wherever a client id is expected (the composer, social_posts), so the two never mix. */
export const LEAD_PREFIX = "lead:";
export const isLeadId = (id: string) => id.startsWith(LEAD_PREFIX);

// A Call Desk lead in the shape the cards read
export function leadCardProfile(lead: { name: string; city: string; profile: Record<string, unknown> }): Profile {
  const p = lead.profile ?? {};
  return {
    name: lead.name, location: lead.city, gender: p.gender, age: p.age, maritalStatus: p.maritalStatus, religion: p.religion,
    nationality: p.nationality, occupation: p.occupation, educationLevel: p.education, ethnicity: p.ethnicity, height: p.height, hijab: p.hijab,
  };
}

// Someone a card can be made for, as listed on Subpages
export type CardPerson = {
  id: string;
  kind: "client" | "lead";
  // The pages a lead is tagged with (for a client: the tags on their Call Desk entry, when they have one)
  origins: SocialAccountKey[];
  // Their Call Desk entry: always set for a lead, and for a client who started as one
  contactId: string | null;
  // Where the conversation with them lives (a Threads message, an Instagram chat…), when it was saved
  link: string;
  leadStatus: string | null;
  personStatus: string | null;
  isTest: boolean;
  profile: Record<string, unknown>;
};

// What Subpages asks for when adding a lead or correcting one; all but the name may be left empty
export type LeadDetails = {
  name: string; phone: string; email: string; link: string; city: string; source: string; note: string;
  gender: string; age: string; maritalStatus: string; religion: string; nationality: string;
  occupation: string; education: string; ethnicity: string; hijab: string;
};
export const EMPTY_LEAD: LeadDetails = {
  name: "", phone: "", email: "", link: "", city: "", source: "instagram", note: "",
  gender: "", age: "", maritalStatus: "", religion: "", nationality: "", occupation: "", education: "", ethnicity: "", hijab: "",
};

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
    // Details that start as "type your own" are simply left out when empty
    if (!value) return f.defaultMode === "custom" ? [] : [`${f.label.en}: hidden (left empty)`];
    return value === auto[f.key] ? [] : [`${f.label.en}: "${value}"${auto[f.key] ? ` (was "${auto[f.key]}")` : ""}`];
  });
  if (hasFigure(pageKey) && figure !== "auto" && figure !== figureFor(profile)) {
    changes.push(`Silhouette: ${FIGURE_NAMES[figure]} (profile suggests ${FIGURE_NAMES[figureFor(profile)]})`);
  }
  return changes;
}
