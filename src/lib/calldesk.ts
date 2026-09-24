// Shared Call Desk definitions — safe to import from both client and server code.

export type Bilingual = { id: string; en: string };

export const TEAM_POSITIONS = [
  { value: "support", label: { id: "Customer Support", en: "Customer Support" } },
  { value: "sales", label: { id: "Sales / Konsultan", en: "Sales / Consultant" } },
  { value: "client_success", label: { id: "Client Success Manager", en: "Client Success Manager" } },
  { value: "matchmaker", label: { id: "Matchmaker", en: "Matchmaker" } },
  { value: "operations", label: { id: "Operasional", en: "Operations" } },
] as const;
export type TeamPosition = (typeof TEAM_POSITIONS)[number]["value"];

// Pending team members, keyed by lowercase email; claimed on their first verified sign-in
export const TEAM_INVITES = "team_invites";

export const TEAM_PERMISSIONS = [
  {
    value: "calldesk",
    label: { id: "Akses Call Desk", en: "Call Desk access" },
    hint: { id: "Bisa melihat kontak, menelepon, dan mencatat aktivitas.", en: "Can see contacts, make calls, and log activity." },
  },
  {
    value: "calldesk_team",
    label: { id: "Lihat riwayat seluruh tim", en: "See whole-team history" },
    hint: { id: "Bisa melihat aktivitas dan laporan anggota tim lain.", en: "Can see other team members' activity and reports." },
  },
  {
    value: "team_schedule",
    label: { id: "Atur jadwal tim", en: "Plan team schedule" },
    hint: { id: "Bisa mengatur ketersediaan semua orang dan menugaskan panggilan ke siapa pun.", en: "Can set everyone's availability and assign calls to anyone." },
  },
] as const;
export type TeamPermission = (typeof TEAM_PERMISSIONS)[number]["value"];

// Every extra permission builds on Call Desk access; without it, nothing else applies
export const normalizePermissions = (requested: readonly string[]) => {
  const known = TEAM_PERMISSIONS.map((p) => p.value as string).filter((p) => requested.includes(p));
  if (!known.length) return [];
  return known.includes("calldesk") ? known : ["calldesk", ...known];
};

// Toggling in the UI: removing Call Desk access removes everything that depends on it
export const togglePermission = (current: readonly string[], permission: string) => {
  if (current.includes(permission)) return permission === "calldesk" ? [] : current.filter((p) => p !== permission);
  return normalizePermissions([...current, permission]);
};

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];
export const WEEKDAY_LABELS: Record<Weekday, Bilingual> = {
  mon: { id: "Senin", en: "Monday" }, tue: { id: "Selasa", en: "Tuesday" }, wed: { id: "Rabu", en: "Wednesday" },
  thu: { id: "Kamis", en: "Thursday" }, fri: { id: "Jumat", en: "Friday" }, sat: { id: "Sabtu", en: "Saturday" }, sun: { id: "Minggu", en: "Sunday" },
};
export type WorkHours = { start: string; end: string } | null;
// Availability is always stored in Jakarta time
// dayOverrides replace the weekly hours for one date (hours: null = not working that day)
export type Availability = {
  weekly: Record<Weekday, WorkHours>;
  daysOff: { date: string; note: string }[];
  dayOverrides: { date: string; hours: WorkHours }[];
};
export const EMPTY_AVAILABILITY: Availability = {
  weekly: { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null },
  daysOff: [],
  dayOverrides: [],
};

