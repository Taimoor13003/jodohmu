"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check, ChevronLeft, ChevronRight, Copy, Eye, Globe2, HeartHandshake, Image as ImageIcon, Info,
  KeyRound, Link2, Mail, Megaphone, MessageCircle, Search, UserRound, X,
} from "lucide-react";
import {
  AUDIENCE_TIERS, SHARE_SECTIONS, candidateDisplayName, defaultAudiences, normalizeAudiences, projectProfile, tierRank,
  type AudienceRule, type AudienceTier, type Audiences,
} from "@/lib/share-sections";
import { AVATAR_LABELS, avatarsForGender, defaultAvatarFor, type AvatarVariant } from "@/lib/share-avatars";
import { questionsSchema, type Question } from "@/lib/share-questions";
import { AvatarSwatch } from "@/components/share/avatars";
import { fieldLabel } from "@/lib/share-display";
import type { AccessMode, SharePurpose, ShareSummary } from "@/lib/share-types";
import { ProfileCard } from "@/components/share/profile-card";
import { QuestionEditor } from "./question-editor";
import { authFetch, shareUrl } from "./share-api";

type Lang = "id" | "en";

const C = {
  card: "#FFFFFF", border: "#E2E8F0", divider: "#F1F5F9", bg: "#F8FAFC",
  text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8",
  navy: "#1B3A6B", rose: "#C4294A", amber: "#B45309", amberBg: "#FFFBEB",
};

const MAX_PROFILES = 5;

export interface BuilderCandidate {
  id: string;
  name: string;
  data: Record<string, unknown>;
  photoUrls: string[];
  photoVisibility: string | null;
}

interface PickerRow {
  uid: string;
  name: string;
  email: string;
  location?: string | null;
  age?: string | number | null;
  canEdit?: boolean;
}

const TIER_META: Record<AudienceTier, { title: Record<Lang, string>; hint: Record<Lang, string> }> = {
  public: { title: { id: "Siapa saja", en: "Anyone" }, hint: { id: "Belum masuk", en: "Not signed in" } },
  member: { title: { id: "Sudah masuk", en: "Signed in" }, hint: { id: "Akun Google apa pun", en: "Any Google account" } },
  candidate: { title: { id: "Kandidat terdaftar", en: "Registered candidates" }, hint: { id: "Sudah lewat tahap lead", en: "Past the New Lead stage" } },
};

const EXPIRY = [
  { v: 24, id: "24 jam", en: "24 hours" },
  { v: 72, id: "3 hari", en: "3 days" },
  { v: 168, id: "7 hari", en: "7 days" },
  { v: 720, id: "30 hari", en: "30 days" },
  { v: null, id: "Tanpa batas", en: "No expiry" },
];
const TOTAL_OPENS = [
  { v: 1, id: "1", en: "1" },
  { v: 5, id: "5", en: "5" },
  { v: 20, id: "20", en: "20" },
  { v: null, id: "Tanpa batas", en: "Unlimited" },
];
const PER_PERSON = [
  { v: 1, id: "Sekali per orang", en: "Once per person" },
  { v: 3, id: "3 kali per orang", en: "3 times per person" },
  { v: null, id: "Tanpa batas", en: "Unlimited" },
];

async function loadCandidate(id: string): Promise<BuilderCandidate> {
  const json = await authFetch<{ data?: Record<string, unknown>; meta?: { name?: string } }>(`/api/admin/candidate/${id}`);
  const data = json.data ?? {};
  return {
    id,
    name: candidateDisplayName(data) || json.meta?.name || "Kandidat",
    data,
    photoUrls: Array.isArray(data.photoUrls) ? (data.photoUrls as unknown[]).filter((u): u is string => typeof u === "string") : [],
    photoVisibility: typeof data.photoVisibility === "string" ? data.photoVisibility : null,
  };
}

/* ── small parts ─────────────────────────────────────── */

function Chip({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-40"
      style={active ? { background: C.navy, borderColor: C.navy, color: "#fff" } : { background: "#fff", borderColor: C.border, color: C.label }}
    >
      {children}
    </button>
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{children}</p>
      {hint && <p className="mt-0.5 text-[12px]" style={{ color: C.label }}>{hint}</p>}
    </div>
  );
}

