'use client';

import { useMemo, useState } from "react";
import {
  CLOSED_LOST, JOURNEY_STAGES, CONTACT_SOURCES, CONTACT_STATUSES, LEAD_QUALITIES, LOST_REASONS, PAID_PACKAGES, addDays, findLabel, stageIndex,
  type Bilingual, type CallDeskContact,
} from "@/lib/calldesk";
import { useL } from "./shared";
import { formatRupiah } from "./outcome";

type Range = "30" | "90" | "all";
export type Row = { key: string; label: string; count: number; paid?: number };

const RANGES: { value: Range; label: Bilingual }[] = [
  { value: "30", label: { id: "30 hari", en: "30 days" } },
  { value: "90", label: { id: "90 hari", en: "90 days" } },
  { value: "all", label: { id: "Semua", en: "All time" } },
];

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const daysBetween = (from: string, to: string) =>
  Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86400000);

function groupBy(contacts: CallDeskContact[], keyOf: (c: CallDeskContact) => string | null, labelOf: (key: string) => string): Row[] {
  const rows = new Map<string, Row>();
  for (const contact of contacts) {
    const key = keyOf(contact);
    if (!key) continue;
    const row = rows.get(key) ?? { key, label: labelOf(key), count: 0, paid: 0 };
    row.count += 1;
    if (contact.status === "paid") row.paid! += 1;
    rows.set(key, row);
  }
  return Array.from(rows.values()).sort((a, b) => b.count - a.count);
}

export function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

