'use client';

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { CONTACT_SOURCES, DEFAULT_TZ, IMPORTED_SOURCES, addDays, isTimeZone, toJakarta, type CallDeskMember } from "@/lib/calldesk";
import { TimeZoneField, callDeskFetch, useL } from "./shared";
import { AssigneeField, type DeskMe } from "./team-schedule";
import type { Slot } from "./day-view";

const input = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20";
const label = "mb-1 block text-xs font-semibold text-slate-500";

const manualSources = CONTACT_SOURCES.filter((source) => !IMPORTED_SOURCES.includes(source.value));

export function AddContactDialog({ today, team, me, preset, onClose, onCreated }: {
  today: string;
  preset?: Slot | null;
  team: CallDeskMember[];
  me: DeskMe;
  onClose: () => void;
  onCreated: (id: string) => Promise<void>;
}) {
  const l = useL();
  const [form, setForm] = useState({
    name: "", phone: "", city: "", source: "whatsapp", bestTime: "", note: "", timezone: DEFAULT_TZ,
    followUpDate: preset?.day ?? "", followUpTime: preset?.time ?? "", followUpNote: "", assignedTo: preset?.uid ?? "",
  });
  const slot = !form.followUpDate
    ? { day: null, time: null }
    : form.followUpTime && form.timezone !== DEFAULT_TZ && isTimeZone(form.timezone)
      ? toJakarta(form.followUpDate, form.followUpTime, form.timezone)
      : { day: form.followUpDate, time: form.followUpTime || null };
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = await callDeskFetch<{ id: string }>("/api/admin/calldesk", { method: "POST", body: JSON.stringify({ action: "create", ...form }) });
      await onCreated(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-900/40" />
      <form onSubmit={submit} className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{l({ id: "Tambah kontak", en: "Add contact" })}</h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {l({ id: "Untuk orang yang menghubungi lewat WhatsApp, Instagram, telepon, atau rekomendasi. Form website masuk otomatis.", en: "For people who reached out via WhatsApp, Instagram, phone, or referral. Website forms arrive automatically." })}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>{l({ id: "Nama *", en: "Name *" })}</label>
            <input required className={input} value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className={label}>{l({ id: "Nomor WhatsApp *", en: "WhatsApp number *" })}</label>
            <input required type="tel" className={input} value={form.phone} onChange={set("phone")} placeholder="0812…" />
          </div>
          <div>
            <label className={label}>{l({ id: "Kota", en: "City" })}</label>
            <input className={input} value={form.city} onChange={set("city")} />
          </div>
          <div>
            <label className={label}>{l({ id: "Dari mana?", en: "Where from?" })}</label>
            <select className={input} value={form.source} onChange={set("source")}>
              {manualSources.map((source) => <option key={source.value} value={source.value}>{l(source.label)}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>{l({ id: "Zona waktu kontak", en: "Contact's time zone" })}</label>
            <TimeZoneField className={input} value={form.timezone} onChange={(timezone) => setForm({ ...form, timezone })} />
            {form.timezone && !isTimeZone(form.timezone) && (
              <p className="mt-1 text-xs font-semibold text-rose-600">{l({ id: "Zona waktu tidak dikenal — pilih dari daftar.", en: "Unknown time zone — pick one from the list." })}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={label}>{l({ id: "Waktu terbaik dihubungi", en: "Best time to call" })}</label>
            <input className={input} value={form.bestTime} onChange={set("bestTime")} placeholder={l({ id: "cth. malam setelah jam 7", en: "e.g. evenings after 7pm" })} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>{l({ id: "Catatan", en: "Note" })}</label>
            <textarea rows={3} value={form.note} onChange={set("note")} className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20" />
          </div>
          <div>
            <label className={label}>{l({ id: "Tindak lanjut (tanggal)", en: "Follow-up date" })}</label>
            <input type="date" min={today} className={input} value={form.followUpDate} onChange={set("followUpDate")} />
          </div>
          <div>
            <label className={label}>{l({ id: "Jam (waktu kontak)", en: "Time (contact's time)" })}</label>
            <input type="time" disabled={!form.followUpDate} className={input} value={form.followUpTime} onChange={set("followUpTime")} />
            {form.followUpDate && form.followUpTime && form.timezone !== DEFAULT_TZ && isTimeZone(form.timezone) && (
              <p className="mt-1 text-xs font-semibold text-amber-700">= {toJakarta(form.followUpDate, form.followUpTime, form.timezone).time} WIB</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <div className="mb-2 flex gap-1.5">
              {[{ id: "Hari ini", en: "Today", day: today }, { id: "Besok", en: "Tomorrow", day: addDays(today, 1) }].map((quick) => (
                <button key={quick.day} type="button" onClick={() => setForm({ ...form, followUpDate: quick.day })} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                  {l(quick)}
                </button>
              ))}
            </div>
            <input disabled={!form.followUpDate} className={input} value={form.followUpNote} onChange={set("followUpNote")} placeholder={l({ id: "Yang perlu dikirim/dilakukan", en: "What to send/do" })} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>{l({ id: "Siapa yang menghubungi?", en: "Who will make the call?" })}</label>
            <AssigneeField team={team} me={me} value={form.assignedTo} onChange={(assignedTo) => setForm({ ...form, assignedTo })} day={slot.day} time={slot.time} className={input} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
        <button type="submit" disabled={saving} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C4294A] text-sm font-bold text-white hover:bg-[#a82340] disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {l({ id: "Simpan kontak", en: "Save contact" })}
        </button>
      </form>
    </div>
  );
}
