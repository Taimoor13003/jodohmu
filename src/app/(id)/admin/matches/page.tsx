"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, Loader2, Plus, Search, Send, Sparkles, ThumbsUp, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { AddSuggestion, ProfileSnapshot, SuggestionRow, teamFetch } from "@/components/admin/match-suggestions";
import { ORIGIN_META, STATUS_META, SUGGESTION_STATUSES, type Suggestion, type SuggestionOrigin, type SuggestionPerson, type SuggestionStatus } from "@/lib/match-suggestions";
import { fitChecks, fitSummary } from "@/lib/match-fit";
import { displayValue } from "@/lib/share-display";

type Filter = "open" | "all" | SuggestionStatus;
type FitFilter = "any" | "strong" | "mixed" | "weak" | "unknown";
type Group = "client" | "none";
type OriginFilter = "any" | SuggestionOrigin;

/** Statuses that still need the team to do something. */
const OPEN: SuggestionStatus[] = ["backlog", "sent", "interested"];

/** Everything about a person the search box should find. */
function haystack(p: SuggestionPerson, lang: "id" | "en") {
  const f = p.facts ?? {};
  return [p.name, p.city, p.age, ...["nationality", "occupation", "jobPosition", "maritalStatus", "ethnicity"].map(k => displayValue(f[k], lang, k)), f.aboutMe]
    .filter(Boolean).join(" ").toLowerCase();
}

