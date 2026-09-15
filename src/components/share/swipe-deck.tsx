"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion";
import {
  Briefcase, CalendarHeart, GraduationCap, Heart, Home, Lock, MapPin, Ruler, RotateCcw, Sparkles, X, type LucideIcon,
} from "lucide-react";
import { LONG_FORM_FIELDS, fieldLabel, type Lang } from "@/lib/share-display";
import type { ProjectedProfile } from "@/lib/share-sections";
import { ProfileAvatar } from "./avatars";
import { BRAND_GRADIENT, GeometricPattern, T, serif } from "./share-theme";
import { formatField, profileSections, profileTitle } from "./profile-card";

export type Decision = "yes" | "no";

const FLING_DISTANCE = 110;
const FLING_VELOCITY = 550;
/** room reserved at the bottom of the screen for the floating actions */
const ACTIONS_SPACE = 116;
/** photo height as a share of the card; the details peek in below and the whole card scrolls */
const PHOTO_SHARE = "84%";
/** how much of a photo we'll crop away before letterboxing it instead */
const MAX_CROP = 0.28;

/** The handful of facts worth reading before any table. */
const GLANCE: { field: string; icon: LucideIcon }[] = [
  { field: "occupation", icon: Briefcase },
  { field: "educations", icon: GraduationCap },
  { field: "maritalTimeline", icon: CalendarHeart },
  { field: "religiousPracticeLevel", icon: Sparkles },
  { field: "height", icon: Ruler },
  { field: "currentlyLivingWith", icon: Home },
];

/* ── one card: the photo, then everything this viewer is allowed to see ── */

