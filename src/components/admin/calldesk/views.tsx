'use client';

import { useMemo, useState } from "react";
import { AlertCircle, CalendarClock, ChevronLeft, ChevronRight, Clock, MessageCircle, Phone, Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  CONTACT_SOURCES, CONTACT_STATUSES, addDays,
  type Bilingual, type CallDeskActivity, type CallDeskContact, type CallDeskMember,
} from "@/lib/calldesk";
import {
  ACTION_TONE, CLOSED_STATUSES, SourceBadge, StatusBadge, actionLabel, byFollowUp, dueState, followUpTimeLabel, formatDay, formatTime,
  jakartaFollowUp, telLink, useL, waLink,
} from "./shared";
import { AvailabilityList, type DeskMe } from "./team-schedule";
import { DayView, type Slot } from "./day-view";
import { availabilityOn } from "@/lib/calldesk";

type OpenContact = (id: string) => void;

/* ── stats ── */
export function computeStats(items: CallDeskActivity[]) {
  const reachedStatus = (item: CallDeskActivity, status: string) => item.statusTo === status && item.statusFrom !== status;
  return {
    calls: items.filter((i) => i.type === "call_reached" || i.type === "call_no_answer").length,
    reached: items.filter((i) => i.type === "call_reached" || i.type === "wa_replied").length,
    messages: items.filter((i) => i.type === "wa_sent").length,
    consultations: items.filter((i) => reachedStatus(i, "consultation")).length,
    paid: items.filter((i) => reachedStatus(i, "paid")).length,
    added: items.filter((i) => i.type === "created").length,
  };
}

const STAT_CARDS: { key: keyof ReturnType<typeof computeStats>; label: Bilingual; tone: string }[] = [
  { key: "calls", label: { id: "Panggilan", en: "Calls" }, tone: "text-[#1B3A6B]" },
  { key: "reached", label: { id: "Tersambung", en: "Reached" }, tone: "text-emerald-600" },
  { key: "messages", label: { id: "WhatsApp dikirim", en: "WhatsApps sent" }, tone: "text-green-600" },
  { key: "consultations", label: { id: "Konsultasi", en: "Consultations" }, tone: "text-indigo-600" },
  { key: "paid", label: { id: "Bayar", en: "Paid" }, tone: "text-[#C4294A]" },
];

function StatGrid({ items, extra }: { items: CallDeskActivity[]; extra?: { label: Bilingual; value: number; tone: string } }) {
  const l = useL();
  const stats = computeStats(items);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {extra && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className={`text-3xl font-bold ${extra.tone}`}>{extra.value}</p>
          <p className="mt-1 text-xs font-semibold text-amber-800">{l(extra.label)}</p>
        </div>
      )}
      {STAT_CARDS.map((card) => (
        <div key={card.key} className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className={`text-3xl font-bold ${card.tone}`}>{stats[card.key]}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{l(card.label)}</p>
        </div>
      ))}
    </div>
  );
}

