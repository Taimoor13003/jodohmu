"use client";

import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Eye, Image as ImageIcon, Info, UserRound, X } from "lucide-react";
import {
  AUDIENCE_PRESETS, AUDIENCE_TIERS, SHARE_SECTIONS, candidateDisplayName, isShowableField, normalizeAudiences,
  presetAudiences, projectProfile, tierRank,
  type AudienceTier, type Audiences,
} from "@/lib/share-sections";
import { AVATAR_LABELS, avatarsForGender, defaultAvatarFor, type AvatarVariant } from "@/lib/share-avatars";
import { AvatarSwatch } from "@/components/share/avatars";
import { ProfileCard } from "@/components/share/profile-card";
import { fieldLabel } from "@/lib/share-display";
import type { ShareSummary } from "@/lib/share-types";
import { authFetch } from "./share-api";

type Lang = "id" | "en";

const C = {
  card: "#FFFFFF", border: "#E2E8F0", divider: "#F1F5F9", bg: "#F8FAFC",
  text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8",
  navy: "#1B3A6B", rose: "#C4294A", amber: "#B45309", amberBg: "#FFFBEB",
};

export interface BuilderCandidate {
  id: string;
  name: string;
  data: Record<string, unknown>;
  photoUrls: string[];
  photoVisibility: string | null;
}

export const TIER_META: Record<AudienceTier, { title: Record<Lang, string>; hint: Record<Lang, string> }> = {
  public: { title: { id: "Siapa saja", en: "Anyone" }, hint: { id: "Belum masuk", en: "Not signed in" } },
  member: { title: { id: "Sudah masuk", en: "Signed in" }, hint: { id: "Akun Google apa pun", en: "Any Google account" } },
  candidate: { title: { id: "Kandidat terdaftar", en: "Registered candidates" }, hint: { id: "Sudah lewat tahap lead", en: "Past the New Lead stage" } },
};

export async function loadCandidate(id: string): Promise<BuilderCandidate> {
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

export function Chip({ active, onClick, children, disabled, title }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-40"
      style={active ? { background: C.navy, borderColor: C.navy, color: "#fff" } : { background: "#fff", borderColor: C.border, color: C.label }}
    >
      {children}
    </button>
  );
}