function CardFace({ profile, lang, interactive, onOpenPhoto, note }: {
  profile: ProjectedProfile;
  lang: Lang;
  interactive: boolean;
  onOpenPhoto?: (index: number) => void;
  note?: string;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  /** cover when the crop is minor, contain when the photo truly can't fill */
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const frame = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPhotoIndex(0);
  }, [profile.slot]);

  const photo = profile.photos[Math.min(photoIndex, profile.photos.length - 1)];
  useEffect(() => {
    setLoaded(false);
  }, [photo?.src]);

  const onPhotoLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const box = frame.current?.getBoundingClientRect();
    if (box && box.width > 0 && img.naturalWidth > 0) {
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const boxRatio = box.width / box.height;
      // share of the image lost if we fill the frame
      const lost = imgRatio > boxRatio ? 1 - boxRatio / imgRatio : 1 - imgRatio / boxRatio;
      setFit(lost <= MAX_CROP ? "cover" : "contain");
    }
    setLoaded(true);
  };

  const age = formatField("age", profile.data.age, lang);
  const location = formatField("location", profile.data.location, lang);
  const occupation = formatField("occupation", profile.data.occupation, lang);
  const about = formatField("aboutMe", profile.data.aboutMe, lang);
  const sections = profileSections(profile, lang);
  const glance = GLANCE.map(g => ({ ...g, value: formatField(g.field, profile.data[g.field], lang) }))
    .filter(g => g.value)
    .slice(0, 6);
  const chips = [
    formatField("openToTaaruf", profile.data.openToTaaruf, lang),
    formatField("maritalStatus", profile.data.maritalStatus, lang),
  ].filter(Boolean) as string[];

  const step = (delta: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex(i => Math.max(0, Math.min(profile.photos.length - 1, i + delta)));
  };

  return (
    <div className="h-full w-full overflow-y-auto overscroll-contain" style={{ background: T.card }}>
      {/* ── photo, or a deep panel + avatar so the white name plate reads the same ── */}
      <div ref={frame} className="relative" style={{ height: PHOTO_SHARE }}>
        {photo ? (
          <>
            {/* placeholder until the photo arrives, so nothing pops in */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{ background: `linear-gradient(160deg, ${T.paperDeep}, ${T.paperBlue})`, opacity: loaded ? 0 : 1 }}
            />
            {/* blurred copy fills the gaps whenever the photo is letterboxed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-500"
              style={{ filter: "blur(26px) saturate(1.15)", transform: "scale(1.2)", opacity: loaded && fit === "contain" ? 1 : 0 }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={profileTitle(profile, lang)}
              draggable={false}
              onLoad={onPhotoLoad}
              onContextMenu={e => e.preventDefault()}
              className="absolute inset-0 h-full w-full select-none transition-opacity duration-500"
              style={{ objectFit: fit, objectPosition: "50% 28%", opacity: loaded ? 1 : 0 }}
            />
            {interactive && (
              <>
                {profile.photos.length > 1 && (
                  <>
                    <button aria-label={lang === "id" ? "Foto sebelumnya" : "Previous photo"} onClick={step(-1)} className="absolute inset-y-0 left-0 w-1/4 cursor-default" />
                    <button aria-label={lang === "id" ? "Foto berikutnya" : "Next photo"} onClick={step(1)} className="absolute inset-y-0 right-0 w-1/4 cursor-default" />
                    <div className="absolute inset-x-0 top-0 flex gap-1.5 p-3">
                      {profile.photos.map((p, i) => (
                        <span key={p.index} className="h-[3px] flex-1 rounded-full" style={{ background: i === photoIndex ? "#fff" : "rgba(255,255,255,0.36)" }} />
                      ))}
                    </div>
                  </>
                )}
                <button
                  aria-label={lang === "id" ? "Perbesar foto" : "Enlarge photo"}
                  onClick={e => { e.stopPropagation(); onOpenPhoto?.(photoIndex); }}
                  className="absolute inset-y-0 left-1/4 right-1/4 cursor-zoom-in"
                />
              </>
            )}
          </>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center pb-[30%]"
            style={{ background: `linear-gradient(160deg, ${T.navyDeep}, ${T.roseDeep})` }}
          >
            <GeometricPattern color="#FFFFFF" opacity={0.1} />
            <ProfileAvatar
              variant={profile.avatar}
              className="relative h-[132px] w-[132px] rounded-full"
              style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.4), 0 0 0 10px rgba(255,255,255,0.09)" }}
            />
          </div>
        )}

        {/* name plate */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%]"
          style={{ background: `linear-gradient(to top, ${T.roseDeep}F5 0%, ${T.roseDeep}D9 20%, ${T.roseDeep}73 46%, transparent 100%)` }}
        />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6" style={{ textShadow: "0 1px 10px rgba(76,31,53,0.5)" }}>
          <h2 className="text-[28px] leading-[1.1] text-white sm:text-[32px]" style={{ fontFamily: serif }}>
            {profileTitle(profile, lang)}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 text-[14px]" style={{ color: "rgba(255,255,255,0.93)" }}>
            {age && <span>{age} {lang === "id" ? "tahun" : "years"}</span>}
            {age && location && <span style={{ color: "rgba(255,255,255,0.5)" }}>·</span>}
            {location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>}
          </p>
          {occupation && <p className="mt-0.5 text-[13px]" style={{ color: "rgba(255,255,255,0.78)" }}>{occupation}</p>}
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {chips.map(chip => (
                <span
                  key={chip}
                  className="max-w-[180px] truncate rounded-full px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
                  style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.26)" }}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── everything the team allowed this viewer to see ──
          at least one card tall, so even a short profile scrolls the photo fully away */}
      <div className="relative" style={{ minHeight: "100%" }}>
        <div className="px-5 pb-10 pt-4" style={{ background: T.card }}>
          {note && (
            <div className="mb-4 rounded-xl px-3.5 py-3" style={{ background: T.paperBlue }}>
              <p className="whitespace-pre-line text-[12.5px] leading-[1.65]" style={{ color: T.body }}>{note}</p>
              <p className="mt-1.5 text-[11.5px] italic" style={{ fontFamily: serif, color: T.navy }}>
                — {lang === "id" ? "Tim Jodohmu" : "The Jodohmu team"}
              </p>
            </div>
          )}

          {profile.photosHidden && (
            <p className="mb-3.5 rounded-xl px-3.5 py-2.5 text-[11.5px] leading-relaxed" style={{ background: T.paperDeep, color: T.roseDeep }}>
              {lang === "id"
                ? "Foto dibagikan setelah ada ketertarikan kedua pihak."
                : "Photos are shared once there is mutual interest."}
            </p>
          )}

          {/* the few facts worth reading first */}
          {glance.length > 0 && (
            <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3.5">
              {glance.map(({ field, icon: Icon, value }) => (
                <div key={field} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: T.surface }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: T.navy }} />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[10px] font-bold uppercase" style={{ color: T.faint, letterSpacing: "0.1em" }}>
                      {fieldLabel(field, lang)}
                    </dt>
                    <dd className="text-[13px] font-semibold leading-snug" style={{ color: T.ink }}>{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}

          {about && (
            <p className="mb-5 whitespace-pre-line text-[14px] leading-[1.8]" style={{ color: T.body }}>{about}</p>
          )}

          {sections.map(section => (
            <section key={section.key} className="mb-4 last:mb-0">
              <div className="mb-2 flex items-center gap-2.5">
                <h3 className="text-[12px] font-extrabold uppercase" style={{ color: T.rose, letterSpacing: "0.12em" }}>
                  {lang === "id" ? section.labelId : section.labelEn}
                </h3>
                <span className="h-px flex-1" style={{ background: T.hairline }} />
              </div>
              <dl>
                {section.rows.map((row, i) =>
                  LONG_FORM_FIELDS.has(row.field) ? (
                    <div key={row.field} className="py-2" style={i ? { borderTop: `1px solid ${T.hairline}` } : undefined}>
                      <dt className="mb-1 text-[10.5px] font-bold uppercase" style={{ color: T.faint, letterSpacing: "0.1em" }}>
                        {fieldLabel(row.field, lang)}
                      </dt>
                      <dd className="whitespace-pre-line text-[13px] leading-relaxed" style={{ color: T.body }}>{row.value}</dd>
                    </div>
                  ) : (
                    <div key={row.field} className="flex items-baseline justify-between gap-4 py-1.5" style={i ? { borderTop: `1px solid ${T.hairline}` } : undefined}>
                      <dt className="text-[12.5px]" style={{ color: T.muted }}>{fieldLabel(row.field, lang)}</dt>
                      <dd className="text-right text-[13px] font-semibold" style={{ color: T.ink }}>{row.value}</dd>
                    </div>
                  ),
                )}
              </dl>
            </section>
          ))}

          {!about && sections.length === 0 && glance.length === 0 && (
            <p className="py-6 text-center text-[12.5px]" style={{ color: T.faint }}>
              {lang === "id" ? "Tim Jodohmu membagikan detail lainnya secara pribadi." : "The Jodohmu team shares further details privately."}
            </p>
          )}
        </div>
      </div>
      {/* hints that the card keeps scrolling */}
      <div className="pointer-events-none sticky bottom-0 -mt-9 h-9" style={{ background: `linear-gradient(to top, ${T.card}, transparent)` }} />
    </div>
  );
}

/* ── capture deterrence ──
   A web page cannot block OS screenshots. What it can do is make any capture
   traceable (identity watermark over the whole card), hide content whenever the
   page isn't the active window, and refuse to print. */

export type CaptureKind = "printscreen" | "shortcut" | "print";

function IdentityWatermark({ text }: { text: string }) {
  const safe = text.replace(/[<>&"'`]/g, "").slice(0, 80);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="150">` +
    `<text x="120" y="80" text-anchor="middle" transform="rotate(-24 120 75)" fill="rgb(128,128,128)" fill-opacity="0.22" ` +
    `font-family="Arial, sans-serif" font-size="12" font-weight="700">${safe}</text></svg>`;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]"
      style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`, backgroundRepeat: "repeat" }}
    />
  );
}

/* ── the deck: fills whatever space its parent gives it ── */

export function SwipeDeck({
  profiles, index, lang, onDecide, onOpenPhoto, onUndo, canUndo, askQuestions, note, watermark, onCaptureAttempt,
}: {
  profiles: ProjectedProfile[];
  index: number;
  lang: Lang;
  onDecide: (decision: Decision) => void;
  onOpenPhoto: (slot: number, index: number) => void;
  onUndo: () => void;
  canUndo: boolean;
  /** matchmaking decks ask "cocok / belum"; promotion decks just browse */
  askQuestions: boolean;
  /** the team's opening note, shown on the first card */
  note?: string;
  /** who is looking — tiled over the card so any capture is traceable */
  watermark?: string;
  onCaptureAttempt?: (kind: CaptureKind) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [exit, setExit] = useState<Decision | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-260, 260], [-14, 14]);
  const yesOpacity = useTransform(x, [30, 130], [0, 1]);
  const noOpacity = useTransform(x, [-130, -30], [1, 0]);
  // the card behind rises towards the front as the top card is dragged away
  const nextScale = useTransform(x, [-220, 0, 220], [1, 0.96, 1]);
  const nextOpacity = useTransform(x, [-220, 0, 220], [0.9, 0.45, 0.9]);
  const nextLift = useTransform(x, [-220, 0, 220], [0, 10, 0]);
  const decided = useRef(false);

  const profile = profiles[index];
  const next = profiles[index + 1];

  /* hide everything while the page isn't the active window */
  const [shielded, setShielded] = useState(false);
  const captureRef = useRef(onCaptureAttempt);
  captureRef.current = onCaptureAttempt;

  useEffect(() => {
    const hide = () => setShielded(true);
    const show = () => setShielded(false);
    const flash = (kind: CaptureKind) => {
      hide();
      window.setTimeout(show, 1600);
      captureRef.current?.(kind);
    };
    const onVisibility = () => (document.visibilityState === "hidden" ? hide() : show());
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === "p") {
        e.preventDefault();
        flash("print");
      } else if (e.metaKey && e.shiftKey && ["3", "4", "5", "6", "s"].includes(key)) {
        flash("shortcut");
      }
    };
    // Windows only reports PrintScreen on key-up, after the capture was taken.
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") flash("printscreen");
    };

    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    decided.current = false;
    setExit(null);
    x.set(0);
  }, [index, x]);

  const fling = (decision: Decision) => {
    if (decided.current) return;
    decided.current = true;
    if (reduceMotion) {
      onDecide(decision);
      return;
    }
    setExit(decision);
    // Driven on a timer rather than onAnimationComplete: dropping `drag` as the
    // card flies out interrupts the animation and the callback never arrives.
    window.setTimeout(() => onDecide(decision), 320);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") fling("yes");
      if (e.key === "ArrowLeft") fling("no");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > FLING_DISTANCE || info.velocity.x > FLING_VELOCITY) fling("yes");
    else if (info.offset.x < -FLING_DISTANCE || info.velocity.x < -FLING_VELOCITY) fling("no");
  };

  if (!profile) return null;

  const yesLabel = askQuestions ? (lang === "id" ? "COCOK" : "MATCH") : (lang === "id" ? "SUKA" : "LIKE");
  const noLabel = askQuestions ? (lang === "id" ? "BELUM" : "NOT YET") : (lang === "id" ? "LEWATI" : "SKIP");
  const cardShell = "h-full w-full overflow-hidden rounded-[24px]";
  const shellShadow = "0 2px 6px rgba(16,43,97,0.07), 0 24px 50px -26px rgba(16,43,97,0.5)";

  return (
    <div className="absolute inset-0 select-none" style={{ WebkitTouchCallout: "none" }} onContextMenu={e => e.preventDefault()}>
      {/* printing or "save as PDF" produces a blank page */}
      <style>{"@media print { html, body { display: none !important; } }"}</style>

      {shielded && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center px-10 text-center"
          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
        >
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: T.paperDeep }}>
            <Lock className="h-5 w-5" style={{ color: T.rose }} />
          </span>
          <p className="text-[15px] font-bold" style={{ color: T.ink }}>
            {lang === "id" ? "Konten disembunyikan" : "Content hidden"}
          </p>
          <p className="mt-1 max-w-[260px] text-[12.5px] leading-relaxed" style={{ color: T.muted }}>
            {lang === "id"
              ? "Profil ini rahasia dan hanya tampil saat halaman aktif."
              : "This profile is confidential and only shows while the page is active."}
          </p>
        </div>
      )}

      {/* the card fills the screen, minus room for the actions */}
      <div className="absolute inset-x-0 top-0 mx-auto px-3 pt-2 sm:px-4" style={{ bottom: ACTIONS_SPACE, maxWidth: 470 }}>
        <div className="relative h-full w-full">
          {next && (
            <motion.div className="absolute inset-0" style={{ scale: nextScale, opacity: nextOpacity, y: nextLift }}>
              <div className={cardShell} style={{ boxShadow: shellShadow }}>
                <CardFace profile={next} lang={lang} interactive={false} />
              </div>
            </motion.div>
          )}

          <motion.div
            key={profile.slot}
            className="absolute inset-0 touch-pan-y"
            style={{ x, rotate, cursor: "grab" }}
            drag={exit ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            dragTransition={{ bounceStiffness: 320, bounceDamping: 26 }}
            whileDrag={{ cursor: "grabbing" }}
            onDragEnd={onDragEnd}
            animate={exit ? { x: exit === "yes" ? 640 : -640, opacity: 0, rotate: exit === "yes" ? 18 : -18 } : undefined}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
          >
            <div className={cardShell} style={{ boxShadow: shellShadow }}>
              <CardFace profile={profile} lang={lang} interactive note={note} onOpenPhoto={i => onOpenPhoto(profile.slot, i)} />
            </div>
            {watermark && <IdentityWatermark text={watermark} />}

            <motion.div
              className="pointer-events-none absolute left-5 top-6 rounded-xl px-4 py-2 text-[18px] font-extrabold tracking-[0.12em]"
              style={{ opacity: yesOpacity, rotate: -11, color: T.rose, border: `3px solid ${T.rose}`, background: "rgba(255,255,255,0.92)" }}
            >
              {yesLabel}
            </motion.div>
            <motion.div
              className="pointer-events-none absolute right-5 top-6 rounded-xl px-4 py-2 text-[18px] font-extrabold tracking-[0.12em]"
              style={{ opacity: noOpacity, rotate: 11, color: T.body, border: `3px solid ${T.body}`, background: "rgba(255,255,255,0.92)" }}
            >
              {noLabel}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* floating actions */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-5 pt-2">
        <div className="flex items-center gap-5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            aria-label={lang === "id" ? "Kembali ke profil sebelumnya" : "Back to the previous profile"}
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-35"
            style={{ background: T.card, border: `1px solid ${T.hairline}`, boxShadow: "0 8px 20px -12px rgba(16,43,97,0.4)" }}
          >
            <RotateCcw className="h-[18px] w-[18px]" style={{ color: T.muted }} />
          </button>
          <button
            onClick={() => fling("no")}
            aria-label={noLabel}
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full transition-transform active:scale-90"
            style={{ background: T.card, border: `1px solid ${T.hairline}`, boxShadow: "0 10px 24px -10px rgba(16,43,97,0.45)" }}
          >
            <X className="h-6 w-6" style={{ color: T.body }} />
          </button>
          <button
            onClick={() => fling("yes")}
            aria-label={yesLabel}
            className="flex h-[70px] w-[70px] items-center justify-center rounded-full transition-transform active:scale-90"
            style={{ background: BRAND_GRADIENT, boxShadow: "0 14px 30px -12px rgba(155,34,66,0.6)" }}
          >
            <Heart className="h-7 w-7 fill-current text-white" />
          </button>
        </div>
        <p className="mt-2.5 text-center text-[11.5px]" style={{ color: T.faint }}>
          {lang === "id" ? "Geser ke kanan bila cocok, ke kiri bila belum." : "Swipe right if it feels right, left if not."}
        </p>
      </div>
    </div>
  );
}
