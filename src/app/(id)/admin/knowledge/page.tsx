"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { callDeskFetch, formatDay, useL } from "@/components/admin/calldesk/shared";
import { KNOWLEDGE_CATEGORIES, type KnowledgeEntry } from "@/lib/knowledge";

// The team's knowledge base: what we have learned from leads, calls and numbers, by topic. Admins only.
export default function KnowledgePage() {
  const { role, loading } = useAuth();
  const l = useL();
  const { lang } = useLanguage();
  const [entries, setEntries] = useState<KnowledgeEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");

  const load = useCallback(async () => {
    try {
      setEntries((await callDeskFetch<{ entries: KnowledgeEntry[] }>("/api/admin/calldesk?knowledge=1")).entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    }
  }, []);
  useEffect(() => { if (role === "admin") load(); }, [role, load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (entries ?? []).filter((e) =>
      (!category || e.category === category)
      && (!q || `${e.title} ${e.body} ${e.evidence.join(" ")}`.toLowerCase().includes(q)));
  }, [entries, query, category]);

  if (loading) return null;
  if (role !== "admin") return <p className="p-6 text-sm text-slate-500">Only admins can see the knowledge base.</p>;

  const lastUpdate = (entries ?? []).map((e) => e.updatedAt ?? "").sort().pop();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-[#C4294A]">Admin</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{l({ id: "Pengetahuan", en: "Knowledge base" })}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {l({ id: "Apa yang kita pelajari dari calon klien, telepon, dan angka — diperbarui setiap sinkronisasi CRM.", en: "What we have learned from leads, calls and numbers — updated on every CRM sync." })}
        {lastUpdate ? ` ${l({ id: "Terakhir diperbarui", en: "Last updated" })} ${formatDay(lastUpdate.slice(0, 10), lang, { day: "numeric", month: "short", year: "numeric" })}.` : ""}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <label className="relative min-w-[14rem] flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={l({ id: "Cari…", en: "Search…" })} className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm" />
        </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">
          <option value="">{l({ id: "Semua topik", en: "All topics" })}</option>
          {KNOWLEDGE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{l(c.label)}</option>)}
        </select>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-rose-600">{error}</p>}
      {!entries && !error && <Loader2 className="mt-6 h-6 w-6 animate-spin text-[#1B3A6B]" />}

      <div className="mt-6 space-y-8">
        {KNOWLEDGE_CATEGORIES.map((c) => {
          const items = visible.filter((e) => e.category === c.value).sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title));
          if (!items.length) return null;
          return (
            <section key={c.value}>
              <h2 className="text-lg font-bold text-slate-900">{l(c.label)}</h2>
              <p className="text-xs text-slate-400">{l(c.hint)}</p>
              <div className="mt-3 space-y-3">
                {items.map((e) => (
                  <article key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-bold text-slate-900">{e.title}</h3>
                    <div className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                      {e.body.split("\n").map((line, i) => line.startsWith("- ")
                        ? <p key={i} className="pl-4 -indent-3">• {line.slice(2)}</p>
                        : line.trim() ? <p key={i}>{line}</p> : <div key={i} className="h-2" />)}
                    </div>
                    {e.evidence.length > 0 && (
                      <p className="mt-3 text-[11px] text-slate-400">{l({ id: "Berdasarkan", en: "Based on" })}: {e.evidence.join(", ")}</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
        {entries && !visible.length && <p className="text-sm text-slate-400">{l({ id: "Belum ada catatan.", en: "Nothing here yet." })}</p>}
      </div>
    </div>
  );
}