function OptionTile({ active, onClick, icon, title, body }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; body: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-start gap-3 rounded-2xl border p-4 text-left transition-all"
      style={active ? { borderColor: C.navy, background: "#EFF4FB", boxShadow: `0 0 0 1px ${C.navy}` } : { borderColor: C.border, background: "#fff" }}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: active ? C.navy : C.bg, color: active ? "#fff" : C.navy }}>
        {icon}
      </span>
      <span>
        <span className="block text-[14px] font-bold" style={{ color: C.text }}>{title}</span>
        <span className="mt-0.5 block text-[12.5px] leading-snug" style={{ color: C.label }}>{body}</span>
      </span>
    </button>
  );
}

function TierBox({ checked, disabled, onChange, label }: { checked: boolean; disabled?: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition-colors disabled:opacity-25"
      style={checked ? { background: C.navy, borderColor: C.navy } : { background: "#fff", borderColor: "#CBD5E1" }}
    >
      {checked && <Check className="h-3.5 w-3.5 text-white" />}
    </button>
  );
}

/* ── builder ─────────────────────────────────────────── */

export default function ShareBuilder({
  initialCandidate, lang, onCreated, onCancel,
}: {
  initialCandidate?: { id: string } | null;
  lang: Lang;
  onCreated: (share: ShareSummary) => void;
  onCancel: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);

  const [candidates, setCandidates] = useState<BuilderCandidate[]>([]);
  const [purpose, setPurpose] = useState<SharePurpose>("matchmaking");
  const [recipientLabel, setRecipientLabel] = useState("");
  const [recipientNote, setRecipientNote] = useState("");

  const [accessMode, setAccessMode] = useState<AccessMode>("signin");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [emailDraft, setEmailDraft] = useState("");
  const [expiresInHours, setExpiresInHours] = useState<number | null>(168);
  const [maxOpens, setMaxOpens] = useState<number | null>(null);
  const [maxOpensPerViewer, setMaxOpensPerViewer] = useState<number | null>(3);

  const [audiences, setAudiences] = useState<Audiences>(() => defaultAudiences());
  const [photoSelection, setPhotoSelection] = useState<Record<string, number[] | null>>({});
  const [avatarSelection, setAvatarSelection] = useState<Record<string, AvatarVariant>>({});

  const [questionnaireEnabled, setQuestionnaireEnabled] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [step, setStep] = useState(0);
  const [previewTier, setPreviewTier] = useState<AudienceTier>("member");
  const [previewSlot, setPreviewSlot] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<ShareSummary | null>(null);

  const [picker, setPicker] = useState<PickerRow[] | null>(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (initialCandidate?.id) {
      loadCandidate(initialCandidate.id)
        .then(c => setCandidates([c]))
        .catch(err => toast.error(err instanceof Error ? err.message : "Failed to load candidate"));
    }
    authFetch<{ questions: Question[] }>("/api/admin/share-questions")
      .then(json => setQuestions(json.questions))
      .catch(() => { /* builder still works; editor starts empty */ });
    authFetch<{ users: PickerRow[] }>("/api/admin/list-users?role=candidate")
      .then(json => setPicker(json.users))
      .catch(() => setPicker([]));
  }, [initialCandidate?.id]);

  const steps = useMemo(
    () => [
      { key: "profiles", title: t("Profil & tujuan", "Profiles & purpose") },
      { key: "access", title: t("Akses & batas", "Access & limits") },
      { key: "visibility", title: t("Yang terlihat", "What's visible") },
      ...(purpose === "matchmaking" ? [{ key: "questions", title: t("Pertanyaan", "Questions") }] : []),
      { key: "review", title: t("Tinjau", "Review") },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [purpose, lang],
  );
  const stepKey = steps[Math.min(step, steps.length - 1)].key;

  /* ── audience editing (keeps tiers cumulative) ── */

  const setField = (field: string, tier: AudienceTier, on: boolean) =>
    setAudiences(prev => {
      const rank = tierRank(tier);
      const next = JSON.parse(JSON.stringify(prev)) as Audiences;
      AUDIENCE_TIERS.forEach((tt, i) => {
        const has = next[tt].fields.includes(field);
        if (on && i >= rank && !has) next[tt].fields.push(field);
        if (!on && i <= rank && has) next[tt].fields = next[tt].fields.filter(f => f !== field);
      });
      return normalizeAudiences(next);
    });

  const setFlag = (flag: "showName" | "showPhotos", tier: AudienceTier, on: boolean) =>
    setAudiences(prev => {
      const rank = tierRank(tier);
      const next = JSON.parse(JSON.stringify(prev)) as Audiences;
      AUDIENCE_TIERS.forEach((tt, i) => {
        if (on && i >= rank) next[tt][flag] = true;
        if (!on && i <= rank) next[tt][flag] = false;
      });
      return normalizeAudiences(next);
    });

  const publicDisabled = accessMode !== "anyone";
  const tiersInUse = publicDisabled ? AUDIENCE_TIERS.filter(tt => tt !== "public") : AUDIENCE_TIERS;

  useEffect(() => {
    if (publicDisabled && previewTier === "public") setPreviewTier("member");
  }, [publicDisabled, previewTier]);

  /* ── candidates ── */

  const addCandidate = async (row: PickerRow) => {
    if (candidates.length >= MAX_PROFILES || candidates.some(c => c.id === row.uid)) return;
    setAdding(row.uid);
    try {
      const c = await loadCandidate(row.uid);
      setCandidates(prev => [...prev, c]);
      setPickerQuery("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAdding(null);
    }
  };

  const pickerResults = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!picker || !q) return [];
    return picker
      .filter(r => !candidates.some(c => c.id === r.uid))
      .filter(r => [r.name, r.email, r.location ?? ""].some(v => v?.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [picker, pickerQuery, candidates]);

  const togglePhoto = (candidate: BuilderCandidate, index: number) =>
    setPhotoSelection(prev => {
      const all = candidate.photoUrls.map((_, i) => i);
      const current = prev[candidate.id] ?? all;
      const next = current.includes(index) ? current.filter(i => i !== index) : [...current, index].sort((a, b) => a - b);
      return { ...prev, [candidate.id]: next.length === all.length ? null : next };
    });

  const commitEmails = () => {
    const parts = emailDraft.split(/[\s,;]+/).map(e => e.trim().toLowerCase()).filter(Boolean);
    const valid = parts.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (valid.length < parts.length) toast.error(t("Beberapa email tidak valid", "Some emails aren't valid"));
    setInvitedEmails(prev => Array.from(new Set([...prev, ...valid])));
    setEmailDraft("");
  };

  /* ── validation per step ── */

  const questionIssue = useMemo(() => {
    if (purpose !== "matchmaking" || !questionnaireEnabled) return null;
    const parsed = questionsSchema.safeParse(questions);
    return parsed.success ? null : parsed.error.issues[0]?.message ?? t("Periksa pertanyaan", "Check the questions");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, purpose, questionnaireEnabled, lang]);

  const stepError = (key: string): string | null => {
    if (key === "profiles") {
      if (candidates.length === 0) return t("Tambahkan minimal satu profil", "Add at least one profile");
      if (!recipientLabel.trim()) return t("Isi untuk siapa tautan ini", "Say who this link is for");
    }
    if (key === "access" && accessMode === "invited" && invitedEmails.length === 0) {
      return t("Tambahkan email yang diundang", "Add the invited emails");
    }
    if (key === "visibility") {
      const top = audiences.candidate;
      if (!top.fields.length && !top.showName && !top.showPhotos) return t("Pilih minimal satu hal untuk ditampilkan", "Choose at least one thing to show");
    }
    if (key === "questions" && questionIssue) return questionIssue;
    return null;
  };

  const next = () => {
    const err = stepError(stepKey);
    if (err) return toast.error(err);
    setStep(s => Math.min(steps.length - 1, s + 1));
  };

  const submit = async () => {
    for (const s of steps) {
      const err = stepError(s.key);
      if (err) {
        setStep(steps.findIndex(x => x.key === s.key));
        return toast.error(err);
      }
    }
    setSubmitting(true);
    try {
      const json = await authFetch<{ share: ShareSummary }>("/api/admin/shares", {
        method: "POST",
        body: JSON.stringify({
          candidateIds: candidates.map(c => c.id),
          purpose,
          recipientLabel: recipientLabel.trim(),
          recipientNote: recipientNote.trim(),
          access: { mode: accessMode, invitedEmails: accessMode === "invited" ? invitedEmails : [] },
          audiences,
          photoSelection,
          avatarSelection,
          expiresInHours,
          maxOpens,
          maxOpensPerViewer,
          questionnaire: { enabled: purpose === "matchmaking" && questionnaireEnabled, questions },
        }),
      });
      setCreated(json.share);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── success ── */

  if (created) {
    const url = shareUrl(created.id);
    const wa = encodeURIComponent(
      lang === "id"
        ? `Assalamualaikum. Berikut perkenalan pribadi dari Jodohmu — tautan ini bersifat rahasia dan terbatas:\n${url}`
        : `Assalamualaikum. Here is a private introduction from Jodohmu — this link is confidential and limited:\n${url}`,
    );
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "#ECFDF5" }}>
          <Check className="h-7 w-7" style={{ color: "#047857" }} />
        </span>
        <h3 className="text-[20px] font-extrabold" style={{ color: C.text }}>{t("Tautan siap dikirim", "Your link is ready")}</h3>
        <p className="mt-1 text-[13px]" style={{ color: C.label }}>
          {created.recipientLabel} · {created.candidateIds.length} {t("profil", created.candidateIds.length > 1 ? "profiles" : "profile")} · {t("kode", "code")} {created.code}
        </p>
        <div className="mt-6 flex w-full max-w-xl items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: C.bg }}>
          <Link2 className="h-4 w-4 shrink-0" style={{ color: C.muted }} />
          <span className="flex-1 truncate text-left font-mono text-[12.5px]" style={{ color: C.body }}>{url}</span>
          <button
            onClick={() => navigator.clipboard.writeText(url).then(() => toast.success(t("Tautan disalin", "Link copied")))}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-[12px] font-bold"
            style={{ borderColor: C.border, color: C.body }}
          >
            <Copy className="h-3.5 w-3.5" /> {t("Salin", "Copy")}
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <a href={`https://wa.me/?text=${wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-bold text-white" style={{ background: "#16A34A" }}>
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border px-4 py-2 text-[13px] font-bold" style={{ borderColor: C.border, color: C.body }}>
            <Eye className="h-4 w-4" /> {t("Buka sebagai tim", "Open as team")}
          </a>
          <button onClick={() => onCreated(created)} className="rounded-lg px-4 py-2 text-[13px] font-bold text-white" style={{ background: C.navy }}>
            {t("Selesai", "Done")}
          </button>
        </div>
      </div>
    );
  }

  /* ── preview projection ── */
  const previewCandidate = candidates[Math.min(previewSlot, Math.max(0, candidates.length - 1))];
  const preview = previewCandidate
    ? projectProfile({
        slot: Math.min(previewSlot, candidates.length - 1),
        candidate: previewCandidate.data,
        audiences,
        tier: previewTier,
        avatar: avatarSelection[previewCandidate.id] ?? defaultAvatarFor(previewCandidate.data),
        photoSelection: photoSelection[previewCandidate.id] ?? null,
        anonymousLabel: `PREVIEW-${previewSlot + 1}`,
        photoSrc: i => previewCandidate.photoUrls[i],
      })
    : null;

  const ruleSummary = (rule: AudienceRule) =>
    `${rule.fields.length} ${t("data", "fields")} · ${rule.showName ? t("nama", "name") : t("tanpa nama", "no name")} · ${rule.showPhotos ? t("foto", "photos") : t("tanpa foto", "no photos")}`;

  return (
    <div className="flex min-h-[70vh] flex-col md:flex-row">
      {/* rail */}
      <aside className="shrink-0 border-b p-4 md:w-56 md:border-b-0 md:border-r md:p-5" style={{ borderColor: C.border, background: C.bg }}>
        <ol className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
          {steps.map((s, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <li key={s.key}>
                <button
                  onClick={() => (i <= step ? setStep(i) : undefined)}
                  className="flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-left text-[13px] font-semibold"
                  style={active ? { background: "#fff", color: C.text, boxShadow: "0 1px 3px rgba(15,23,42,0.08)" } : { color: done ? C.body : C.muted }}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold" style={active ? { background: C.navy, color: "#fff" } : done ? { background: "#DCFCE7", color: "#15803D" } : { background: "#E2E8F0", color: C.label }}>
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {s.title}
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {/* ── 1. profiles & purpose ── */}
          {stepKey === "profiles" && (
            <div className="flex flex-col gap-7">
              <div>
                <Label hint={t("Tujuan menentukan tampilan halaman dan apakah ada pertanyaan.", "Purpose shapes the page and whether questions are asked.")}>
                  {t("Tujuan tautan", "Link purpose")}
                </Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <OptionTile active={purpose === "matchmaking"} onClick={() => setPurpose("matchmaking")} icon={<HeartHandshake className="h-4 w-4" />}
                    title={t("Perjodohan", "Matchmaking")} body={t("Kirim 1–5 profil ke seseorang dan kumpulkan refleksinya.", "Send 1–5 profiles to someone and collect their reflections.")} />
                  <OptionTile active={purpose === "promotion"} onClick={() => setPurpose("promotion")} icon={<Megaphone className="h-4 w-4" />}
                    title={t("Promosi", "Promotion")} body={t("Tampilkan profil pilihan untuk menarik calon kandidat baru.", "Showcase profiles to attract new candidates.")} />
                </div>
              </div>

              <div>
                <Label hint={t(`Maksimal ${MAX_PROFILES} profil. Hanya kandidat yang Anda tangani yang bisa ditambahkan.`, `Up to ${MAX_PROFILES}. Only candidates you manage can be added.`)}>
                  {t("Profil", "Profiles")} ({candidates.length}/{MAX_PROFILES})
                </Label>
                <div className="flex flex-col gap-2">
                  {candidates.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-xl border bg-white px-3 py-2.5" style={{ borderColor: C.border }}>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold" style={{ background: C.bg, color: C.navy }}>{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-bold" style={{ color: C.text }}>{c.name}</p>
                        <p className="text-[11.5px]" style={{ color: C.label }}>
                          {c.photoUrls.length} {t("foto", "photos")}
                          {c.photoVisibility === "after_match" && <span style={{ color: C.amber }}> · {t("foto hanya setelah match", "photos only after match")}</span>}
                        </p>
                      </div>
                      <button onClick={() => setCandidates(prev => prev.filter(x => x.id !== c.id))} className="rounded-md p-1.5 hover:bg-slate-100" aria-label="Remove">
                        <X className="h-4 w-4" style={{ color: C.muted }} />
                      </button>
                    </div>
                  ))}

                  {candidates.length < MAX_PROFILES && (
                    <div className="relative">
                      <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5" style={{ borderColor: C.border }}>
                        <Search className="h-4 w-4" style={{ color: C.muted }} />
                        <input
                          value={pickerQuery}
                          onChange={e => setPickerQuery(e.target.value)}
                          placeholder={t("Cari kandidat berdasarkan nama, email, kota…", "Search candidates by name, email, city…")}
                          className="flex-1 bg-transparent text-[13px] focus:outline-none"
                          style={{ color: C.body }}
                        />
                      </div>
                      {pickerResults.length > 0 && (
                        <div className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border bg-white shadow-lg" style={{ borderColor: C.border }}>
                          {pickerResults.map(r => (
                            <button
                              key={r.uid}
                              disabled={!r.canEdit || adding === r.uid}
                              onClick={() => addCandidate(r)}
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <UserRound className="h-4 w-4" style={{ color: C.muted }} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-semibold" style={{ color: C.text }}>{r.name}</span>
                                <span className="block truncate text-[11.5px]" style={{ color: C.label }}>{[r.age, r.location, r.email].filter(Boolean).join(" · ")}</span>
                              </span>
                              {!r.canEdit && <span className="text-[11px]" style={{ color: C.muted }}>{t("tidak ditugaskan", "not assigned")}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label hint={t("Tampil di halaman dan pada tanda air foto.", "Shown on the page and in the photo watermark.")}>{t("Untuk siapa", "For whom")}</Label>
                  <input
                    value={recipientLabel}
                    onChange={e => setRecipientLabel(e.target.value)}
                    placeholder={t("cth. Keluarga Bapak Ahmad", "e.g. The Ahmad family")}
                    className="w-full rounded-xl border px-3 py-2.5 text-[13.5px] focus:outline-none"
                    style={{ borderColor: C.border, color: C.text }}
                  />
                </div>
                <div>
                  <Label hint={t("Pesan pembuka yang hangat, opsional.", "A warm opening message, optional.")}>{t("Pesan pembuka", "Opening note")}</Label>
                  <textarea
                    value={recipientNote}
                    onChange={e => setRecipientNote(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border px-3 py-2.5 text-[13.5px] focus:outline-none"
                    style={{ borderColor: C.border, color: C.text }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── 2. access & limits ── */}
          {stepKey === "access" && (
            <div className="flex flex-col gap-7">
              <div>
                <Label>{t("Siapa yang bisa membuka", "Who can open it")}</Label>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <OptionTile active={accessMode === "anyone"} onClick={() => setAccessMode("anyone")} icon={<Globe2 className="h-4 w-4" />}
                    title={t("Siapa saja", "Anyone with the link")} body={t("Tanpa masuk. Masuk dengan Google membuka lebih banyak.", "No sign-in needed. Signing in reveals more.")} />
                  <OptionTile active={accessMode === "signin"} onClick={() => setAccessMode("signin")} icon={<KeyRound className="h-4 w-4" />}
                    title={t("Wajib masuk Google", "Google sign-in required")} body={t("Setiap orang tercatat. Akun baru dibuat otomatis.", "Every viewer is identified. New accounts are created automatically.")} />
                  <OptionTile active={accessMode === "invited"} onClick={() => setAccessMode("invited")} icon={<Mail className="h-4 w-4" />}
                    title={t("Hanya email tertentu", "Specific people only")} body={t("Hanya email Google yang Anda undang.", "Only the Google emails you invite.")} />
                </div>
                {accessMode === "invited" && (
                  <div className="mt-4 rounded-xl border bg-white p-3" style={{ borderColor: C.border }}>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {invitedEmails.map(email => (
                        <span key={email} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: C.bg, color: C.body }}>
                          {email}
                          <button onClick={() => setInvitedEmails(prev => prev.filter(e => e !== email))} aria-label="Remove"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                    <input
                      value={emailDraft}
                      onChange={e => setEmailDraft(e.target.value)}
                      onBlur={commitEmails}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commitEmails(); } }}
                      placeholder={t("ketik email lalu Enter", "type an email and press Enter")}
                      className="w-full bg-transparent text-[13px] focus:outline-none"
                      style={{ color: C.body }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div>
                  <Label>{t("Berakhir setelah", "Expires after")}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {EXPIRY.map(p => <Chip key={String(p.v)} active={expiresInHours === p.v} onClick={() => setExpiresInHours(p.v)}>{lang === "id" ? p.id : p.en}</Chip>)}
                  </div>
                </div>
                <div>
                  <Label hint={t("Refresh dalam 20 menit tidak dihitung.", "Refreshes within 20 minutes don't count.")}>{t("Kali dibuka per orang", "Opens per person")}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PER_PERSON.map(p => <Chip key={String(p.v)} active={maxOpensPerViewer === p.v} onClick={() => setMaxOpensPerViewer(p.v)}>{lang === "id" ? p.id : p.en}</Chip>)}
                  </div>
                </div>
                <div>
                  <Label>{t("Total kali dibuka", "Total opens")}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {TOTAL_OPENS.map(p => <Chip key={String(p.v)} active={maxOpens === p.v} onClick={() => setMaxOpens(p.v)}>{lang === "id" ? p.id : p.en}</Chip>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 3. visibility matrix ── */}
          {stepKey === "visibility" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3" style={{ background: "#EFF4FB" }}>
                <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.navy }} />
                <p className="text-[12.5px] leading-relaxed" style={{ color: C.body }}>
                  {t(
                    "Centang apa yang boleh dilihat setiap kelompok. Kelompok yang lebih tinggi selalu melihat semua yang dilihat kelompok di kirinya. Tim Jodohmu selalu melihat semuanya.",
                    "Tick what each audience may see. Each audience always sees everything the one to its left sees. The Jodohmu team always sees everything.",
                  )}
                  {publicDisabled && <strong> {t("Kolom “Siapa saja” tidak dipakai karena tautan ini wajib masuk.", "The “Anyone” column is unused because this link requires sign-in.")}</strong>}
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border bg-white" style={{ borderColor: C.border }}>
                <table className="w-full min-w-[560px] text-[13px]">
                  <thead>
                    <tr style={{ background: C.bg }}>
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{t("Informasi", "Information")}</th>
                      {AUDIENCE_TIERS.map(tier => (
                        <th key={tier} className="w-32 px-2 py-3 text-center" style={{ opacity: tier === "public" && publicDisabled ? 0.35 : 1 }}>
                          <span className="block text-[12px] font-bold" style={{ color: C.text }}>{TIER_META[tier].title[lang]}</span>
                          <span className="block text-[10.5px] font-medium" style={{ color: C.muted }}>{TIER_META[tier].hint[lang]}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {([["showName", t("Nama asli", "Real name")], ["showPhotos", t("Foto", "Photos")]] as const).map(([flag, label]) => (
                      <tr key={flag} style={{ borderTop: `1px solid ${C.divider}` }}>
                        <td className="px-4 py-2.5 font-bold" style={{ color: C.text }}>{label}</td>
                        {AUDIENCE_TIERS.map(tier => (
                          <td key={tier} className="px-2 py-2.5 text-center">
                            <TierBox checked={audiences[tier][flag]} disabled={tier === "public" && publicDisabled} onChange={on => setFlag(flag, tier, on)} label={`${label} — ${TIER_META[tier].title[lang]}`} />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {SHARE_SECTIONS.map(section => (
                      <SectionRows key={section.key} sectionLabel={lang === "id" ? section.labelId : section.labelEn} fields={section.fields}
                        audiences={audiences} lang={lang} publicDisabled={publicDisabled} onToggle={setField} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <Label hint={t("Dipakai untuk audiens yang tidak boleh melihat foto, atau bila kandidat belum punya foto.", "Shown to audiences who may not see photos, or when a candidate has none.")}>
                  <span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" /> {t("Avatar pengganti", "Stand-in avatar")}</span>
                </Label>
                <div className="flex flex-col gap-3">
                  {candidates.map(c => {
                    const current = avatarSelection[c.id] ?? defaultAvatarFor(c.data);
                    return (
                      <div key={c.id} className="rounded-xl border bg-white p-3" style={{ borderColor: C.border }}>
                        <p className="mb-2.5 text-[13px] font-bold" style={{ color: C.text }}>{c.name}</p>
                        <div className="flex flex-wrap gap-4">
                          {avatarsForGender(c.data.gender).map(v => (
                            <AvatarSwatch
                              key={v}
                              variant={v}
                              selected={current === v}
                              label={AVATAR_LABELS[v][lang]}
                              onClick={() => setAvatarSelection(prev => ({ ...prev, [c.id]: v }))}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {candidates.some(c => c.photoUrls.length > 0) && (
                <div>
                  <Label hint={t("Pilih foto mana yang ikut dibagikan, per profil. Foto selalu diberi tanda air nama penerima.", "Choose which photos are shared, per profile. Photos are always watermarked with the viewer.")}>
                    <span className="inline-flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> {t("Foto yang dibagikan", "Shared photos")}</span>
                  </Label>
                  <div className="flex flex-col gap-3">
                    {candidates.filter(c => c.photoUrls.length > 0).map(c => (
                      <div key={c.id} className="rounded-xl border bg-white p-3" style={{ borderColor: C.border }}>
                        <div className="mb-2 flex items-center gap-2">
                          <p className="text-[13px] font-bold" style={{ color: C.text }}>{c.name}</p>
                          {c.photoVisibility === "after_match" && (
                            <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: C.amberBg, color: C.amber }}>
                              {t("Kandidat memilih foto setelah match", "Candidate prefers photos after match")}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {c.photoUrls.map((url, i) => {
                            const on = (photoSelection[c.id] ?? null) === null || photoSelection[c.id]!.includes(i);
                            return (
                              <button key={i} type="button" onClick={() => togglePhoto(c, i)} className="relative h-16 w-14 overflow-hidden rounded-lg" style={{ border: `2px solid ${on ? C.navy : C.border}`, opacity: on ? 1 : 0.4 }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="" className="h-full w-full object-cover object-top" />
                                {on && <span className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full" style={{ background: C.navy }}><Check className="h-2.5 w-2.5 text-white" /></span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 4. questions ── */}
          {stepKey === "questions" && (
            <div className="flex flex-col gap-5">
              <label className="flex items-start gap-3 rounded-2xl border bg-white p-4" style={{ borderColor: C.border }}>
                <input type="checkbox" checked={questionnaireEnabled} onChange={e => setQuestionnaireEnabled(e.target.checked)} className="mt-1" />
                <span>
                  <span className="block text-[14px] font-bold" style={{ color: C.text }}>{t("Minta refleksi dari penerima", "Ask the recipient for reflections")}</span>
                  <span className="block text-[12.5px]" style={{ color: C.label }}>
                    {t("Pertanyaan diulang untuk setiap profil. Untuk beberapa profil, penerima juga memilih satu di akhir.", "Questions repeat for each profile. With several profiles, the recipient also picks one at the end.")}
                  </span>
                </span>
              </label>
              {questionnaireEnabled && (
                <>
                  <p className="text-[12px]" style={{ color: C.label }}>
                    {t("Diambil dari pertanyaan bawaan. Perubahan di sini hanya berlaku untuk tautan ini.", "Started from the default set. Changes here apply to this link only.")}
                  </p>
                  <QuestionEditor questions={questions} onChange={setQuestions} lang={lang} />
                  {questionIssue && <p className="text-[12.5px] font-semibold" style={{ color: C.rose }}>{questionIssue}</p>}
                </>
              )}
            </div>
          )}

          {/* ── 5. review ── */}
          {stepKey === "review" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {tiersInUse.map(tier => (
                  <div key={tier} className="rounded-xl border bg-white px-4 py-3" style={{ borderColor: C.border }}>
                    <p className="text-[12px] font-bold" style={{ color: C.text }}>{TIER_META[tier].title[lang]}</p>
                    <p className="text-[12px]" style={{ color: C.label }}>{ruleSummary(audiences[tier])}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border" style={{ borderColor: C.border, background: "#FBF8F3" }}>
                <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3" style={{ borderColor: C.border, background: "#fff" }}>
                  <Eye className="h-4 w-4" style={{ color: C.navy }} />
                  <span className="text-[13px] font-bold" style={{ color: C.text }}>{t("Pratinjau sebagai", "Preview as")}</span>
                  {tiersInUse.map(tier => (
                    <Chip key={tier} active={previewTier === tier} onClick={() => setPreviewTier(tier)}>{TIER_META[tier].title[lang]}</Chip>
                  ))}
                  <div className="flex-1" />
                  {candidates.length > 1 && candidates.map((c, i) => (
                    <Chip key={c.id} active={previewSlot === i} onClick={() => setPreviewSlot(i)}>{i + 1}</Chip>
                  ))}
                </div>
                <div className="p-4 sm:p-6">
                  {preview ? (
                    <ProfileCard profile={preview} lang={lang} position={{ index: previewSlot, total: candidates.length }} />
                  ) : (
                    <p className="py-10 text-center text-[13px]" style={{ color: C.muted }}>{t("Tambahkan profil untuk melihat pratinjau.", "Add a profile to see a preview.")}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center gap-2 border-t px-5 py-4 sm:px-7" style={{ borderColor: C.border, background: "#fff" }}>
          <button onClick={step === 0 ? onCancel : () => setStep(s => s - 1)} className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[13px] font-semibold" style={{ borderColor: C.border, color: C.label }}>
            {step === 0 ? t("Batal", "Cancel") : <><ChevronLeft className="h-4 w-4" /> {t("Kembali", "Back")}</>}
          </button>
          <div className="flex-1" />
          {stepKey !== "review" ? (
            <button onClick={next} className="flex items-center gap-1.5 rounded-lg px-5 py-2 text-[13px] font-bold text-white" style={{ background: C.navy }}>
              {t("Lanjut", "Continue")} <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} className="flex items-center gap-1.5 rounded-lg px-5 py-2 text-[13px] font-bold text-white disabled:opacity-60" style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.rose})` }}>
              <Link2 className="h-4 w-4" /> {submitting ? t("Membuat…", "Creating…") : t("Buat tautan", "Create link")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionRows({ sectionLabel, fields, audiences, lang, publicDisabled, onToggle }: {
  sectionLabel: string;
  fields: string[];
  audiences: Audiences;
  lang: Lang;
  publicDisabled: boolean;
  onToggle: (field: string, tier: AudienceTier, on: boolean) => void;
}) {
  const allOn = (tier: AudienceTier) => fields.every(f => audiences[tier].fields.includes(f));
  return (
    <>
      <tr style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}>
        <td className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: C.label }}>{sectionLabel}</td>
        {AUDIENCE_TIERS.map(tier => (
          <td key={tier} className="px-2 py-2 text-center">
            <button
              type="button"
              disabled={tier === "public" && publicDisabled}
              onClick={() => fields.forEach(f => onToggle(f, tier, !allOn(tier)))}
              className="text-[10.5px] font-bold disabled:opacity-25"
              style={{ color: C.navy }}
            >
              {allOn(tier) ? (lang === "id" ? "hapus semua" : "clear") : (lang === "id" ? "semua" : "all")}
            </button>
          </td>
        ))}
      </tr>
      {fields.map(field => (
        <tr key={field} style={{ borderTop: `1px solid ${C.divider}` }}>
          <td className="py-2 pl-7 pr-4" style={{ color: C.body }}>{fieldLabel(field, lang)}</td>
          {AUDIENCE_TIERS.map(tier => (
            <td key={tier} className="px-2 py-2 text-center">
              <TierBox
                checked={audiences[tier].fields.includes(field)}
                disabled={tier === "public" && publicDisabled}
                onChange={on => onToggle(field, tier, on)}
                label={`${fieldLabel(field, lang)} — ${tier}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
