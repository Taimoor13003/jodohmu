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
export type Availability = { weekly: Record<Weekday, WorkHours>; daysOff: { date: string; note: string }[] };
export const EMPTY_AVAILABILITY: Availability = {
  weekly: { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null },
  daysOff: [],
};

export const weekdayOf = (day: string): Weekday => WEEKDAYS[(new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7];

// Whether a member can take a call on a Jakarta day (and optionally time)
export function availabilityOn(availability: Availability | null, day: string, time?: string | null) {
  if (!availability) return { state: "unknown" as const };
  const off = availability.daysOff.find((d) => d.date === day);
  if (off) return { state: "off" as const, note: off.note };
  const hours = availability.weekly[weekdayOf(day)];
  if (!hours) return { state: "not_working" as const };
  if (time && (time < hours.start || time >= hours.end)) return { state: "outside" as const, hours };
  return { state: "available" as const, hours };
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

export const CONTACT_SOURCES = [
  { value: "contact_form", label: { id: "Form kontak", en: "Contact form" } },
  { value: "chatbot", label: { id: "Chatbot website", en: "Website chatbot" } },
  { value: "registration", label: { id: "Pendaftaran", en: "Registration" } },
  { value: "partner", label: { id: "Form mitra", en: "Partner form" } },
  { value: "ads", label: { id: "Iklan", en: "Ads" } },
  { value: "whatsapp", label: { id: "WhatsApp", en: "WhatsApp" } },
  { value: "instagram", label: { id: "Instagram", en: "Instagram" } },
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
  { value: "note", label: { id: "Catatan saja", en: "Note only" } },
] as const;
export type LogAction = (typeof LOG_ACTIONS)[number]["value"];
export type ActivityType = LogAction | "created" | "edited";

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
};

export type CallDeskMember = { uid: string; name: string; position: TeamPosition | null; role: string; availability: Availability | null };

export const findLabel = <T extends { value: string; label: Bilingual }>(list: readonly T[], value: string | null | undefined) =>
  list.find((item) => item.value === value)?.label ?? null;

// All dates are handled as Jakarta calendar days so "today" matches the team's working day
export const JAKARTA_TZ = "Asia/Jakarta";
export const jakartaDay = (date: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: JAKARTA_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

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