export const weekdayOf = (day: string): Weekday => WEEKDAYS[(new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7];

// Whether a member can take a call on a Jakarta day (and optionally time)
export function availabilityOn(availability: Availability | null, day: string, time?: string | null) {
  if (!availability) return { state: "unknown" as const };
  const off = availability.daysOff.find((d) => d.date === day);
  if (off) return { state: "off" as const, note: off.note, custom: true };
  const override = (availability.dayOverrides ?? []).find((d) => d.date === day);
  const custom = Boolean(override);
  const hours = override ? override.hours : availability.weekly[weekdayOf(day)];
  if (!hours) return { state: "not_working" as const, custom };
  if (time && (time < hours.start || time >= hours.end)) return { state: "outside" as const, hours, custom };
  return { state: "available" as const, hours, custom };
}

export const CONTACT_STATUSES = [
  { value: "new", label: { id: "Baru", en: "New" }, tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "contacted", label: { id: "Sudah dihubungi", en: "Contacted" }, tone: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "interested", label: { id: "Tertarik", en: "Interested" }, tone: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "consultation", label: { id: "Konsultasi dijadwalkan", en: "Consultation booked" }, tone: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "paid", label: { id: "Sudah bayar", en: "Paid" }, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "not_interested", label: { id: "Tidak tertarik", en: "Not interested" }, tone: "bg-slate-100 text-slate-500 border-slate-200" },
  { value: "unreachable", label: { id: "Tidak bisa dihubungi", en: "Unreachable" }, tone: "bg-rose-50 text-rose-600 border-rose-200" },
] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number]["value"];
// Statuses where the lead did not go ahead, so a lost reason applies
export const CLOSED_LOST: string[] = ["not_interested", "unreachable"];

export const CONTACT_SOURCES = [
  { value: "contact_form", label: { id: "Form kontak", en: "Contact form" } },
  { value: "chatbot", label: { id: "Chatbot website", en: "Website chatbot" } },
  { value: "registration", label: { id: "Pendaftaran", en: "Registration" } },
  { value: "partner", label: { id: "Form mitra", en: "Partner form" } },
  { value: "ads", label: { id: "Iklan", en: "Ads" } },
  { value: "whatsapp", label: { id: "WhatsApp", en: "WhatsApp" } },
  { value: "instagram", label: { id: "Instagram", en: "Instagram" } },
  { value: "facebook", label: { id: "Facebook Messenger", en: "Facebook Messenger" } },
  { value: "referral", label: { id: "Rekomendasi", en: "Referral" } },
  { value: "walk_in", label: { id: "Datang langsung", en: "Walk-in" } },
  { value: "other", label: { id: "Lainnya", en: "Other" } },
] as const;
export type ContactSource = (typeof CONTACT_SOURCES)[number]["value"];
// Sources that only arrive through automatic import, never picked by hand
export const IMPORTED_SOURCES: ContactSource[] = ["contact_form", "chatbot", "registration", "partner"];

export const LOG_ACTIONS = [
  { value: "call_reached", label: { id: "Ditelepon — tersambung", en: "Called — reached" } },
  { value: "call_no_answer", label: { id: "Ditelepon — tidak diangkat", en: "Called — no answer" } },
  { value: "wa_sent", label: { id: "WhatsApp dikirim", en: "WhatsApp sent" } },
  { value: "wa_replied", label: { id: "Dibalas di WhatsApp", en: "Replied on WhatsApp" } },
  { value: "meet_held", label: { id: "Video call (Meet)", en: "Video call (Meet)" } },
  { value: "note", label: { id: "Catatan saja", en: "Note only" } },
] as const;
export type LogAction = (typeof LOG_ACTIONS)[number]["value"];
export type ActivityType = LogAction | "created" | "edited" | "rescheduled" | "updated" | "outcome";

// Where a person is in the Jodohmu process, in order; the furthest step reached drives the funnel in Insights
export const JOURNEY_STAGES = [
  { value: "inquiry", label: { id: "Bertanya", en: "Asked about the service" } },
  { value: "details", label: { id: "Memberi data diri", en: "Gave their details" } },
  { value: "intro_booked", label: { id: "Telepon perkenalan dijadwalkan", en: "Intro call booked" } },
  { value: "intro_done", label: { id: "Telepon perkenalan selesai", en: "Intro call done" } },
  { value: "consult_booked", label: { id: "Meet konsultan dijadwalkan", en: "Consultant meet booked" } },
  { value: "consult_done", label: { id: "Meet konsultan selesai", en: "Consultant meet done" } },
  { value: "paid", label: { id: "Sudah bayar", en: "Paid" } },
  { value: "profile", label: { id: "Pembuatan profil", en: "Profile being built" } },
  { value: "matching", label: { id: "Proses perjodohan", en: "Matching" } },
] as const;
export type JourneyStage = (typeof JOURNEY_STAGES)[number]["value"];
export const stageIndex = (stage: string | null) => JOURNEY_STAGES.findIndex((s) => s.value === stage);

