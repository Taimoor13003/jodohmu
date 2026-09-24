'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { findLabel, jakartaDay, type CallDeskContact } from "@/lib/calldesk";
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES, type FinanceExpense } from "@/lib/finance";
import { callDeskFetch, formatDay, useL } from "./shared";
import { BarList, Tile, type Row } from "./insights";
import { formatRupiah } from "./outcome";
import { useLanguage } from "@/context/LanguageContext";

const monthOf = (day: string | null) => (day ? day.slice(0, 7) : null);

// Money in (recorded client payments) against money out (company expenses), all time. Admins only.
export function FinanceView({ contacts }: { contacts: CallDeskContact[] }) {
  const l = useL();
  const { lang } = useLanguage();
  const [expenses, setExpenses] = useState<FinanceExpense[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setExpenses((await callDeskFetch<{ expenses: FinanceExpense[] }>("/api/admin/calldesk?finance=expenses")).expenses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const blank = { date: jakartaDay(), amount: "", category: "salary", status: "paid", payee: "", role: "", note: "" };
  const [form, setForm] = useState(blank);

  const post = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try {
      await callDeskFetch("/api/admin/calldesk", { method: "POST", body: JSON.stringify(body) });
      await load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      return false;
    } finally {
      setSaving(false);
    }
  };
  const addExpense = async () => {
    const ok = await post({ action: "expense", ...form, amount: Number(form.amount.replace(/\D/g, "")) });
    if (ok) { setForm(blank); setAdding(false); }
  };

  const payers = useMemo(() => contacts.filter((c) => !c.excluded && (c.paidAmount ?? 0) > 0), [contacts]);

  if (!expenses && error) return <p className="text-sm font-semibold text-rose-600">{error}</p>;
  if (!expenses) return <Loader2 className="h-6 w-6 animate-spin text-[#1B3A6B]" />;

  const sum = (items: { amount: number }[]) => items.reduce((total, item) => total + item.amount, 0);
  const income = payers.map((c) => ({ amount: c.paidAmount ?? 0, month: monthOf(c.paidDate), channel: c.paymentChannel }));
  const revenue = sum(income);
  const paidOut = expenses.filter((e) => e.status === "paid");
  const owed = expenses.filter((e) => e.status === "owed");
  const spent = sum(paidOut);
  const net = revenue - spent;

  const byCategory: Row[] = EXPENSE_CATEGORIES
    .map((c) => ({ key: c.value, label: l(c.label), count: sum(paidOut.filter((e) => e.category === c.value)) }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  const byPayee: Row[] = Array.from(new Set(paidOut.map((e) => e.payee)))
    .map((payee) => ({ key: payee, label: payee || "—", count: sum(paidOut.filter((e) => e.payee === payee)) }))
    .sort((a, b) => b.count - a.count);

  // Team cost per month: the salaries in the latest month that has any (paid or owed)
  const salaries = expenses.filter((e) => e.category === "salary");
  const latestSalaryMonth = salaries.map((e) => monthOf(e.date)!).sort().pop() ?? null;
  const teamCost = sum(salaries.filter((e) => monthOf(e.date) === latestSalaryMonth));
  const teamNames = salaries.filter((e) => monthOf(e.date) === latestSalaryMonth).map((e) => e.payee).join(", ");
  // What an average package sale brings in, and how many of those cover the team each month
  const packageSales = payers.filter((c) => c.paidPackage && !["consultation", "registration"].includes(c.paidPackage));
  const avgSale = packageSales.length ? sum(packageSales.map((c) => ({ amount: c.paidAmount ?? 0 }))) / packageSales.length : 0;
  const salesToCoverTeam = avgSale ? Math.ceil(teamCost / avgSale) : null;
  const adSpend = sum(paidOut.filter((e) => e.category === "ads"));
  const costPerPayer = payers.length ? Math.round(adSpend / payers.length) : null;

  // Months with any money moving; income without a paid date is shown on its own row
  const months = Array.from(new Set([...paidOut.map((e) => monthOf(e.date)!), ...income.map((i) => i.month).filter(Boolean) as string[]])).sort();
  const undated = sum(income.filter((i) => !i.month));
  const monthLabel = (month: string) => formatDay(`${month}-01`, lang, { month: "short", year: "numeric" });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label={l({ id: "Pendapatan", en: "Revenue" })} value={formatRupiah(revenue)} hint={`${payers.length} ${l({ id: "pembayar", en: "payers" })}`} />
        <Tile label={l({ id: "Pengeluaran (dibayar)", en: "Expenses (paid)" })} value={formatRupiah(spent)} />
        <Tile label={l({ id: "Bersih", en: "Net" })} value={`${net < 0 ? "−" : ""}${formatRupiah(Math.abs(net))}`} hint={l({ id: "pendapatan − pengeluaran dibayar", en: "revenue − paid expenses" })} />
        <Tile label={l({ id: "Masih harus dibayar", en: "Still owed" })} value={formatRupiah(sum(owed))} hint={owed.map((e) => e.payee).join(", ")} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-900">{l({ id: "Angka kunci", en: "Key numbers" })}</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">{l({ id: "Biaya tim per bulan", en: "Team cost per month" })}{latestSalaryMonth ? ` (${monthLabel(latestSalaryMonth)})` : ""}</dt>
            <dd className="font-semibold text-slate-800">{formatRupiah(teamCost)} <span className="text-xs font-normal text-slate-400">{teamNames}</span></dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">{l({ id: "Rata-rata penjualan paket", en: "Average package sale" })}</dt>
            <dd className="font-semibold text-slate-800">{avgSale ? formatRupiah(Math.round(avgSale)) : "—"} <span className="text-xs font-normal text-slate-400">{packageSales.length} {l({ id: "penjualan", en: "sales" })}</span></dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">{l({ id: "Penjualan paket per bulan untuk menutup biaya tim", en: "Package sales a month to cover the team" })}</dt>
            <dd className="font-semibold text-slate-800">{salesToCoverTeam ?? "—"} <span className="text-xs font-normal text-slate-400">{l({ id: "sebelum komisi & iklan", en: "before commissions & ads" })}</span></dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">{l({ id: "Biaya iklan per pembayar", en: "Ad spend per paying client" })}</dt>
            <dd className="font-semibold text-slate-800">{costPerPayer !== null ? formatRupiah(costPerPayer) : "—"} <span className="text-xs font-normal text-slate-400">{formatRupiah(adSpend)} {l({ id: "total iklan", en: "total ads" })}</span></dd>
          </div>
        </dl>
        <p className="mt-3 text-[11px] text-slate-400">{l({ id: "Gaji dibayar tanggal 1 untuk bulan sebelumnya. Komisi: matchmaker 20% (uang muka Pearl), sales 12%.", en: "Salaries are paid on the 1st for the month before. Commissions: matchmaker 20% (advance on Pearl), sales 12%." })}</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <BarList title={l({ id: "Pengeluaran per kategori", en: "Expenses by category" })} rows={byCategory} total={spent} format={formatRupiah} empty="—" />
        <BarList title={l({ id: "Pengeluaran per orang/penerima", en: "Expenses by person" })} rows={byPayee} total={spent} format={formatRupiah} empty="—" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 px-5 py-3 text-sm font-bold text-slate-900">{l({ id: "Per bulan", en: "By month" })}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-2">{l({ id: "Bulan", en: "Month" })}</th>
                <th className="px-3 py-2 text-right">{l({ id: "Masuk", en: "In" })}</th>
                <th className="px-3 py-2 text-right">{l({ id: "Keluar", en: "Out" })}</th>
                <th className="px-5 py-2 text-right">{l({ id: "Bersih", en: "Net" })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {months.map((month) => {
                const inflow = sum(income.filter((i) => i.month === month));
                const outflow = sum(paidOut.filter((e) => monthOf(e.date) === month));
                return (
                  <tr key={month}>
                    <td className="px-5 py-2.5 font-semibold text-slate-800">{monthLabel(month)}</td>
                    <td className="px-3 py-2.5 text-right text-slate-700">{inflow ? formatRupiah(inflow) : "·"}</td>
                    <td className="px-3 py-2.5 text-right text-slate-700">{outflow ? formatRupiah(outflow) : "·"}</td>
                    <td className="px-5 py-2.5 text-right font-semibold text-slate-800">{inflow - outflow < 0 ? "−" : ""}{formatRupiah(Math.abs(inflow - outflow))}</td>
                  </tr>
                );
              })}
              {undated > 0 && (
                <tr>
                  <td className="px-5 py-2.5 text-slate-500">{l({ id: "Pembayaran tanpa tanggal", en: "Payments with no date" })}</td>
                  <td className="px-3 py-2.5 text-right text-slate-700">{formatRupiah(undated)}</td>
                  <td className="px-3 py-2.5 text-right">·</td>
                  <td className="px-5 py-2.5 text-right text-slate-700">{formatRupiah(undated)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-bold text-slate-900">{l({ id: "Semua pengeluaran", en: "All expenses" })}</h2>
          <button type="button" onClick={() => setAdding((open) => !open)} className="h-9 rounded-lg bg-[#C4294A] px-4 text-sm font-bold text-white hover:bg-[#a82340]">
            {adding ? l({ id: "Batal", en: "Cancel" }) : l({ id: "+ Tambah pengeluaran", en: "+ Add expense" })}
          </button>
        </div>
        {adding && (
          <div className="grid gap-2 border-b border-slate-100 bg-slate-50/60 p-5 sm:grid-cols-3">
            <input type="date" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input inputMode="numeric" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800" placeholder={l({ id: "Jumlah (Rp)", en: "Amount (Rp)" })} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d]/g, "") })} />
            <input className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800" placeholder={l({ id: "Dibayar ke (nama)", en: "Paid to (name)" })} value={form.payee} onChange={(e) => setForm({ ...form, payee: e.target.value })} />
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{l(c.label)}</option>)}
            </select>
            <select className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {EXPENSE_STATUSES.map((c) => <option key={c.value} value={c.value}>{l(c.label)}</option>)}
            </select>
            <input className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800" placeholder={l({ id: "Peran (opsional)", en: "Role (optional)" })} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <input className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 sm:col-span-2" placeholder={l({ id: "Catatan, misalnya: gaji September", en: "Note, e.g. September salary" })} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <button type="button" disabled={saving} onClick={addExpense} className="h-10 rounded-lg bg-[#1B3A6B] text-sm font-bold text-white disabled:opacity-60">
              {l({ id: "Simpan", en: "Save" })}
            </button>
          </div>
        )}
        {error && <p className="px-5 pt-3 text-sm font-semibold text-rose-600">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-2">{l({ id: "Tanggal", en: "Date" })}</th>
                <th className="px-3 py-2">{l({ id: "Kepada", en: "To" })}</th>
                <th className="px-3 py-2">{l({ id: "Kategori", en: "Category" })}</th>
                <th className="px-3 py-2 text-right">{l({ id: "Jumlah", en: "Amount" })}</th>
                <th className="px-5 py-2">{l({ id: "Catatan", en: "Note" })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <tr key={e.id} className={e.status === "owed" ? "bg-amber-50/60" : ""}>
                  <td className="whitespace-nowrap px-5 py-2.5 text-slate-700">{formatDay(e.date, lang, { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-3 py-2.5 text-slate-800">{e.payee}{e.role ? <span className="text-xs text-slate-400"> · {e.role}</span> : null}</td>
                  <td className="px-3 py-2.5 text-slate-600">{l(findLabel(EXPENSE_CATEGORIES, e.category))}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-800">
                    {formatRupiah(e.amount)}
                    {e.status === "owed" && <span className="ml-1 text-[11px] font-bold text-amber-700">({l(findLabel(EXPENSE_STATUSES, e.status))})</span>}
                  </td>
                  <td className="px-5 py-2.5 text-xs text-slate-500">
                    {e.note}
                    {e.status === "owed" && (
                      <button type="button" disabled={saving} onClick={() => post({ action: "expense_paid", id: e.id })} className="ml-2 font-bold text-emerald-700 hover:underline">
                        {l({ id: "Tandai dibayar hari ini", en: "Mark paid today" })}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
