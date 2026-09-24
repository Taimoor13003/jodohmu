'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, CalendarRange, History, Loader2, PhoneCall, Plus, RefreshCw, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { addDays, jakartaDay, type CallDeskActivity, type CallDeskContact, type CallDeskMember } from "@/lib/calldesk";
import { AddContactDialog } from "./add-contact";
import { ContactPanel } from "./contact-panel";
import { callDeskFetch, formatDay, useL } from "./shared";
import { CalendarView, ContactsView, HistoryView, TodayView } from "./views";
import { TeamScheduleView, type DeskMe } from "./team-schedule";
import { SlotPicker, type Slot } from "./day-view";
import { InsightsView } from "./insights";

type DeskData = {
  today: string;
  contacts: CallDeskContact[];
  activity: CallDeskActivity[];
  team: CallDeskMember[];
  me: DeskMe;
};

type Tab = "today" | "calendar" | "contacts" | "team" | "history" | "insights";

const monthEnd = (month: string) => {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return date.toISOString().slice(0, 10);
};

export function CallDeskApp() {
  const l = useL();
  const { lang } = useLanguage();
  const initialToday = jakartaDay();
  const [data, setData] = useState<DeskData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  // A calendar slot being scheduled: picked first, then carried into the contact panel or new-contact form
  const [slot, setSlot] = useState<Slot | null>(null);
  const [preset, setPreset] = useState<Slot | null>(null);
  const [month, setMonth] = useState(initialToday.slice(0, 7));
  const [historyRange, setHistoryRange] = useState({ from: addDays(initialToday, -6), to: initialToday });

  // Load whatever the visible tab needs, always including today so the Today stats stay correct
  const fetchRange = useMemo(() => {
    const starts = [initialToday, historyRange.from, `${month}-01`];
    const ends = [initialToday, historyRange.to, monthEnd(month)];
    return { from: starts.sort()[0], to: ends.sort().reverse()[0] };
  }, [initialToday, historyRange, month]);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await callDeskFetch<DeskData>(`/api/admin/calldesk?from=${fetchRange.from}&to=${fetchRange.to}`);
      setData(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setRefreshing(false);
    }
  }, [fetchRange]);

  useEffect(() => { load(); }, [load]);

  // Pick up new website leads and teammates' activity without a manual refresh
  useEffect(() => {
    const interval = setInterval(() => { if (document.visibilityState === "visible") load(); }, 60000);
    return () => clearInterval(interval);
  }, [load]);

  const openContact = data?.contacts.find((c) => c.id === openId) ?? null;

  if (!data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-sm text-slate-500">
        {error ? (
          <>
            <p className="font-semibold text-rose-600">{error}</p>
            <button type="button" onClick={load} className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700">{l({ id: "Coba lagi", en: "Try again" })}</button>
          </>
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-[#1B3A6B]" />
        )}
      </div>
    );
  }

  const tabs: { value: Tab; label: string; icon: React.ReactNode }[] = [
    { value: "today", label: l({ id: "Hari ini", en: "Today" }), icon: <PhoneCall className="h-4 w-4" /> },
    { value: "calendar", label: l({ id: "Kalender", en: "Calendar" }), icon: <CalendarDays className="h-4 w-4" /> },
    { value: "contacts", label: l({ id: "Semua kontak", en: "All contacts" }), icon: <Users className="h-4 w-4" /> },
    { value: "team", label: l({ id: "Jadwal tim", en: "Team schedule" }), icon: <CalendarRange className="h-4 w-4" /> },
    { value: "history", label: l({ id: "Riwayat & laporan", en: "History & reports" }), icon: <History className="h-4 w-4" /> },
    // Whole-business numbers, so only for people who can see the whole team
    ...(data.me.canSeeTeam ? [{ value: "insights" as Tab, label: l({ id: "Insight", en: "Insights" }), icon: <BarChart3 className="h-4 w-4" /> }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#C4294A]">Call Desk</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            {l({ id: "Halo", en: "Hi" })}, {data.me.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{formatDay(data.today, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} disabled={refreshing} title={l({ id: "Muat ulang", en: "Refresh" })} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          {tab !== "team" && (
            <button type="button" onClick={() => { setPreset(null); setAdding(true); }} className="flex h-10 items-center gap-2 rounded-xl bg-[#C4294A] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#a82340]">
              <Plus className="h-4 w-4" /> {l({ id: "Tambah kontak (calon klien)", en: "Add contact (lead)" })}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

      <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${tab === item.value ? "bg-[#1B3A6B] text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {item.icon}{item.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "today" && <TodayView contacts={data.contacts} activity={data.activity} today={data.today} me={data.me} onOpen={(id) => { setPreset(null); setOpenId(id); }} />}
        {tab === "calendar" && (
          <CalendarView
            contacts={data.contacts}
            activity={data.activity}
            team={data.team}
            me={data.me}
            today={data.today}
            month={month}
            onMonthChange={setMonth}
            onOpen={(id) => { setPreset(null); setOpenId(id); }}
            onSlot={setSlot}
            onChanged={load}
          />
        )}
        {tab === "team" && <TeamScheduleView team={data.team} me={data.me} today={data.today} onChanged={load} />}
        {tab === "insights" && data.me.canSeeTeam && <InsightsView contacts={data.contacts} today={data.today} />}
        {tab === "contacts" && <ContactsView contacts={data.contacts} today={data.today} onOpen={setOpenId} />}
        {tab === "history" && (
          <HistoryView
            activity={data.activity}
            team={data.team}
            meUid={data.me.uid}
            canSeeTeam={data.me.canSeeTeam}
            range={historyRange}
            onRangeChange={setHistoryRange}
            onOpen={setOpenId}
          />
        )}
      </div>

      {openContact && (
        <ContactPanel
          contact={openContact}
          team={data.team}
          me={data.me}
          today={data.today}
          preset={preset}
          onClose={() => { setOpenId(null); setPreset(null); }}
          onChanged={load}
        />
      )}
      {slot && (
        <SlotPicker
          slot={slot}
          contacts={data.contacts}
          onClose={() => setSlot(null)}
          onPick={(id) => { setPreset(slot); setSlot(null); setOpenId(id); }}
          onNew={() => { setPreset(slot); setSlot(null); setAdding(true); }}
        />
      )}
      {adding && (
        <AddContactDialog
          today={data.today}
          team={data.team}
          me={data.me}
          preset={preset}
          onClose={() => { setAdding(false); setPreset(null); }}
          onCreated={async (id) => { await load(); setAdding(false); setPreset(null); setOpenId(id); }}
        />
      )}
    </div>
  );
}
