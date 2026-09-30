// Mitra (referral partner) pipeline: people we might ask, or have asked, to send us singles. Safe for client and server.
import type { Bilingual } from "@/lib/calldesk";

export const MITRA_PROSPECTS = "mitra_prospects";

export const MITRA_STAGES = [
  { value: "prospect", label: { id: "Belum dihubungi", en: "Not contacted" }, tone: "bg-slate-50 text-slate-600 border-slate-200" },
  { value: "contacted", label: { id: "Sudah dihubungi", en: "Contacted" }, tone: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "interested", label: { id: "Tertarik", en: "Interested" }, tone: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "signed", label: { id: "Sudah bergabung", en: "Signed up" }, tone: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  // Has sent at least one real referral
  { value: "active", label: { id: "Aktif (sudah merujuk)", en: "Active (has referred)" }, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "not_now", label: { id: "Belum sekarang", en: "Not now" }, tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "not_fit", label: { id: "Tidak cocok", en: "Not a fit" }, tone: "bg-slate-100 text-slate-400 border-slate-200" },
] as const;
export type MitraStage = (typeof MITRA_STAGES)[number]["value"];
// Stages nobody needs to chase any more
export const MITRA_CLOSED: string[] = ["not_fit"];

// The first six match the partner types on the public /mitra form
export const MITRA_TYPES = [
  { value: "wedding", label: { id: "WO / bridal / MUA / fotografer", en: "Wedding organizer / bridal / MUA / photographer" } },
  { value: "professional", label: { id: "Psikolog / konselor", en: "Psychologist / counselor" } },
  { value: "faith", label: { id: "Tokoh agama", en: "Religious leader" } },
  { value: "elder", label: { id: "Tokoh masyarakat", en: "Community elder" } },
  { value: "organization", label: { id: "Organisasi / komunitas / HR", en: "Organization / community / HR" } },
  { value: "individual", label: { id: "Perorangan", en: "Individual" } },
  { value: "creator", label: { id: "Kreator konten", en: "Content creator" } },
  { value: "other", label: { id: "Lainnya", en: "Other" } },
] as const;
export type MitraType = (typeof MITRA_TYPES)[number]["value"];

export const MITRA_SOURCES = [
  { value: "research", label: { id: "Riset (IG / Google Maps)", en: "Research (IG / Google Maps)" } },
  { value: "website", label: { id: "Form mitra di website", en: "Website partner form" } },
  { value: "referral", label: { id: "Dikenalkan orang lain", en: "Introduced by someone" } },
  { value: "event", label: { id: "Acara / pameran", en: "Event / expo" } },
  { value: "other", label: { id: "Lainnya", en: "Other" } },
] as const;
export type MitraSource = (typeof MITRA_SOURCES)[number]["value"];

// Faith of the community they serve; Jodohmu is for all faiths, and a facilitator from the same faith reassures clients
export const MITRA_FAITHS = [
  { value: "islam", label: { id: "Islam", en: "Muslim" } },
  { value: "catholic", label: { id: "Katolik", en: "Catholic" } },
  { value: "protestant", label: { id: "Kristen Protestan", en: "Protestant" } },
  { value: "hindu", label: { id: "Hindu", en: "Hindu" } },
  { value: "buddhist", label: { id: "Buddha", en: "Buddhist" } },
  { value: "general", label: { id: "Umum / semua agama", en: "General / all faiths" } },
] as const;
export type MitraFaith = (typeof MITRA_FAITHS)[number]["value"];

// Whether they could also be paid per meeting to facilitate an in-person introduction
export const MITRA_FACILITATOR = [
  { value: "unknown", label: { id: "Belum ditanya", en: "Not asked yet" }, tone: "bg-slate-50 text-slate-500 border-slate-200" },
  { value: "maybe", label: { id: "Mungkin", en: "Maybe" }, tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "yes", label: { id: "Mau jadi pendamping", en: "Will facilitate" }, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "no", label: { id: "Tidak mau", en: "Won't facilitate" }, tone: "bg-slate-100 text-slate-400 border-slate-200" },
] as const;
export type MitraFacilitator = (typeof MITRA_FACILITATOR)[number]["value"];

// How someone was reached in a logged touch
export const MITRA_CHANNELS = [
  { value: "call", label: { id: "Telepon", en: "Call" } },
  { value: "whatsapp", label: { id: "WhatsApp", en: "WhatsApp" } },
  { value: "instagram", label: { id: "DM Instagram", en: "Instagram DM" } },
  { value: "email", label: { id: "Email", en: "Email" } },
  { value: "video", label: { id: "Video call", en: "Video call" } },
  { value: "visit", label: { id: "Kunjungan", en: "Visit" } },
  { value: "note", label: { id: "Catatan saja", en: "Note only" } },
] as const;
export type MitraChannel = (typeof MITRA_CHANNELS)[number]["value"];

// The call qualification: one point per yes. 3–4 is worth a video call with Nova; a visit only once they have referred someone.
export const MITRA_SCORE_QUESTIONS: Bilingual[] = [
  { id: "Ada orang single / orang tua yang minta tolong dicarikan jodoh?", en: "Do singles or parents ask them for help finding someone?" },
  { id: "Bertemu 20+ orang/klien per bulan?", en: "Deal with 20+ people or clients a month?" },
  { id: "Mau membagikan info ke 1–2 orang minggu ini?", en: "Willing to share our info with 1–2 people this week?" },
  { id: "Membalas WhatsApp dalam 24 jam?", en: "Replied on WhatsApp within 24 hours?" },
];

export type MitraLogEntry = {
  at: string;
  by: string;
  channel: MitraChannel;
  note: string;
  stageFrom: MitraStage | null;
  stageTo: MitraStage | null;
};

export type MitraProspect = {
  id: string;
  name: string;
  organization: string;
  type: MitraType;
  city: string;
  phone: string;
  instagram: string;
  email: string;
  website: string;
  source: MitraSource;
  stage: MitraStage;
  // 0–4 from the call questions; null until someone has asked them
  score: number | null;
  referrals: number;
  faith: MitraFaith;
  // Why they are on the list at all
  reason: string;
  // Exactly where the contact came from, e.g. a URL or "Google Maps listing"
  sourceDetail: string;
  // The next thing to do with them, e.g. "Call the DKM office, ask for the head of the youth wing"
  nextAction: string;
  // When they are most likely to pick up
  bestTime: string;
  facilitator: MitraFacilitator;
  // Agreed pay per meeting, as said on the call
  facilitatorRate: string;
  meetingsFacilitated: number;
  // Anything else: what they said, context
  notes: string;
  followUpDate: string | null;
  lastContactedAt: string | null;
  createdAt: string | null;
  createdBy: string;
  log: MitraLogEntry[];
};

export const instagramUrl = (handle: string) => `https://www.instagram.com/${handle.replace(/^@/, "").trim()}/`;