export function Label({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{children}</p>
      {hint && <p className="mt-0.5 text-[12px]" style={{ color: C.label }}>{hint}</p>}
    </div>
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

function sameAudiences(a: Audiences, b: Audiences): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/* ── the matrix, avatars and photos ──────────────────── */

/**
 * Everything that decides what a recipient sees: name, photos, each field,
 * the stand-in avatar and which photos. Used when creating a link and when
 * changing one that is already out.
 */
export function VisibilityFields({
  candidates, lang, publicDisabled,
  audiences, onAudiences,
  photoSelection, onPhotoSelection,
  avatarSelection, onAvatarSelection,
}: {
  candidates: BuilderCandidate[];
  lang: Lang;
  /** The link requires sign-in, so the "Anyone" column has no effect. */
  publicDisabled: boolean;
  audiences: Audiences;
  onAudiences: (next: Audiences) => void;
  photoSelection: Record<string, number[] | null>;
  onPhotoSelection: (next: Record<string, number[] | null>) => void;
  avatarSelection: Record<string, AvatarVariant>;
  onAvatarSelection: (next: Record<string, AvatarVariant>) => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);

  /* keeps tiers cumulative */
  const setField = (fields: string[], tier: AudienceTier, on: boolean) => {
    const rank = tierRank(tier);
    const next = JSON.parse(JSON.stringify(audiences)) as Audiences;
    for (const field of fields) {
      AUDIENCE_TIERS.forEach((tt, i) => {
        const has = next[tt].fields.includes(field);
        if (on && i >= rank && !has) next[tt].fields.push(field);
        if (!on && i <= rank && has) next[tt].fields = next[tt].fields.filter(f => f !== field);
      });
    }
    onAudiences(normalizeAudiences(next));
  };

  const setFlag = (flag: "showName" | "showPhotos", tier: AudienceTier, on: boolean) => {
    const rank = tierRank(tier);
    const next = JSON.parse(JSON.stringify(audiences)) as Audiences;
    AUDIENCE_TIERS.forEach((tt, i) => {
      if (on && i >= rank) next[tt][flag] = true;
      if (!on && i <= rank) next[tt][flag] = false;
    });
    onAudiences(normalizeAudiences(next));
  };

  const togglePhoto = (candidate: BuilderCandidate, index: number) => {
    const all = candidate.photoUrls.map((_, i) => i);
    const current = photoSelection[candidate.id] ?? all;
    const next = current.includes(index) ? current.filter(i => i !== index) : [...current, index].sort((a, b) => a - b);
    onPhotoSelection({ ...photoSelection, [candidate.id]: next.length === all.length ? null : next });
  };

  /** A field nobody in this link has answered shows nothing, whatever is ticked. */
  const isEmpty = (field: string) => candidates.length > 0 && !candidates.some(c => isShowableField(c.data, field));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-2.5 rounded-xl px-4 py-3" style={{ background: "#EFF4FB" }}>
        <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.navy }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: C.body }}>
          {t(
            "Centang apa yang boleh dilihat setiap kelompok. Kelompok yang lebih tinggi selalu melihat semua yang dilihat kelompok di kirinya. Data yang belum diisi tidak pernah ditampilkan.",
            "Tick what each audience may see. Each audience always sees everything the one to its left sees. Anything not filled in is never shown.",
          )}
          {publicDisabled && <strong> {t("Kolom “Siapa saja” tidak dipakai karena tautan ini wajib masuk.", "The “Anyone” column is unused because this link requires sign-in.")}</strong>}
        </p>
      </div>

      <div>
        <Label hint={t("Titik awal sekali klik. Setiap kotak tetap bisa diubah satu per satu.", "One-click starting points. Every box can still be changed one by one.")}>
          {t("Preset", "Presets")}
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {AUDIENCE_PRESETS.map(p => (
            <Chip
              key={p.key}
              active={sameAudiences(audiences, presetAudiences(p.key))}
              onClick={() => onAudiences(presetAudiences(p.key))}
              title={lang === "id" ? p.hintId : p.hintEn}
            >
              {lang === "id" ? p.labelId : p.labelEn}
              <span className="ml-1.5 font-normal opacity-70">· {lang === "id" ? p.hintId : p.hintEn}</span>
            </Chip>
          ))}
        </div>
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
            {([
              ["showName", t("Nama asli", "Real name"), t("Bila tidak dicentang, tampil sebagai “Kandidat 1”.", "When off, shown as “Candidate 1”.")],
              ["showPhotos", t("Foto", "Photos"), t("Bila tidak dicentang, avatar pengganti yang tampil.", "When off, the stand-in avatar is shown.")],
            ] as const).map(([flag, label, hint]) => (
              <tr key={flag} style={{ borderTop: `1px solid ${C.divider}` }}>
                <td className="px-4 py-2.5">
                  <span className="block font-bold" style={{ color: C.text }}>{label}</span>
                  <span className="block text-[11.5px]" style={{ color: C.muted }}>{hint}</span>
                </td>
                {AUDIENCE_TIERS.map(tier => (
                  <td key={tier} className="px-2 py-2.5 text-center">
                    <TierBox checked={audiences[tier][flag]} disabled={tier === "public" && publicDisabled} onChange={on => setFlag(flag, tier, on)} label={`${label} — ${TIER_META[tier].title[lang]}`} />
                  </td>
                ))}
              </tr>
            ))}
            {SHARE_SECTIONS.map(section => {
              const allOn = (tier: AudienceTier) => section.fields.every(f => audiences[tier].fields.includes(f));
              return (
                <Fragment key={section.key}>
                  <tr style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}>
                    <td className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: C.label }}>{lang === "id" ? section.labelId : section.labelEn}</td>
                    {AUDIENCE_TIERS.map(tier => (
                      <td key={tier} className="px-2 py-2 text-center">
                        <button
                          type="button"
                          disabled={tier === "public" && publicDisabled}
                          onClick={() => setField(section.fields, tier, !allOn(tier))}
                          className="text-[10.5px] font-bold disabled:opacity-25"
                          style={{ color: C.navy }}
                        >
                          {allOn(tier) ? t("hapus semua", "clear") : t("semua", "all")}
                        </button>
                      </td>
                    ))}
                  </tr>
                  {section.fields.map(field => (
                    <tr key={field} style={{ borderTop: `1px solid ${C.divider}` }}>
                      <td className="py-2 pl-7 pr-4" style={{ color: isEmpty(field) ? C.muted : C.body }}>
                        {fieldLabel(field, lang)}
                        {isEmpty(field) && (
                          <span className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: C.divider, color: C.muted }}>
                            {t("belum diisi", "not filled in")}
                          </span>
                        )}
                      </td>
                      {AUDIENCE_TIERS.map(tier => (
                        <td key={tier} className="px-2 py-2 text-center">
                          <TierBox
                            checked={audiences[tier].fields.includes(field)}
                            disabled={tier === "public" && publicDisabled}
                            onChange={on => setField([field], tier, on)}
                            label={`${fieldLabel(field, lang)} — ${tier}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
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
                      onClick={() => onAvatarSelection({ ...avatarSelection, [c.id]: v })}
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
  );
}

/* ── live preview ────────────────────────────────────── */

export function VisibilityPreview({
  candidates, lang, tiers, audiences, photoSelection, avatarSelection,
}: {
  candidates: BuilderCandidate[];
  lang: Lang;
  /** Audiences this link can actually have. */
  tiers: AudienceTier[];
  audiences: Audiences;
  photoSelection: Record<string, number[] | null>;
  avatarSelection: Record<string, AvatarVariant>;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [wantedTier, setWantedTier] = useState<AudienceTier>("member");
  const [wantedSlot, setWantedSlot] = useState(0);

  const tier = tiers.includes(wantedTier) ? wantedTier : tiers[0];
  const slot = Math.min(wantedSlot, Math.max(0, candidates.length - 1));
  const candidate = candidates[slot];
  const preview = candidate
    ? projectProfile({
        slot,
        candidate: candidate.data,
        audiences,
        tier,
        avatar: avatarSelection[candidate.id] ?? defaultAvatarFor(candidate.data),
        photoSelection: photoSelection[candidate.id] ?? null,
        anonymousLabel: `PREVIEW-${slot + 1}`,
        photoSrc: i => candidate.photoUrls[i],
      })
    : null;

  return (
    <div className="rounded-2xl border" style={{ borderColor: C.border, background: "#FBF8F3" }}>
      <div className="flex flex-wrap items-center gap-2 rounded-t-2xl border-b px-4 py-3" style={{ borderColor: C.border, background: "#fff" }}>
        <Eye className="h-4 w-4" style={{ color: C.navy }} />
        <span className="text-[13px] font-bold" style={{ color: C.text }}>{t("Pratinjau sebagai", "Preview as")}</span>
        {tiers.map(tt => (
          <Chip key={tt} active={tier === tt} onClick={() => setWantedTier(tt)}>{TIER_META[tt].title[lang]}</Chip>
        ))}
        <div className="flex-1" />
        {candidates.length > 1 && candidates.map((c, i) => (
          <Chip key={c.id} active={slot === i} onClick={() => setWantedSlot(i)}>{i + 1}</Chip>
        ))}
      </div>
      <div className="p-4 sm:p-6">
        {preview ? (
          <ProfileCard profile={preview} lang={lang} position={{ index: slot, total: candidates.length }} />
        ) : (
          <p className="py-10 text-center text-[13px]" style={{ color: C.muted }}>{t("Tambahkan profil untuk melihat pratinjau.", "Add a profile to see a preview.")}</p>
        )}
      </div>
    </div>
  );
}

/* ── editor for a link that already exists ───────────── */

export function ShareVisibilityEditor({ share, lang, onClose, onSaved }: {
  share: ShareSummary;
  lang: Lang;
  onClose: () => void;
  onSaved: (next: ShareSummary) => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [candidates, setCandidates] = useState<BuilderCandidate[] | null>(null);
  const [audiences, setAudiences] = useState<Audiences>(share.audiences);
  const [photoSelection, setPhotoSelection] = useState(share.photoSelection);
  const [avatarSelection, setAvatarSelection] = useState(share.avatarSelection);
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);

  const candidateKey = share.candidateIds.join(",");
  useEffect(() => {
    let alive = true;
    Promise.all(candidateKey.split(",").map(loadCandidate))
      .then(list => alive && setCandidates(list))
      .catch(err => {
        toast.error(err instanceof Error ? err.message : "Failed to load profiles");
        if (alive) setCandidates([]);
      });
    return () => { alive = false; };
  }, [candidateKey]);

  const publicDisabled = share.access.mode !== "anyone" || share.purpose === "matchmaking";
  const tiers = publicDisabled ? AUDIENCE_TIERS.filter(tt => tt !== "public") : AUDIENCE_TIERS;

  const dirty =
    !sameAudiences(audiences, share.audiences) ||
    JSON.stringify(photoSelection) !== JSON.stringify(share.photoSelection) ||
    JSON.stringify(avatarSelection) !== JSON.stringify(share.avatarSelection);

  const save = async () => {
    const top = audiences.candidate;
    if (!top.fields.length && !top.showName && !top.showPhotos) {
      return toast.error(t("Pilih minimal satu hal untuk ditampilkan", "Choose at least one thing to show"));
    }
    setSaving(true);
    try {
      const json = await authFetch<{ share: ShareSummary }>(`/api/admin/shares/${share.id}`, {
        method: "PATCH",
        body: JSON.stringify({ audiences, photoSelection, avatarSelection }),
      });
      onSaved(json.share);
      toast.success(t("Tampilan tautan diperbarui", "Link visibility updated"));
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-3 sm:p-8" style={{ background: "rgba(15,23,42,0.55)" }}>
      <div className="my-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white" style={{ boxShadow: "0 24px 64px rgba(15,23,42,0.28)" }}>
        <div className="flex flex-wrap items-center gap-3 border-b px-6 py-4" style={{ borderColor: C.border }}>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-extrabold" style={{ color: C.text }}>{t("Atur yang terlihat", "Edit what's visible")}</h2>
            <p className="truncate text-[12px]" style={{ color: C.muted }}>
              {share.recipientLabel} · {share.code} · {t("berlaku langsung di tautan yang sama", "applies at once to the same link")}
            </p>
          </div>
          <Chip active={view === "edit"} onClick={() => setView("edit")}>{t("Pengaturan", "Settings")}</Chip>
          <Chip active={view === "preview"} onClick={() => setView("preview")}>{t("Pratinjau", "Preview")}</Chip>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ borderColor: C.border }} aria-label="Close">
            <X className="h-4 w-4" style={{ color: C.muted }} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-7">
          {!candidates ? (
            <div className="flex justify-center py-16"><div className="h-7 w-7 animate-spin rounded-full border-2" style={{ borderColor: C.rose, borderTopColor: "transparent" }} /></div>
          ) : view === "edit" ? (
            <VisibilityFields
              candidates={candidates}
              lang={lang}
              publicDisabled={publicDisabled}
              audiences={audiences}
              onAudiences={setAudiences}
              photoSelection={photoSelection}
              onPhotoSelection={setPhotoSelection}
              avatarSelection={avatarSelection}
              onAvatarSelection={setAvatarSelection}
            />
          ) : (
            <VisibilityPreview
              candidates={candidates}
              lang={lang}
              tiers={tiers}
              audiences={audiences}
              photoSelection={photoSelection}
              avatarSelection={avatarSelection}
            />
          )}
        </div>

        <div className="flex items-center gap-2 border-t px-5 py-4 sm:px-7" style={{ borderColor: C.border }}>
          <p className="text-[12px]" style={{ color: C.label }}>
            {dirty ? t("Ada perubahan yang belum disimpan.", "You have unsaved changes.") : t("Belum ada perubahan.", "No changes yet.")}
          </p>
          <div className="flex-1" />
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-[13px] font-semibold" style={{ borderColor: C.border, color: C.label }}>
            {t("Batal", "Cancel")}
          </button>
          <button onClick={save} disabled={saving || !dirty} className="rounded-lg px-5 py-2 text-[13px] font-bold text-white disabled:opacity-50" style={{ background: C.navy }}>
            {saving ? t("Menyimpan…", "Saving…") : t("Simpan", "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}
