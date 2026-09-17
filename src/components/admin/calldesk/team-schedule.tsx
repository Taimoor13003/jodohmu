'use client';

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  EMPTY_AVAILABILITY, TEAM_POSITIONS, WEEKDAYS, WEEKDAY_LABELS, availabilityOn, findLabel,
  type Availability, type CallDeskMember, type Weekday,
} from "@/lib/calldesk";
import { callDeskFetch, formatDay, useL } from "./shared";

export type DeskMe = { uid: string; name: string; isAdmin: boolean; canSeeTeam: boolean; canPlan: boolean };

const timeInput = "h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-300";

/* ── Who's available on a given day ── */
export function AvailabilityList({ team, day }: { team: CallDeskMember[]; day: string }) {
  const l = useL();
  return (
    <ul className="space-y-1.5">
      {team.map((member) => {
        const state = availabilityOn(member.availability, day);
        return (
          <li key={member.uid} className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-semibold text-slate-700">{member.name}</span>
            {state.state === "available" && <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">{state.hours.start}–{state.hours.end}</span>}
            {state.state === "off" && <span className="shrink-0 truncate rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">{l({ id: "Libur", en: "Off" })}{state.note ? ` · ${state.note}` : ""}</span>}
            {state.state === "not_working" && <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{l({ id: "Tidak bekerja", en: "Not working" })}</span>}
            {state.state === "unknown" && <span className="shrink-0 text-xs text-slate-400">{l({ id: "Jadwal belum diisi", en: "No schedule yet" })}</span>}
          </li>
        );
      })}
    </ul>
  );
}

/* ── Assignee picker with an availability check ── */
export function AssigneeField({ team, me, value, onChange, day, time, className }: {
  team: CallDeskMember[]; me: DeskMe; value: string; onChange: (uid: string) => void;
  day: string | null; time: string | null; className: string;
}) {
  const l = useL();
  const { lang } = useLanguage();
  // Non-planners can only take a call themselves, or keep whoever already has it
  const options = (me.canPlan ? team : team.filter((m) => m.uid === me.uid || m.uid === value)).filter((m) => !m.pending);
  const member = team.find((m) => m.uid === value);
  const check = member && day ? availabilityOn(member.availability, day, time) : null;

  return (
    <div>
      <select className={className} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{l({ id: "Belum ditugaskan", en: "Not assigned" })}</option>
        {options.map((m) => (
          <option key={m.uid} value={m.uid}>
            {m.name}{m.position ? ` — ${l(findLabel(TEAM_POSITIONS, m.position))}` : ""}
          </option>
        ))}
      </select>
      {member && day && check && (
        <p className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${check.state === "available" ? "text-emerald-700" : check.state === "unknown" ? "text-slate-400" : "text-rose-600"}`}>
          {check.state === "available" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {check.state === "available" && `${member.name} ${l({ id: "tersedia", en: "is available" })} (${check.hours.start}–${check.hours.end} WIB)`}
          {check.state === "outside" && `${l({ id: "Di luar jam kerja", en: "Outside working hours" })} ${member.name} (${check.hours.start}–${check.hours.end} WIB)`}
          {check.state === "off" && `${member.name} ${l({ id: "libur pada", en: "is off on" })} ${formatDay(day, lang)}${check.note ? ` — ${check.note}` : ""}`}
          {check.state === "not_working" && `${member.name} ${l({ id: "tidak bekerja pada hari ini", en: "doesn't work that day" })}`}
          {check.state === "unknown" && l({ id: "Jadwal orang ini belum diisi.", en: "This person's schedule isn't filled in yet." })}
        </p>
      )}
    </div>
  );
}

/* ── Editor for one person's weekly hours and days off ── */
function AvailabilityEditor({ member, today, onClose, onSaved }: {
  member: CallDeskMember; today: string; onClose: () => void; onSaved: () => Promise<void>;
}) {
  const l = useL();
  const { lang } = useLanguage();
  const [value, setValue] = useState<Availability>(member.availability ?? EMPTY_AVAILABILITY);
  const [newOff, setNewOff] = useState({ date: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setDay = (day: Weekday, hours: Availability["weekly"][Weekday]) => setValue({ ...value, weekly: { ...value.weekly, [day]: hours } });
  const copyToWeekdays = () => {
    const hours = value.weekly.mon;
    setValue({ ...value, weekly: { ...value.weekly, tue: hours, wed: hours, thu: hours, fri: hours } });
  };

  const save = async () => {
    const invalid = WEEKDAYS.find((d) => value.weekly[d] && value.weekly[d]!.start >= value.weekly[d]!.end);
    if (invalid) {
      setError(`${l(WEEKDAY_LABELS[invalid])}: ${l({ id: "jam selesai harus setelah jam mulai.", en: "end time must be after start time." })}`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await callDeskFetch("/api/admin/calldesk", { method: "POST", body: JSON.stringify({ action: "availability", uid: member.uid, availability: value }) });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-900/40" />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{l({ id: "Jadwal", en: "Schedule" })} · {member.name}</h2>
            <p className="text-xs text-slate-500">{l({ id: "Semua jam dalam WIB (waktu Jakarta).", en: "All times are in WIB (Jakarta time)." })}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-2">
          {WEEKDAYS.map((day) => {
            const hours = value.weekly[day];
            return (
              <div key={day} className="flex flex-wrap items-center gap-2">
                <label className="flex w-28 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#1B3A6B]"
                    checked={Boolean(hours)}
                    onChange={(e) => setDay(day, e.target.checked ? { start: "09:00", end: "17:00" } : null)}
                  />
                  {l(WEEKDAY_LABELS[day])}
                </label>
                <input type="time" className={timeInput} disabled={!hours} value={hours?.start ?? ""} onChange={(e) => hours && setDay(day, { ...hours, start: e.target.value })} />
                <span className="text-slate-400">–</span>
                <input type="time" className={timeInput} disabled={!hours} value={hours?.end ?? ""} onChange={(e) => hours && setDay(day, { ...hours, end: e.target.value })} />
                {day === "mon" && hours && (
                  <button type="button" onClick={copyToWeekdays} className="text-xs font-bold text-[#1B3A6B] hover:underline">
                    {l({ id: "Salin ke Sel–Jum", en: "Copy to Tue–Fri" })}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {value.dayOverrides.some((d) => d.date >= today) && (
          <div className="mt-6 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
            <h3 className="text-sm font-bold text-slate-900">{l({ id: "Jam khusus per tanggal", en: "Custom hours on specific dates" })}</h3>
            <ul className="mt-2 space-y-1.5">
              {value.dayOverrides.filter((d) => d.date >= today).map((override) => (
                <li key={override.date} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm">
                  <span>
                    <span className="font-semibold text-slate-800">{formatDay(override.date, lang)}</span>
                    <span className="text-slate-500"> · {override.hours ? `${override.hours.start}–${override.hours.end}` : l({ id: "tidak bekerja", en: "not working" })}</span>
                  </span>
                  <button type="button" title={l({ id: "Kembali ke jadwal biasa", en: "Back to the normal schedule" })} onClick={() => setValue({ ...value, dayOverrides: value.dayOverrides.filter((d) => d.date !== override.date) })} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <h3 className="text-sm font-bold text-slate-900">{l({ id: "Hari libur / cuti", en: "Days off / leave" })}</h3>
          {value.daysOff.filter((d) => d.date >= today).length === 0 && (
            <p className="mt-1 text-xs text-slate-400">{l({ id: "Belum ada hari libur mendatang.", en: "No upcoming days off." })}</p>
          )}
          <ul className="mt-2 space-y-1.5">
            {value.daysOff.filter((d) => d.date >= today).map((off) => (
              <li key={off.date} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm">
                <span><span className="font-semibold text-slate-800">{formatDay(off.date, lang)}</span>{off.note && <span className="text-slate-500"> · {off.note}</span>}</span>
                <button type="button" onClick={() => setValue({ ...value, daysOff: value.daysOff.filter((d) => d.date !== off.date) })} className="text-slate-400 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <input type="date" min={today} className={timeInput} value={newOff.date} onChange={(e) => setNewOff({ ...newOff, date: e.target.value })} />
            <input className={`${timeInput} min-w-0 flex-1`} placeholder={l({ id: "Keterangan (opsional)", en: "Note (optional)" })} value={newOff.note} onChange={(e) => setNewOff({ ...newOff, note: e.target.value })} />
            <button
              type="button"
              disabled={!newOff.date}
              onClick={() => {
                setValue({ ...value, daysOff: [...value.daysOff.filter((d) => d.date !== newOff.date), newOff].sort((a, b) => a.date.localeCompare(b.date)) });
                setNewOff({ date: "", note: "" });
              }}
              className="flex h-9 items-center gap-1 rounded-lg bg-[#1B3A6B] px-3 text-xs font-bold text-white disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" /> {l({ id: "Tambah", en: "Add" })}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
        <button type="button" disabled={saving} onClick={save} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C4294A] text-sm font-bold text-white hover:bg-[#a82340] disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {l({ id: "Simpan jadwal", en: "Save schedule" })}
        </button>
      </div>
    </div>
  );
}

/* ── Team schedule tab ── */
export function TeamScheduleView({ team, me, today, onChanged }: {
  team: CallDeskMember[]; me: DeskMe; today: string; onChanged: () => Promise<void>;
}) {
  const l = useL();
  const { lang } = useLanguage();
  const [editing, setEditing] = useState<CallDeskMember | null>(null);
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(`${today}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + i);
    return date.toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        {me.canPlan
          ? l({ id: "Atur jam kerja dan hari libur setiap orang. Saat menugaskan panggilan, sistem akan memberi peringatan jika orangnya tidak tersedia.", en: "Set everyone's working hours and days off. When you assign a call, you'll be warned if that person isn't available." })
          : l({ id: "Anda bisa mengubah jadwal Anda sendiri. Jadwal orang lain diatur oleh tim perencana.", en: "You can change your own schedule. Other people's schedules are set by the planning team." })}
      </p>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-900">{l({ id: "7 hari ke depan", en: "Next 7 days" })}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-2">{l({ id: "Anggota tim", en: "Team member" })}</th>
                {week.map((day) => (
                  <th key={day} className={`whitespace-nowrap px-2 py-2 text-center ${day === today ? "text-[#C4294A]" : ""}`}>{formatDay(day, lang)}</th>
                ))}
                <th className="px-5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team.map((member) => {
                const canEdit = me.canPlan || member.uid === me.uid;
                return (
                  <tr key={member.uid}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{member.name}{member.uid === me.uid && <span className="ml-1 text-xs text-slate-400">({l({ id: "Anda", en: "you" })})</span>}</p>
                      {member.pending && (
                        <span className="mt-0.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          {l({ id: "Belum login", en: "Not signed in yet" })}
                        </span>
                      )}
                      <p className="text-xs text-slate-400">{l(findLabel(TEAM_POSITIONS, member.position)) || (member.role === "admin" ? "Admin" : "")}</p>
                    </td>
                    {week.map((day) => {
                      const state = availabilityOn(member.availability, day);
                      return (
                        <td key={day} className="px-1 py-3 text-center">
                          {state.state === "available" && (
                            <span className={`inline-block rounded-md px-1.5 py-1 text-[11px] font-bold leading-tight ${state.custom ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200" : "bg-emerald-50 text-emerald-700"}`}>
                              {state.hours.start}<br />{state.hours.end}
                            </span>
                          )}
                          {state.state === "off" && <span title={state.note} className="inline-block rounded-md bg-rose-50 px-1.5 py-1 text-[11px] font-bold text-rose-600">{l({ id: "Libur", en: "Off" })}</span>}
                          {state.state === "not_working" && <span className={state.custom ? "text-[11px] font-bold text-sky-600" : "text-slate-300"}>{state.custom ? "×" : "—"}</span>}
                          {state.state === "unknown" && <span className="text-[11px] text-slate-300">?</span>}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3 text-right">
                      {canEdit && (
                        <button type="button" onClick={() => setEditing(member)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#1B3A6B] hover:bg-slate-50">
                          <Pencil className="h-3 w-3" /> {l({ id: "Ubah", en: "Edit" })}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <p className="text-xs text-slate-400">
        {l({ id: "Hanya orang dengan akses Call Desk yang muncul di sini (termasuk yang belum login). Tambahkan akses di halaman Workers. Panggilan baru bisa ditugaskan setelah orangnya login.", en: "Only people with Call Desk access appear here (including those who haven't signed in yet). Grant access on the Workers page. Calls can be assigned once the person has signed in." })}
      </p>

      {editing && <AvailabilityEditor member={editing} today={today} onClose={() => setEditing(null)} onSaved={onChanged} />}
    </div>
  );
}
