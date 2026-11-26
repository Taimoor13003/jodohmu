"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Check, ExternalLink, Heart, HelpCircle, Loader2, MessageSquarePlus, Plus, Search, Trash2, X } from "lucide-react";
import { displayValue } from "@/lib/share-display";
import { fitChecks, fitSummary } from "@/lib/match-fit";
import { auth } from "@/lib/firebase";
import {
  ORIGIN_META,
  SUGGESTION_ORIGINS,
  STATUS_META,
  SUGGESTION_STATUSES,
  type Suggestion,
  type SuggestionOrigin,
  type SuggestionPerson,
  type SuggestionStatus,
} from "@/lib/match-suggestions";

type Lang = "id" | "en";

/* ── fetch helper ─────────────────────────────────────────────────────── */
export async function teamFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  // On a fresh page load Firebase restores the session asynchronously
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const res = await fetch(url, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${await user.getIdToken()}`, "Content-Type": "application/json" },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error ?? "Request failed"), { status: res.status });
  return body as T;
}

function timeAgo(iso: string | null, lang: Lang): string {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return lang === "id" ? "hari ini" : "today";
  if (days === 1) return lang === "id" ? "kemarin" : "yesterday";
  return lang === "id" ? `${days} hari lalu` : `${days}d ago`;
}

function fmtDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/* ── small pieces ─────────────────────────────────────────────────────── */
export function Avatar({ p, size = 40, square = false }: { p: SuggestionPerson; size?: number; square?: boolean }) {
  const radius = square ? Math.round(size * 0.22) : size;
  return p.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={p.photo} alt={p.name} className="object-cover object-top shrink-0" style={{ width: size, height: size, borderRadius: radius }} />
  ) : (
    <div className="shrink-0 flex items-center justify-center text-white font-bold"
      style={{ width: size, height: size, borderRadius: radius, fontSize: size * 0.38, background: p.gender === "female" ? "#C4294A" : "#1B3A6B" }}>
      {p.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function personLine(p: SuggestionPerson) {
  return [p.age, p.city].filter(Boolean).join(" · ");
}

const val = (p: SuggestionPerson, field: string, lang: Lang) => displayValue(p.facts?.[field], lang, field);

/** Short facts about who the person is, in reading order. */
function personChips(p: SuggestionPerson, lang: Lang): string[] {
  const l = (id: string, en: string) => (lang === "id" ? id : en);
  const kids = Number(p.facts?.childrenCount) || 0;
  const status = val(p, "maritalStatus", lang);
  const job = val(p, "occupation", lang) ?? val(p, "jobPosition", lang);
  const height = val(p, "height", lang);
  return [
    val(p, "nationality", lang),
    status && (kids ? `${status} · ${kids} ${l("anak", kids === 1 ? "child" : "children")}` : status),
    job,
    val(p, "educations", lang),
    val(p, "religiousPracticeLevel", lang),
    p.gender === "female" ? val(p, "hijab", lang) && `${l("Hijab", "Hijab")}: ${val(p, "hijab", lang)}` : val(p, "beard", lang) && `${l("Jenggot", "Beard")}: ${val(p, "beard", lang)}`,
    height && `${height} cm`,
  ].filter((x): x is string => !!x);
}

/** One line on what the person is looking for. */
function wantsLine(p: SuggestionPerson, lang: Lang): string | null {
  const l = (id: string, en: string) => (lang === "id" ? id : en);
  const f = p.facts ?? {};
  const min = f.preferredMinAge, max = f.preferredMaxAge;
  const parts = [
    (min || max) && `${l("usia", "age")} ${min ?? "?"}–${max ?? "?"}`,
    val(p, "preferredReligion", lang),
    f.prefReligionLevel && f.prefReligionLevel !== "no_pref" && val(p, "prefReligionLevel", lang),
    f.prefSmokingAcceptance === "not_accepted" && l("bukan perokok", "non-smoker"),
    f.prefChildrenFromPrevious === "accepted" && l("menerima yang punya anak", "OK with children"),
    f.prefChildrenFromPrevious === "not_accepted" && l("tanpa anak", "no children from before"),
    f.prefMinHeight && `${f.prefMinHeight}+ cm`,
  ].filter(Boolean) as string[];
  const traits = typeof f.preferredPersonalityTraits === "string" ? f.preferredPersonalityTraits.trim() : "";
  if (!parts.length && !traits) return null;
  return [parts.join(", "), traits].filter(Boolean).join(" — ");
}

/** Who someone is and what they want: the team's at-a-glance view of a profile. */
export function ProfileSnapshot({ p, lang, role, size = 64 }: { p: SuggestionPerson; lang: Lang; role?: string; size?: number }) {
  const l = (id: string, en: string) => (lang === "id" ? id : en);
  const chips = personChips(p, lang);
  const wants = wantsLine(p, lang);
  const about = typeof p.facts?.aboutMe === "string" ? p.facts.aboutMe : "";
  return (
    <div className="flex gap-3.5 min-w-0">
      <Avatar p={p} size={size} square />
      <div className="min-w-0 flex-1">
        {role && <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{role}</p>}
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Link href={`/admin/candidates/${p.uid}`} className="text-[15px] font-bold text-slate-900 hover:underline">{p.name}</Link>
          <span className="text-[12.5px] text-slate-500">{personLine(p)}</span>
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {chips.map(c => <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{c}</span>)}
          </div>
        )}
        {about && <p className="text-[12px] text-slate-500 mt-1.5 leading-snug line-clamp-2">{about}</p>}
        {wants && (
          <p className="text-[12px] mt-1.5 leading-snug text-slate-600 line-clamp-2">
            <span className="font-semibold" style={{ color: "#9B2242" }}>{l("Mencari", "Looking for")}: </span>{wants}
          </p>
        )}
        <div className="flex gap-3 mt-1.5">
          <Link href={`/admin/candidates/${p.uid}`} className="text-[11.5px] font-semibold text-slate-500 hover:text-slate-900">{l("Profil admin", "Admin page")} →</Link>
          {p.linkActive && (
            <a href={`/profile/${p.uid}`} target="_blank" rel="noopener noreferrer" className="text-[11.5px] font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
              {l("Link profil", "Profile link")} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const LEVEL_META = {
  strong:  { id: "Cocok", en: "Strong fit", color: "#047857", bg: "#ECFDF5", border: "#A7F3D0" },
  mixed:   { id: "Sebagian cocok", en: "Mixed fit", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  weak:    { id: "Kurang cocok", en: "Weak fit", color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
  unknown: { id: "Data belum cukup", en: "Not enough info", color: "#475569", bg: "#F1F5F9", border: "#E2E8F0" },
} as const;

export function FitBadge({ client, candidate, lang }: { client: SuggestionPerson; candidate: SuggestionPerson; lang: Lang }) {
  const sum = fitSummary(fitChecks(client, candidate));
  const m = LEVEL_META[sum.level];
  return (
    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap" style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      {m[lang]}{sum.good + sum.bad > 0 ? ` · ${sum.good}/${sum.good + sum.bad}` : ""}
    </span>
  );
}

/** Why the two fit (or don't), checked against each other's stated wishes. */
export function FitPanel({ client, candidate, lang }: { client: SuggestionPerson; candidate: SuggestionPerson; lang: Lang }) {
  const l = (id: string, en: string) => (lang === "id" ? id : en);
  const checks = fitChecks(client, candidate);
  const sum = fitSummary(checks);
  const m = LEVEL_META[sum.level];
  const order = { bad: 0, unknown: 1, good: 2 } as const;
  return (
    <div className="rounded-xl p-3" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <p className="text-[12.5px] font-bold" style={{ color: m.color }}>{m[lang]}</p>
        <p className="text-[11px] text-slate-500">
          {l(`${sum.good} cocok · ${sum.bad} bentrok · ${sum.unknown} perlu dicek`, `${sum.good} fit · ${sum.bad} clash · ${sum.unknown} to check`)}
        </p>
      </div>
      {checks.length === 0 ? (
        <p className="text-[12px] text-slate-500">{l("Belum ada kriteria yang bisa dibandingkan. Lengkapi kriteria pasangan di profil.", "Nothing to compare yet. Fill in partner criteria on the profiles.")}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {[...checks].sort((a, b) => order[a.result] - order[b.result]).map(c => (
            <li key={c.key} className="flex items-start gap-1.5 text-[12px] leading-snug text-slate-700">
              {c.result === "good" ? <Check className="w-3.5 h-3.5 mt-px shrink-0 text-emerald-600" />
                : c.result === "bad" ? <X className="w-3.5 h-3.5 mt-px shrink-0 text-red-600" />
                : <HelpCircle className="w-3.5 h-3.5 mt-px shrink-0 text-amber-600" />}
              <span>{c.text[lang]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StatusSelect({ value, lang, onChange, disabled }: {
  value: SuggestionStatus; lang: Lang; onChange: (s: SuggestionStatus) => void; disabled?: boolean;
}) {
  const m = STATUS_META[value];
  return (
    <select value={value} disabled={disabled} onChange={e => onChange(e.target.value as SuggestionStatus)}
      className="text-[11.5px] font-bold rounded-full pl-2.5 pr-6 py-1 border cursor-pointer focus:outline-none"
      style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      {SUGGESTION_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s][lang]}</option>)}
    </select>
  );
}

/** Who started the match: the team's idea, or the candidate came to us asking for this profile. */
export function OriginSelect({ value, lang, onChange, disabled }: {
  value: SuggestionOrigin; lang: Lang; onChange: (o: SuggestionOrigin) => void; disabled?: boolean;
}) {
  const m = ORIGIN_META[value];
  return (
    <select value={value} disabled={disabled} onChange={e => onChange(e.target.value as SuggestionOrigin)}
      title={m[lang]}
      className="text-[11.5px] font-bold rounded-full pl-2.5 pr-6 py-1 border cursor-pointer focus:outline-none"
      style={{ color: m.color, background: m.bg, borderColor: m.border }}>
      {SUGGESTION_ORIGINS.map(o => <option key={o} value={o}>{ORIGIN_META[o].short[lang]}</option>)}
    </select>
  );
}

/** Two-button switch used when adding a suggestion. */
export function OriginToggle({ value, lang, onChange, candidateName, clientName }: {
  value: SuggestionOrigin; lang: Lang; onChange: (o: SuggestionOrigin) => void; candidateName?: string; clientName?: string;
}) {
  const l = (id: string, en: string) => (lang === "id" ? id : en);
  const opts: { o: SuggestionOrigin; title: string; sub: string }[] = [
    { o: "team", title: l("Ide tim", "Our idea"), sub: l("Tim yang menyarankan pasangan ini", "The team thinks they'd suit each other") },
    { o: "candidate_request", title: l("Kandidat yang meminta", "Candidate asked"),
      sub: candidateName && clientName
        ? l(`${candidateName} menghubungi kami untuk profil ${clientName}`, `${candidateName} reached out to us for ${clientName}'s profile`)
        : l("Kandidat menghubungi kami untuk profil ini", "The candidate reached out to us for this profile") },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {opts.map(({ o, title, sub }) => {
        const on = value === o, m = ORIGIN_META[o];
        return (
          <button key={o} type="button" onClick={() => onChange(o)}
            className="text-left rounded-xl px-3 py-2 border transition-colors"
            style={on ? { background: m.bg, borderColor: m.color } : { borderColor: "#E2E8F0" }}>
            <span className="block text-[12.5px] font-bold" style={{ color: on ? m.color : "#334155" }}>{title}</span>
            <span className="block text-[11px] text-slate-500 leading-snug">{sub}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── one suggestion ───────────────────────────────────────────────────── */
/**
 * `show` picks whose card leads the row: on a client's page we show the suggested
 * candidate; on the candidate's page we show who they were suggested to; the
 * backlog shows both.
 */
export function SuggestionRow({ s, show, lang, onChanged, onDeleted }: {
  s: Suggestion;
  show: "candidate" | "client" | "both";
  lang: Lang;
  onChanged: (next: Suggestion) => void;
  onDeleted: (id: string) => void;
}) {
  const l = (id: string, en: string) => (lang === "id" ? id : en);
  const [busy, setBusy] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [editingReason, setEditingReason] = useState(false);
  const [reason, setReason] = useState(s.reason);

  const patch = async (body: Record<string, unknown>, optimistic: Partial<Suggestion>) => {
    setBusy(true);
    const before = s;
    onChanged({ ...s, ...optimistic });
    try {
      await teamFetch(`/api/admin/suggestions/${s.id}`, { method: "PATCH", body: JSON.stringify(body) });
    } catch (e) {
      onChanged(before);
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  const setStatus = (status: SuggestionStatus) =>
    patch({ status }, { status, ...(status === "sent" && !s.sentAt ? { sentAt: new Date().toISOString() } : {}) });

  const addNote = async () => {
    const text = note.trim();
    if (!text) return;
    const name = auth.currentUser?.displayName ?? l("Anda", "You");
    await patch({ note: text }, { notes: [...s.notes, { id: `tmp-${Date.now()}`, text, byUid: "", byName: name, at: new Date().toISOString() }] });
    setNote(""); setNoteOpen(false);
  };

  const saveReason = async () => {
    await patch({ reason }, { reason: reason.trim() });
    setEditingReason(false);
  };

  const remove = async () => {
    if (!confirm(l("Hapus saran ini?", "Remove this suggestion?"))) return;
    try {
      await teamFetch(`/api/admin/suggestions/${s.id}`, { method: "DELETE" });
      onDeleted(s.id);
    } catch (e) { toast.error((e as Error).message); }
  };

  const setOrigin = (origin: SuggestionOrigin) => patch({ origin }, { origin });

  const statusColor = STATUS_META[s.status].color;
  const asked = s.origin === "candidate_request";

  return (
    <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#E2E8F0", borderLeft: `4px solid ${statusColor}` }}>
      {asked && (
        <div className="px-4 py-2 text-[12px] font-semibold flex items-center gap-1.5 border-b"
          style={{ background: ORIGIN_META.candidate_request.bg, color: ORIGIN_META.candidate_request.color, borderColor: ORIGIN_META.candidate_request.border }}>
          <Heart className="w-3.5 h-3.5 fill-current" />
          {l(`${s.candidate.name} menghubungi kami dan meminta profil ${s.client.name}`, `${s.candidate.name} reached out to us asking for ${s.client.name}'s profile`)}
        </div>
      )}
      {/* who */}
      <div className="p-4">
        {show === "both" ? (
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 items-start">
            <ProfileSnapshot p={s.candidate} lang={lang} role={l("Profil yang disarankan", "Suggested profile")} size={56} />
            <div className="hidden md:flex items-center justify-center pt-6"><Heart className="w-4 h-4" style={{ color: "#C4294A" }} /></div>
            <ProfileSnapshot p={s.client} lang={lang} role={l("Untuk klien", "For client")} size={56} />
          </div>
        ) : (
          <ProfileSnapshot p={show === "client" ? s.client : s.candidate} lang={lang}
            role={show === "client" ? l("Disarankan ke", "Suggested to") : l("Profil yang disarankan", "Suggested profile")} />
        )}
      </div>

      {/* why + where it stands */}
      <div className="px-4 pb-4 grid md:grid-cols-2 gap-3">
        <FitPanel client={s.client} candidate={s.candidate} lang={lang} />
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusSelect value={s.status} lang={lang} onChange={setStatus} disabled={busy} />
              <OriginSelect value={s.origin} lang={lang} onChange={setOrigin} disabled={busy} />
            </div>
            <button onClick={remove} title={l("Hapus", "Remove")} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            {asked ? l("Dicatat", "Logged") : l("Disarankan", "Suggested")} {s.createdByName ? `${l("oleh", "by")} ${s.createdByName} ` : ""}{timeAgo(s.createdAt, lang)}
            {s.sentAt && <> · {l("dikirim", "sent")} {timeAgo(s.sentAt, lang)}</>}
          </p>

          {editingReason ? (
            <div className="flex flex-col gap-1.5">
              <textarea autoFocus rows={2} value={reason} onChange={e => setReason(e.target.value)}
                className="w-full text-[12.5px] rounded-lg px-3 py-2 border resize-none focus:outline-none focus:border-slate-400" style={{ borderColor: "#E2E8F0" }} />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setEditingReason(false); setReason(s.reason); }} className="text-[12px] font-semibold px-3 py-1 rounded-lg text-slate-500 hover:bg-slate-100">{l("Batal", "Cancel")}</button>
                <button onClick={saveReason} className="text-[12px] font-bold px-3 py-1 rounded-lg text-white" style={{ background: "#1B3A6B" }}>{l("Simpan", "Save")}</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingReason(true)} className="text-left rounded-lg px-3 py-2 text-[12.5px] hover:bg-slate-50 border border-dashed" style={{ borderColor: "#E2E8F0" }}>
              <span className="font-semibold text-slate-700">{asked ? l("Catatan permintaan", "About the request") : l("Kenapa cocok", "Why we suggested it")}: </span>
              <span className={s.reason ? "text-slate-600" : "text-slate-400"}>{s.reason || l("belum ditulis — klik untuk menambah", "not written yet — click to add")}</span>
            </button>
          )}

          {s.notes.map(n => (
            <div key={n.id} className="rounded-lg px-3 py-2 text-[12.5px]" style={{ background: "#F8FAFC" }}>
              <p className="text-slate-700 whitespace-pre-wrap leading-snug">{n.text}</p>
              <p className="text-[10.5px] text-slate-400 mt-0.5">{n.byName} · {n.at ? fmtDate(n.at, lang) : ""}</p>
            </div>
          ))}
          {noteOpen ? (
            <div className="flex flex-col gap-1.5">
              <textarea autoFocus rows={2} value={note} onChange={e => setNote(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote(); }}
                placeholder={l("Mis. Joko bilang kurang cocok karena …", "e.g. Joko said not a fit because …")}
                className="w-full text-[12.5px] rounded-lg px-3 py-2 border resize-none focus:outline-none focus:border-slate-400"
                style={{ borderColor: "#E2E8F0" }} />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setNoteOpen(false); setNote(""); }} className="text-[12px] font-semibold px-3 py-1 rounded-lg text-slate-500 hover:bg-slate-100">{l("Batal", "Cancel")}</button>
                <button onClick={addNote} disabled={!note.trim() || busy}
                  className="text-[12px] font-bold px-3 py-1 rounded-lg text-white disabled:opacity-40" style={{ background: "#1B3A6B" }}>
                  {l("Simpan catatan", "Save note")}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setNoteOpen(true)} className="self-start inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-500 hover:text-slate-800">
              <MessageSquarePlus className="w-3.5 h-3.5" /> {l("Tambah catatan / feedback", "Add note / feedback")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── picker to add a suggestion ───────────────────────────────────────── */
let peopleCache: SuggestionPerson[] | null = null;

export function AddSuggestion({ fixed, fixedRole, lang, exclude, onAdded, onClose }: {
  /** The person this page is about. */
  fixed: SuggestionPerson | null;
  /** Whether `fixed` is the client (we pick a profile for them) or the candidate (we pick a client). */
  fixedRole: "client" | "candidate";
  lang: Lang;
  exclude: Set<string>;
  onAdded: (s: Suggestion) => void;
  onClose: () => void;
}) {
  const l = (id: string, en: string) => (lang === "id" ? id : en);
  const [people, setPeople] = useState<SuggestionPerson[] | null>(peopleCache);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<SuggestionPerson | null>(null);
  const [client, setClient] = useState<SuggestionPerson | null>(fixed && fixedRole === "client" ? fixed : null);
  const [candidate, setCandidate] = useState<SuggestionPerson | null>(fixed && fixedRole === "candidate" ? fixed : null);
  const [reason, setReason] = useState("");
  const [origin, setOrigin] = useState<SuggestionOrigin>("team");
  const [saving, setSaving] = useState(false);
  const [sameGender, setSameGender] = useState(false);

  useEffect(() => {
    if (peopleCache) return;
    teamFetch<{ people: SuggestionPerson[] }>("/api/admin/suggestions?people=1")
      .then(r => { peopleCache = r.people; setPeople(r.people); })
      .catch(e => toast.error((e as Error).message));
  }, []);

  // The page only knows the basics about `fixed`; swap in the full record so the fit check has data
  useEffect(() => {
    const full = fixed && people?.find(x => x.uid === fixed.uid);
    if (!full) return;
    if (fixedRole === "client") setClient(full); else setCandidate(full);
  }, [people, fixed, fixedRole]);

  // Which slot the search fills next
  const slot: "client" | "candidate" = fixed ? (fixedRole === "client" ? "candidate" : "client") : (!client ? "client" : "candidate");
  const other = slot === "candidate" ? client : candidate;

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (people ?? [])
      .filter(p => p.uid !== other?.uid && !(fixed && exclude.has(p.uid)))
      .filter(p => sameGender || !other?.gender || !p.gender || p.gender !== other.gender)
      .filter(p => !term || [p.name, p.city, p.age].some(v => v?.toLowerCase().includes(term)))
      .slice(0, 60);
  }, [people, q, other, fixed, exclude, sameGender]);

  const choose = (p: SuggestionPerson) => {
    if (slot === "client") setClient(p); else setCandidate(p);
    setPicked(p); setQ("");
  };

  const save = async () => {
    if (!client || !candidate) return;
    setSaving(true);
    try {
      const r = await teamFetch<{ suggestion: Suggestion }>("/api/admin/suggestions", {
        method: "POST", body: JSON.stringify({ clientUid: client.uid, candidateUid: candidate.uid, reason, origin }),
      });
      toast.success(l("Saran disimpan", "Suggestion saved"));
      onAdded(r.suggestion);
      onClose();
    } catch (e) {
      const err = e as Error & { status?: number };
      toast.error(err.status === 409 ? l("Sudah pernah disarankan", "Already suggested") : err.message);
    } finally { setSaving(false); }
  };

  const ready = !!client && !!candidate;
  const Slot = ({ label, p, onClear }: { label: string; p: SuggestionPerson | null; onClear?: () => void }) => (
    <div className="flex-1 min-w-0 rounded-xl border px-3 py-2.5" style={{ borderColor: p ? "#CBD5E1" : "#E2E8F0", background: p ? "#fff" : "#F8FAFC" }}>
      <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      {p ? (
        <div className="flex items-center gap-2">
          <Avatar p={p} size={28} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-slate-900 truncate">{p.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{personLine(p)}</p>
          </div>
          {onClear && <button onClick={onClear} className="text-slate-300 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
        </div>
      ) : <p className="text-[12.5px] text-slate-400">{l("Pilih di bawah", "Pick below")}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(3px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: "88vh" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4" style={{ color: "#C4294A" }} />
            <p className="text-[15px] font-bold text-slate-900">{l("Sarankan jodoh", "Suggest a match")}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 pt-4 flex items-stretch gap-2">
          <Slot label={l("Profil yang disarankan", "Profile to suggest")} p={candidate}
            onClear={fixed && fixedRole === "candidate" ? undefined : () => { setCandidate(null); setPicked(null); }} />
          <div className="flex items-center text-slate-300"><ArrowRight className="w-4 h-4" /></div>
          <Slot label={l("Untuk klien", "For client")} p={client}
            onClear={fixed && fixedRole === "client" ? undefined : () => { setClient(null); setPicked(null); }} />
        </div>

        {!ready && (
          <>
            <div className="px-5 pt-3">
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "#E2E8F0" }}>
                <Search className="w-4 h-4 text-slate-400" />
                <input autoFocus value={q} onChange={e => setQ(e.target.value)}
                  placeholder={slot === "client" ? l("Cari klien: nama, kota, umur", "Find the client: name, city, age") : l("Cari profil: nama, kota, umur", "Find a profile: name, city, age")}
                  className="flex-1 text-[13px] focus:outline-none" />
              </div>
              {other?.gender && (
                <label className="flex items-center gap-1.5 mt-2 text-[11.5px] text-slate-500">
                  <input type="checkbox" checked={sameGender} onChange={e => setSameGender(e.target.checked)} />
                  {l("Tampilkan juga gender yang sama", "Also show the same gender")}
                </label>
              )}
            </div>
            <div className="px-3 py-2 overflow-y-auto flex-1 min-h-[160px]">
              {!people ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
              ) : list.length === 0 ? (
                <p className="text-center text-[12.5px] text-slate-400 py-8">{l("Tidak ada yang cocok", "Nobody matches")}</p>
              ) : list.map(p => (
                <button key={p.uid} onClick={() => choose(p)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left hover:bg-slate-50">
                  <Avatar p={p} size={34} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[11.5px] text-slate-500 truncate">{[p.gender === "female" ? l("Wanita", "Woman") : p.gender === "male" ? l("Pria", "Man") : null, personLine(p), val(p, "nationality", lang), val(p, "maritalStatus", lang)].filter(Boolean).join(" · ")}</p>
                  </div>
                  {other && <span className="ml-auto"><FitBadge client={slot === "candidate" ? other : p} candidate={slot === "candidate" ? p : other} lang={lang} /></span>}
                </button>
              ))}
            </div>
          </>
        )}

        {ready && (
          <div className="px-5 pt-4 overflow-y-auto">
            <p className="text-[12px] font-semibold text-slate-600 mb-1.5">{l("Siapa yang memulai?", "Who started this?")}</p>
            <div className="mb-3"><OriginToggle value={origin} lang={lang} onChange={setOrigin} candidateName={candidate!.name} clientName={client!.name} /></div>
            <div className="mb-3"><FitPanel client={client!} candidate={candidate!} lang={lang} /></div>
            <p className="text-[12px] font-semibold text-slate-600 mb-1.5">{origin === "candidate_request" ? l("Catatan permintaan (opsional)", "About the request (optional)") : l("Kenapa cocok? (opsional)", "Why they fit (optional)")}</p>
            <textarea autoFocus rows={3} value={reason} onChange={e => setReason(e.target.value)}
              placeholder={l("Mis. sama-sama ingin menikah segera, beda usia pas, sama-sama terbuka pindah", "e.g. both want to marry soon, age gap fits, both open to relocating")}
              className="w-full text-[13px] rounded-xl px-3 py-2.5 border resize-none focus:outline-none focus:border-slate-400" style={{ borderColor: "#E2E8F0" }} />
            {picked && <p className="text-[11px] text-slate-400 mt-1">{l("Status awal: Belum dikirim. Ubah ke Sudah dikirim saat profil dikirim ke klien.", "Starts as To send. Switch to Sent when you send the profile to the client.")}</p>}
          </div>
        )}

        <div className="px-5 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="text-[13px] font-semibold px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100">{l("Batal", "Cancel")}</button>
          <button onClick={save} disabled={!ready || saving}
            className="text-[13px] font-bold px-4 py-2 rounded-xl text-white disabled:opacity-40 flex items-center gap-1.5"
            style={{ background: "linear-gradient(135deg, #1B3A6B, #C4294A)" }}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {l("Simpan ke backlog", "Save to backlog")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── card on a candidate's admin page ─────────────────────────────────── */
export default function MatchSuggestionsCard({ candidate, lang }: { candidate: SuggestionPerson; lang: Lang }) {
  const l = (id: string, en: string) => (lang === "id" ? id : en);
  const [forClient, setForClient] = useState<Suggestion[] | null>(null);
  const [suggestedTo, setSuggestedTo] = useState<Suggestion[]>([]);
  const [tab, setTab] = useState<"for" | "to">("for");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await teamFetch<{ forClient: Suggestion[]; suggestedTo: Suggestion[] }>(`/api/admin/suggestions?uid=${candidate.uid}`);
      const byNewest = (a: Suggestion, b: Suggestion) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      setForClient(r.forClient.sort(byNewest));
      setSuggestedTo(r.suggestedTo.sort(byNewest));
    } catch (e) { setError((e as Error).message); }
  }, [candidate.uid]);

  useEffect(() => { load(); }, [load]);

  const rows = tab === "for" ? forClient ?? [] : suggestedTo;
  const setRows = (fn: (list: Suggestion[]) => Suggestion[]) =>
    tab === "for" ? setForClient(prev => fn(prev ?? [])) : setSuggestedTo(fn);

  const exclude = useMemo(() => new Set(
    tab === "for" ? (forClient ?? []).map(s => s.candidateUid) : suggestedTo.map(s => s.clientUid),
  ), [tab, forClient, suggestedTo]);

  const pending = (forClient ?? []).filter(s => s.status === "backlog").length;
  const first = candidate.name.split(" ")[0];

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 4px 20px rgba(15,23,42,0.05)" }}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FFF1F2", color: "#C4294A" }}>
            <Heart className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-slate-900">{l("Saran Jodoh", "Match Suggestions")}</p>
            <p className="text-[11.5px] text-slate-500">
              {pending > 0
                ? l(`${pending} profil menunggu dikirim ke ${first}`, `${pending} profile${pending === 1 ? "" : "s"} waiting to be sent to ${first}`)
                : l("Catat siapa yang cocok, kirim nanti, simpan feedback-nya", "Note who fits, send later, keep the feedback")}
            </p>
          </div>
          <button onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-[12.5px] font-bold px-3.5 py-1.5 rounded-lg text-white hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1B3A6B, #C4294A)" }}>
            <Plus className="w-3.5 h-3.5" /> {l("Sarankan", "Suggest")}
          </button>
        </div>

        <div className="inline-flex rounded-lg p-0.5 mb-3" style={{ background: "#F1F5F9" }}>
          {([
            ["for", l(`Untuk ${first}`, `For ${first}`), forClient?.length ?? 0],
            ["to", l(`${first} disarankan ke`, `${first} suggested to`), suggestedTo.length],
          ] as const).map(([key, label, count]) => (
            <button key={key} onClick={() => setTab(key)}
              className="text-[12px] font-semibold px-3 py-1 rounded-md transition-colors"
              style={tab === key ? { background: "#fff", color: "#0F172A", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" } : { color: "#64748B" }}>
              {label} <span className="text-slate-400">{count}</span>
            </button>
          ))}
        </div>

        {error ? (
          <p className="text-[12.5px] text-red-600">{error}</p>
        ) : !forClient ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
        ) : rows.length === 0 ? (
          <p className="text-[12.5px] text-slate-400 py-3">
            {tab === "for"
              ? l(`Belum ada profil yang disarankan untuk ${first}.`, `No profiles suggested for ${first} yet.`)
              : l(`${first} belum disarankan ke siapa pun.`, `${first} hasn't been suggested to anyone yet.`)}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map(s => (
              <SuggestionRow key={s.id} s={s} show={tab === "for" ? "candidate" : "client"} lang={lang}
                onChanged={next => setRows(list => list.map(x => (x.id === next.id ? next : x)))}
                onDeleted={id => setRows(list => list.filter(x => x.id !== id))} />
            ))}
          </div>
        )}
      </div>

      {adding && (
        <AddSuggestion fixed={candidate} fixedRole={tab === "for" ? "client" : "candidate"} lang={lang} exclude={exclude}
          onAdded={s => setRows(list => [s, ...list])} onClose={() => setAdding(false)} />
      )}
    </div>
  );
}
