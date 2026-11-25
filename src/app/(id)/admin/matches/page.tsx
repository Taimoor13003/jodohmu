"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, Loader2, Plus, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { AddSuggestion, SuggestionRow, teamFetch } from "@/components/admin/match-suggestions";
import { STATUS_META, SUGGESTION_STATUSES, type Suggestion, type SuggestionStatus } from "@/lib/match-suggestions";

type Filter = "open" | "all" | SuggestionStatus;
type Group = "client" | "none";

/** Statuses that still need the team to do something. */
const OPEN: SuggestionStatus[] = ["backlog", "sent", "interested"];

export default function AdminMatchesPage() {
  const { lang: rawLang } = useLanguage();
  const lang = rawLang === "en" ? "en" : "id";
  const l = (id: string, en: string) => (lang === "id" ? id : en);

  const [rows, setRows] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("open");
  const [group, setGroup] = useState<Group>("client");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await teamFetch<{ suggestions: Suggestion[] }>("/api/admin/suggestions");
      setRows(r.suggestions.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")));
    } catch (e) { setError((e as Error).message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows?.length ?? 0, open: 0 };
    for (const s of rows ?? []) {
      c[s.status] = (c[s.status] ?? 0) + 1;
      if (OPEN.includes(s.status)) c.open++;
    }
    return c;
  }, [rows]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (rows ?? [])
      .filter(s => filter === "all" ? true : filter === "open" ? OPEN.includes(s.status) : s.status === filter)
      .filter(s => !term || [s.client.name, s.candidate.name, s.reason, ...s.notes.map(n => n.text)].some(v => v?.toLowerCase().includes(term)));
  }, [rows, filter, q]);

  const groups = useMemo(() => {
    if (group === "none") return [{ key: "all", title: null as string | null, items: visible }];
    const map = new Map<string, Suggestion[]>();
    for (const s of visible) map.set(s.clientUid, [...(map.get(s.clientUid) ?? []), s]);
    return Array.from(map.entries())
      .map(([key, items]) => ({ key, title: items[0].client.name, items }))
      .sort((a, b) => b.items.filter(s => s.status === "backlog").length - a.items.filter(s => s.status === "backlog").length);
  }, [visible, group]);

  const update = (next: Suggestion) => setRows(list => (list ?? []).map(x => (x.id === next.id ? next : x)));
  const remove = (id: string) => setRows(list => (list ?? []).filter(x => x.id !== id));

  const chips: { key: Filter; label: string }[] = [
    { key: "open", label: l("Perlu tindakan", "Needs action") },
    ...SUGGESTION_STATUSES.map(s => ({ key: s as Filter, label: STATUS_META[s][lang] })),
    { key: "all", label: l("Semua", "All") },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#EEF2F7" }}>
      <div className="max-w-4xl mx-auto px-4 md:px-5 py-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF1F2", color: "#C4294A" }}>
            <Heart className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-bold text-slate-900">{l("Saran Jodoh", "Match Suggestions")}</h1>
            <p className="text-[13px] text-slate-500">
              {l("Siapa cocok untuk siapa: simpan dulu, kirim ke klien nanti, lalu catat tanggapannya.",
                 "Who suits whom: save it now, send it to the client later, then note how they reacted.")}
            </p>
          </div>
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-xl text-white hover:opacity-90 shrink-0"
            style={{ background: "linear-gradient(135deg, #1B3A6B, #C4294A)" }}>
            <Plus className="w-4 h-4" /> {l("Sarankan", "Suggest")}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {chips.map(c => {
            const active = filter === c.key;
            const meta = c.key in STATUS_META ? STATUS_META[c.key as SuggestionStatus] : null;
            return (
              <button key={c.key} onClick={() => setFilter(c.key)}
                className="text-[12px] font-semibold px-3 py-1 rounded-full border transition-colors"
                style={active
                  ? { background: meta?.bg ?? "#0F172A", color: meta?.color ?? "#fff", borderColor: meta?.border ?? "#0F172A" }
                  : { background: "#fff", color: "#64748B", borderColor: "#E2E8F0" }}>
                {c.label} <span className="opacity-60">{counts[c.key] ?? 0}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 rounded-xl border bg-white px-3 py-2" style={{ borderColor: "#E2E8F0" }}>
            <Search className="w-4 h-4 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={l("Cari nama atau catatan", "Search names or notes")}
              className="flex-1 text-[13px] focus:outline-none bg-transparent" />
          </div>
          <div className="inline-flex rounded-lg p-0.5" style={{ background: "#E2E8F0" }}>
            {(["client", "none"] as const).map(g => (
              <button key={g} onClick={() => setGroup(g)} className="text-[12px] font-semibold px-3 py-1 rounded-md"
                style={group === g ? { background: "#fff", color: "#0F172A" } : { color: "#64748B" }}>
                {g === "client" ? l("Per klien", "By client") : l("Terbaru", "Newest")}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p className="text-[13px] text-red-600">{error}</p>
        ) : !rows ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl bg-white border p-10 text-center" style={{ borderColor: "#E2E8F0" }}>
            <p className="text-[14px] font-semibold text-slate-700 mb-1">
              {rows.length === 0 ? l("Belum ada saran jodoh", "No suggestions yet") : l("Tidak ada yang cocok dengan filter ini", "Nothing matches this filter")}
            </p>
            <p className="text-[12.5px] text-slate-500">
              {l("Klik Sarankan, atau buka profil kandidat dan tambahkan dari sana.", "Click Suggest, or open a candidate's page and add one there.")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map(g => (
              <div key={g.key}>
                {g.title && (
                  <p className="text-[12px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                    {l("Untuk", "For")} {g.title}
                    <span className="font-semibold normal-case tracking-normal text-slate-400"> · {g.items.length}</span>
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {g.items.map(s => (
                    <SuggestionRow key={s.id} s={s} show={group === "client" ? "candidate" : "both"} lang={lang} onChanged={update} onDeleted={remove} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {adding && (
        <AddSuggestion fixed={null} fixedRole="client" lang={lang} exclude={new Set()}
          onAdded={s => setRows(list => [s, ...(list ?? [])])} onClose={() => setAdding(false)} />
      )}
    </div>
  );
}