// One horizontal bar per category; with `showPaid`, the value column also shows how many of them paid
// `format` shows the value another way (e.g. rupiah) instead of a plain count
export function BarList({ title, rows, total, showPaid, empty, format }: {
  title: string; rows: Row[]; total: number; showPaid?: boolean; empty: string; format?: (value: number) => string;
}) {
  const l = useL();
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {rows.length ? (
        <ul className="mt-4 space-y-2.5">
          {rows.map((row) => {
            const tip = showPaid
              ? `${row.label}: ${row.count} ${l({ id: "lead", en: "leads" })}, ${row.paid} ${l({ id: "bayar", en: "paid" })} (${pct(row.paid ?? 0, row.count)}%)`
              : `${row.label}: ${format ? format(row.count) : row.count} (${pct(row.count, total)}%)`;
            return (
              <li key={row.key} title={tip} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[minmax(0,12rem)_1fr_auto]">
                <span className="truncate text-slate-600">{row.label}</span>
                <span className="h-3 rounded-r bg-slate-100">
                  <span className="block h-3 rounded-r bg-[#1B3A6B]" style={{ width: `${(row.count / max) * 100}%` }} />
                </span>
                <span className="whitespace-nowrap text-right tabular-nums font-semibold text-slate-800">
                  {format ? format(row.count) : row.count}
                  <span className="ml-1.5 text-xs font-medium text-slate-400">
                    {showPaid ? `· ${row.paid} ${l({ id: "bayar", en: "paid" })} (${pct(row.paid ?? 0, row.count)}%)` : `${pct(row.count, total)}%`}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-400">{empty}</p>
      )}
    </section>
  );
}

export function InsightsView({ contacts, today }: { contacts: CallDeskContact[]; today: string }) {
  const l = useL();
  const [range, setRange] = useState<Range>("30");

  const leads = useMemo(() => {
    const real = contacts.filter((c) => !c.excluded);
    if (range === "all") return real;
    const from = addDays(today, -Number(range));
    return real.filter((c) => (c.createdAt ?? "").slice(0, 10) >= from);
  }, [contacts, range, today]);

  const paid = leads.filter((c) => c.status === "paid");
  const lost = leads.filter((c) => CLOSED_LOST.includes(c.status));
  const open = leads.length - paid.length - lost.length;
  // Anyone with a recorded payment counts, including consultation fees from leads who went no further
  const payers = leads.filter((c) => (c.paidAmount ?? 0) > 0);
  const revenue = payers.reduce((sum, c) => sum + (c.paidAmount ?? 0), 0);
  const revenueIn = (channel: string) => payers.filter((c) => c.paymentChannel === channel).reduce((sum, c) => sum + (c.paidAmount ?? 0), 0);
  const revenueIndonesia = revenueIn("jodohmu_bank");
  const revenueAbroad = revenueIn("paypal_personal");
  const revenueUnsorted = revenue - revenueIndonesia - revenueAbroad;
  const payDays = paid
    .filter((c) => c.paidDate && c.createdAt)
    .map((c) => daysBetween(c.createdAt!.slice(0, 10), c.paidDate!))
    .filter((d) => d >= 0)
    .sort((a, b) => a - b);
  const medianPayDays = payDays.length ? payDays[Math.floor(payDays.length / 2)] : null;

  // Funnel: how many reached each step (a lead that got further also passed the earlier steps)
  const staged = leads.filter((c) => stageIndex(c.stage) >= 0);
  const funnel = JOURNEY_STAGES.map((s, i) => ({
    key: s.value, label: `${i + 1}. ${l(s.label)}`, count: staged.filter((c) => stageIndex(c.stage) >= i).length,
  }));
  const waitingOnUs = leads.filter((c) => c.waitingOn === "us");
  const waitingOnThem = leads.filter((c) => c.waitingOn === "them");

  const byStatus = CONTACT_STATUSES
    .map((s) => ({ key: s.value, label: l(s.label), count: leads.filter((c) => c.status === s.value).length }))
    .filter((r) => r.count);
  const bySource = groupBy(leads, (c) => c.source, (key) => l(findLabel(CONTACT_SOURCES, key)) || key);
  const byAd = groupBy(leads, (c) => c.adId, (key) => `Ad ${key}`).slice(0, 8);
  const byQuality = groupBy(leads, (c) => c.quality ?? "unrated", (key) => l(findLabel(LEAD_QUALITIES, key)) || l({ id: "Belum dinilai", en: "Not rated" }));
  const byPerson = groupBy(leads, (c) => c.assignedName ?? "unassigned", (key) => (key === "unassigned" ? l({ id: "Belum ditugaskan", en: "Unassigned" }) : key));
  const byLostReason = groupBy(lost, (c) => c.lostReason ?? "unknown", (key) => l(findLabel(LOST_REASONS, key)) || l({ id: "Belum diketahui", en: "Not known yet" }));
  const byPackage = groupBy(payers, (c) => c.paidPackage ?? "unknown", (key) => l(findLabel(PAID_PACKAGES, key)) || l({ id: "Belum dicatat", en: "Not recorded" }));

  const none = l({ id: "Belum ada data di rentang ini.", en: "No data in this range yet." });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{l({ id: "Berdasarkan kontak yang masuk dalam rentang ini.", en: "Based on contacts that came in during this range." })}</p>
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {RANGES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setRange(item.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${range === item.value ? "bg-[#1B3A6B] text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              {l(item.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Tile label={l({ id: "Lead masuk", en: "Leads in" })} value={String(leads.length)} hint={`${open} ${l({ id: "masih berjalan", en: "still open" })}`} />
        <Tile label={l({ id: "Sudah bayar", en: "Paid" })} value={String(paid.length)} hint={`${pct(paid.length, leads.length)}% ${l({ id: "konversi", en: "conversion" })}`} />
        <Tile label={l({ id: "Tidak lanjut", en: "Lost" })} value={String(lost.length)} hint={`${pct(lost.length, leads.length)}%`} />
        <Tile
          label={l({ id: "Pendapatan tercatat", en: "Revenue recorded" })}
          value={revenue ? formatRupiah(revenue) : "—"}
          hint={`${payers.length} ${l({ id: "pembayar", en: "payers" })}`}
        />
        <Tile
          label={l({ id: "Waktu sampai bayar", en: "Time to pay" })}
          value={medianPayDays === null ? "—" : `${medianPayDays} ${l({ id: "hari", en: "days" })}`}
          hint={l({ id: "median, dari masuk sampai bayar", en: "median, first contact to payment" })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tile label={l({ id: "Menunggu kita", en: "Waiting on us" })} value={String(waitingOnUs.length)} hint={waitingOnUs.map((c) => c.name).slice(0, 6).join(", ")} />
        <Tile label={l({ id: "Menunggu mereka", en: "Waiting on them" })} value={String(waitingOnThem.length)} />
      </div>

      {revenue > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Tile label={l({ id: "Masuk rekening Jodohmu (Indonesia)", en: "Into Jodohmu bank (Indonesia)" })} value={formatRupiah(revenueIndonesia)} />
          <Tile label={l({ id: "PayPal pribadi (luar Indonesia)", en: "PayPal, personal (outside Indonesia)" })} value={formatRupiah(revenueAbroad)} hint={l({ id: "setelah potongan PayPal", en: "after PayPal fees" })} />
          {revenueUnsorted > 0 && <Tile label={l({ id: "Belum dicatat ke mana", en: "Channel not recorded" })} value={formatRupiah(revenueUnsorted)} />}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <BarList title={l({ id: "Corong proses (tahap tercapai)", en: "Process funnel (steps reached)" })} rows={funnel} total={staged.length} empty={none} />
        <BarList title={l({ id: "Posisi lead sekarang", en: "Where leads are now" })} rows={byStatus} total={leads.length} empty={none} />
        <BarList title={l({ id: "Kenapa tidak lanjut", en: "Why leads didn't go ahead" })} rows={byLostReason} total={lost.length} empty={none} />
        <BarList title={l({ id: "Sumber lead & konversi", en: "Lead source & conversion" })} rows={bySource} total={leads.length} showPaid empty={none} />
        <BarList title={l({ id: "Iklan & konversi (8 teratas)", en: "Ads & conversion (top 8)" })} rows={byAd} total={leads.length} showPaid empty={l({ id: "Belum ada lead dengan ID iklan.", en: "No leads with an ad ID yet." })} />
        <BarList title={l({ id: "Kualitas lead", en: "Lead quality" })} rows={byQuality} total={leads.length} showPaid empty={none} />
        <BarList title={l({ id: "Per anggota tim", en: "By team member" })} rows={byPerson} total={leads.length} showPaid empty={none} />
        <BarList title={l({ id: "Paket yang dibayar", en: "Packages paid" })} rows={byPackage} total={payers.length} empty={none} />
      </div>
    </div>
  );
}
