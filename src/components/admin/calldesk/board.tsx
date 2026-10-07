'use client';

import { useMemo, useState } from "react";
import { CalendarClock, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  CLOSED_LOST, JOURNEY_STAGES,
  type CallDeskContact, type CallDeskMember, type JourneyStage,
} from "@/lib/calldesk";
import { StatusBadge, callDeskFetch, dueState, formatDay, useL } from "./shared";
import type { DeskMe } from "./team-schedule";

// Board columns: every journey stage, plus leads with no stage yet and leads that ended as lost
type ColumnKey = JourneyStage | "none" | "lost";
const LOST_KEY = "lost";
const NONE_KEY = "none";

const columnOf = (contact: CallDeskContact, stage: JourneyStage | null): ColumnKey =>
  CLOSED_LOST.includes(contact.status) ? LOST_KEY : stage ?? NONE_KEY;

const daysAgo = (iso: string | null, today: string) => {
  if (!iso) return null;
  const diff = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${iso.slice(0, 10)}T00:00:00Z`)) / 86400000);
  return Math.max(0, diff);
};

// Most urgent first: overdue or due follow-ups, then leads waiting on us, then the most recently touched
const urgency = (contact: CallDeskContact, today: string) => {
  const due = dueState(contact, today);
  return due === "overdue" ? 0 : due === "today" ? 1 : contact.waitingOn === "us" ? 2 : 3;
};

function BoardCard({ contact, today, draggable, onOpen, onDragStart }: {
  contact: CallDeskContact;
  today: string;
  draggable: boolean;
  onOpen: (id: string) => void;
  onDragStart: (id: string | null) => void;
}) {
  const l = useL();
  const { lang } = useLanguage();
  const due = dueState(contact, today);
  const idle = daysAgo(contact.lastActivityAt, today);
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", contact.id); e.dataTransfer.effectAllowed = "move"; onDragStart(contact.id); }}
      onDragEnd={() => onDragStart(null)}
      onClick={() => onOpen(contact.id)}
      className={`w-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-slate-300 hover:shadow ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 truncate text-sm font-bold text-slate-900">{contact.name}</span>
        <StatusBadge status={contact.status} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {contact.assignedName ? (
          <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700">→ {contact.assignedName.split(" ")[0]}</span>
        ) : (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-400">{l({ id: "Belum ditugaskan", en: "Unassigned" })}</span>
        )}
        {contact.waitingOn === "us" && (
          <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-bold text-rose-700">{l({ id: "Menunggu kita", en: "Waiting on us" })}</span>
        )}
        {contact.waitingOn === "them" && (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">{l({ id: "Menunggu mereka", en: "Waiting on them" })}</span>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400">
        {contact.followUpDate ? (
          <span className={`flex items-center gap-1 font-semibold ${due === "overdue" ? "text-rose-600" : due === "today" ? "text-amber-700" : "text-slate-500"}`}>
            <CalendarClock className="h-3 w-3" />
            {due === "overdue" && `${l({ id: "Terlambat", en: "Overdue" })} · `}{formatDay(contact.followUpDate, lang, { day: "numeric", month: "short" })}
          </span>
        ) : <span />}
        {idle !== null && (
          <span>{idle === 0 ? l({ id: "Hari ini", en: "Today" }) : `${idle}${l({ id: " hr lalu", en: "d ago" })}`}</span>
        )}
      </div>
    </button>
  );
}

export function BoardView({ contacts, team, me, today, onOpen, onChanged }: {
  contacts: CallDeskContact[];
  team: CallDeskMember[];
  me: DeskMe;
  today: string;
  onOpen: (id: string) => void;
  onChanged: () => Promise<void> | void;
}) {
  const l = useL();
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("");
  const [showLost, setShowLost] = useState(false);
  // Stage moves shown straight away, kept until the reload brings the saved stage back
  const [moved, setMoved] = useState<Record<string, JourneyStage | null>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<ColumnKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stageOf = (c: CallDeskContact) => (c.id in moved ? moved[c.id] : c.stage);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return contacts.filter((c) => !c.excluded
      && (!owner || (owner === "unassigned" ? !c.assignedTo : c.assignedTo === owner))
      && (!needle || `${c.name} ${c.phone} ${c.email} ${c.city}`.toLowerCase().includes(needle)));
  }, [contacts, query, owner]);

  const columns: { key: ColumnKey; label: string; step?: number }[] = [
    { key: NONE_KEY, label: l({ id: "Belum ada tahap", en: "No stage yet" }) },
    ...JOURNEY_STAGES.map((s, i) => ({ key: s.value as ColumnKey, label: l(s.label), step: i + 1 })),
    ...(showLost ? [{ key: LOST_KEY as ColumnKey, label: l({ id: "Tidak lanjut", en: "Lost" }) }] : []),
  ];

  const grouped = new Map<ColumnKey, CallDeskContact[]>();
  for (const c of visible) {
    const key = columnOf(c, stageOf(c));
    grouped.set(key, [...(grouped.get(key) ?? []), c]);
  }
  grouped.forEach((list) => {
    list.sort((a, b) => urgency(a, today) - urgency(b, today) || (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? ""));
  });
  const lostCount = grouped.get(LOST_KEY)?.length ?? 0;
  const openCount = visible.length - lostCount;

  const move = async (id: string, column: ColumnKey) => {
    const contact = contacts.find((c) => c.id === id);
    if (!contact || column === LOST_KEY || CLOSED_LOST.includes(contact.status)) return;
    const stage = column === NONE_KEY ? null : column;
    if (stageOf(contact) === stage) return;
    setError(null);
    setMoved((prev) => ({ ...prev, [id]: stage }));
    try {
      await callDeskFetch("/api/admin/calldesk", { method: "POST", body: JSON.stringify({ action: "stage", contactId: id, stage }) });
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move");
    } finally {
      setMoved((prev) => { const next = { ...prev }; delete next[id]; return next; });
    }
  };

  const select = "h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <label className="relative flex min-w-[200px] flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={l({ id: "Cari nama, nomor, kota", en: "Search name, phone, city" })} className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm" />
        </label>
        <select className={select} value={owner} onChange={(e) => setOwner(e.target.value)}>
          <option value="">{l({ id: "Semua orang", en: "Everyone" })}</option>
          <option value={me.uid}>{l({ id: "Punya saya", en: "Mine" })}</option>
          <option value="unassigned">{l({ id: "Belum ditugaskan", en: "Unassigned" })}</option>
          {team.filter((m) => m.uid !== me.uid && !m.pending).map((m) => <option key={m.uid} value={m.uid}>{m.name}</option>)}
        </select>
        <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600">
          <input type="checkbox" checked={showLost} onChange={(e) => setShowLost(e.target.checked)} />
          {l({ id: "Tampilkan yang tidak lanjut", en: "Show lost" })} ({lostCount})
        </label>
      </div>

      <p className="text-xs font-semibold text-slate-400">
        {openCount} {l({ id: "klien berjalan", en: "open clients" })} · {l({ id: "Seret kartu ke kolom lain untuk mengubah tahap. Klik kartu untuk membuka detail.", en: "Drag a card to another column to change its stage. Click a card to open it." })}
      </p>
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

      <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6">
        <div className="flex gap-3">
          {columns.map((col) => {
            const items = grouped.get(col.key) ?? [];
            const droppable = col.key !== LOST_KEY;
            const highlight = droppable && dragging && over === col.key;
            return (
              <section
                key={col.key}
                onDragOver={(e) => { if (!droppable || !dragging) return; e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOver(col.key); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver((cur) => (cur === col.key ? null : cur)); }}
                onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); setOver(null); setDragging(null); if (id) move(id, col.key); }}
                className={`flex w-64 shrink-0 flex-col rounded-2xl border p-2 transition ${
                  highlight ? "border-[#1B3A6B] bg-indigo-50/60" : col.key === LOST_KEY ? "border-slate-200 bg-slate-100/70" : "border-slate-200 bg-slate-50"
                }`}
              >
                <header className="flex items-start justify-between gap-2 px-1 pb-2 pt-1">
                  <h3 className="text-xs font-bold leading-snug text-slate-700">
                    {col.step && <span className="text-slate-400">{col.step}. </span>}{col.label}
                  </h3>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm">{items.length}</span>
                </header>
                {col.key === LOST_KEY && (
                  <p className="px-1 pb-2 text-[11px] text-slate-400">{l({ id: "Ubah status di detail klien untuk membukanya lagi.", en: "Change the status in the client panel to reopen." })}</p>
                )}
                <div className="flex min-h-[80px] flex-col gap-2">
                  {items.map((c) => (
                    <BoardCard
                      key={c.id}
                      contact={c}
                      today={today}
                      draggable={col.key !== LOST_KEY}
                      onOpen={onOpen}
                      onDragStart={setDragging}
                    />
                  ))}
                  {!items.length && (
                    <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-[11px] text-slate-400">{l({ id: "Kosong", en: "Empty" })}</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