// Who has the next move: us (a follow-up we owe) or them (we are waiting for a reply or decision)
export const WAITING_ON = [
  { value: "us", label: { id: "Menunggu kita", en: "Waiting on us" } },
  { value: "them", label: { id: "Menunggu mereka", en: "Waiting on them" } },
] as const;
export type WaitingOn = (typeof WAITING_ON)[number]["value"];

export const LEAD_QUALITIES = [
  { value: "hot", label: { id: "Panas — siap lanjut", en: "Hot — ready to go" }, tone: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "warm", label: { id: "Hangat — tertarik, belum pasti", en: "Warm — interested, not sure yet" }, tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "cold", label: { id: "Dingin — kecil kemungkinan", en: "Cold — unlikely" }, tone: "bg-sky-50 text-sky-700 border-sky-200" },
] as const;
export type LeadQuality = (typeof LEAD_QUALITIES)[number]["value"];

// Why a lead did not go ahead; picked when a contact ends as not interested or unreachable
export const LOST_REASONS = [
  { value: "price", label: { id: "Harga terlalu mahal", en: "Too expensive" } },
  { value: "not_ready", label: { id: "Belum siap / nanti saja", en: "Not ready yet / later" } },
  { value: "family", label: { id: "Keluarga tidak setuju", en: "Family didn't agree" } },
  { value: "wanted_free", label: { id: "Mencari layanan gratis", en: "Wanted a free service" } },
  { value: "wrong_expectation", label: { id: "Harapan tidak sesuai layanan", en: "Expected a different service" } },
  { value: "no_reply", label: { id: "Berhenti membalas", en: "Stopped replying" } },
  { value: "we_dropped", label: { id: "Kita tidak menindaklanjuti", en: "We didn't follow up" } },
  { value: "no_show", label: { id: "Tidak hadir / terlalu sering reschedule", en: "Missed calls / rescheduled too often" } },
  { value: "not_fit", label: { id: "Tidak cocok dengan kriteria kami", en: "Not a fit for us" } },
  { value: "found_partner", label: { id: "Sudah menemukan pasangan", en: "Already found someone" } },
  { value: "spam", label: { id: "Spam / tidak serius", en: "Spam / not serious" } },
  { value: "other", label: { id: "Lainnya", en: "Other" } },
] as const;
export type LostReason = (typeof LOST_REASONS)[number]["value"];

export const PAID_PACKAGES = [
  { value: "consultation", label: { id: "Biaya sesi konsultasi", en: "Consultation call fee" } },
  { value: "registration", label: { id: "Biaya pendaftaran", en: "Registration fee" } },
  { value: "pearl", label: { id: "Pearl", en: "Pearl" } },
  { value: "ruby", label: { id: "Ruby", en: "Ruby" } },
  { value: "diamond", label: { id: "Diamond", en: "Diamond" } },
  { value: "other", label: { id: "Lainnya", en: "Other" } },
] as const;
export type PaidPackage = (typeof PAID_PACKAGES)[number]["value"];

// Where the money landed: Indonesian clients pay the Jodohmu bank account, international clients pay by PayPal to a personal account
export const PAYMENT_CHANNELS = [
  { value: "jodohmu_bank", label: { id: "Rekening Jodohmu (Indonesia)", en: "Jodohmu bank (Indonesia)" } },
  { value: "paypal_personal", label: { id: "PayPal pribadi (luar Indonesia)", en: "PayPal, personal (outside Indonesia)" } },
] as const;
export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number]["value"];

