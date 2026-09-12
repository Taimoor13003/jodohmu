"use client";

import {
  Briefcase, CalendarHeart, GraduationCap, MapPin, Quote, Ruler, Sparkles, type LucideIcon,
} from "lucide-react";
import { SHARE_SECTIONS, type ProjectedProfile } from "@/lib/share-sections";
import { LONG_FORM_FIELDS, displayValue, fieldLabel, type Lang } from "@/lib/share-display";
import { Eyebrow, GeometricPattern, T, cardShadow, serif } from "./share-theme";

const GLANCE: { field: string; icon: LucideIcon }[] = [
  { field: "location", icon: MapPin },
  { field: "occupation", icon: Briefcase },
  { field: "educations", icon: GraduationCap },
  { field: "height", icon: Ruler },
  { field: "religiousPracticeLevel", icon: Sparkles },
  { field: "maritalTimeline", icon: CalendarHeart },
];

const HERO_FIELDS = new Set(["age", "gender", "maritalStatus", "openToTaaruf", "aboutMe", ...GLANCE.map(g => g.field)]);

export function formatField(field: string, value: unknown, lang: Lang): string | null {
  const text = displayValue(value, lang);
  if (!text) return null;
  if (field === "height" && /^\d+$/.test(text)) return `${text} cm`;
  if (field === "weight" && /^\d+$/.test(text)) return `${text} kg`;
  return text;
}

export function profileTitle(profile: ProjectedProfile, lang: Lang): string {
  if (!profile.nameHidden) return profile.name;
  return `${lang === "id" ? "Kandidat" : "Candidate"} ${profile.slot + 1}`;
}

function initials(profile: ProjectedProfile): string {
  if (profile.nameHidden) return String(profile.slot + 1);
  return profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join("");
}

function Portrait({ profile, lang, onOpenPhoto }: { profile: ProjectedProfile; lang: Lang; onOpenPhoto?: (i: number) => void }) {
  const cover = profile.photos[0];
  if (cover) {
    return (
      <button
        type="button"
        onClick={() => onOpenPhoto?.(0)}
        onContextMenu={e => e.preventDefault()}
        className="group relative block w-full h-full min-h-[340px] overflow-hidden cursor-zoom-in"
        style={{ background: T.paperDeep }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover.src}
          alt={profileTitle(profile, lang)}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover object-top select-none transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <span className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to top, rgba(28,25,23,0.35), transparent)" }} />
      </button>
    );
  }

  return (
    <div className="relative flex h-full min-h-[300px] flex-col items-center justify-center overflow-hidden px-8 py-12" style={{ background: T.paperDeep }}>
      <GeometricPattern />
      <div
        className="relative flex h-[118px] w-[118px] items-center justify-center rounded-full"
        style={{ background: T.paper, boxShadow: `0 0 0 1px ${T.gold}55, 0 0 0 8px ${T.paper}, 0 0 0 9px ${T.gold}33` }}
      >
        <span className="text-[40px] leading-none" style={{ fontFamily: serif, color: T.navyDeep }}>
          {initials(profile)}
        </span>
      </div>
      <p className="relative mt-7 max-w-[240px] text-center text-[12px] leading-relaxed" style={{ color: T.muted }}>
        {lang === "id"
          ? "Foto dibagikan dengan penuh amanah, setelah ada ketertarikan dan persetujuan kedua pihak."
          : "Photos are shared in trust, once there is mutual interest and consent."}
      </p>
    </div>
  );
}

