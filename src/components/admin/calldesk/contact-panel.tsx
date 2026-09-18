'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, ExternalLink, Loader2, Lock, MessageCircle, Pencil, Phone, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  CONTACT_STATUSES, DEFAULT_TZ, LOG_ACTIONS, TIMEZONES, addDays, fromJakarta, isPastSlot, isTimeZone, jakartaTime, toJakarta,
  type CallDeskActivity, type CallDeskContact, type CallDeskMember, type LogAction,
} from "@/lib/calldesk";
import {
  ACTION_TONE, SourceBadge, StatusBadge, TimeZoneField, actionLabel, callDeskFetch, followUpTimeLabel, formatDay, formatTime, telLink, useL, waLink,
} from "./shared";
import { AssigneeField, type DeskMe } from "./team-schedule";
import type { Slot } from "./day-view";

const input = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20";

export function ContactPanel({ contact, team, me, today, preset, onClose, onChanged }: {
  contact: CallDeskContact;
  team: CallDeskMember[];
  me: DeskMe;
  today: string;
  // Set when opened from a calendar slot (a WIB time); pre-fills the follow-up and assignee
  preset?: Slot | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const l = useL();
  const { lang } = useLanguage();
  const [timeline, setTimeline] = useState<CallDeskActivity[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only a follow-up that's still in the future carries over; logging against a due one completes it
  const futureFollowUp = contact.followUpDate && contact.followUpDate > today;
  const presetLocal = preset
    ? (contact.timezone === DEFAULT_TZ ? { day: preset.day, time: preset.time } : fromJakarta(preset.day, preset.time, contact.timezone))
    : null;
  const emptyLog = presetLocal && preset
    ? {
        type: "note" as LogAction | "",
        status: contact.status as string,
        note: "",
        followUpDate: presetLocal.day,
        followUpTime: presetLocal.time,
        followUpNote: futureFollowUp ? contact.followUpNote ?? "" : "",
        assignedTo: preset.uid,
      }
    : {
        type: "" as LogAction | "",
        status: contact.status as string,
        note: "",
        followUpDate: futureFollowUp ? contact.followUpDate ?? "" : "",
        followUpTime: futureFollowUp ? contact.followUpTime ?? "" : "",
        followUpNote: futureFollowUp ? contact.followUpNote ?? "" : "",
        assignedTo: contact.assignedTo ?? "",
      };
  const [log, setLog] = useState(emptyLog);
  const [details, setDetails] = useState({ name: contact.name, phone: contact.phone, city: contact.city, bestTime: contact.bestTime, timezone: contact.timezone });
  const [editingSlot, setEditingSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({
    followUpDate: contact.followUpDate ?? "",
    followUpTime: contact.followUpTime ?? "",
    followUpNote: contact.followUpNote ?? "",
    assignedTo: contact.assignedTo ?? "",
  });

  // A scheduled call can be moved until its time has passed (compared in Jakarta time)
  const jakartaDue = contact.followUpDate && contact.followUpTime && contact.timezone !== DEFAULT_TZ
    ? toJakarta(contact.followUpDate, contact.followUpTime, contact.timezone)
    : { day: contact.followUpDate, time: contact.followUpTime };
  const slotIsPast = isPastSlot(jakartaDue.day, jakartaDue.time, today, jakartaTime());

  const loadTimeline = useCallback(async () => {
    try {
      const data = await callDeskFetch<{ timeline: CallDeskActivity[] }>(`/api/admin/calldesk?contactId=${encodeURIComponent(contact.id)}`);
      setTimeline(data.timeline);
    } catch {
      setTimeline([]);
    }
  }, [contact.id]);

  useEffect(() => {
    setTimeline(null);
    setEditing(false);
    setError(null);
    setLog(emptyLog);
    setEditingSlot(false);
    setSlotForm({
      followUpDate: contact.followUpDate ?? "",
      followUpTime: contact.followUpTime ?? "",
      followUpNote: contact.followUpNote ?? "",
      assignedTo: contact.assignedTo ?? "",
    });
    setDetails({ name: contact.name, phone: contact.phone, city: contact.city, bestTime: contact.bestTime, timezone: contact.timezone });
    loadTimeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact.id, contact.lastActivityAt, preset]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try {
      await callDeskFetch("/api/admin/calldesk", { method: "POST", body: JSON.stringify({ contactId: contact.id, ...body }) });
      await onChanged();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveLog = async () => {
    if (!log.type) {
      setError(l({ id: "Pilih apa yang Anda lakukan.", en: "Choose what you did." }));
      return;
    }
    if (await submit({ action: "log", ...log })) setLog({ ...emptyLog, followUpDate: "", followUpTime: "", followUpNote: "" });
  };

  // The assignee's availability is checked against the follow-up as it falls in Jakarta time
  const jakartaSlot = () => {
    if (!log.followUpDate) return { day: null, time: null };
    if (!log.followUpTime || contact.timezone === DEFAULT_TZ) return { day: log.followUpDate, time: log.followUpTime || null };
    return toJakarta(log.followUpDate, log.followUpTime, contact.timezone);
  };

  const saveDetails = async () => {
    if (await submit({ action: "edit", ...details })) setEditing(false);
  };

  const saveSlot = async () => {
    if (await submit({ action: "reschedule", ...slotForm })) setEditingSlot(false);
  };

  const quickDates = [
    { label: { id: "Besok", en: "Tomorrow" }, day: addDays(today, 1) },
    { label: { id: "3 hari", en: "3 days" }, day: addDays(today, 3) },
    { label: { id: "1 minggu", en: "1 week" }, day: addDays(today, 7) },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-900/40" />
      <aside className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-900">{contact.name}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <StatusBadge status={contact.status} />
                <SourceBadge source={contact.source} />
                {contact.city && <span className="text-xs text-slate-500">· {contact.city}</span>}
                {contact.assignedName && (
                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700">→ {contact.assignedName}</span>
                )}
              </div>
            </div>
            <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <a
              href={waLink(contact.phone)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setLog((prev) => ({ ...prev, type: prev.type || "wa_sent" }))}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#16a34a] text-sm font-bold text-white hover:bg-[#15803d]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={telLink(contact.phone)}
              onClick={() => setLog((prev) => ({ ...prev, type: prev.type || "call_reached" }))}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1B3A6B] text-sm font-bold text-white hover:bg-[#244a85]"
            >
              <Phone className="h-4 w-4" /> {l({ id: "Telepon", en: "Call" })}
            </a>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Details */}
          <section className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{l({ id: "Detail", en: "Details" })}</h3>
              {!editing && (
                <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-bold text-[#1B3A6B] hover:underline">
                  <Pencil className="h-3 w-3" /> {l({ id: "Ubah", en: "Edit" })}
                </button>
              )}
            </div>
            {editing ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <input className={input} value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} placeholder={l({ id: "Nama", en: "Name" })} />
                <input className={input} value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} placeholder={l({ id: "Nomor telepon", en: "Phone" })} />
                <input className={input} value={details.city} onChange={(e) => setDetails({ ...details, city: e.target.value })} placeholder={l({ id: "Kota", en: "City" })} />
                <input className={input} value={details.bestTime} onChange={(e) => setDetails({ ...details, bestTime: e.target.value })} placeholder={l({ id: "Waktu terbaik dihubungi", en: "Best time to call" })} />
                <div className="sm:col-span-2">
                  <TimeZoneField className={input} value={details.timezone} onChange={(timezone) => setDetails({ ...details, timezone })} />
                  {!isTimeZone(details.timezone) && <p className="mt-1 text-xs font-semibold text-rose-600">{l({ id: "Zona waktu tidak dikenal.", en: "Unknown time zone." })}</p>}
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <button type="button" disabled={saving} onClick={saveDetails} className="h-9 rounded-lg bg-[#1B3A6B] px-4 text-sm font-bold text-white disabled:opacity-60">{l({ id: "Simpan", en: "Save" })}</button>
                  <button type="button" onClick={() => setEditing(false)} className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600">{l({ id: "Batal", en: "Cancel" })}</button>
                </div>
              </div>
            ) : (
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-slate-400">{l({ id: "Telepon", en: "Phone" })}</dt><dd className="font-semibold text-slate-800">{contact.phone}</dd>
                <dt className="text-slate-400">{l({ id: "Waktu terbaik", en: "Best time" })}</dt><dd className="text-slate-700">{contact.bestTime || "—"}</dd>
                <dt className="text-slate-400">{l({ id: "Zona waktu", en: "Time zone" })}</dt><dd className="text-slate-700">{TIMEZONES.find((tz) => tz.value === contact.timezone)?.label ?? contact.timezone}</dd>
                {contact.createdAt && (<><dt className="text-slate-400">{l({ id: "Masuk", en: "Added" })}</dt><dd className="text-slate-700">{formatDay(contact.createdAt.slice(0, 10), lang, { day: "numeric", month: "short", year: "numeric" })}</dd></>)}
              </dl>
            )}
            {contact.details && <p className="mt-3 whitespace-pre-line rounded-lg bg-white p-3 text-xs leading-5 text-slate-600">{contact.details}</p>}
            {contact.candidateUid && (
              <Link href={`/admin/candidates/${contact.candidateUid}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#C4294A] hover:underline">
                {l({ id: "Buka profil kandidat", en: "Open candidate profile" })} <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </section>

          {/* Scheduled call — editable while it is still ahead */}
          {contact.followUpDate && (
            <div className={`rounded-xl p-3 text-sm ${slotIsPast ? "bg-rose-50 text-rose-800" : "bg-amber-50 text-amber-900"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-bold">
                      {l({ id: "Tindak lanjut", en: "Follow-up" })}: {formatDay(contact.followUpDate, lang)}{contact.followUpTime ? ` · ${followUpTimeLabel(contact)}` : ""}
                    </p>
                    {contact.assignedName && <p className="mt-0.5 font-semibold">→ {contact.assignedName}</p>}
                    {contact.followUpNote && <p className="mt-0.5">{contact.followUpNote}</p>}
                  </div>
                </div>
                {slotIsPast ? (
                  <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-rose-500">
                    <Lock className="h-3 w-3" />{l({ id: "Sudah lewat", en: "Already passed" })}
                  </span>
                ) : (
                  <button type="button" onClick={() => setEditingSlot((open) => !open)} className="flex shrink-0 items-center gap-1 text-xs font-bold text-amber-900 hover:underline">
                    <Pencil className="h-3 w-3" />{editingSlot ? l({ id: "Batal", en: "Cancel" }) : l({ id: "Ubah jadwal", en: "Edit" })}
                  </button>
                )}
              </div>

              {slotIsPast && <p className="mt-2 text-xs">{l({ id: "Jadwal yang sudah lewat tidak bisa diubah — catat hasilnya di bawah.", en: "A call that has passed can't be moved — log what happened below." })}</p>}

              {editingSlot && !slotIsPast && (
                <div className="mt-3 space-y-2 rounded-lg bg-white p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" min={today} className={input} value={slotForm.followUpDate} onChange={(e) => setSlotForm({ ...slotForm, followUpDate: e.target.value })} />
                    <input type="time" className={input} value={slotForm.followUpTime} onChange={(e) => setSlotForm({ ...slotForm, followUpTime: e.target.value })} />
                  </div>
                  {contact.timezone !== DEFAULT_TZ && slotForm.followUpDate && slotForm.followUpTime && (
                    <p className="text-[11px] font-semibold text-amber-700">
                      {l({ id: "Waktu kontak", en: "Contact's time" })} · = {toJakarta(slotForm.followUpDate, slotForm.followUpTime, contact.timezone).time} WIB
                    </p>
                  )}
                  <AssigneeField
                    team={team}
                    me={me}
                    value={slotForm.assignedTo}
                    onChange={(assignedTo) => setSlotForm({ ...slotForm, assignedTo })}
                    day={slotForm.followUpDate ? (contact.timezone === DEFAULT_TZ || !slotForm.followUpTime ? slotForm.followUpDate : toJakarta(slotForm.followUpDate, slotForm.followUpTime, contact.timezone).day) : null}
                    time={slotForm.followUpTime ? (contact.timezone === DEFAULT_TZ ? slotForm.followUpTime : toJakarta(slotForm.followUpDate, slotForm.followUpTime, contact.timezone).time) : null}
                    className={input}
                  />
                  <input className={input} value={slotForm.followUpNote} onChange={(e) => setSlotForm({ ...slotForm, followUpNote: e.target.value })} placeholder={l({ id: "Yang perlu dikirim/dilakukan", en: "What to send/do" })} />
                  <button type="button" disabled={saving} onClick={saveSlot} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1B3A6B] text-sm font-bold text-white disabled:opacity-60">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}{l({ id: "Simpan perubahan jadwal", en: "Save schedule change" })}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Log form */}
          <section>
            <h3 className="text-sm font-bold text-slate-900">{l({ id: "Catat aktivitas", en: "Log activity" })}</h3>
            <p className="mt-2 text-xs font-semibold text-slate-500">{l({ id: "Apa yang Anda lakukan?", en: "What did you do?" })}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LOG_ACTIONS.map((action) => (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => setLog({ ...log, type: action.value })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${log.type === action.value ? "border-[#1B3A6B] bg-[#1B3A6B] text-white" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                >
                  {l(action.label)}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-500">{l({ id: "Status sekarang", en: "Status now" })}</p>
            <select className={`${input} mt-1.5`} value={log.status} onChange={(e) => setLog({ ...log, status: e.target.value })}>
              {CONTACT_STATUSES.map((status) => <option key={status.value} value={status.value}>{l(status.label)}</option>)}
            </select>

            <textarea
              value={log.note}
              onChange={(e) => setLog({ ...log, note: e.target.value })}
              rows={3}
              placeholder={l({ id: "Catatan, misalnya: minta dihubungi lagi setelah gajian", en: "Note, e.g. asked to be called back after payday" })}
              className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20"
            />

            <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <CalendarClock className="h-3.5 w-3.5" /> {l({ id: "Tindak lanjut berikutnya", en: "Next follow-up" })}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quickDates.map((quick) => (
                  <button
                    key={quick.day}
                    type="button"
                    onClick={() => setLog({ ...log, followUpDate: quick.day })}
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${log.followUpDate === quick.day ? "border-amber-500 bg-amber-500 text-white" : "border-slate-200 text-slate-600"}`}
                  >
                    {l(quick.label)}
                  </button>
                ))}
                {log.followUpDate && (
                  <button type="button" onClick={() => setLog({ ...log, followUpDate: "", followUpTime: "", followUpNote: "" })} className="px-2 text-xs font-bold text-slate-400 hover:text-rose-600">
                    {l({ id: "Hapus", en: "Clear" })}
                  </button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input type="date" min={today} className={input} value={log.followUpDate} onChange={(e) => setLog({ ...log, followUpDate: e.target.value })} />
                <input type="time" className={input} value={log.followUpTime} disabled={!log.followUpDate} onChange={(e) => setLog({ ...log, followUpTime: e.target.value })} />
              </div>
              {contact.timezone !== DEFAULT_TZ && (
                <p className="mt-1 text-[11px] font-semibold text-amber-700">
                  {l({ id: "Jam diisi dalam waktu kontak", en: "Time is in the contact's time zone" })} ({contact.timezone})
                  {log.followUpDate && log.followUpTime ? ` = ${toJakarta(log.followUpDate, log.followUpTime, contact.timezone).time} WIB` : ""}
                </p>
              )}
              <input
                className={`${input} mt-2`}
                value={log.followUpNote}
                disabled={!log.followUpDate}
                onChange={(e) => setLog({ ...log, followUpNote: e.target.value })}
                placeholder={l({ id: "Yang perlu dikirim/dilakukan, misalnya: kirim info paket Ruby", en: "What to send/do, e.g. send Ruby package info" })}
              />
              <p className="mt-3 text-xs font-semibold text-slate-500">{l({ id: "Siapa yang menghubungi?", en: "Who will make the call?" })}</p>
              <div className="mt-1.5">
                <AssigneeField
                  team={team}
                  me={me}
                  value={log.assignedTo}
                  onChange={(assignedTo) => setLog({ ...log, assignedTo })}
                  day={jakartaSlot().day}
                  time={jakartaSlot().time}
                  className={input}
                />
              </div>
              {!log.followUpDate && contact.followUpDate && (
                <p className="mt-2 text-[11px] text-slate-400">{l({ id: "Tanpa tanggal baru, tindak lanjut saat ini dianggap selesai.", en: "Without a new date, the current follow-up is marked done." })}</p>
              )}
            </div>

            {error && <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p>}
            <button
              type="button"
              disabled={saving}
              onClick={saveLog}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C4294A] text-sm font-bold text-white hover:bg-[#a82340] disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {l({ id: "Simpan aktivitas", en: "Save activity" })}
            </button>
          </section>

          {/* Timeline */}
          <section>
            <h3 className="text-sm font-bold text-slate-900">{l({ id: "Riwayat", en: "History" })}</h3>
            {timeline === null ? (
              <p className="mt-3 text-sm text-slate-400">{l({ id: "Memuat…", en: "Loading…" })}</p>
            ) : timeline.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">{l({ id: "Belum ada aktivitas.", en: "No activity yet." })}</p>
            ) : (
              <ol className="mt-3 space-y-4 border-l border-slate-200 pl-4">
                {timeline.map((item) => (
                  <li key={item.id} className="relative">
                    <span className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white ${ACTION_TONE[item.type] ?? "bg-slate-300"}`} />
                    <p className="text-sm font-bold text-slate-800">
                      {l(actionLabel(item.type))}
                      {item.statusTo && item.statusFrom !== item.statusTo && item.type !== "created" && (
                        <span className="ml-2 align-middle"><StatusBadge status={item.statusTo} /></span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {item.byName} · {formatDay(item.day, lang)} {formatTime(item.createdAt)}
                    </p>
                    {item.note && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{item.note}</p>}
                    {item.assignedName && item.type !== "edited" && (
                      <p className="mt-1 text-xs font-semibold text-indigo-700">→ {l({ id: "Ditugaskan ke", en: "Assigned to" })} {item.assignedName}</p>
                    )}
                    {item.followUpDate && (
                      <p className="mt-1 text-xs font-semibold text-amber-700">
                        → {l({ id: "Tindak lanjut", en: "Follow-up" })} {formatDay(item.followUpDate, lang)}{item.followUpTime ? ` ${item.followUpTime}` : ""}{item.followUpNote ? `: ${item.followUpNote}` : ""}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