// Activity written by the on-demand CRM sync (chats + call recordings), not by a person
export const SYNC_UID = "crm_sync";
export const SYNC_NAME = "CRM sync";

export type CallDeskContact = {
  id: string;
  name: string;
  phone: string;
  city: string;
  source: ContactSource;
  status: ContactStatus;
  bestTime: string;
  timezone: string;
  details: string;
  candidateUid: string | null;
  followUpDate: string | null;
  followUpTime: string | null;
  followUpNote: string | null;
  assignedTo: string | null;
  assignedName: string | null;
  lastAction: ActivityType | null;
  lastActivityAt: string | null;
  lastActivityBy: string | null;
  createdAt: string | null;
  createdByName: string | null;
  // Outcome fields, set by hand or by the CRM sync
  quality: LeadQuality | null;
  lostReason: LostReason | null;
  lostNote: string | null;
  paidPackage: PaidPackage | null;
  paidAmount: number | null;
  paidDate: string | null;
  // paidAmount is always the rupiah actually received; foreign payments keep their original amount, e.g. "USD 25"
  paymentChannel: PaymentChannel | null;
  paidOriginal: string | null;
  // Meta ad the lead replied to, from the WhatsApp inbox label "ad_id.…"
  adId: string | null;
  // Facts about the person, gathered from chats and calls, kept structured so they can be queried later
  profile: LeadProfile;
  // True once the CRM sync has archived this person's WhatsApp chat
  hasChatArchive: boolean;
  stage: JourneyStage | null;
  waitingOn: WaitingOn | null;
  // Test entries and duplicates, left out of Insights
  excluded: boolean;
};

export type LeadProfile = {
  age?: number;
  gender?: "male" | "female";
  maritalStatus?: "never_married" | "divorced" | "widowed" | "married";
  children?: number;
  religion?: string;
  occupation?: string;
  education?: string;
  lookingFor?: string;
  [extra: string]: string | number | boolean | undefined;
};

export const PROFILE_LABELS: Record<string, Bilingual> = {
  age: { id: "Usia", en: "Age" },
  gender: { id: "Jenis kelamin", en: "Gender" },
  maritalStatus: { id: "Status pernikahan", en: "Marital status" },
  children: { id: "Anak", en: "Children" },
  religion: { id: "Agama", en: "Religion" },
  occupation: { id: "Pekerjaan", en: "Occupation" },
  education: { id: "Pendidikan", en: "Education" },
  lookingFor: { id: "Mencari", en: "Looking for" },
};

export type CallDeskActivity = {
  id: string;
  contactId: string;
  contactName: string;
  type: ActivityType;
  note: string;
  statusFrom: ContactStatus | null;
  statusTo: ContactStatus | null;
  followUpDate: string | null;
  followUpTime: string | null;
  followUpNote: string | null;
  assignedTo: string | null;
  assignedName: string | null;
  byUid: string;
  byName: string;
  day: string;
  createdAt: string | null;
  // Calls from the Drive recordings folder: a link to the file and, when transcribed, the transcript id
  recordingUrl: string | null;
  transcriptId: string | null;
};

// Invited people who haven't signed in yet use the id "invite:<email>" until their first sign-in
export type CallDeskMember = {
  uid: string; name: string; position: TeamPosition | null; role: string; availability: Availability | null; pending?: boolean;
};
export const inviteMemberId = (email: string) => `invite:${email.toLowerCase()}`;

export const findLabel = <T extends { value: string; label: Bilingual }>(list: readonly T[], value: string | null | undefined) =>
  list.find((item) => item.value === value)?.label ?? null;

// All dates are handled as Jakarta calendar days so "today" matches the team's working day
export const JAKARTA_TZ = "Asia/Jakarta";
export const jakartaDay = (date: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: JAKARTA_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

export const jakartaTime = (date: Date = new Date()) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: JAKARTA_TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);