export function ProfileCard({
  profile, lang, position, onOpenPhoto, notice,
}: {
  profile: ProjectedProfile;
  lang: Lang;
  /** e.g. { index: 0, total: 3 } for multi-profile links */
  position?: { index: number; total: number };
  onOpenPhoto?: (photoIndex: number) => void;
  notice?: React.ReactNode;
}) {
  const d = profile.data;
  const f = (field: string) => formatField(field, d[field], lang);
  const title = profileTitle(profile, lang);
  const age = f("age");
  const location = f("location");
  const about = f("aboutMe");
  const chips = [f("maritalStatus"), f("openToTaaruf"), f("gender")].filter(Boolean) as string[];
  const glance = GLANCE.map(g => ({ ...g, value: f(g.field) })).filter(g => g.value && g.field !== "location");

  const sections = SHARE_SECTIONS.map(section => ({
    ...section,
    rows: section.fields
      .filter(field => !HERO_FIELDS.has(field))
      .map(field => ({ field, value: f(field) }))
      .filter((row): row is { field: string; value: string } => !!row.value),
  })).filter(s => s.rows.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <article className="overflow-hidden rounded-[28px]" style={{ background: T.card, border: `1px solid ${T.hairline}`, boxShadow: cardShadow }}>
        <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="relative md:min-h-[520px]">
            <Portrait profile={profile} lang={lang} onOpenPhoto={onOpenPhoto} />
          </div>

          <div className="flex flex-col px-6 py-8 sm:px-10 sm:py-11">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Eyebrow>
                {position && position.total > 1
                  ? lang === "id"
                    ? `Perkenalan ${position.index + 1} dari ${position.total}`
                    : `Introduction ${position.index + 1} of ${position.total}`
                  : lang === "id"
                    ? "Perkenalan pribadi"
                    : "Private introduction"}
              </Eyebrow>
            </div>

            <h2 className="text-[34px] sm:text-[44px] leading-[1.05] tracking-[-0.01em]" style={{ fontFamily: serif, color: T.ink }}>
              {title}
            </h2>

            {(age || location) && (
              <p className="mt-3 flex flex-wrap items-center gap-x-2.5 text-[15px]" style={{ color: T.body }}>
                {age && <span>{age} {lang === "id" ? "tahun" : "years"}</span>}
                {age && location && <span style={{ color: T.faint }}>·</span>}
                {location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" style={{ color: T.gold }} />
                    {location}
                  </span>
                )}
              </p>
            )}

            {chips.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {chips.map(chip => (
                  <span key={chip} className="rounded-full px-3 py-1 text-[11.5px] font-bold" style={{ background: T.goldSoft, color: "#6B5530" }}>
                    {chip}
                  </span>
                ))}
              </div>
            )}

            {about && (
              <blockquote className="relative mt-8 border-l pl-5" style={{ borderColor: T.gold }}>
                <Quote className="absolute -left-2.5 -top-1 h-5 w-5 p-0.5" style={{ color: T.gold, background: T.card }} />
                <p className="whitespace-pre-line text-[16.5px] italic leading-[1.8]" style={{ fontFamily: serif, color: T.body }}>
                  {about}
                </p>
              </blockquote>
            )}

            {glance.length > 0 && (
              <dl className="mt-auto grid grid-cols-1 gap-x-6 gap-y-4 pt-9 sm:grid-cols-2">
                {glance.map(({ field, icon: Icon, value }) => (
                  <div key={field} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: T.paper, border: `1px solid ${T.hairline}` }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: T.navy }} />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[10.5px] font-bold uppercase" style={{ color: T.faint, letterSpacing: "0.12em" }}>
                        {fieldLabel(field, lang)}
                      </dt>
                      <dd className="text-[14px] font-semibold leading-snug" style={{ color: T.ink }}>{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {profile.photos.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto px-6 py-5 sm:px-8" style={{ borderTop: `1px solid ${T.hairline}` }}>
            {profile.photos.map((photo, i) => (
              <button
                key={photo.index}
                type="button"
                onClick={() => onOpenPhoto?.(i)}
                onContextMenu={e => e.preventDefault()}
                className="h-20 w-16 shrink-0 overflow-hidden rounded-xl cursor-zoom-in"
                style={{ border: `1px solid ${T.hairline}`, background: T.paperDeep }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt="" draggable={false} className="h-full w-full object-cover object-top select-none" />
              </button>
            ))}
          </div>
        )}
      </article>

      {notice}

      {sections.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {sections.map(section => (
            <section key={section.key} className="rounded-[24px] px-6 py-7 sm:px-8" style={{ background: T.card, border: `1px solid ${T.hairline}` }}>
              <div className="mb-5 flex items-center gap-3">
                <h3 className="text-[19px]" style={{ fontFamily: serif, color: T.ink }}>
                  {lang === "id" ? section.labelId : section.labelEn}
                </h3>
                <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${T.gold}66, transparent)` }} />
              </div>
              <dl>
                {section.rows.map((row, i) =>
                  LONG_FORM_FIELDS.has(row.field) ? (
                    <div key={row.field} className="py-3.5" style={i ? { borderTop: `1px solid ${T.hairline}` } : undefined}>
                      <dt className="mb-1.5 text-[10.5px] font-bold uppercase" style={{ color: T.faint, letterSpacing: "0.12em" }}>
                        {fieldLabel(row.field, lang)}
                      </dt>
                      <dd className="whitespace-pre-line text-[14.5px] leading-relaxed" style={{ color: T.body }}>{row.value}</dd>
                    </div>
                  ) : (
                    <div key={row.field} className="flex items-baseline justify-between gap-6 py-3" style={i ? { borderTop: `1px solid ${T.hairline}` } : undefined}>
                      <dt className="text-[13px]" style={{ color: T.muted }}>{fieldLabel(row.field, lang)}</dt>
                      <dd className="text-right text-[14px] font-semibold" style={{ color: T.ink }}>{row.value}</dd>
                    </div>
                  ),
                )}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
