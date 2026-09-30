'use client';

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { findLabel } from "@/lib/calldesk";
import { MITRA_FACILITATOR, MITRA_STAGES, MITRA_TYPES, type MitraProspect, type MitraStage } from "@/lib/mitra";
import { callDeskFetch, formatDay, useL } from "@/components/admin/calldesk/shared";
import { useLanguage } from "@/context/LanguageContext";

const PHASES = [
  { value: "acquisition", label: { id: "Mendapatkan Mitra", en: "Getting Mitra" }, hint: { id: "Dari belum dihubungi sampai tertarik", en: "From first contact to interested" } },
  { value: "management", label: { id: "Mengelola Mitra", en: "Managing Mitra" }, hint: { id: "Sudah bergabung: briefing, rujukan, pendampingan", en: "Signed up: briefing, referrals, facilitating" } },
  { value: "closed", label: { id: "Ditutup", en: "Closed" }, hint: { id: "Belum sekarang atau tidak cocok", en: "Not now or not a fit" } },
] as const;

// Overdue follow-ups first, then due today, then the rest by follow-up date
const urgency = (p: MitraProspect, today: string) =>
  !p.followUpDate ? 3 : p.followUpDate < today ? 0 : p.followUpDate === today ? 1 : 2;

function BoardCard({ p, today, onOpen, onDragStart }: {
  p: MitraProspect; today: string; onOpen: (id: string) => void; onDragStart: (id: string | null) => void;
}) {
  const l = useL();
  const { lang } = useLanguage();
  const overdue = p.followUpDate && p.followUpDate < today;
  const facilitator = MITRA_FACILITATOR.find((f) => f.value === p.facilitator);
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", p.id); e.dataTransfer.effectAllowed = "move"; onDragStart(p.id); }}
      onDragEnd={() => onDragStart(null)}
      onClick={() => onOpen(p.id)}
      className="w-full cursor-grab rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:shadow active:cursor-grabbing"
    >
      <p className="truncate text-sm font-bold text-slate-900">{p.name}</p>
      <p className="mt-0.5 truncate text-[11px] text-slate-500">{l(findLabel(MITRA_TYPES, p.type))}{p.city ? ` · ${p.city}` : ""}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {p.facilitator !== "unknown" && (
          <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${facilitator?.tone ?? ""}`}>{l(facilitator?.label)}</span>
        )}
        {p.score !== null && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">{p.score}/4</span>}
        {p.referrals > 0 && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">{p.referrals} {l({ id: "rujukan", en: "referred" })}</span>}
        {p.meetingsFacilitated > 0 && <span className="rounded-md bg-cyan-50 px-1.5 py-0.5 text-[10px] font-bold text-cyan-700">{p.meetingsFacilitated} {l({ id: "pertemuan", en: "meetings" })}</span>}
      </div>
      {p.followUpDate && (
        <p className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${overdue ? "text-rose-600" : p.followUpDate === today ? "text-amber-700" : "text-slate-400"}`}>
          <CalendarClock className="h-3 w-3" />
          {overdue && `${l({ id: "Terlambat", en: "Overdue" })} · `}{formatDay(p.followUpDate, lang, { day: "numeric", month: "short" })}
        </p>
      )}
    </button>
  );
}

// Every stage as a column, grouped into getting Mitra and managing them. Dragging a card changes its stage.
export function MitraBoard({ prospects, today, onOpen, onChanged }: {
  prospects: MitraProspect[]; today: string; onOpen: (id: string) => void; onChanged: () => Promise<void> | void;
}) {
  const l = useL();
  const [showClosed, setShowClosed] = useState(false);
  // Moves shown straight away, kept until the reload brings the saved stage back
  const [moved, setMoved] = useState<Record<string, MitraStage>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stageOf = (p: MitraProspect) => moved[p.id] ?? p.stage;
  const grouped = new Map<string, MitraProspect[]>();
  for (const p of prospects) grouped.set(stageOf(p), [...(grouped.get(stageOf(p)) ?? []), p]);
  grouped.forEach((list) => list.sort((a, b) => urgency(a, today) - urgency(b, today) || (a.followUpDate ?? "").localeCompare(b.followUpDate ?? "")));
  const closedCount = MITRA_STAGES.filter((s) => s.phase === "closed").reduce((n, s) => n + (grouped.get(s.value)?.length ?? 0), 0);

  const move = async (id: string, stage: MitraStage) => {
    const p = prospects.find((x) => x.id === id);
    if (!p || stageOf(p) === stage) return;
    setError(null);
    setMoved((prev) => ({ ...prev, [id]: stage }));
    try {
      await callDeskFetch("/api/admin/mitra", { method: "POST", body: JSON.stringify({ action: "stage", id, stage }) });
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move");
    } finally {
      setMoved((prev) => { const next = { ...prev }; delete next[id]; return next; });
    }
  };

  return (
    <div className="space-y-3 px-5 pb-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-400">
          {l({ id: "Seret kartu ke kolom lain untuk mengubah tahap. Klik kartu untuk membuka detail.", en: "Drag a card to another column to change its stage. Click a card to open it." })}
        </p>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
          {l({ id: "Tampilkan yang ditutup", en: "Show closed" })} ({closedCount})
        </label>
      </div>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

      <div className="-mx-5 overflow-x-auto px-5 pb-2">
        <div className="flex gap-5">
          {PHASES.filter((phase) => phase.value !== "closed" || showClosed).map((phase) => {
            const stages = MITRA_STAGES.filter((s) => s.phase === phase.value);
            const total = stages.reduce((n, s) => n + (grouped.get(s.value)?.length ?? 0), 0);
            return (
              <div key={phase.value} className="shrink-0">
                <div className="mb-2 flex items-baseline gap-2 px-1">
                  <h3 className="text-sm font-bold text-slate-800">{l(phase.label)}</h3>
                  <span className="text-xs font-semibold text-slate-400">{total} · {l(phase.hint)}</span>
                </div>
                <div className="flex gap-3">
                  {stages.map((stage) => {
                    const items = grouped.get(stage.value) ?? [];
                    const highlight = dragging && over === stage.value;
                    return (
                      <section
                        key={stage.value}
                        onDragOver={(e) => { if (!dragging) return; e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOver(stage.value); }}
                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver((cur) => (cur === stage.value ? null : cur)); }}
                        onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); setOver(null); setDragging(null); if (id) move(id, stage.value); }}
                        className={`flex w-60 shrink-0 flex-col rounded-2xl border p-2 transition ${
                          highlight ? "border-[#1B3A6B] bg-indigo-50/60" : phase.value === "closed" ? "border-slate-200 bg-slate-100/70" : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <header className="flex items-start justify-between gap-2 px-1 pb-2 pt-1">
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${stage.tone}`}>{l(stage.label)}</span>
                          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm">{items.length}</span>
                        </header>
                        <div className="flex max-h-[65vh] min-h-[80px] flex-col gap-2 overflow-y-auto">
                          {items.map((p) => <BoardCard key={p.id} p={p} today={today} onOpen={onOpen} onDragStart={setDragging} />)}
                          {!items.length && (
                            <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-[11px] text-slate-400">{l({ id: "Kosong", en: "Empty" })}</p>
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
