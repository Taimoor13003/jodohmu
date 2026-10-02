"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink, Images, Inbox, Loader2, Pencil, Plus, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { LEAD_PREFIX, autoValues, findPage, suggestPages, type CardPerson, type SocialPageKey } from "@/lib/social";
import { authFetch } from "@/components/admin/share-api";
import { SocialComposer, type PostRow } from "./social-post-panel";
import SocialHub, { type HubData } from "./social-hub";
import LoginStatus from "./login-status";
import SubpageLeadForm from "./subpage-lead-form";
import { OriginBadge, StatusBadge } from "./calldesk/shared";
import { SOCIAL_ACCOUNTS, findSocialAccount, type SocialAccountKey } from "@/lib/social-accounts";

// How many people the list draws at once; searching narrows it down to the rest
const LIST_LIMIT = 250;

const C = { border: "#E2E8F0", text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8", navy: "#1B3A6B" };

/* Admin → Subpages: one tab per public account. "Inbox & posting" handles its Instagram, Facebook and Threads
   in one place; "Client cards" builds a faceless card for a client or a Call Desk lead and posts it to the
   page's Instagram, and is where a new lead for that page is added. The page wraps this with the admin check. */
export default function SubpagesScreen() {
  const { lang: rawLang } = useLanguage();
  const lang = rawLang === "id" ? "id" : "en";
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Account, view and profile live in the URL, so "Post to subpage" elsewhere (and the Threads login) can link straight here
  const account = (findSocialAccount(params.get("page") ?? "")?.key ?? "nikahin_foreigner") as SocialAccountKey;
  const accountInfo = findSocialAccount(account)!;
  const cardPage = findPage(account);
  const view = params.get("view") === "cards" || (params.get("profile") && params.get("view") !== "inbox") ? "cards" : "inbox";
  const go = (next: { page?: string; view?: string; profile?: string | null }) => {
    const q = new URLSearchParams({ page: next.page ?? account, view: next.view ?? view });
    const profile = next.profile === undefined ? params.get("profile") : next.profile;
    if (profile && (next.page ?? account) === account) q.set("profile", profile);
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };
  const [threadsOn, setThreadsOn] = useState<HubData["accounts"]>([]);
  const notice = params.get("connected") ? t("Threads terhubung.", "Threads connected.") : null;
  const loginError = params.get("error");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-[#C4294A]">Subpages</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("Kelola akun sosial kita", "Manage our social accounts")}</h1>

      <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border bg-white p-1" style={{ borderColor: C.border }}>
        {SOCIAL_ACCOUNTS.map((a) => (
          <button key={a.key} type="button" onClick={() => go({ page: a.key, profile: null })}
            className="flex shrink-0 flex-col items-start rounded-lg px-4 py-2 text-left transition"
            style={account === a.key ? { background: a.accent, color: "white" } : { color: C.label }}>
            <span className="text-sm font-bold">@{a.handle}</span>
            <span className="text-[11px] opacity-80">{a.label}{threadsOn.find((x) => x.key === a.key)?.threads ? " · Threads ✓" : ""}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 inline-flex rounded-xl border bg-white p-1" style={{ borderColor: C.border }}>
        {([["inbox", t("Inbox & posting", "Inbox & posting"), Inbox], ["cards", t("Kartu klien", "Client cards"), Images]] as const).map(([key, label, Icon]) => (
          <button key={key} type="button" onClick={() => go({ view: key })}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-bold"
            style={view === key ? { background: C.navy, color: "white" } : { color: C.label }}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
      <div className="mt-4"><LoginStatus key={account} accountKey={account} lang={lang} /></div>
      {loginError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{loginError}</p>}

      <div className="mt-4">
        {view === "inbox"
          ? <SocialHub key={account} accountKey={account} lang={lang} notice={notice} onAccounts={setThreadsOn} />
          : cardPage
            ? <ClientCards key={cardPage.key} page={cardPage.key} lang={lang} selectedId={params.get("profile")} onSelect={(id) => go({ profile: id })} />
            : <p className="rounded-2xl border bg-white px-5 py-16 text-center text-sm" style={{ borderColor: C.border, color: C.muted }}>
                {t(`Kartu klien hanya untuk subpage, bukan @${accountInfo.handle}.`, `Client cards are for the niche pages, not @${accountInfo.handle}.`)}
              </p>}
      </div>
    </div>
  );
}

// Pick a client or lead (or add a lead), shape their card, post it to the page's Instagram
function ClientCards({ page, lang, selectedId, onSelect }: {
  page: SocialPageKey; lang: "id" | "en"; selectedId: string | null; onSelect: (id: string) => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const pageInfo = findPage(page)!;
  const { role, permissions } = useAuth();
  const canOpenCallDesk = role === "admin" || permissions.includes("calldesk");
  const [profiles, setProfiles] = useState<CardPerson[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyFits, setOnlyFits] = useState(false);
  const [kind, setKind] = useState<"all" | "client" | "lead" | "page">("all");
  // The lead form: adding one to this page, or correcting the one named here
  const [leadForm, setLeadForm] = useState<"new" | CardPerson | null>(null);
  // Goes up when a lead's details are corrected, so the composer starts again from the new details
  const [edits, setEdits] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await authFetch<{ posts: PostRow[]; profiles: CardPerson[] }>(`/api/admin/social?page=${page}`);
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
      .filter((p) => kind === "all" || (kind === "page" ? p.origin === page : p.kind === kind))
      .filter((p) => (!onlyFits || p.fits) && (!needle || `${p.auto.name} ${p.auto.city} ${p.auto.occupation}`.toLowerCase().includes(needle)))
      // This page's own leads lead the list, then whoever fits the page
      .sort((a, b) => Number(b.origin === page) - Number(a.origin === page) || Number(b.fits) - Number(a.fits) || Number(a.isTest) - Number(b.isTest) || a.auto.name.localeCompare(b.auto.name));
  }, [profiles, query, onlyFits, kind, page]);
  // A link from the Call Desk names the lead; once they have registered, their client profile is the one listed
  const selected = profiles.find((p) => p.id === selectedId)
    ?? profiles.find((p) => p.kind === "client" && p.contactId && `${LEAD_PREFIX}${p.contactId}` === selectedId) ?? null;
  const counts = useMemo(() => ({
    all: profiles.length,
    client: profiles.filter((p) => p.kind === "client").length,
    lead: profiles.filter((p) => p.kind === "lead").length,
    page: profiles.filter((p) => p.origin === page).length,
  }), [profiles, page]);

  return (
    <div>
      {!pageInfo.connected && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          {t(`@${pageInfo.handle} belum terhubung ke poster Instagram.`, `@${pageInfo.handle} isn't connected to the Instagram poster yet.`)}
        </p>
      )}
      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* ── choose a profile ── */}
        <aside className="space-y-3">
          <div className="rounded-2xl border bg-white p-3" style={{ borderColor: C.border }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t("Pilih profil", "Choose a profile")}</p>
              <button type="button" onClick={() => setLeadForm("new")} title={t(`Tambah calon klien untuk @${pageInfo.handle}`, `Add a lead for @${pageInfo.handle}`)}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-white" style={{ background: pageInfo.accent }}>
                <Plus className="h-3.5 w-3.5" />{t("Tambah calon klien", "Add lead")}
              </button>
            </div>
            <label className="relative mt-2 flex items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Cari nama, kota, pekerjaan", "Search name, city, job")} className="h-9 w-full rounded-lg border pl-9 pr-3 text-sm" style={{ borderColor: C.border }} />
            </label>
            <label className="mt-2 flex items-center gap-2 text-xs font-semibold" style={{ color: C.label }}>
              <input type="checkbox" checked={onlyFits} onChange={(e) => setOnlyFits(e.target.checked)} />
              {t(`Hanya yang cocok untuk @${pageInfo.handle}`, `Only profiles that fit @${pageInfo.handle}`)}
            </label>
            <div className="mt-2 flex flex-wrap gap-1">
              {([["all", t("Semua", "All")], ["client", t("Klien", "Clients")], ["lead", t("Calon klien", "Leads")], ["page", t(`Dari @${pageInfo.handle}`, `From @${pageInfo.handle}`)]] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setKind(key)}
                  className="rounded-full border px-2.5 py-1 text-[11px] font-bold"
                  style={kind === key ? { background: C.navy, borderColor: C.navy, color: "white" } : { borderColor: C.border, color: C.label }}>
                  {label} <span className="opacity-70">{counts[key]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
            {loading && <div className="grid place-items-center py-10"><Loader2 className="h-5 w-5 animate-spin text-[#1B3A6B]" /></div>}
            {!loading && !rows.length && <p className="py-8 text-center text-sm text-slate-400">{t("Tidak ada profil yang cocok.", "No matching profiles.")}</p>}
            {rows.slice(0, LIST_LIMIT).map((p) => {
              const active = p.id === selected?.id;
              const posted = postedBy.get(p.id);
              return (
                <button key={p.id} type="button" onClick={() => onSelect(p.id)}
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-left transition hover:shadow-sm"
                  style={{ borderColor: active ? pageInfo.accent : C.border, boxShadow: active ? `0 0 0 1px ${pageInfo.accent}` : undefined }}>
                  <div className="flex items-center gap-1.5">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-bold" style={{ color: C.text }}>{p.auto.name || t("(tanpa nama)", "(no name)")}</span>
                    {p.kind === "lead" && <span className="rounded bg-amber-50 px-1.5 text-[10px] font-bold text-amber-700">{t("calon klien", "lead")}</span>}
                    {p.fits && <span className="rounded bg-emerald-50 px-1.5 text-[10px] font-bold text-emerald-700">{t("cocok", "fits")}</span>}
                    {posted && <span className="rounded bg-indigo-50 px-1.5 text-[10px] font-bold text-indigo-700">{t("terposting", "posted")}</span>}
                    {p.isTest && <span className="rounded bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">test</span>}
                  </div>
                  <p className="mt-0.5 truncate text-[11px]" style={{ color: C.muted }}>{[p.auto.headline, p.auto.city, p.auto.occupation].filter(Boolean).join(" · ") || "—"}</p>
                  {/* Which of our pages the person came in through */}
                  {p.origin && <div className="mt-1.5 flex"><OriginBadge origin={p.origin} /></div>}
                </button>
              );
            })}
            {rows.length > LIST_LIMIT && (
              <p className="py-2 text-center text-[11px]" style={{ color: C.muted }}>
                {t(`Menampilkan ${LIST_LIMIT} dari ${rows.length}. Cari nama untuk menemukan yang lain.`, `Showing ${LIST_LIMIT} of ${rows.length}. Search by name to find the rest.`)}
              </p>
            )}
          </div>
        </aside>

        {/* ── compose ── */}
        <section className="min-w-0 space-y-5">
          <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: C.border }}>
            {selected ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3" style={{ borderColor: C.border }}>
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <p className="text-sm font-bold" style={{ color: C.text }}>
                      {autoValues(selected.profile).name || "—"} <span className="font-semibold" style={{ color: C.muted }}>→ @{pageInfo.handle}</span>
                    </p>
                    {selected.origin && <OriginBadge origin={selected.origin} />}
                    {selected.leadStatus && <StatusBadge status={selected.leadStatus} />}
                  </div>
                  {selected.kind === "lead" ? (
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setLeadForm(selected)} className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: C.navy }}>
                        <Pencil className="h-3 w-3" />{t("Ubah data", "Edit details")}
                      </button>
                      {canOpenCallDesk && <a href={`/admin/calls?contact=${encodeURIComponent(selected.contactId ?? "")}`} className="text-xs font-bold" style={{ color: C.navy }}>{t("Buka di Call Desk", "Open in Call Desk")}</a>}
                    </div>
                  ) : (
                    <a href={`/admin/candidates/${selected.id}/crm`} className="text-xs font-bold" style={{ color: C.navy }}>{t("Buka CRM", "Open CRM")}</a>
                  )}
                </div>
                <SocialComposer key={`${selected.id}_${page}_${edits}`} candidateId={selected.id} profile={selected.profile} lang={lang} page={page} onPosted={load} compact />
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

      {leadForm && (
        <SubpageLeadForm
          page={page}
          lang={lang}
          lead={leadForm === "new" ? null : leadForm}
          onClose={() => setLeadForm(null)}
          onSaved={async (id) => { await load(); setLeadForm(null); setEdits((n) => n + 1); onSelect(id); }}
        />
      )}
    </div>
  );
}