// A follow-up counts as past once its Jakarta day (and time, when set) has gone by
export const isPastSlot = (day: string | null, time: string | null, today: string, now: string) => {
  if (!day) return false;
  if (day < today) return true;
  if (day > today) return false;
  return time ? time < now : false;
};

export const addDays = (day: string, amount: number) => {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
};

// Indonesian numbers are often typed as 08…; wa.me needs the international form
export const phoneDigits = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
};

export const isDay = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
export const isTime = (value: unknown): value is string => typeof value === "string" && /^\d{2}:\d{2}$/.test(value);

// Contact time zones: follow-up times are entered in the contact's zone and shown in Jakarta time too
export const DEFAULT_TZ = JAKARTA_TZ;
export const TIMEZONES: { value: string; label: string }[] = [
  { value: "Asia/Jakarta", label: "WIB — Jakarta, Bandung, Sumatra (UTC+7)" },
  { value: "Asia/Makassar", label: "WITA — Bali, Makassar, Kalimantan Timur (UTC+8)" },
  { value: "Asia/Jayapura", label: "WIT — Papua, Maluku (UTC+9)" },
  { value: "Asia/Singapore", label: "Singapore (UTC+8)" },
  { value: "Asia/Kuala_Lumpur", label: "Kuala Lumpur (UTC+8)" },
  { value: "Asia/Riyadh", label: "Saudi Arabia (UTC+3)" },
  { value: "Asia/Dubai", label: "UAE — Dubai (UTC+4)" },
  { value: "Asia/Qatar", label: "Qatar (UTC+3)" },
  { value: "Asia/Karachi", label: "Pakistan (UTC+5)" },
  { value: "Asia/Kolkata", label: "India (UTC+5:30)" },
  { value: "Asia/Tokyo", label: "Japan (UTC+9)" },
  { value: "Asia/Seoul", label: "South Korea (UTC+9)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (UTC+8)" },
  { value: "Australia/Sydney", label: "Australia — Sydney" },
  { value: "Europe/London", label: "United Kingdom" },
  { value: "Europe/Amsterdam", label: "Netherlands" },
  { value: "Europe/Berlin", label: "Germany" },
  { value: "Europe/Istanbul", label: "Turkey (UTC+3)" },
  { value: "America/New_York", label: "USA — New York" },
  { value: "America/Los_Angeles", label: "USA — Los Angeles" },
];

export const isTimeZone = (value: unknown): value is string => {
  if (typeof value !== "string" || !value || value.length > 60) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

const offsetMinutes = (timeZone: string, date: Date) => {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = part.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  return match ? (match[1] === "-" ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3] ?? 0)) : 0;
};

// Converts a wall-clock day + time in `timeZone` to the same moment in Jakarta
export function toJakarta(day: string, time: string, timeZone: string) {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let utc = guess - offsetMinutes(timeZone, new Date(guess)) * 60000;
  utc = guess - offsetMinutes(timeZone, new Date(utc)) * 60000; // second pass settles DST edges
  const moment = new Date(utc);
  return {
    day: jakartaDay(moment),
    time: new Intl.DateTimeFormat("en-GB", { timeZone: JAKARTA_TZ, hour: "2-digit", minute: "2-digit" }).format(moment),
  };
}

export const timeZoneShort = (timeZone: string) =>
  TIMEZONES.find((tz) => tz.value === timeZone)?.label.split(" (")[0].split(" — ")[0] ?? timeZone.split("/").pop()!.replace(/_/g, " ");

// The reverse of toJakarta: a Jakarta (UTC+7, no DST) wall-clock day + time as seen in `timeZone`
export function fromJakarta(day: string, time: string, timeZone: string) {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const moment = new Date(Date.UTC(y, m - 1, d, hh - 7, mm));
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(moment);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return { day: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

// Calls have no set length; the day view shows each one as a slot of this size
export const CALL_SLOT_MINUTES = 30;
export const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
export const fromMinutes = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
