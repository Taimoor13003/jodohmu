'use client';

import { useEffect, useState } from "react";
import { FileText, Loader2, PlayCircle } from "lucide-react";
import {
  CLOSED_LOST, JOURNEY_STAGES, LEAD_QUALITIES, WAITING_ON, LOST_REASONS, PAID_PACKAGES, PAYMENT_CHANNELS, PROFILE_LABELS, phoneDigits,
  type CallDeskActivity, type CallDeskContact,
} from "@/lib/calldesk";
import { callDeskFetch, useL } from "./shared";

const input = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20";

export const formatRupiah = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;

export function QualityBadge({ quality }: { quality: string | null }) {
  const l = useL();
  const item = LEAD_QUALITIES.find((q) => q.value === quality);
  if (!item) return null;
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${item.tone}`}>
      {l(item.label).split(" — ")[0]}
    </span>
  );
}

const fromContact = (contact: CallDeskContact) => ({
  stage: contact.stage ?? "",
  waitingOn: contact.waitingOn ?? "",
  excluded: contact.excluded,
  quality: contact.quality ?? "",
  lostReason: contact.lostReason ?? "",
  lostNote: contact.lostNote ?? "",
  paidPackage: contact.paidPackage ?? "",
  paidAmount: contact.paidAmount === null ? "" : String(contact.paidAmount),
  paidDate: contact.paidDate ?? "",
  paymentChannel: contact.paymentChannel ?? "",
  paidOriginal: contact.paidOriginal ?? "",
});

// Lead quality, why a lead was lost, and what a client paid — the fields behind the Insights tab
export function OutcomeSection({ contact, today, onSave }: {
  contact: CallDeskContact;
  today: string;
  onSave: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const l = useL();
  const [form, setForm] = useState(() => fromContact(contact));
  const [saving, setSaving] = useState(false);

  // Reset only when the saved record changes, not on every background refresh
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setForm(fromContact(contact)); }, [contact.id, contact.lastActivityAt]);

  const lost = CLOSED_LOST.includes(contact.status) || Boolean(contact.lostReason);
  const paid = contact.status === "paid" || Boolean(contact.paidPackage);
  const dirty = JSON.stringify(form) !== JSON.stringify(fromContact(contact));

  const save = async () => {
    setSaving(true);
    const amount = form.paidAmount.replace(/\D/g, "");
    await onSave({
      action: "outcome",
      ...form,
      paidAmount: amount ? Number(amount) : null,
    });
    setSaving(false);
  };

  return (
    <section className="rounded-xl border border-slate-100 p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{l({ id: "Hasil", en: "Outcome" })}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-slate-500">
          {l({ id: "Tahap proses", en: "Process step" })}
          <select className={`${input} mt-1`} value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
            <option value="">—</option>
            {JOURNEY_STAGES.map((s, i) => <option key={s.value} value={s.value}>{i + 1}. {l(s.label)}</option>)}
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-500">
          {l({ id: "Langkah berikutnya", en: "Next move" })}
          <select className={`${input} mt-1`} value={form.waitingOn} onChange={(e) => setForm({ ...form, waitingOn: e.target.value })}>
            <option value="">{l({ id: "Tidak ada / selesai", en: "None / closed" })}</option>
            {WAITING_ON.map((w) => <option key={w.value} value={w.value}>{l(w.label)}</option>)}
          </select>
        </label>
      </div>
      <label className="mt-3 block text-xs font-semibold text-slate-500">
        {l({ id: "Kualitas lead", en: "Lead quality" })}
        <select className={`${input} mt-1`} value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })}>
          <option value="">{l({ id: "Belum dinilai", en: "Not rated" })}</option>
          {LEAD_QUALITIES.map((q) => <option key={q.value} value={q.value}>{l(q.label)}</option>)}
        </select>
      </label>

      {lost && (
        <div className="mt-3 grid gap-2">
          <label className="block text-xs font-semibold text-slate-500">
            {l({ id: "Kenapa tidak lanjut?", en: "Why didn't they go ahead?" })}
            <select className={`${input} mt-1`} value={form.lostReason} onChange={(e) => setForm({ ...form, lostReason: e.target.value })}>
              <option value="">{l({ id: "Belum diketahui", en: "Not known yet" })}</option>
              {LOST_REASONS.map((r) => <option key={r.value} value={r.value}>{l(r.label)}</option>)}
            </select>
          </label>
          <input className={input} value={form.lostNote} onChange={(e) => setForm({ ...form, lostNote: e.target.value })} placeholder={l({ id: "Detail singkat (opsional)", en: "Short detail (optional)" })} />
        </div>
      )}

      {paid && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <label className="block text-xs font-semibold text-slate-500">
            {l({ id: "Paket", en: "Package" })}
            <select className={`${input} mt-1`} value={form.paidPackage} onChange={(e) => setForm({ ...form, paidPackage: e.target.value })}>
              <option value="">—</option>
              {PAID_PACKAGES.map((p) => <option key={p.value} value={p.value}>{l(p.label)}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-500">
            {l({ id: "Jumlah (Rp)", en: "Amount (Rp)" })}
            <input inputMode="numeric" className={`${input} mt-1`} value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value.replace(/[^\d]/g, "") })} placeholder="2500000" />
          </label>
          <label className="block text-xs font-semibold text-slate-500">
            {l({ id: "Tanggal bayar", en: "Paid on" })}
            <input type="date" max={today} className={`${input} mt-1`} value={form.paidDate} onChange={(e) => setForm({ ...form, paidDate: e.target.value })} />
          </label>
          <label className="block text-xs font-semibold text-slate-500 sm:col-span-2">
            {l({ id: "Dibayar ke", en: "Paid into" })}
            <select className={`${input} mt-1`} value={form.paymentChannel} onChange={(e) => setForm({ ...form, paymentChannel: e.target.value })}>
              <option value="">—</option>
              {PAYMENT_CHANNELS.map((c) => <option key={c.value} value={c.value}>{l(c.label)}</option>)}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-500">
            {l({ id: "Jumlah asli", en: "Original amount" })}
            <input className={`${input} mt-1`} value={form.paidOriginal} onChange={(e) => setForm({ ...form, paidOriginal: e.target.value })} placeholder="USD 25" />
          </label>
          <p className="text-[11px] text-slate-400 sm:col-span-3">{l({ id: "Jumlah (Rp) = uang yang benar-benar diterima, setelah potongan PayPal.", en: "Amount (Rp) = what was actually received, after PayPal fees." })}</p>
        </div>
      )}

      {contact.adId && (
        <p className="mt-3 text-[11px] text-slate-400">{l({ id: "Dari iklan", en: "From ad" })} {contact.adId}</p>
      )}

      <label className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <input type="checkbox" checked={form.excluded} onChange={(e) => setForm({ ...form, excluded: e.target.checked })} />
        {l({ id: "Data tes / duplikat — jangan hitung di Insight", en: "Test entry / duplicate — leave out of Insights" })}
      </label>

      {dirty && (
        <button type="button" disabled={saving} onClick={save} className="mt-3 flex h-9 items-center gap-2 rounded-lg bg-[#1B3A6B] px-4 text-sm font-bold text-white disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}{l({ id: "Simpan hasil", en: "Save outcome" })}
        </button>
      )}
    </section>
  );
}

const PROFILE_VALUES: Record<string, Record<string, { id: string; en: string }>> = {
  gender: { male: { id: "Pria", en: "Male" }, female: { id: "Wanita", en: "Female" } },
  maritalStatus: {
    never_married: { id: "Belum pernah menikah", en: "Never married" }, divorced: { id: "Cerai", en: "Divorced" },
    widowed: { id: "Cerai mati", en: "Widowed" }, married: { id: "Menikah", en: "Married" },
  },
};

// Facts gathered about the person (age, marital status, job…), shown as a compact list
export function ProfileFacts({ contact }: { contact: CallDeskContact }) {
  const l = useL();
  const entries = Object.entries(contact.profile ?? {}).filter(([, value]) => value !== undefined && value !== "");
  if (!entries.length) return null;
  return (
    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-slate-200 pt-3 text-sm">
      {entries.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-slate-400">{l(PROFILE_LABELS[key]) || key}</dt>
          <dd className="text-slate-700">{l(PROFILE_VALUES[key]?.[String(value)]) || String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

// Loads a stored transcript or chat archive on first open
function useTranscript(transcriptId: string | null) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const toggle = async () => {
    setOpen((value) => !value);
    if (text !== null || !transcriptId) return;
    try {
      const data = await callDeskFetch<{ transcript: { text: string } }>(`/api/admin/calldesk?transcriptId=${encodeURIComponent(transcriptId)}`);
      setText(data.transcript.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };
  return { open, text, error, toggle };
}

// The archived WhatsApp chat saved by the CRM sync, if there is one
export function ChatArchive({ contact }: { contact: CallDeskContact }) {
  const l = useL();
  const { open, text, error, toggle } = useTranscript(`chat_${phoneDigits(contact.phone)}`);
  if (!contact.hasChatArchive) return null;
  return (
    <div className="mt-3">
      <button type="button" onClick={toggle} className="inline-flex items-center gap-1 text-xs font-bold text-[#1B3A6B] hover:underline">
        <FileText className="h-3.5 w-3.5" /> {open ? l({ id: "Tutup chat WhatsApp", en: "Hide WhatsApp chat" }) : l({ id: "Chat WhatsApp lengkap", en: "Full WhatsApp chat" })}
      </button>
      {open && (
        <div className="mt-2 max-h-96 overflow-y-auto whitespace-pre-line rounded-lg bg-white p-3 text-xs leading-5 text-slate-600">
          {error ?? text ?? l({ id: "Memuat…", en: "Loading…" })}
        </div>
      )}
    </div>
  );
}

// Recording link and an expandable transcript under a timeline entry
export function RecordingLinks({ item }: { item: CallDeskActivity }) {
  const l = useL();
  const { open, text, error, toggle } = useTranscript(item.transcriptId);

  if (!item.recordingUrl && !item.transcriptId) return null;

  return (
    <div className="mt-1.5">
      <div className="flex flex-wrap gap-3 text-xs font-bold">
        {item.recordingUrl && (
          <a href={item.recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#1B3A6B] hover:underline">
            <PlayCircle className="h-3.5 w-3.5" /> {l({ id: "Rekaman", en: "Recording" })}
          </a>
        )}
        {item.transcriptId && (
          <button type="button" onClick={toggle} className="inline-flex items-center gap-1 text-[#1B3A6B] hover:underline">
            <FileText className="h-3.5 w-3.5" /> {open ? l({ id: "Tutup transkrip", en: "Hide transcript" }) : l({ id: "Transkrip", en: "Transcript" })}
          </button>
        )}
      </div>
      {open && item.transcriptId && (
        <div className="mt-2 max-h-72 overflow-y-auto whitespace-pre-line rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          {error ?? text ?? l({ id: "Memuat…", en: "Loading…" })}
        </div>
      )}
    </div>
  );
}
