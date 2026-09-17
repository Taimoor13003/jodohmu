'use client';

import { auth } from "@/lib/firebase";
import { useLanguage } from "@/context/LanguageContext";
import {
  CONTACT_SOURCES, CONTACT_STATUSES, LOG_ACTIONS, JAKARTA_TZ, TIMEZONES, findLabel, phoneDigits, timeZoneShort, toJakarta,
  type ActivityType, type Bilingual, type CallDeskContact,
} from "@/lib/calldesk";

export function useL() {
  const { lang } = useLanguage();
  return (copy: Bilingual | null | undefined) => (copy ? (lang === "id" ? copy.id : copy.en) : "");
}

export async function callDeskFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const current = auth.currentUser;
  if (!current) throw new Error("Not signed in");
  const token = await current.getIdToken();
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export function StatusBadge({ status }: { status: string }) {
  const l = useL();
  const item = CONTACT_STATUSES.find((s) => s.value === status);
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${item?.tone ?? "border-slate-200 bg-slate-50 text-slate-500"}`}>
      {l(item?.label) || status}
    </span>
  );
}

export function SourceBadge({ source }: { source: string }) {
  const l = useL();
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
      {l(findLabel(CONTACT_SOURCES, source)) || source}
    </span>
  );
}

const EXTRA_ACTIONS: Record<string, Bilingual> = {
  created: { id: "Kontak ditambahkan", en: "Contact added" },
  edited: { id: "Data diubah", en: "Details edited" },
};

export function actionLabel(type: ActivityType | null) {
  if (!type) return null;
  return findLabel(LOG_ACTIONS, type) ?? EXTRA_ACTIONS[type] ?? null;
}

export const ACTION_TONE: Record<string, string> = {
  call_reached: "bg-emerald-500",
  call_no_answer: "bg-amber-500",
  wa_sent: "bg-green-600",
  wa_replied: "bg-teal-500",
  note: "bg-slate-400",
  created: "bg-[#1B3A6B]",
  edited: "bg-slate-300",
};

export const formatTime = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("en-GB", { timeZone: JAKARTA_TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) : "";

export function formatDay(day: string, lang: string, options: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) {
  return new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", { ...options, timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));
}

export const waLink = (phone: string, text?: string) =>
  `https://wa.me/${phoneDigits(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

// A follow-up as it falls in Jakarta time (times are entered in the contact's own zone)
export function jakartaFollowUp(contact: CallDeskContact) {
  if (!contact.followUpDate) return null;
  if (!contact.followUpTime || contact.timezone === JAKARTA_TZ) return { day: contact.followUpDate, time: contact.followUpTime };
  return toJakarta(contact.followUpDate, contact.followUpTime, contact.timezone);
}

// "15:00 Dubai · 18:00 WIB" for contacts outside Jakarta time, plain "15:00" otherwise
export function followUpTimeLabel(contact: CallDeskContact) {
  if (!contact.followUpDate || !contact.followUpTime) return "";
  if (contact.timezone === JAKARTA_TZ) return contact.followUpTime;
  const local = jakartaFollowUp(contact)!;
  return `${contact.followUpTime} ${timeZoneShort(contact.timezone)} · ${local.time} WIB`;
}

export function TimeZoneField({ value, onChange, className }: { value: string; onChange: (value: string) => void; className: string }) {
  return (
    <>
      <input list="calldesk-timezones" className={className} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Asia/Jakarta" />
      <datalist id="calldesk-timezones">
        {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
      </datalist>
    </>
  );
}

export const byFollowUp = (a: CallDeskContact, b: CallDeskContact) => {
  const x = jakartaFollowUp(a);
  const y = jakartaFollowUp(b);
  return `${x?.day ?? ""}${x?.time ?? "99"}`.localeCompare(`${y?.day ?? ""}${y?.time ?? "99"}`);
};

// Contacts that belong on today's work list: follow-ups due or overdue, plus untouched new leads
export function dueState(contact: CallDeskContact, today: string): "overdue" | "today" | "new" | null {
  const due = jakartaFollowUp(contact);
  if (due && due.day < today) return "overdue";
  if (due?.day === today) return "today";
  if (contact.status === "new" && !contact.followUpDate) return "new";
  return null;
}

export const CLOSED_STATUSES = ["paid", "not_interested", "unreachable"];
