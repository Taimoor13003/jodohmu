"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Instagram, Loader2, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SOCIAL_PAGES, autoValues, findPage, suggestPages, type SocialPageKey } from "@/lib/social";
import { authFetch } from "@/components/admin/share-api";
import { SocialComposer, type PostRow } from "./social-post-panel";

type ProfileRow = { id: string; personStatus: string | null; isTest: boolean; profile: Record<string, unknown> };

const C = { border: "#E2E8F0", text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8", navy: "#1B3A6B" };

/* Admin → Subpages: one tab per niche Instagram page. Pick a profile, shape its card, post it.
   The page wraps this with the admin check. */
export default function SubpagesScreen() {
  const { lang: rawLang } = useLanguage();
  const lang = rawLang === "id" ? "id" : "en";
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // The chosen page and profile live in the URL, so "Post to subpage" elsewhere can link straight here
  const page = (findPage(params.get("page") ?? "")?.key ?? "nikahin_foreigner") as SocialPageKey;
  const selectedId = params.get("profile");
  const pageInfo = findPage(page)!;
  const go = (next: { page?: string; profile?: string | null }) => {
    const q = new URLSearchParams({ page: next.page ?? page });
    const profile = next.profile === undefined ? selectedId : next.profile;
    if (profile) q.set("profile", profile);
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyFits, setOnlyFits] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await authFetch<{ posts: PostRow[]; profiles: ProfileRow[] }>(`/api/admin/social?page=${page}`);
      setProfiles(data.profiles);
      setPosts(data.posts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const postedBy = useMemo(() => new Map(posts.filter((p) => p.status === "published").map((p) => [p.candidateId, p])), [posts]);
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return profiles
      .map((p) => ({ ...p, auto: autoValues(p.profile), fits: suggestPages(p.profile).includes(page) }))
      .filter((p) => p.auto.name || p.auto.headline)
      .filter((p) => (!onlyFits || p.fits) && (!needle || `${p.auto.name} ${p.auto.city} ${p.auto.occupation}`.toLowerCase().includes(needle)))
      .sort((a, b) => Number(b.fits) - Number(a.fits) || Number(a.isTest) - Number(b.isTest) || a.auto.name.localeCompare(b.auto.name));
  }, [profiles, query, onlyFits, page]);
  const selected = profiles.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-[#C4294A]">Subpages</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("Posting profil ke halaman Instagram", "Post profiles to our Instagram pages")}</h1>

      <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border bg-white p-1" style={{ borderColor: C.border }}>
        {SOCIAL_PAGES.map((p) => (
          <button key={p.key} type="button" onClick={() => go({ page: p.key })}
            className="flex shrink-0 flex-col items-start rounded-lg px-4 py-2 text-left transition"
            style={page === p.key ? { background: p.accent, color: "white" } : { color: C.label }}>
            <span className="flex items-center gap-1.5 text-sm font-bold"><Instagram className="h-3.5 w-3.5" />@{p.handle}</span>
            <span className="text-[11px] opacity-80">{p.label}{!p.connected && ` · ${t("belum terhubung", "not connected yet")}`}</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

      <div className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* ── choose a profile ── */}
        <aside className="space-y-3">
          <div className="rounded-2xl border bg-white p-3" style={{ borderColor: C.border }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t("Pilih profil", "Choose a profile")}</p>
            <label className="relative mt-2 flex items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Cari nama, kota, pekerjaan", "Search name, city, job")} className="h-9 w-full rounded-lg border pl-9 pr-3 text-sm" style={{ borderColor: C.border }} />
            </label>
            <label className="mt-2 flex items-center gap-2 text-xs font-semibold" style={{ color: C.label }}>
              <input type="checkbox" checked={onlyFits} onChange={(e) => setOnlyFits(e.target.checked)} />
              {t(`Hanya yang cocok untuk @${pageInfo.handle}`, `Only profiles that fit @${pageInfo.handle}`)}
            </label>
          </div>

          <div className="max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
            {loading && <div className="grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin text-[#1B3A6B]" /></div>}
            {!loading && !rows.length && <p className="py-8 text-center text-sm text-slate-400">{t("Tidak ada profil yang cocok.", "No matching profiles.")}</p>}
            {rows.map((p) => {
              const active = p.id === selectedId;
              const posted = postedBy.get(p.id);
              return (
                <button key={p.id} type="button" onClick={() => go({ profile: p.id })}
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-left transition hover:shadow-sm"
                  style={{ borderColor: active ? pageInfo.accent : C.border, boxShadow: active ? `0 0 0 1px ${pageInfo.accent}` : undefined }}>
                  <div className="flex items-center gap-1.5">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-bold" style={{ color: C.text }}>{p.auto.name || t("(tanpa nama)", "(no name)")}</span>
                    {p.fits && <span className="rounded bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-700">{t("cocok", "fits")}</span>}
                    {posted && <span className="rounded bg-indigo-50 px-1.5 text-[10px] font-bold text-indigo-700">{t("terposting", "posted")}</span>}
                    {p.isTest && <span className="rounded bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">test</span>}
                  </div>
                  <p className="mt-0.5 truncate text-[11px]" style={{ color: C.muted }}>{[p.auto.headline, p.auto.city, p.auto.occupation].filter(Boolean).join(" · ") || "—"}</p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── compose ── */}
        <section className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: C.border }}>
            {selected ? (
              <>
                <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: C.border }}>
                  <p className="text-sm font-bold" style={{ color: C.text }}>
                    {autoValues(selected.profile).name || "—"} <span className="font-semibold" style={{ color: C.muted }}>→ @{pageInfo.handle}</span>
                  </p>
                  <a href={`/admin/candidates/${selected.id}/crm`} className="text-xs font-bold" style={{ color: C.navy }}>{t("Buka CRM", "Open CRM")}</a>
                </div>
                <SocialComposer key={`${selected.id}_${page}`} candidateId={selected.id} profile={selected.profile} lang={lang} page={page} onPosted={load} compact />
              </>
            ) : (
              <p className="px-5 py-16 text-center text-sm" style={{ color: C.muted }}>
                {t(`Pilih profil di kiri untuk membuat kartu @${pageInfo.handle}.`, `Choose a profile on the left to build its @${pageInfo.handle} card.`)}
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-5" style={{ borderColor: C.border }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>
              {t(`Sudah diposting di @${pageInfo.handle}`, `Posted on @${pageInfo.handle}`)} ({postedBy.size})
            </p>
            {postedBy.size ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from(postedBy.values()).map((p) => (
                  <div key={p.candidateId} className="flex gap-3 rounded-xl border p-2" style={{ borderColor: C.border }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.imageUrl && <img src={p.imageUrl} alt="" className="h-20 w-16 shrink-0 rounded-md object-cover" />}
                    <div className="min-w-0 flex-1 text-[12px]">
                      <p className="flex items-center gap-1 font-bold" style={{ color: C.text }}><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />{p.candidateName || p.code}</p>
                      <p style={{ color: C.muted }}>{p.code}{p.at && ` · ${new Date(p.at).toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "short" })}`}{p.byName && ` · ${p.byName}`}</p>
                      {p.permalink && <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 font-bold" style={{ color: C.navy }}>{t("Lihat post", "View post")}<ExternalLink className="h-3 w-3" /></a>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm" style={{ color: C.muted }}>{t("Belum ada.", "Nothing yet.")}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
