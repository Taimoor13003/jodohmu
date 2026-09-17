'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  CALL_SLOT_MINUTES, TEAM_POSITIONS, WEEKDAY_LABELS, addDays, availabilityOn, findLabel, fromMinutes, toMinutes, weekdayOf,
  type CallDeskContact, type CallDeskMember,
} from "@/lib/calldesk";
import { CLOSED_STATUSES, StatusBadge, callDeskFetch, formatDay, jakartaFollowUp, useL } from "./shared";
import type { DeskMe } from "./team-schedule";

export type Slot = { uid: string; name: string; day: string; time: string };

const ROW_HEIGHT = 26; // pixels per 30 minutes
const UNASSIGNED = "__unassigned";

/* ── Google Calendar-style day: one column per teammate, availability as background, calls as blocks ── */
export function DayView({ day, today, team, me, contacts, onDayChange, onBack, onOpen, onSlot, onChanged }: {
  day: string; today: string; team: CallDeskMember[]; me: DeskMe; contacts: CallDeskContact[];
  onDayChange: (day: string) => void; onBack: () => void; onOpen: (id: string) => void; onSlot: (slot: Slot) => void;
  onChanged: () => Promise<void>;
}) {
  const l = useL();
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<CallDeskMember | null>(null);

  const dueToday = useMemo(
    () => contacts
      .map((contact) => ({ contact, due: jakartaFollowUp(contact) }))
      .filter((item): item is { contact: CallDeskContact; due: { day: string; time: string | null } } => item.due?.day === day),
    [contacts, day],
  );
  const hasUnassigned = dueToday.some(({ contact }) => !contact.assignedTo);

  // Show 07:00–21:00, stretched to fit anyone's hours or calls outside that
  const [startMin, endMin] = useMemo(() => {
    let start = 7 * 60;
    let end = 21 * 60;
    team.forEach((member) => {
      const state = availabilityOn(member.availability, day);
      if (state.state === "available") {
        start = Math.min(start, toMinutes(state.hours.start));
        end = Math.max(end, toMinutes(state.hours.end));
      }
    });
    dueToday.forEach(({ due }) => {
      if (!due.time) return;
      start = Math.min(start, toMinutes(due.time));
      end = Math.max(end, toMinutes(due.time) + CALL_SLOT_MINUTES);
    });
    return [Math.floor(start / 60) * 60, Math.min(24 * 60, Math.ceil(end / 60) * 60)];
  }, [team, day, dueToday]);

  const slots = Array.from({ length: (endMin - startMin) / 30 }, (_, i) => startMin + i * 30);
  const top = (minutes: number) => ((minutes - startMin) / 30) * ROW_HEIGHT;
  const nowMinutes = (() => {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
    return toMinutes(parts);
  })();

  // Start the view around the working day rather than at the top of the grid
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, top(8 * 60) - 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  const columns: (CallDeskMember | { uid: typeof UNASSIGNED })[] = [...team, ...(hasUnassigned ? [{ uid: UNASSIGNED } as const] : [])];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> {l({ id: "Bulan", en: "Month" })}
          </button>
          <h2 className="text-lg font-bold capitalize text-slate-900">{formatDay(day, lang, { weekday: "long", day: "numeric", month: "long" })}</h2>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => onDayChange(addDays(day, -1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => onDayChange(today)} className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">{l({ id: "Hari ini", en: "Today" })}</button>
          <button type="button" onClick={() => onDayChange(addDays(day, 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div ref={scrollRef} className="max-h-[70vh] overflow-auto">
        <div className="grid min-w-max" style={{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(150px, 1fr))` }}>
          {/* Column headers */}
          <div className="sticky left-0 top-0 z-30 border-b border-r border-slate-100 bg-white" />
          {columns.map((column) => {
            if (column.uid === UNASSIGNED) {
              return (
                <div key={column.uid} className="sticky top-0 z-20 border-b border-l border-slate-100 bg-white px-3 py-2">
                  <p className="text-sm font-bold text-slate-500">{l({ id: "Belum ditugaskan", en: "Unassigned" })}</p>
                  <p className="text-[11px] text-slate-400">{l({ id: "Pilih orangnya di kontak", en: "Pick someone on the contact" })}</p>
                </div>
              );
            }
            const member = column as CallDeskMember;
            const state = availabilityOn(member.availability, day);
            const canEdit = me.canPlan || member.uid === me.uid;
            return (
              <button
                key={member.uid}
                type="button"
                disabled={!canEdit}
                onClick={() => setEditing(member)}
                title={canEdit ? l({ id: "Atur ketersediaan hari ini", en: "Set availability for this day" }) : undefined}
                className={`group sticky top-0 z-20 border-b border-l border-slate-100 bg-white px-3 py-2 text-left ${canEdit ? "cursor-pointer hover:bg-slate-50" : "cursor-default"}`}
              >
                <p className="flex items-center gap-1.5 truncate text-sm font-bold text-slate-800">
                  <span className="truncate">{member.name}</span>
                  {canEdit && <Pencil className="h-3 w-3 shrink-0 text-slate-300 group-hover:text-[#1B3A6B]" />}
                </p>
                <p className="truncate text-[11px] font-semibold">
                  {state.state === "available" && <span className="text-emerald-700">{state.hours.start}–{state.hours.end}</span>}
                  {state.state === "off" && <span className="text-rose-600">{l({ id: "Libur", en: "Off" })}{state.note ? ` · ${state.note}` : ""}</span>}
                  {state.state === "not_working" && <span className="text-slate-400">{l({ id: "Tidak bekerja", en: "Not working" })}</span>}
                  {state.state === "unknown" && <span className="text-slate-300">{l({ id: "Jadwal belum diisi", en: "No schedule yet" })}</span>}
                  {state.state !== "unknown" && state.custom && state.state !== "off" && (
                    <span className="ml-1 rounded bg-sky-50 px-1 text-[10px] text-sky-700">{l({ id: "khusus hari ini", en: "this day only" })}</span>
                  )}
                  {member.pending && <span className="ml-1 text-amber-600">· {l({ id: "belum login", en: "not signed in" })}</span>}
                </p>
                <p className="truncate text-[10px] text-slate-400">{l(findLabel(TEAM_POSITIONS, member.position))}</p>
              </button>
            );
          })}

          {/* No-time strip */}
          <div className="sticky left-0 z-10 border-b border-r border-slate-100 bg-white px-1 py-2 text-right text-[10px] font-semibold text-slate-400">
            {l({ id: "Tanpa jam", en: "No time" })}
          </div>
          {columns.map((column) => {
            const items = dueToday.filter(({ contact, due }) => !due.time && (column.uid === UNASSIGNED ? !contact.assignedTo : contact.assignedTo === column.uid));
            return (
              <div key={column.uid} className="min-h-[36px] space-y-1 border-b border-l border-slate-100 bg-slate-50/50 p-1">
                {items.map(({ contact }) => (
                  <button key={contact.id} type="button" onClick={() => onOpen(contact.id)} className="block w-full truncate rounded-md bg-amber-100 px-2 py-1 text-left text-[11px] font-bold text-amber-900 hover:bg-amber-200">
                    {contact.name}
                  </button>
                ))}
              </div>
            );
          })}

          {/* Time axis */}
          <div className="sticky left-0 z-10 border-r border-slate-100 bg-white">
            {slots.map((minutes) => (
              <div key={minutes} style={{ height: ROW_HEIGHT }} className="relative">
                {minutes % 60 === 0 && <span className="absolute -top-2 right-2 text-[10px] font-semibold text-slate-400">{fromMinutes(minutes)}</span>}
              </div>
            ))}
          </div>

          {/* Member columns */}
          {columns.map((column) => {
            const isUnassigned = column.uid === UNASSIGNED;
            const member = isUnassigned ? null : (column as CallDeskMember);
            const state = member ? availabilityOn(member.availability, day) : null;
            const canSchedule = Boolean(member && !member.pending && (me.canPlan || member.uid === me.uid) && day >= today);
            const calls = dueToday.filter(({ contact, due }) => due.time && (isUnassigned ? !contact.assignedTo : contact.assignedTo === column.uid));
            const pastSlot = (minutes: number) => day < today || (day === today && minutes + 30 <= nowMinutes);

            return (
              <div key={column.uid} className="relative border-l border-slate-100" style={{ height: slots.length * ROW_HEIGHT }}>
                {/* Background: not working by default */}
                <div className={`absolute inset-0 ${isUnassigned || state?.state === "unknown" ? "bg-white" : state?.state === "off" ? "bg-rose-50/70" : "bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_6px,#eef2f7_6px,#eef2f7_12px)]"}`} />
                {state?.state === "off" && (
                  <div className="absolute inset-x-0 top-2 text-center text-[11px] font-bold text-rose-500">{l({ id: "Libur", en: "Off" })}</div>
                )}
                {state?.state === "available" && (
                  <div
                    className="absolute inset-x-0 border-l-4 border-emerald-400 bg-white"
                    style={{ top: top(toMinutes(state.hours.start)), height: top(toMinutes(state.hours.end)) - top(toMinutes(state.hours.start)) }}
                  />
                )}

                {/* Clickable half-hour slots */}
                {slots.map((minutes) => {
                  const clickable = canSchedule && !pastSlot(minutes);
                  return (
                    <button
                      key={minutes}
                      type="button"
                      disabled={!clickable}
                      onClick={() => member && onSlot({ uid: member.uid, name: member.name, day, time: fromMinutes(minutes) })}
                      title={clickable ? `${l({ id: "Jadwalkan panggilan", en: "Schedule a call" })} ${fromMinutes(minutes)}` : undefined}
                      className={`group absolute inset-x-0 border-t ${minutes % 60 === 0 ? "border-slate-200/80" : "border-slate-100/80"} ${clickable ? "cursor-pointer hover:bg-sky-50/80" : "cursor-default"}`}
                      style={{ top: top(minutes), height: ROW_HEIGHT }}
                    >
                      {clickable && <Plus className="mx-auto hidden h-3.5 w-3.5 text-sky-500 group-hover:block" />}
                    </button>
                  );
                })}

                {/* Now line */}
                {day === today && nowMinutes >= startMin && nowMinutes <= endMin && (
                  <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-[#C4294A]" style={{ top: top(nowMinutes) }} />
                )}

                {/* Scheduled calls */}
                {calls.map(({ contact, due }) => {
                  const start = toMinutes(due.time!);
                  const within = state?.state === "available" && start >= toMinutes(state.hours.start) && start < toMinutes(state.hours.end);
                  const outside = !isUnassigned && state?.state !== "unknown" && !within;
                  const closed = CLOSED_STATUSES.includes(contact.status);
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => onOpen(contact.id)}
                      className={`absolute inset-x-1 z-20 overflow-hidden rounded-md px-2 py-0.5 text-left shadow-sm transition hover:shadow-md ${closed ? "bg-slate-200 text-slate-600" : "bg-indigo-600 text-white"} ${outside ? "ring-2 ring-rose-500" : ""}`}
                      style={{ top: top(start) + 1, height: Math.max(ROW_HEIGHT * (CALL_SLOT_MINUTES / 30) - 2, ROW_HEIGHT - 2) }}
                      title={`${contact.name}${contact.followUpNote ? ` — ${contact.followUpNote}` : ""}`}
                    >
                      <p className="truncate text-[11px] font-bold leading-tight">{due.time} · {contact.name}</p>
                      {contact.followUpNote && <p className="truncate text-[10px] leading-tight opacity-80">{contact.followUpNote}</p>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 border-t border-slate-100 px-4 py-3 text-[11px] font-semibold text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border-l-4 border-emerald-400 bg-white ring-1 ring-slate-200" />{l({ id: "Tersedia", en: "Available" })}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-indigo-600" />{l({ id: "Panggilan terjadwal", en: "Scheduled call" })}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[repeating-linear-gradient(135deg,#f8fafc_0,#f8fafc_2px,#dfe5ee_2px,#dfe5ee_4px)] ring-1 ring-slate-200" />{l({ id: "Tidak bekerja", en: "Not working" })}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-rose-100" />{l({ id: "Libur", en: "Off" })}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-indigo-600 ring-2 ring-rose-500" />{l({ id: "Di luar jam kerja", en: "Outside working hours" })}</span>
        <span className="text-slate-400">
          · {l({ id: "Klik nama untuk mengatur ketersediaan hari ini, klik slot kosong untuk menjadwalkan panggilan", en: "Click a name to set that day's availability, click an empty slot to schedule a call" })}
        </span>
      </div>
      {editing && <DayAvailabilityDialog member={editing} day={day} onClose={() => setEditing(null)} onSaved={onChanged} />}
    </section>
  );
}

const PRESETS = [
  { start: "09:00", end: "17:00" },
  { start: "08:00", end: "16:00" },
  { start: "10:00", end: "18:00" },
  { start: "13:00", end: "21:00" },
];

/* ── Quick availability for one person on one day ── */
function DayAvailabilityDialog({ member, day, onClose, onSaved }: {
  member: CallDeskMember; day: string; onClose: () => void; onSaved: () => Promise<void>;
}) {
  const l = useL();
  const { lang } = useLanguage();
  const current = availabilityOn(member.availability, day);
  const weekday = weekdayOf(day);
  const weeklyHours = member.availability?.weekly[weekday] ?? null;
  const initialMode = !current.custom || current.state === "unknown" ? "default" : current.state === "off" ? "off" : current.state === "not_working" ? "not_working" : "hours";
  const [mode, setMode] = useState<"default" | "hours" | "not_working" | "off">(initialMode);
  const [hours, setHours] = useState(current.state === "available" ? current.hours : weeklyHours ?? PRESETS[0]);
  const [note, setNote] = useState(current.state === "off" ? current.note ?? "" : "");
  const [applyWeekly, setApplyWeekly] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (mode === "hours" && hours.start >= hours.end) {
      setError(l({ id: "Jam selesai harus setelah jam mulai.", en: "End time must be after start time." }));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await callDeskFetch("/api/admin/calldesk", {
        method: "POST",
        body: JSON.stringify({ action: "availability_day", uid: member.uid, date: day, mode, start: hours.start, end: hours.end, note, applyWeekly }),
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setSaving(false);
    }
  };

  const option = (value: typeof mode, title: string, hint: string, tone: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      className={`w-full rounded-xl border p-3 text-left transition ${mode === value ? `${tone} ring-2` : "border-slate-200 hover:border-slate-300"}`}
    >
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500">{hint}</p>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-900/40" />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{member.name}</h2>
            <p className="text-sm text-slate-500">{formatDay(day, lang, { weekday: "long", day: "numeric", month: "long" })} · WIB</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-4 space-y-2">
          {option(
            "default",
            l({ id: "Jadwal biasa", en: "Normal schedule" }),
            weeklyHours
              ? `${l(WEEKDAY_LABELS[weekday])}: ${weeklyHours.start}–${weeklyHours.end}`
              : `${l(WEEKDAY_LABELS[weekday])}: ${member.availability ? l({ id: "tidak bekerja", en: "not working" }) : l({ id: "belum diisi", en: "not set yet" })}`,
            "border-slate-400 ring-slate-200",
          )}
          {option("hours", l({ id: "Tersedia di jam tertentu", en: "Available at these hours" }), l({ id: "Hanya untuk hari ini", en: "Just for this day" }), "border-emerald-500 ring-emerald-100")}
          {mode === "hours" && (
            <div className="rounded-xl bg-emerald-50/60 p-3">
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.start}
                    type="button"
                    onClick={() => setHours(preset)}
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${hours.start === preset.start && hours.end === preset.end ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-600"}`}
                  >
                    {preset.start}–{preset.end}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input type="time" value={hours.start} onChange={(e) => setHours({ ...hours, start: e.target.value })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" />
                <span className="text-slate-400">–</span>
                <input type="time" value={hours.end} onChange={(e) => setHours({ ...hours, end: e.target.value })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm" />
              </div>
            </div>
          )}
          {option("not_working", l({ id: "Tidak bekerja", en: "Not working" }), l({ id: "Tidak menerima panggilan hari ini", en: "Takes no calls this day" }), "border-slate-500 ring-slate-200")}
          {option("off", l({ id: "Libur / cuti", en: "Off / leave" }), l({ id: "Ditandai merah di kalender", en: "Shown in red on the calendar" }), "border-rose-500 ring-rose-100")}
          {mode === "off" && (
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={l({ id: "Keterangan (opsional), misalnya: sakit", en: "Note (optional), e.g. sick" })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
          )}
        </div>

        {(mode === "hours" || mode === "not_working") && (
          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={applyWeekly} onChange={(e) => setApplyWeekly(e.target.checked)} className="h-4 w-4 accent-[#1B3A6B]" />
            {l({ id: `Terapkan juga untuk setiap hari ${WEEKDAY_LABELS[weekday].id}`, en: `Also apply to every ${WEEKDAY_LABELS[weekday].en}` })}
          </label>
        )}

        {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
        <button type="button" disabled={saving} onClick={save} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C4294A] text-sm font-bold text-white hover:bg-[#a82340] disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {l({ id: "Simpan", en: "Save" })}
        </button>
      </div>
    </div>
  );
}

/* ── After clicking a slot: pick who to call ── */
export function SlotPicker({ slot, contacts, onClose, onPick, onNew }: {
  slot: Slot; contacts: CallDeskContact[]; onClose: () => void; onPick: (contactId: string) => void; onNew: () => void;
}) {
  const l = useL();
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = contacts
    .filter((c) => !CLOSED_STATUSES.includes(c.status))
    .filter((c) => !needle || `${c.name} ${c.phone} ${c.city}`.toLowerCase().includes(needle))
    .slice(0, 40);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-900/40" />
      <div className="relative flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{l({ id: "Jadwalkan panggilan", en: "Schedule a call" })}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{slot.name} · {formatDay(slot.day, lang)} · {slot.time} WIB</p>
            </div>
            <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-50"><X className="h-4 w-4" /></button>
          </div>
          <label className="relative mt-4 flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={l({ id: "Cari kontak", en: "Search contacts" })} className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm" />
          </label>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {matches.length === 0 && <p className="py-6 text-center text-sm text-slate-400">{l({ id: "Tidak ada kontak yang cocok.", en: "No matching contacts." })}</p>}
          {matches.map((contact) => (
            <button key={contact.id} type="button" onClick={() => onPick(contact.id)} className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50">
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-800">{contact.name}</span>
                <span className="block truncate text-xs text-slate-500">{[contact.city, contact.assignedName && `→ ${contact.assignedName}`].filter(Boolean).join(" · ")}</span>
              </span>
              <StatusBadge status={contact.status} />
            </button>
          ))}
        </div>
        <div className="border-t border-slate-100 p-4">
          <button type="button" onClick={onNew} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#C4294A] text-sm font-bold text-white hover:bg-[#a82340]">
            <Plus className="h-4 w-4" /> {l({ id: "Kontak baru (calon klien)", en: "New contact (lead)" })}
          </button>
        </div>
      </div>
    </div>
  );
}