export default function AdminMatchesPage() {
  const { lang: rawLang } = useLanguage();
  const lang = rawLang === "en" ? "en" : "id";
  const l = (id: string, en: string) => (lang === "id" ? id : en);

  const [rows, setRows] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("open");
  const [fitFilter, setFitFilter] = useState<FitFilter>("any");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("any");
  const [group, setGroup] = useState<Group>("client");
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState<SuggestionPerson | null | false>(false);

  const load = useCallback(async () => {
    try {
      const r = await teamFetch<{ suggestions: Suggestion[] }>("/api/admin/suggestions");
      setRows(r.suggestions.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")));
    } catch (e) { setError((e as Error).message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const fitOf = useMemo(() => {
    const m = new Map<string, ReturnType<typeof fitSummary>["level"]>();
    for (const s of rows ?? []) m.set(s.id, fitSummary(fitChecks(s.client, s.candidate)).level);
    return m;
  }, [rows]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows?.length ?? 0, open: 0 };
    for (const s of rows ?? []) {
      c[s.status] = (c[s.status] ?? 0) + 1;
      if (OPEN.includes(s.status)) c.open++;
    }
    return c;
  }, [rows]);

  const clients = useMemo(() => {
    const m = new Map<string, SuggestionPerson>();
    for (const s of rows ?? []) m.set(s.clientUid, s.client);
    return Array.from(m.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (rows ?? [])
      .filter(s => filter === "all" ? true : filter === "open" ? OPEN.includes(s.status) : s.status === filter)
      .filter(s => clientFilter === "all" || s.clientUid === clientFilter)
      .filter(s => fitFilter === "any" || fitOf.get(s.id) === fitFilter)
      .filter(s => originFilter === "any" || s.origin === originFilter)
      .filter(s => !term || [haystack(s.client, lang), haystack(s.candidate, lang), s.reason, ...s.notes.map(n => n.text)]
        .some(v => v?.toLowerCase().includes(term)));
  }, [rows, filter, clientFilter, fitFilter, originFilter, fitOf, q, lang]);

  const groups = useMemo(() => {
    if (group === "none") return [{ key: "all", client: null as SuggestionPerson | null, items: visible }];
    const map = new Map<string, Suggestion[]>();
    for (const s of visible) map.set(s.clientUid, [...(map.get(s.clientUid) ?? []), s]);
    return Array.from(map.entries())
      // Candidates who asked for this client come first: they are already keen
      .map(([key, items]) => ({ key, client: items[0].client, items: [...items].sort((a, b) => Number(b.origin === "candidate_request") - Number(a.origin === "candidate_request")) }))
      .sort((a, b) => b.items.filter(s => s.status === "backlog").length - a.items.filter(s => s.status === "backlog").length);
  }, [visible, group]);

  const update = (next: Suggestion) => setRows(list => (list ?? []).map(x => (x.id === next.id ? next : x)));
  const remove = (id: string) => setRows(list => (list ?? []).filter(x => x.id !== id));

  const tiles: { key: Filter; icon: typeof Heart; label: string; hint: string; count: number }[] = [
    { key: "backlog", icon: Sparkles, label: l("Belum dikirim", "To send"), hint: l("Siap dikirim ke klien", "Ready to send to the client"), count: counts.backlog ?? 0 },
    { key: "sent", icon: Send, label: l("Menunggu jawaban", "Awaiting reply"), hint: l("Sudah dikirim, belum ada respons", "Sent, no answer yet"), count: counts.sent ?? 0 },
    { key: "interested", icon: ThumbsUp, label: l("Tertarik", "Interested"), hint: l("Atur perkenalannya", "Arrange the introduction"), count: counts.interested ?? 0 },
    { key: "introduced", icon: Users, label: l("Sudah dikenalkan", "Introduced"), hint: l("Sedang berproses", "In progress"), count: counts.introduced ?? 0 },
  ];

  const chips: { key: Filter; label: string }[] = [
    { key: "open", label: l("Perlu tindakan", "Needs action") },
    ...SUGGESTION_STATUSES.map(s => ({ key: s as Filter, label: STATUS_META[s][lang] })),
    { key: "all", label: l("Semua", "All") },
  ];

  const selectCls = "h-10 rounded-xl border bg-white px-3 text-[13px] text-slate-700 focus:outline-none";

  return (
    <div className="min-h-screen" style={{ background: "#EEF2F7" }}>
      <div className="max-w-5xl mx-auto px-4 md:px-5 py-6">
        {/* header */}
        <div className="rounded-2xl p-5 md:p-6 mb-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #6B2A5E 60%, #C4294A 100%)" }}>
          <Heart className="absolute -right-6 -bottom-8 w-40 h-40 opacity-10" />
          <div className="relative flex flex-wrap items-start gap-4">
            <div className="flex-1 min-w-[220px]">
              <h1 className="text-[22px] font-bold">{l("Saran Jodoh", "Match Suggestions")}</h1>
              <p className="text-[13px] text-white/80 mt-1 max-w-xl">
                {l("Siapa cocok untuk siapa, kenapa cocok, dan sampai mana prosesnya. Simpan sekarang, kirim ke klien nanti, lalu catat tanggapannya.",
                   "Who suits whom, why, and where each one stands. Save it now, send it to the client later, then note how they reacted.")}
              </p>
            </div>
            <button onClick={() => setAdding(null)}
              className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-2.5 rounded-xl bg-white hover:bg-white/90 shrink-0" style={{ color: "#9B2242" }}>
              <Plus className="w-4 h-4" /> {l("Sarankan jodoh", "Suggest a match")}
            </button>
          </div>
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
            {tiles.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)}
                className="text-left rounded-xl px-3.5 py-3 transition-colors"
                style={{ background: filter === t.key ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>
                <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-white/85"><t.icon className="w-3.5 h-3.5" /> {t.label}</div>
                <div className="text-[26px] font-bold leading-tight mt-0.5">{t.count}</div>
                <div className="text-[10.5px] text-white/70">{t.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {/* search + filters */}
        <div className="rounded-2xl bg-white border p-3 mb-4 flex flex-col gap-3" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[220px] flex items-center gap-2 rounded-xl border px-3 h-10" style={{ borderColor: "#E2E8F0" }}>
              <Search className="w-4 h-4 text-slate-400" />
              <input value={q} onChange={e => setQ(e.target.value)}
                placeholder={l("Cari nama, kota, negara, pekerjaan, alasan, atau catatan", "Search name, city, country, job, reason or notes")}
                className="flex-1 text-[13px] focus:outline-none bg-transparent" />
            </div>
            <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className={selectCls} style={{ borderColor: "#E2E8F0" }}>
              <option value="all">{l("Semua klien", "All clients")}</option>
              {clients.map(c => <option key={c.uid} value={c.uid}>{c.name}</option>)}
            </select>
            <select value={fitFilter} onChange={e => setFitFilter(e.target.value as FitFilter)} className={selectCls} style={{ borderColor: "#E2E8F0" }}>
              <option value="any">{l("Semua tingkat kecocokan", "Any fit")}</option>
              <option value="strong">{l("Cocok", "Strong fit")}</option>
              <option value="mixed">{l("Sebagian cocok", "Mixed fit")}</option>
              <option value="weak">{l("Kurang cocok", "Weak fit")}</option>
              <option value="unknown">{l("Data belum cukup", "Not enough info")}</option>
            </select>
            <select value={originFilter} onChange={e => setOriginFilter(e.target.value as OriginFilter)} className={selectCls} style={{ borderColor: "#E2E8F0" }}>
              <option value="any">{l("Semua sumber", "Any source")}</option>
              <option value="candidate_request">{ORIGIN_META.candidate_request[lang]} ({(rows ?? []).filter(s => s.origin === "candidate_request").length})</option>
              <option value="team">{ORIGIN_META.team[lang]} ({(rows ?? []).filter(s => s.origin === "team").length})</option>
            </select>
            <div className="inline-flex rounded-xl p-1 h-10" style={{ background: "#F1F5F9" }}>
              {(["client", "none"] as const).map(g => (
                <button key={g} onClick={() => setGroup(g)} className="text-[12px] font-semibold px-3 rounded-lg"
                  style={group === g ? { background: "#fff", color: "#0F172A", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" } : { color: "#64748B" }}>
                  {g === "client" ? l("Per klien", "By client") : l("Terbaru", "Newest")}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
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
        </div>

        {/* list */}
        {error ? (
          <p className="text-[13px] text-red-600">{error}</p>
        ) : !rows ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl bg-white border p-10 text-center" style={{ borderColor: "#E2E8F0" }}>
            <p className="text-[14px] font-semibold text-slate-700 mb-1">
              {rows.length === 0 ? l("Belum ada saran jodoh", "No suggestions yet") : l("Tidak ada yang cocok dengan filter ini", "Nothing matches these filters")}
            </p>
            <p className="text-[12.5px] text-slate-500">
              {l("Klik Sarankan jodoh, atau buka profil kandidat dan tambahkan dari sana.", "Click Suggest a match, or open a candidate's page and add one there.")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map(g => (
              <section key={g.key}>
                {g.client && (
                  <div className="rounded-2xl p-4 mb-2.5 border bg-white" style={{ borderColor: "#E2E8F0", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="flex-1 min-w-[240px]">
                        <ProfileSnapshot p={g.client} lang={lang} role={l("Klien", "Client")} size={72} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex flex-wrap justify-end gap-1">
                          {g.items.some(s => s.origin === "candidate_request") && (
                            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full border"
                              style={{ color: ORIGIN_META.candidate_request.color, background: ORIGIN_META.candidate_request.bg, borderColor: ORIGIN_META.candidate_request.border }}>
                              ♥ {g.items.filter(s => s.origin === "candidate_request").length} {l("meminta profilnya", "asked for this profile")}
                            </span>
                          )}
                          {SUGGESTION_STATUSES.filter(st => g.items.some(s => s.status === st)).map(st => (
                            <span key={st} className="text-[10.5px] font-bold px-2 py-0.5 rounded-full border"
                              style={{ color: STATUS_META[st].color, background: STATUS_META[st].bg, borderColor: STATUS_META[st].border }}>
                              {g.items.filter(s => s.status === st).length} {STATUS_META[st][lang]}
                            </span>
                          ))}
                        </div>
                        <button onClick={() => setAdding(g.client)}
                          className="text-[12px] font-bold px-3 py-1.5 rounded-lg border hover:bg-slate-50 inline-flex items-center gap-1" style={{ borderColor: "#E2E8F0", color: "#9B2242" }}>
                          <Plus className="w-3.5 h-3.5" /> {l(`Sarankan untuk ${g.client.name.split(" ")[0]}`, `Suggest for ${g.client.name.split(" ")[0]}`)}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className={`flex flex-col gap-2.5 ${g.client ? "md:pl-6 md:border-l-2" : ""}`} style={{ borderColor: "#E2E8F0" }}>
                  {g.items.map(s => (
                    <SuggestionRow key={s.id} s={s} show={group === "client" ? "candidate" : "both"} lang={lang} onChanged={update} onDeleted={remove} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {adding !== false && (
        <AddSuggestion fixed={adding} fixedRole="client" lang={lang}
          exclude={new Set(adding ? (rows ?? []).filter(s => s.clientUid === adding.uid).map(s => s.candidateUid) : [])}
          onAdded={s => setRows(list => [s, ...(list ?? [])])} onClose={() => setAdding(false)} />
      )}
    </div>
  );
}