/* ── shared rows ── */
function ContactRow({ contact, today, onOpen }: { contact: CallDeskContact; today: string; onOpen: OpenContact }) {
  const l = useL();
  const { lang } = useLanguage();
  const state = dueState(contact, today);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:shadow-sm">
      <button type="button" onClick={() => onOpen(contact.id)} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate font-bold text-slate-900">{contact.name}</span>
          <StatusBadge status={contact.status} />
          <SourceBadge source={contact.source} />
          {contact.assignedName && (
            <span className="shrink-0 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700">→ {contact.assignedName}</span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
          {contact.city && <span>{contact.city}</span>}
          {contact.bestTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{contact.bestTime}</span>}
          {contact.followUpDate && (
            <span className={`flex items-center gap-1 font-semibold ${state === "overdue" ? "text-rose-600" : "text-amber-700"}`}>
              <CalendarClock className="h-3 w-3" />
              {state === "overdue" ? `${l({ id: "Terlambat", en: "Overdue" })} · ${formatDay(contact.followUpDate, lang)}` : formatDay(contact.followUpDate, lang)}
              {contact.followUpTime && ` ${followUpTimeLabel(contact)}`}
            </span>
          )}
        </div>
        {contact.followUpNote && <p className="mt-1 truncate text-xs font-medium text-slate-700">→ {contact.followUpNote}</p>}
      </button>
      <a href={waLink(contact.phone)} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-green-50 text-green-700 hover:bg-green-100">
        <MessageCircle className="h-4 w-4" />
      </a>
      <a href={telLink(contact.phone)} title={l({ id: "Telepon", en: "Call" })} className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-[#1B3A6B] hover:bg-slate-200 sm:grid">
        <Phone className="h-4 w-4" />
      </a>
      <button type="button" onClick={() => onOpen(contact.id)} className="h-9 shrink-0 rounded-lg bg-[#1B3A6B] px-3 text-xs font-bold text-white hover:bg-[#244a85]">
        {l({ id: "Catat", en: "Log" })}
      </button>
    </div>
  );
}

function ActivityFeed({ items, onOpen, showDay }: { items: CallDeskActivity[]; onOpen: OpenContact; showDay?: boolean }) {
  const l = useL();
  const { lang } = useLanguage();
  if (!items.length) return <p className="py-6 text-center text-sm text-slate-400">{l({ id: "Belum ada aktivitas.", en: "No activity yet." })}</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <li key={item.id}>
          <button type="button" onClick={() => onOpen(item.contactId)} className="flex w-full gap-3 py-2.5 text-left hover:bg-slate-50">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ACTION_TONE[item.type] ?? "bg-slate-300"}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-800">
                <span className="font-bold">{item.contactName}</span> · {l(actionLabel(item.type))}
                {item.statusTo && item.statusFrom !== item.statusTo && item.type !== "created" && <span className="ml-1.5 align-middle"><StatusBadge status={item.statusTo} /></span>}
              </p>
              {item.note && item.type !== "edited" && <p className="truncate text-xs text-slate-500">{item.note}</p>}
              <p className="text-[11px] text-slate-400">{item.byName} · {showDay ? `${formatDay(item.day, lang)} ` : ""}{formatTime(item.createdAt)}</p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, icon, count, children, tone = "text-slate-900" }: { title: string; icon?: React.ReactNode; count?: number; children: React.ReactNode; tone?: string }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className={`flex items-center gap-2 text-sm font-bold ${tone}`}>
        {icon}{title}
        {count !== undefined && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{count}</span>}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/* ── Today ── */
export function TodayView({ contacts, activity, today, me, onOpen }: {
  contacts: CallDeskContact[]; activity: CallDeskActivity[]; today: string; me: DeskMe; onOpen: OpenContact;
}) {
  const l = useL();
  const meUid = me.uid;
  const canSeeTeam = me.canSeeTeam;
  const [scope, setScope] = useState<"me" | "team">("me");
  // Planners see every call by default; everyone else starts on the calls assigned to them
  const [onlyMine, setOnlyMine] = useState(!me.canPlan);
  const todays = activity.filter((item) => item.day === today && (scope === "team" || item.byUid === meUid));

  const open = contacts.filter((contact) =>
    !contact.excluded
    && (!CLOSED_STATUSES.includes(contact.status) || contact.followUpDate)
    && (!onlyMine || contact.assignedTo === meUid));
  const byTime = byFollowUp;
  const overdue = open.filter((c) => dueState(c, today) === "overdue").sort(byTime);
  const dueToday = open.filter((c) => dueState(c, today) === "today").sort(byTime);
  const fresh = open.filter((c) => dueState(c, today) === "new");
  const upcoming = open.filter((c) => {
    const due = jakartaFollowUp(c);
    return due && due.day > today && due.day <= addDays(today, 7);
  }).sort(byTime);
  const todo = overdue.length + dueToday.length + fresh.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-bold text-slate-500">{l({ id: "Ringkasan hari ini", en: "Today's summary" })}</h2>
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-bold">
            {([false, true] as const).map((value) => (
              <button key={String(value)} type="button" onClick={() => setOnlyMine(value)} className={`rounded-md px-3 py-1.5 ${onlyMine === value ? "bg-[#C4294A] text-white" : "text-slate-500"}`}>
                {value ? l({ id: "Tugas saya", en: "My calls" }) : l({ id: "Semua panggilan", en: "All calls" })}
              </button>
            ))}
          </div>
        </div>
        {canSeeTeam && (
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-bold">
            {(["me", "team"] as const).map((value) => (
              <button key={value} type="button" onClick={() => setScope(value)} className={`rounded-md px-3 py-1.5 ${scope === value ? "bg-[#1B3A6B] text-white" : "text-slate-500"}`}>
                {value === "me" ? l({ id: "Aktivitas saya", en: "My activity" }) : l({ id: "Aktivitas tim", en: "Team activity" })}
              </button>
            ))}
          </div>
        )}
      </div>
      <StatGrid items={todays} extra={{ label: { id: "Perlu dihubungi", en: "To contact" }, value: todo, tone: "text-amber-700" }} />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {overdue.length > 0 && (
            <Panel title={l({ id: "Terlambat", en: "Overdue" })} icon={<AlertCircle className="h-4 w-4" />} count={overdue.length} tone="text-rose-600">
              <div className="space-y-2">{overdue.map((c) => <ContactRow key={c.id} contact={c} today={today} onOpen={onOpen} />)}</div>
            </Panel>
          )}
          <Panel title={l({ id: "Jadwal hari ini", en: "Due today" })} icon={<CalendarClock className="h-4 w-4 text-amber-600" />} count={dueToday.length}>
            {dueToday.length ? (
              <div className="space-y-2">{dueToday.map((c) => <ContactRow key={c.id} contact={c} today={today} onOpen={onOpen} />)}</div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">{l({ id: "Tidak ada tindak lanjut terjadwal hari ini.", en: "No follow-ups scheduled for today." })}</p>
            )}
          </Panel>
          <Panel title={l({ id: "Kontak baru — belum dihubungi", en: "New contacts — not contacted yet" })} icon={<Sparkles className="h-4 w-4 text-[#C4294A]" />} count={fresh.length}>
            {fresh.length ? (
              <div className="space-y-2">{fresh.map((c) => <ContactRow key={c.id} contact={c} today={today} onOpen={onOpen} />)}</div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">{l({ id: "Semua kontak baru sudah dihubungi.", en: "Every new contact has been reached out to." })}</p>
            )}
          </Panel>
        </div>
        <div className="space-y-5">
          <Panel title={l({ id: "7 hari ke depan", en: "Next 7 days" })} count={upcoming.length}>
            {upcoming.length ? (
              <div className="space-y-2">{upcoming.slice(0, 12).map((c) => <ContactRow key={c.id} contact={c} today={today} onOpen={onOpen} />)}</div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">{l({ id: "Belum ada jadwal.", en: "Nothing scheduled." })}</p>
            )}
          </Panel>
          <Panel title={l({ id: "Aktivitas hari ini", en: "Today's activity" })} count={todays.length}>
            <ActivityFeed items={todays} onOpen={onOpen} />
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ── Calendar ── */
const WEEKDAYS: Bilingual[] = [
  { id: "Sen", en: "Mon" }, { id: "Sel", en: "Tue" }, { id: "Rab", en: "Wed" }, { id: "Kam", en: "Thu" },
  { id: "Jum", en: "Fri" }, { id: "Sab", en: "Sat" }, { id: "Min", en: "Sun" },
];

export function CalendarView({ contacts, activity, team, me, today, month, onMonthChange, onOpen, onSlot, onChanged }: {
  contacts: CallDeskContact[]; activity: CallDeskActivity[]; team: CallDeskMember[]; me: DeskMe; today: string; month: string;
  onMonthChange: (month: string) => void; onOpen: OpenContact; onSlot: (slot: Slot) => void; onChanged: () => Promise<void>;
}) {
  const l = useL();
  const { lang } = useLanguage();
  const [selected, setSelected] = useState(today);
  const [dayOpen, setDayOpen] = useState(false);

  const cells = useMemo(() => {
    const first = `${month}-01`;
    const offset = (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday first
    const start = addDays(first, -offset);
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [month]);

  const followUpsByDay = useMemo(() => {
    const map = new Map<string, CallDeskContact[]>();
    contacts.forEach((c) => {
      const due = jakartaFollowUp(c);
      if (due) map.set(due.day, [...(map.get(due.day) ?? []), c]);
    });
    return map;
  }, [contacts]);
  const activityByDay = useMemo(() => {
    const map = new Map<string, CallDeskActivity[]>();
    activity.forEach((a) => map.set(a.day, [...(map.get(a.day) ?? []), a]));
    return map;
  }, [activity]);

  const shiftMonth = (amount: number) => {
    const date = new Date(`${month}-01T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + amount);
    onMonthChange(date.toISOString().slice(0, 7));
  };

  const selectedFollowUps = (followUpsByDay.get(selected) ?? []).sort(byFollowUp);
  const selectedActivity = activityByDay.get(selected) ?? [];

  if (dayOpen) {
    return (
      <div className="space-y-5">
        <DayView
          day={selected}
          today={today}
          team={team}
          me={me}
          contacts={contacts}
          onDayChange={(day) => { setSelected(day); if (!day.startsWith(month)) onMonthChange(day.slice(0, 7)); }}
          onBack={() => setDayOpen(false)}
          onOpen={onOpen}
          onSlot={onSlot}
          onChanged={onChanged}
        />
        <Panel title={l({ id: "Aktivitas di hari ini", en: "Activity on this day" })} count={selectedActivity.length}>
          <ActivityFeed items={selectedActivity} onOpen={onOpen} />
        </Panel>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold capitalize text-slate-900">{formatDay(`${month}-01`, lang, { month: "long", year: "numeric" })}</h2>
          <div className="flex gap-1">
            <button type="button" onClick={() => shiftMonth(-1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => { onMonthChange(today.slice(0, 7)); setSelected(today); }} className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">{l({ id: "Hari ini", en: "Today" })}</button>
            <button type="button" onClick={() => shiftMonth(1)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase text-slate-400">
          {WEEKDAYS.map((day) => <div key={day.en}>{l(day)}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day) => {
            const inMonth = day.startsWith(month);
            const due = followUpsByDay.get(day)?.length ?? 0;
            const done = activityByDay.get(day)?.filter((a) => a.type !== "edited").length ?? 0;
            const isOverdue = due > 0 && day < today;
            return (
              <button
                key={day}
                type="button"
                onClick={() => { if (selected === day) setDayOpen(true); else setSelected(day); }}
                onDoubleClick={() => { setSelected(day); setDayOpen(true); }}
                className={`flex min-h-[64px] flex-col rounded-lg border p-1.5 text-left transition sm:min-h-[84px] ${selected === day ? "border-[#1B3A6B] ring-2 ring-[#1B3A6B]/15" : "border-slate-100 hover:border-slate-300"} ${inMonth ? "bg-white" : "bg-slate-50/60"}`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${day === today ? "bg-[#C4294A] text-white" : inMonth ? "text-slate-700" : "text-slate-300"}`}>
                  {Number(day.slice(8))}
                </span>
                {inMonth && team.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {team.map((member) => {
                      const state = availabilityOn(member.availability, day).state;
                      if (state === "unknown") return null;
                      const tone = state === "available" ? "bg-emerald-500" : state === "off" ? "bg-rose-500" : "bg-slate-300";
                      const label = state === "available" ? l({ id: "tersedia", en: "available" }) : state === "off" ? l({ id: "libur", en: "off" }) : l({ id: "tidak bekerja", en: "not working" });
                      return <span key={member.uid} title={`${member.name}: ${label}`} className={`h-2 w-2 rounded-full ${tone}`} />;
                    })}
                  </div>
                )}
                <div className="mt-auto space-y-0.5">
                  {due > 0 && (
                    <span className={`block truncate rounded px-1 text-[10px] font-bold ${isOverdue ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-800"}`}>
                      {due}<span className="hidden sm:inline"> {l({ id: "jadwal", en: "due" })}</span>
                    </span>
                  )}
                  {done > 0 && (
                    <span className="block truncate rounded bg-sky-100 px-1 text-[10px] font-bold text-sky-800">
                      {done}<span className="hidden sm:inline"> {l({ id: "selesai", en: "done" })}</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-200" />{l({ id: "Tindak lanjut terjadwal", en: "Follow-ups scheduled" })}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-sky-200" />{l({ id: "Aktivitas tercatat", en: "Activity logged" })}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose-200" />{l({ id: "Terlambat", en: "Overdue" })}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />{l({ id: "Tersedia", en: "Available" })}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />{l({ id: "Tidak bekerja", en: "Not working" })}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />{l({ id: "Libur", en: "Off" })}</span>
          <span className="text-slate-400">· {l({ id: "Klik tanggal dua kali untuk tampilan per jam", en: "Click a date twice to see its hour-by-hour view" })}</span>
        </div>
      </section>

      <div className="space-y-5">
        <button type="button" onClick={() => setDayOpen(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] text-sm font-bold text-white hover:bg-[#244a85]">
          {l({ id: "Buka tampilan per jam", en: "Open hour-by-hour view" })} · {formatDay(selected, lang)}
        </button>
        <Panel title={`${l({ id: "Jadwal", en: "Scheduled" })} · ${formatDay(selected, lang)}`} count={selectedFollowUps.length}>
          {selectedFollowUps.length ? (
            <div className="space-y-2">{selectedFollowUps.map((c) => <ContactRow key={c.id} contact={c} today={today} onOpen={onOpen} />)}</div>
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">{l({ id: "Tidak ada jadwal.", en: "Nothing scheduled." })}</p>
          )}
        </Panel>
        <Panel title={l({ id: "Siapa yang tersedia", en: "Who's available" })}>
          <AvailabilityList team={team} day={selected} />
        </Panel>
        <Panel title={l({ id: "Aktivitas di hari ini", en: "Activity on this day" })} count={selectedActivity.length}>
          <ActivityFeed items={selectedActivity} onOpen={onOpen} />
        </Panel>
      </div>
    </div>
  );
}

/* ── Contacts ── */
export function ContactsView({ contacts, today, onOpen }: { contacts: CallDeskContact[]; today: string; onOpen: OpenContact }) {
  const l = useL();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");

  const filtered = contacts.filter((c) => {
    const needle = query.trim().toLowerCase();
    return (!status || c.status === status)
      && (!source || c.source === source)
      && (!needle || `${c.name} ${c.phone} ${c.city}`.toLowerCase().includes(needle));
  });

  const select = "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <label className="relative flex min-w-[200px] flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={l({ id: "Cari nama, nomor, kota", en: "Search name, phone, city" })} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm" />
        </label>
        <select className={select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">{l({ id: "Semua status", en: "All statuses" })}</option>
          {CONTACT_STATUSES.map((s) => <option key={s.value} value={s.value}>{l(s.label)}</option>)}
        </select>
        <select className={select} value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">{l({ id: "Semua sumber", en: "All sources" })}</option>
          {CONTACT_SOURCES.map((s) => <option key={s.value} value={s.value}>{l(s.label)}</option>)}
        </select>
      </div>
      <p className="text-xs font-semibold text-slate-400">{filtered.length} {l({ id: "kontak", en: "contacts" })}</p>
      {filtered.length ? (
        <div className="space-y-2">{filtered.map((c) => <ContactRow key={c.id} contact={c} today={today} onOpen={onOpen} />)}</div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-400">{l({ id: "Tidak ada kontak yang cocok.", en: "No matching contacts." })}</p>
      )}
    </div>
  );
}

/* ── History ── */
export function HistoryView({ activity, team, meUid, canSeeTeam, range, onRangeChange, onOpen }: {
  activity: CallDeskActivity[]; team: CallDeskMember[]; meUid: string; canSeeTeam: boolean;
  range: { from: string; to: string }; onRangeChange: (range: { from: string; to: string }) => void; onOpen: OpenContact;
}) {
  const l = useL();
  const { lang } = useLanguage();
  const [person, setPerson] = useState(canSeeTeam ? "" : meUid);

  const inRange = activity.filter((a) => a.day >= range.from && a.day <= range.to && (!person || a.byUid === person));
  const days = Array.from(new Set(inRange.map((a) => a.day))).sort().reverse();
  const people = Array.from(new Set(inRange.map((a) => a.byUid)));
  const nameOf = (uid: string) => inRange.find((a) => a.byUid === uid)?.byName || team.find((m) => m.uid === uid)?.name || "—";

  const rows = days.flatMap((day) => people
    .map((uid) => ({ day, uid, items: inRange.filter((a) => a.day === day && a.byUid === uid) }))
    .filter((row) => row.items.length));

  const input = "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700";
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs font-semibold text-slate-500">
          {l({ id: "Dari", en: "From" })}
          <input type="date" className={`${input} mt-1 block`} value={range.from} max={range.to} onChange={(e) => e.target.value && onRangeChange({ ...range, from: e.target.value })} />
        </label>
        <label className="text-xs font-semibold text-slate-500">
          {l({ id: "Sampai", en: "To" })}
          <input type="date" className={`${input} mt-1 block`} value={range.to} min={range.from} onChange={(e) => e.target.value && onRangeChange({ ...range, to: e.target.value })} />
        </label>
        {canSeeTeam && (
          <label className="text-xs font-semibold text-slate-500">
            {l({ id: "Anggota tim", en: "Team member" })}
            <select className={`${input} mt-1 block`} value={person} onChange={(e) => setPerson(e.target.value)}>
              <option value="">{l({ id: "Semua", en: "Everyone" })}</option>
              {team.map((m) => <option key={m.uid} value={m.uid}>{m.name}</option>)}
            </select>
          </label>
        )}
      </div>

      <StatGrid items={inRange} />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-900">{l({ id: "Per hari", en: "By day" })}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="whitespace-nowrap bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-2">{l({ id: "Tanggal", en: "Date" })}</th>
                <th className="px-3 py-2">{l({ id: "Oleh", en: "By" })}</th>
                {STAT_CARDS.map((card) => <th key={card.key} className="px-3 py-2 text-right">{l(card.label)}</th>)}
                <th className="px-5 py-2 text-right">{l({ id: "Kontak baru", en: "Added" })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length ? rows.map((row) => {
                const stats = computeStats(row.items);
                return (
                  <tr key={`${row.day}-${row.uid}`}>
                    <td className="whitespace-nowrap px-5 py-2.5 font-semibold text-slate-800">{formatDay(row.day, lang)}</td>
                    <td className="px-3 py-2.5 text-slate-600">{nameOf(row.uid)}</td>
                    {STAT_CARDS.map((card) => <td key={card.key} className="px-3 py-2.5 text-right tabular-nums text-slate-700">{stats[card.key] || "·"}</td>)}
                    <td className="px-5 py-2.5 text-right tabular-nums text-slate-700">{stats.added || "·"}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">{l({ id: "Tidak ada aktivitas di rentang ini.", en: "No activity in this range." })}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Panel title={l({ id: "Semua aktivitas", en: "All activity" })} count={inRange.length}>
        <ActivityFeed items={inRange} onOpen={onOpen} showDay />
      </Panel>
    </div>
  );
}
