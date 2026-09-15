"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { getIdToken } from "firebase/auth";
import {
  Briefcase, CalendarHeart, CheckCircle2, ChevronLeft, ChevronRight, Expand, Eye, Globe,
  GraduationCap, Heart, HeartHandshake, Lock, MapPin, Ruler, Send, Share2, Sparkles, X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { SHARE_SECTIONS } from "@/lib/share-sections";
import { LONG_FORM_FIELDS, fieldLabel } from "@/lib/share-display";
import { defaultAvatarFor, type AvatarVariant } from "@/lib/share-avatars";
import { formatField } from "@/components/share/profile-card";
import { ProfileAvatar } from "@/components/share/avatars";
import { BRAND_GRADIENT, GeometricPattern, T, cardShadow, serif } from "@/components/share/share-theme";
import LogoIcon from "@/assets/jodohmu-logo.png";

type D = Record<string, unknown>;
type Lang = "id" | "en";
type Preview = { linkActive: boolean; photosVisible: boolean };

/* Quick facts shown as chips right under the photo */
const GLANCE: { field: string; icon: LucideIcon }[] = [
  { field: "occupation", icon: Briefcase },
  { field: "educations", icon: GraduationCap },
  { field: "maritalStatus", icon: HeartHandshake },
  { field: "religiousPracticeLevel", icon: Sparkles },
  { field: "maritalTimeline", icon: CalendarHeart },
  { field: "height", icon: Ruler },
];

const HERO_FIELDS = new Set(["fullName", "age", "gender", "location", "openToTaaruf", "aboutMe", ...GLANCE.map(g => g.field)]);
const SKIP_SECTIONS = new Set(["ringkasan", "tentang-saya"]);
/** fill the frame only if that crops away at most this share of the photo */
const COVER_MAX_CROP = 0.18;

/** Display text for a field; stored placeholders like "—" count as empty. */
function show(field: string, value: unknown, lang: Lang): string | null {
  const text = formatField(field, value, lang);
  return text && text.trim() !== "—" ? text : null;
}

type Row = { field: string; label: string; value: string };

function detailSections(data: D, lang: Lang) {
  return SHARE_SECTIONS.filter(s => !SKIP_SECTIONS.has(s.key))
    .map(section => {
      const rows: Row[] = [];
      for (const field of section.fields) {
        if (HERO_FIELDS.has(field) || field === "preferredMaxAge") continue;
        if (field === "preferredMinAge") {
          const min = show(field, data.preferredMinAge, lang);
          const max = show("preferredMaxAge", data.preferredMaxAge, lang);
          if (min || max) {
            rows.push({
              field,
              label: lang === "id" ? "Usia pasangan" : "Partner's age",
              value: min && max ? `${min}–${max} ${lang === "id" ? "tahun" : "years"}` : min ? `${min}+` : `≤ ${max}`,
            });
          }
          continue;
        }
        const value = show(field, data[field], lang);
        if (value) rows.push({ field, label: fieldLabel(field, lang), value });
      }
      return { key: section.key, title: lang === "id" ? section.labelId : section.labelEn, rows };
    })
    .filter(s => s.rows.length > 0);
}

export default function PublicProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const { user, loading: authLoading } = useAuth();
  const { lang, setLang } = useLanguage();
  const router = useRouter();

  /** Set when an admin/worker opens the link: what visitors get, plus the link's settings. */
  const [preview,     setPreview]     = useState<Preview | null>(null);
  const [previewAs,   setPreviewAs]   = useState<"visitor" | "member">("visitor");
  const [data,        setData]        = useState<D | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [photoIdx,    setPhotoIdx]    = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [sheetOpen,   setSheetOpen]   = useState(false);
  const [message,     setMessage]     = useState("");
  const [sending,     setSending]     = useState(false);
  const [sent,        setSent]        = useState(false);
  const [sendError,   setSendError]   = useState("");

  useEffect(() => {
    if (!uid || authLoading) return;
    (async () => {
      try {
        // Signed-in team members get a preview even while the link is switched off
        const headers: HeadersInit = user ? { Authorization: `Bearer ${await getIdToken(user)}` } : {};
        const res = await fetch(`/api/public/profile/${uid}`, { headers });
        const json = await res.json() as { available: boolean; data?: D; preview?: Preview };
        setData(json.available ? (json.data ?? null) : null);
        setPreview(json.preview ?? null);
      } catch { setData(null); }
      finally { setLoading(false); }
    })();
  }, [uid, user, authLoading]);

  const l = (id: string, en: string) => lang === "id" ? id : en;

  // In preview, render exactly what the chosen kind of viewer would see
  const viewer = preview ? (previewAs === "member" ? user : null) : user;

  const sections = useMemo(() => (data ? detailSections(data, lang) : []), [data, lang]);

  const sendRequest = async () => {
    if (preview) return;
    if (!user) { router.push(`/login?redirect=/profile/${uid}`); return; }
    setSending(true); setSendError("");
    try {
      const token = await getIdToken(auth.currentUser!);
      const res = await fetch("/api/taaruf-request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUid: uid, message }),
      });
      if (res.status === 409) { setSent(true); return; }
      if (!res.ok) {
        let msg = l("Terjadi kesalahan. Coba lagi.", "Something went wrong. Please try again.");
        try {
          const body = await res.json() as { error?: string };
          if (body.error === "Cannot request yourself") msg = l("Anda tidak bisa mengajukan perkenalan ke diri sendiri.", "You can't request an introduction to yourself.");
          else if (body.error === "Profile not available") msg = l("Profil tidak tersedia.", "Profile not available.");
          else if (body.error) msg = body.error;
        } catch { /* ignore */ }
        setSendError(msg);
        return;
      }
      setSent(true);
    } catch { setSendError(l("Terjadi kesalahan.", "Something went wrong.")); }
    finally { setSending(false); }
  };

  const shareLink = async () => {
    const url = `${window.location.origin}/profile/${uid}`;
    try {
      if (navigator.share) { await navigator.share({ title: "Jodohmu", url }); return; }
      await navigator.clipboard.writeText(url);
      toast.success(l("Link profil disalin", "Profile link copied"));
    } catch { /* share sheet dismissed */ }
  };

  /* ── states ── */
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: T.paper }}>
        <div className="mx-auto max-w-[520px] px-4 pt-20">
          <div className="aspect-[4/5] w-full animate-pulse rounded-[28px]" style={{ background: T.surface }} />
          <div className="mt-3 flex gap-2">
            {[80, 110, 70].map(w => <div key={w} className="h-8 animate-pulse rounded-full" style={{ width: w, background: T.surface }} />)}
          </div>
          <div className="mt-4 h-28 animate-pulse rounded-[24px]" style={{ background: T.surface }} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: `linear-gradient(180deg, ${T.paperDeep} 0%, ${T.paper} 45%, ${T.paperBlue} 100%)` }}>
        <div className="w-full max-w-sm rounded-[28px] bg-white px-6 py-10 text-center" style={{ boxShadow: cardShadow }}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: T.paperDeep, color: T.rose }}>
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-[22px]" style={{ fontFamily: serif, color: T.ink }}>{l("Profil tidak tersedia", "Profile not available")}</h1>
          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: T.body }}>
            {l("Pemilik profil sedang menutup link ini, atau link tidak ditemukan.", "The owner has switched this link off, or it doesn't exist.")}
          </p>
          <Link href="/" className="mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-[14px] font-bold text-white" style={{ background: BRAND_GRADIENT }}>
            {l("Kenali Jodohmu", "Discover Jodohmu")}
          </Link>
        </div>
      </div>
    );
  }

  const firstName = (typeof data.fullName === "string" ? data.fullName.trim().split(/\s+/)[0] : "") || l("Kandidat", "Candidate");
  const age = show("age", data.age, lang);
  const location = show("location", data.location, lang);
  const about = show("aboutMe", data.aboutMe, lang);
  const openTaaruf = data.openToTaaruf === "ready" || data.openToTaaruf === "preparing" ? formatField("openToTaaruf", data.openToTaaruf, lang) : null;
  const photos = data.publicPhotosVisible && Array.isArray(data.photoUrls)
    ? (data.photoUrls as unknown[]).filter((u): u is string => typeof u === "string" && !!u)
    : [];
  const glance = GLANCE
    .map(g => ({ ...g, value: show(g.field, data[g.field], lang) }))
    .filter((g): g is typeof g & { value: string } => !!g.value);


  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${T.paperDeep} 0%, ${T.paper} 360px)`, color: T.ink }}>
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-xl" style={{ background: "rgba(255,255,255,0.84)", borderColor: T.hairline }}>
        <div className="mx-auto flex h-14 max-w-[520px] items-center gap-2 px-4">
          <Link href="/" aria-label="Jodohmu" className="flex items-center">
            <Image src={LogoIcon} alt="Jodohmu" height={30} style={{ width: "auto" }} priority />
          </Link>
          <div className="flex-1" />
          <button onClick={() => setLang(lang === "id" ? "en" : "id")}
            className="flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold"
            style={{ borderColor: T.hairline, color: T.navy, background: T.surface }}>
            <Globe className="h-3.5 w-3.5" />
            {lang === "id" ? "EN" : "ID"}
          </button>
          {!viewer && (
            <Link href={`/login?redirect=/profile/${uid}`}
              className="flex h-8 items-center rounded-full px-3.5 text-[12.5px] font-bold text-white"
              style={{ background: T.navy }}>
              {l("Masuk", "Sign in")}
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[520px] px-4 pb-32 pt-4">
        {preview && (
          <div className="mb-4 rounded-2xl border px-4 py-3" style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}>
            <p className="text-[13px] font-bold" style={{ color: "#92400E" }}>
              <Eye className="mr-1.5 inline h-4 w-4 -translate-y-px" />
              {l("Pratinjau tim — beginilah link ini terlihat oleh orang lain", "Team preview — this is exactly what others see")}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "#B45309" }}>
              {preview.linkActive
                ? l("Link sedang AKTIF — siapa pun yang punya link bisa membukanya.", "The link is ON — anyone with it can open this page.")
                : l("Link sedang NONAKTIF — orang lain akan melihat “Profil tidak tersedia”. Hanya tim yang bisa melihat pratinjau ini.", "The link is OFF — others see “Profile not available”. Only the team can see this preview.")}
              {" · "}
              {preview.photosVisible ? l("Foto terlihat", "Photos visible") : l("Foto disembunyikan (avatar)", "Photos hidden (avatar)")}
            </p>
            <div className="mt-2.5 inline-flex rounded-full border bg-white p-0.5 text-[12px] font-semibold" style={{ borderColor: "#FDE68A" }}>
              {(["visitor", "member"] as const).map(v => (
                <button key={v} onClick={() => setPreviewAs(v)} className="rounded-full px-3 py-1 transition-colors"
                  style={previewAs === v ? { background: "#92400E", color: "#fff" } : { color: "#92400E" }}>
                  {v === "visitor" ? l("Belum login", "Not signed in") : l("Sudah login", "Signed in")}
                </button>
              ))}
            </div>
          </div>
        )}

        <PhotoHero
          photos={photos}
          index={photoIdx}
          onIndex={setPhotoIdx}
          onOpen={setLightboxIdx}
          firstName={firstName}
          age={age}
          location={location}
          openTaaruf={openTaaruf}
          avatar={defaultAvatarFor(data)}
          lang={lang}
        />

        {glance.length > 0 && (
          <section className="mt-3 flex flex-wrap gap-2">
            {glance.map(({ field, icon: Icon, value }) => (
              <span key={field} className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-[13px] font-medium"
                style={{ borderColor: T.hairline, color: T.ink }}>
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: T.rose }} />
                {value}
              </span>
            ))}
          </section>
        )}

        {about && (
          <section className="mt-4 rounded-[24px] bg-white px-5 py-6" style={{ boxShadow: cardShadow }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: T.rose }}>{l("Tentang saya", "About me")}</p>
            <p className="mt-3 whitespace-pre-line text-[19px] leading-[1.55]" style={{ fontFamily: serif, color: T.ink }}>{about}</p>
          </section>
        )}

        {sections.map(section => (
          <SectionCard key={section.key} title={section.title} rows={section.rows} />
        ))}

        <footer className="mt-10 flex flex-col items-center gap-2 text-center">
          <Image src={LogoIcon} alt="Jodohmu" height={22} style={{ width: "auto", opacity: 0.7 }} />
          <p className="max-w-[300px] text-[12px] leading-relaxed" style={{ color: T.muted }}>
            {l("Profil ini dibagikan melalui Jodohmu. Mohon jaga amanah dan jangan sebarkan tanpa izin.",
               "Shared via Jodohmu. Please keep it in confidence and don't pass it on without permission.")}
          </p>
        </footer>
      </main>

      {/* action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40" style={{ background: "linear-gradient(to top, rgba(255,255,255,0.97) 62%, rgba(255,255,255,0))" }}>
        <div className="mx-auto flex max-w-[520px] items-center gap-3 px-4 pt-6" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}>
          <button onClick={shareLink} aria-label={l("Bagikan profil", "Share profile")}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white transition active:scale-95"
            style={{ boxShadow: cardShadow, color: T.navy }}>
            <Share2 className="h-5 w-5" />
          </button>
          <button onClick={() => setSheetOpen(true)} disabled={sent}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-[15.5px] font-bold text-white transition active:scale-[0.98]"
            style={{ background: sent ? T.successInk : BRAND_GRADIENT, boxShadow: "0 14px 30px -12px rgba(155,34,66,0.6)" }}>
            {sent
              ? <><CheckCircle2 className="h-5 w-5" />{l("Permintaan terkirim", "Request sent")}</>
              : <><Heart className="h-5 w-5 fill-current" />{l("Ajukan Perkenalan", "Request an Introduction")}</>}
          </button>
        </div>
      </div>

      {/* request sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div key="scrim" className="fixed inset-0 z-50" style={{ background: "rgba(16,20,40,0.5)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)} />
            <motion.div key="sheet" role="dialog" aria-modal="true"
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[520px] rounded-t-[28px] bg-white px-5 pt-3"
              style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 340 }}>
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full" style={{ background: T.hairline }} />
              {sent ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <CheckCircle2 className="h-11 w-11" style={{ color: T.successInk }} />
                  <h2 className="text-[21px]" style={{ fontFamily: serif, color: T.ink }}>{l("Permintaan terkirim", "Request sent")}</h2>
                  <p className="max-w-[300px] text-[13.5px] leading-relaxed" style={{ color: T.body }}>
                    {l("Tim Jodohmu akan menghubungimu untuk langkah selanjutnya.", "The Jodohmu team will reach out to you for the next steps.")}
                  </p>
                  <button onClick={() => setSheetOpen(false)} className="mt-3 h-11 rounded-full px-6 text-[14px] font-bold" style={{ color: T.navy, background: T.surface }}>
                    {l("Tutup", "Close")}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: T.paperDeep, color: T.rose }}>
                      <Heart className="h-5 w-5 fill-current" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[20px] leading-tight" style={{ fontFamily: serif, color: T.ink }}>
                        {l(`Ajukan perkenalan dengan ${firstName}`, `Request an introduction to ${firstName}`)}
                      </h2>
                      <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: T.body }}>
                        {l("Tim Jodohmu mendampingi prosesnya dengan amanah — tidak ada kontak langsung sebelum kedua pihak setuju.",
                           "The Jodohmu team guides the process in trust — no direct contact until both sides agree.")}
                      </p>
                    </div>
                    <button onClick={() => setSheetOpen(false)} aria-label={l("Tutup", "Close")} className="-mr-1 p-1" style={{ color: T.muted }}>
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {preview && (
                    <p className="mt-4 rounded-xl px-3 py-2 text-[12px]" style={{ background: "#FFFBEB", color: "#92400E" }}>
                      {l("Pratinjau tim — tombol di bawah tidak mengirim apa pun.", "Team preview — the button below doesn't send anything.")}
                    </p>
                  )}

                  {viewer ? (
                    <>
                      <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
                        placeholder={l("Perkenalkan dirimu singkat (opsional)…", "Introduce yourself briefly (optional)…")}
                        className="mt-4 w-full resize-none rounded-2xl border px-4 py-3 text-[14px] focus:outline-none"
                        style={{ borderColor: T.hairline, background: T.surface, color: T.ink }} />
                      {sendError && <p className="mt-2 text-[12.5px]" style={{ color: T.rose }}>{sendError}</p>}
                      <button onClick={sendRequest} disabled={sending || !!preview}
                        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white disabled:opacity-60"
                        style={{ background: BRAND_GRADIENT }}>
                        <Send className="h-4 w-4" />
                        {sending ? l("Mengirim…", "Sending…") : l("Kirim permintaan", "Send request")}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mt-4 text-[13.5px]" style={{ color: T.body }}>
                        {l("Masuk atau buat akun gratis untuk mengajukan perkenalan.", "Sign in or create a free account to request an introduction.")}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Link href={`/register?redirect=/profile/${uid}`}
                          className="flex h-12 items-center justify-center rounded-full text-[14px] font-bold text-white"
                          style={{ background: BRAND_GRADIENT }}>
                          {l("Daftar", "Sign up")}
                        </Link>
                        <Link href={`/login?redirect=/profile/${uid}`}
                          className="flex h-12 items-center justify-center rounded-full border text-[14px] font-bold"
                          style={{ borderColor: T.hairline, color: T.navy }}>
                          {l("Masuk", "Sign in")}
                        </Link>
                      </div>
                    </>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* lightbox */}
      {lightboxIdx !== null && photos.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(8,8,16,0.92)" }}
          onClick={() => setLightboxIdx(null)}>
          <button className="absolute right-4 top-4 z-10 text-white/70 hover:text-white" onClick={() => setLightboxIdx(null)} aria-label={l("Tutup", "Close")}>
            <X className="h-7 w-7" />
          </button>
          {photos.length > 1 && (
            <button className="absolute left-2 z-10 p-2 text-white/70 hover:text-white" aria-label={l("Sebelumnya", "Previous")}
              onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + photos.length) % photos.length); }}>
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
          <div className="flex max-w-[min(92vw,620px)] flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[lightboxIdx]} alt="" draggable={false} onContextMenu={e => e.preventDefault()}
              className="max-h-[84vh] max-w-full select-none rounded-2xl object-contain shadow-2xl" />
            {photos.length > 1 && (
              <div className="flex gap-1.5">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setLightboxIdx(i)} className="rounded-full transition-all" aria-label={`${i + 1}`}
                    style={{ width: i === lightboxIdx ? 20 : 7, height: 7, background: i === lightboxIdx ? "#fff" : "rgba(255,255,255,0.35)" }} />
                ))}
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <button className="absolute right-2 z-10 p-2 text-white/70 hover:text-white" aria-label={l("Berikutnya", "Next")}
              onClick={e => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % photos.length); }}>
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── the big photo card: tap left/right to flip, name plate on top ── */
function PhotoHero({ photos, index, onIndex, onOpen, firstName, age, location, openTaaruf, avatar, lang }: {
  photos: string[];
  index: number;
  onIndex: (i: number) => void;
  onOpen: (i: number) => void;
  firstName: string;
  age: string | null;
  location: string | null;
  openTaaruf: string | null;
  avatar: AvatarVariant;
  lang: Lang;
}) {
  const [fit, setFit] = useState<Record<number, "cover" | "contain">>({});
  const l = (id: string, en: string) => lang === "id" ? id : en;
  const src = photos[index];

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const i = Number(img.dataset.idx);
    const box = img.parentElement?.getBoundingClientRect();
    if (box && box.height > 0 && img.naturalWidth > 0) {
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const boxRatio = box.width / box.height;
      const lost = imgRatio > boxRatio ? 1 - boxRatio / imgRatio : 1 - imgRatio / boxRatio;
      setFit(prev => ({ ...prev, [i]: lost <= COVER_MAX_CROP ? "cover" : "contain" }));
    }
  };

  return (
    <section className="relative overflow-hidden rounded-[28px]" style={{ boxShadow: cardShadow }}>
      <div className="relative aspect-[4/5] w-full"
        style={{ background: src ? "#1A1426" : "linear-gradient(160deg, #0B3A86 0%, #4C1F35 68%, #9B2242 100%)" }}>
        {src ? (
          <>
            {/* whole photo, never cropped — a blurred copy fills any gaps */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={`bg-${index}`} src={src} alt="" aria-hidden draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: "blur(28px) saturate(1.1)", transform: "scale(1.25)", opacity: 0.85 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={index} src={src} data-idx={index} alt={firstName} onLoad={onLoad} draggable={false}
              onContextMenu={e => e.preventDefault()}
              className="absolute inset-0 h-full w-full select-none"
              style={{ objectFit: fit[index] ?? "contain", objectPosition: "50% 30%" }} />
            {photos.length > 1 && (
              <>
                <button aria-label={l("Foto sebelumnya", "Previous photo")} className="absolute inset-y-0 left-0 z-10 w-1/3"
                  onClick={() => onIndex((index - 1 + photos.length) % photos.length)} />
                <button aria-label={l("Foto berikutnya", "Next photo")} className="absolute inset-y-0 right-0 z-10 w-1/3"
                  onClick={() => onIndex((index + 1) % photos.length)} />
                <div className="absolute inset-x-3 top-3 z-20 flex gap-1.5">
                  {photos.map((_, i) => (
                    <span key={i} className="h-[3px] flex-1 rounded-full transition-colors"
                      style={{ background: i === index ? "#fff" : "rgba(255,255,255,0.4)" }} />
                  ))}
                </div>
              </>
            )}
            <button onClick={() => onOpen(index)} aria-label={l("Perbesar foto", "Enlarge photo")}
              className="absolute right-3 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{ background: "rgba(16,20,40,0.35)", backdropFilter: "blur(8px)" }}>
              <Expand className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center pb-28">
            <GeometricPattern color="#ffffff" opacity={0.07} />
            <ProfileAvatar variant={avatar} className="relative h-40 w-40 rounded-full"
              style={{ boxShadow: "0 0 0 6px rgba(255,255,255,0.14), 0 20px 50px -10px rgba(0,0,0,0.45)" }} />
            <p className="relative mt-6 flex max-w-[270px] items-start gap-1.5 text-left text-[12.5px] leading-relaxed text-white/75">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {l("Foto dibagikan dengan amanah setelah ada ketertarikan dari kedua pihak.", "Photos are shared in trust once there's interest from both sides.")}
            </p>
          </div>
        )}

        {/* name plate */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-5 pt-24"
          style={{ background: "linear-gradient(to top, rgba(16,14,32,0.86) 0%, rgba(16,14,32,0.5) 45%, transparent 100%)" }}>
          {openTaaruf && (
            <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: "rgba(155,34,66,0.92)" }}>
              <Heart className="h-3 w-3 fill-current" />
              {openTaaruf}
            </span>
          )}
          <h1 className="text-[34px] font-semibold leading-none text-white" style={{ fontFamily: serif }}>
            {firstName}
            {age && <span className="font-normal text-white/85">, {age}</span>}
          </h1>
          {location && (
            <p className="mt-2 flex items-center gap-1.5 text-[13.5px] text-white/85">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function SectionCard({ title, rows }: { title: string; rows: Row[] }) {
  const facts = rows.filter(r => !LONG_FORM_FIELDS.has(r.field));
  const prompts = rows.filter(r => LONG_FORM_FIELDS.has(r.field));
  return (
    <section className="mt-4 rounded-[24px] bg-white px-5 py-5" style={{ boxShadow: cardShadow }}>
      <div className="mb-1 flex items-center gap-3">
        <h2 className="text-[18px]" style={{ fontFamily: serif, color: T.ink }}>{title}</h2>
        <span className="h-px flex-1" style={{ background: `linear-gradient(to right, ${T.accentSoft}, transparent)` }} />
      </div>
      {facts.length > 0 && (
        <dl>
          {facts.map((r, i) => (
            <div key={r.field} className="flex items-baseline justify-between gap-5 py-2.5" style={i ? { borderTop: `1px solid ${T.hairline}` } : undefined}>
              <dt className="text-[13px]" style={{ color: T.muted }}>{r.label}</dt>
              <dd className="text-right text-[14px] font-semibold" style={{ color: T.ink }}>{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {/* long answers read like prompts */}
      {prompts.map(r => (
        <div key={r.field} className="mt-3 rounded-[18px] px-4 py-4" style={{ background: T.paperDeep }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: T.rose }}>{r.label}</p>
          <p className="mt-2 whitespace-pre-line text-[16px] leading-relaxed" style={{ fontFamily: serif, color: T.ink }}>{r.value}</p>
        </div>
      ))}
    </section>
  );
}
