"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, ExternalLink, Instagram, Loader2, RotateCcw, Send, X } from "lucide-react";
import {
  SOCIAL_PAGES, autoValues, buildCard, defaultCaption, defaultChoices, fieldsFor, figureFor, slideCount, suggestPages,
  type FieldChoices, type FieldMode, type FigureChoice, type SocialFieldKey, type SocialPageKey,
} from "@/lib/social";
import { FIGURES, type Figure } from "@/lib/social-figures";
import { authFetch } from "./share-api";
import { auth } from "@/lib/firebase";

type Lang = "id" | "en";
export type PostRow = {
  candidateId: string; candidateName: string; page: string; handle: string; code: string;
  status: "publishing" | "published" | "failed" | "deleted"; permalink: string | null; imageUrl: string | null; imageUrls: string[];
  error: string | null; changes: string[]; caption: string; byName: string; at: string | null;
};

const C = { border: "#E2E8F0", text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8", navy: "#1B3A6B", rose: "#C4294A" };
const MODE_LABEL: Record<FieldMode, Record<Lang, string>> = {
  show: { id: "Tampil", en: "Show" },
  custom: { id: "Ubah", en: "Custom" },
  hide: { id: "Sembunyi", en: "Hide" },
};

// The profile button's pop-up: the composer with a page picker
export default function SocialPostPanel({ candidateId, profile, lang, onClose }: {
  candidateId: string;
  profile: Record<string, unknown>;
  lang: Lang;
  onClose: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const suggested = useMemo(() => suggestPages(profile), [profile]);
  const [page, setPage] = useState<SocialPageKey>(() => suggested.find((k) => SOCIAL_PAGES.find((p) => p.key === k)?.connected) ?? "nikahin_foreigner");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4" style={{ background: "linear-gradient(135deg, #1B3A6B, #C4294A)" }}>
          <div className="flex items-center gap-2 text-white">
            <Instagram className="h-5 w-5" />
            <div>
              <p className="text-sm font-bold">{t("Posting ke Instagram", "Post to Instagram")}</p>
              <p className="text-[11px] opacity-80">{t("Kartu tanpa foto. Pilih apa yang tampil.", "Faceless card. Choose what shows.")}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SocialComposer candidateId={candidateId} profile={profile} lang={lang} page={page} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}

/* Choose what shows, see the real card, edit the caption, post. Used by the profile pop-up and the Subpages screen. */
export function SocialComposer({ candidateId, profile, lang, page, onPageChange, onPosted, compact }: {
  candidateId: string;
  profile: Record<string, unknown>;
  lang: Lang;
  page: SocialPageKey;
  // Given only where the page can be switched here (the profile pop-up)
  onPageChange?: (page: SocialPageKey) => void;
  onPosted?: () => void;
  // Narrower spots (the Subpages screen) split into two columns only on wide screens
  compact?: boolean;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const suggested = useMemo(() => suggestPages(profile), [profile]);
  const setPage = (key: SocialPageKey) => onPageChange?.(key);
  const pageInfo = SOCIAL_PAGES.find((p) => p.key === page)!;
  const [choices, setChoices] = useState<FieldChoices>(() => defaultChoices(page));
  const [figure, setFigure] = useState<FigureChoice>("auto");
  const [caption, setCaption] = useState("");
  const [captionEdited, setCaptionEdited] = useState(false);
  const [consent, setConsent] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [posting, setPosting] = useState(false);
  // One preview image per slide; the carousel pages show two
  const [previews, setPreviews] = useState<(string | null)[]>([]);
  const [slide, setSlide] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const previewUrls = useRef<string[]>([]);

  const auto = useMemo(() => autoValues(profile, pageInfo.lang), [profile, pageInfo.lang]);
  const card = useMemo(() => buildCard(page, candidateId, profile, choices, figure), [page, candidateId, profile, choices, figure]);
  const fields = useMemo(() => fieldsFor(page), [page]);
  const slides = slideCount(page);
  const existing = posts.find((p) => p.page === page);

  // Each page has its own template, so switching page starts its card afresh
  const firstPage = useRef(page);
  useEffect(() => {
    if (firstPage.current === page) return;
    firstPage.current = page;
    setChoices(defaultChoices(page));
    setCaptionEdited(false);
    setSlide(0);
  }, [page]);

  // The caption follows the card until someone edits it by hand
  useEffect(() => { if (!captionEdited) setCaption(defaultCaption(page, card)); }, [page, card, captionEdited]);

  const loadPosts = useCallback(async () => {
    try {
      const data = await authFetch<{ connected: boolean; posts: PostRow[] }>(`/api/admin/social?candidateId=${encodeURIComponent(candidateId)}`);
      setConnected(data.connected);
      setPosts(data.posts);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    }
  }, [candidateId]);
  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Redraw the real slide images shortly after the last change
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const token = await auth.currentUser?.getIdToken();
        const urls = await Promise.all(Array.from({ length: slides }, async (_, index) => {
          const res = await fetch("/api/admin/social", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: "preview", candidateId, page, choices, figure, slide: index }),
          });
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Preview failed");
          return URL.createObjectURL(await res.blob());
        }));
        if (cancelled) { urls.forEach((u) => URL.revokeObjectURL(u)); return; }
        previewUrls.current.forEach((u) => URL.revokeObjectURL(u));
        previewUrls.current = urls;
        setPreviews(urls);
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : "Preview failed");
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [candidateId, page, choices, figure, slides]);
  useEffect(() => () => { previewUrls.current.forEach((u) => URL.revokeObjectURL(u)); }, []);
  const preview = previews[Math.min(slide, previews.length - 1)] ?? null;

  const setChoice = (key: SocialFieldKey, patch: Partial<{ mode: FieldMode; custom: string }>) => {
    setConfirming(false);
    setChoices((prev) => {
      const next = { ...prev[key], ...patch };
      // Switching to "custom" starts from the stored value, so small fixes are quick
      if (patch.mode === "custom" && !prev[key].custom) next.custom = auto[key];
      return { ...prev, [key]: next };
    });
  };

  const post = async () => {
    setPosting(true);
    try {
      const data = await authFetch<{ permalink: string | null }>("/api/admin/social", {
        method: "POST",
        body: JSON.stringify({ action: "post", candidateId, page, choices, figure, caption, consent }),
      });
      toast.success(t(`Terposting di @${pageInfo.handle}`, `Posted on @${pageInfo.handle}`));
      if (data.permalink) window.open(data.permalink, "_blank", "noopener,noreferrer");
      onPosted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Posting failed");
    } finally {
      setPosting(false);
      setConfirming(false);
      loadPosts();
    }
  };

  const blocked = !pageInfo.connected || connected === false || existing?.status === "published" || existing?.status === "publishing";
  const canPost = !blocked && consent && caption.trim().length > 0 && !posting;

  return (
        <div className={`grid gap-0 ${compact ? "xl:grid-cols-[1fr_minmax(0,400px)]" : "lg:grid-cols-[1fr_minmax(0,440px)]"}`}>
          {/* ── settings ── */}
          <div className="space-y-5 p-5">
            {onPageChange && <section>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t("Halaman", "Page")}</p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PAGES.map((p) => {
                  const active = p.key === page;
                  const done = posts.find((x) => x.page === p.key)?.status === "published";
                  return (
                    <button key={p.key} type="button" onClick={() => { setPage(p.key); setConfirming(false); }}
                      className="flex flex-col items-start rounded-xl border px-3 py-2 text-left transition"
                      style={{ borderColor: active ? p.accent : C.border, background: active ? `${p.accent}0D` : "white", opacity: p.connected ? 1 : 0.6 }}>
                      <span className="text-[13px] font-bold" style={{ color: active ? p.accent : C.text }}>@{p.handle}</span>
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: C.label }}>
                        {p.label}
                        {suggested.includes(p.key) && <span className="rounded bg-emerald-50 px-1 font-bold text-emerald-700">{t("cocok", "fits")}</span>}
                        {!p.connected && <span>· {t("belum terhubung", "not connected yet")}</span>}
                        {done && <span className="font-bold text-emerald-700">· {t("sudah diposting", "posted")}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>}

            <section>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t("Apa yang tampil di kartu", "What shows on the card")}</p>
              <div className="divide-y rounded-xl border" style={{ borderColor: C.border }}>
                {fields.map((f) => {
                  const choice = choices[f.key];
                  return (
                    <div key={f.key} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold" style={{ color: C.text }}>{lang === "id" ? f.label.id : f.label.en}</p>
                        <p className="truncate text-[11px]" style={{ color: C.muted }}>{auto[f.key] || t("(kosong di profil)", "(empty in profile)")}</p>
                      </div>
                      <div className="flex shrink-0 rounded-lg border p-0.5" style={{ borderColor: C.border }}>
                        {(["show", "custom", "hide"] as FieldMode[]).map((m) => (
                          <button key={m} type="button" onClick={() => setChoice(f.key, { mode: m })}
                            className="rounded-md px-2.5 py-1 text-[11px] font-bold"
                            style={choice.mode === m ? { background: m === "hide" ? "#475569" : C.navy, color: "white" } : { color: C.label }}>
                            {MODE_LABEL[m][lang]}
                          </button>
                        ))}
                      </div>
                      {choice.mode === "custom" && (
                        <input value={choice.custom} maxLength={140} onChange={(e) => setChoice(f.key, { custom: e.target.value })}
                          placeholder={f.key === "name" ? t("mis. nama samaran", "e.g. a nickname") : f.key === "intro" ? t("mis. Mencari pasangan yang sabar dan jujur", "e.g. Looking for someone patient and honest") : auto[f.key]}
                          className="h-8 w-full rounded-lg border px-2 text-[13px] sm:w-56" style={{ borderColor: C.border }} />
                      )}
                    </div>
                  );
                })}
              </div>
              {choices.name.mode === "show" && (
                <p className="mt-2 flex items-start gap-1.5 text-[11px] font-semibold text-amber-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {t("Nama asli akan terlihat publik. Pastikan klien setuju.", "The real name will be public. Make sure the client agreed.")}
                </p>
              )}
            </section>

            {pageInfo.template === "hello" && (
              <section>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t("Siluet", "Silhouette")}</p>
                <div className="flex flex-wrap gap-2">
                  {(["auto", "man", "woman", "hijab"] as FigureChoice[]).map((f) => {
                    const active = figure === f;
                    const label = f === "auto"
                      ? `${t("Otomatis", "Auto")} · ${FIGURES[figureFor(profile)].label[lang]}`
                      : FIGURES[f as Figure].label[lang];
                    return (
                      <button key={f} type="button" onClick={() => { setFigure(f); setConfirming(false); setSlide(0); }}
                        className="rounded-lg border px-3 py-1.5 text-[12px] font-bold"
                        style={active ? { background: C.navy, borderColor: C.navy, color: "white" } : { borderColor: C.border, color: C.label }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[11px]" style={{ color: C.muted }}>
                  {t("Otomatis mengikuti jenis kelamin dan jawaban hijab di profil.", "Auto follows the profile's gender and hijab answer.")}
                </p>
              </section>
            )}
          </div>

          {/* ── preview & post ── */}
          <div className={`space-y-4 border-t p-5 ${compact ? "xl:border-l xl:border-t-0" : "lg:border-l lg:border-t-0"}`} style={{ borderColor: C.border, background: "#F8FAFC" }}>
            <div className="relative overflow-hidden rounded-xl border bg-white" style={{ borderColor: C.border, aspectRatio: "4 / 5" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview && <img src={preview} alt={t("Pratinjau kartu", "Card preview")} className="h-full w-full object-contain" />}
              {(previewLoading || !preview) && (
                <div className="absolute inset-0 grid place-items-center bg-white/60"><Loader2 className="h-6 w-6 animate-spin" style={{ color: C.navy }} /></div>
              )}
            </div>
            {slides > 1 && (
              <div className="flex gap-2">
                {Array.from({ length: slides }, (_, i) => (
                  <button key={i} type="button" onClick={() => setSlide(i)}
                    className="flex flex-1 items-center gap-2 rounded-lg border bg-white p-1.5 text-left text-[11px] font-bold"
                    style={{ borderColor: slide === i ? C.navy : C.border, color: slide === i ? C.navy : C.label }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {previews[i] && <img src={previews[i]!} alt="" className="h-10 w-8 shrink-0 rounded object-cover" />}
                    {i + 1}. {i === 0 ? t("Pembuka", "Intro") : t("Profil", "Profile")}
                  </button>
                ))}
              </div>
            )}

            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>Caption</p>
                {captionEdited && (
                  <button type="button" onClick={() => setCaptionEdited(false)} className="flex items-center gap-1 text-[11px] font-bold" style={{ color: C.navy }}>
                    <RotateCcw className="h-3 w-3" />{t("Buat ulang", "Regenerate")}
                  </button>
                )}
              </div>
              <textarea value={caption} maxLength={2200} rows={8} onChange={(e) => { setCaption(e.target.value); setCaptionEdited(true); setConfirming(false); }}
                className="w-full rounded-xl border bg-white p-3 text-[13px] leading-relaxed" style={{ borderColor: C.border, color: C.body }} />
            </div>

            {existing?.status === "published" ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[13px] font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="flex-1">{t(`Sudah diposting di @${pageInfo.handle}`, `Already posted on @${pageInfo.handle}`)}{existing.byName && ` · ${existing.byName}`}</span>
                {existing.permalink && <a href={existing.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-bold underline">{t("Lihat", "View")}<ExternalLink className="h-3 w-3" /></a>}
              </div>
            ) : (
              <>
                {existing?.status === "deleted" && (
                  <p className="rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-semibold text-slate-600">{t("Posting sebelumnya sudah dihapus di Instagram, jadi bisa diposting lagi.", "The earlier post was deleted on Instagram, so this can be posted again.")}</p>
                )}
                {existing?.status === "failed" && (
                  <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">{t("Percobaan terakhir gagal: ", "Last attempt failed: ")}{existing.error}</p>
                )}
                {!pageInfo.connected && (
                  <p className="rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-semibold text-slate-600">{t(`@${pageInfo.handle} belum terhubung. Pratinjau tetap bisa dilihat.`, `@${pageInfo.handle} isn't connected yet. You can still preview.`)}</p>
                )}
                {pageInfo.connected && connected === false && (
                  <p className="rounded-xl bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-800">{t("Instagram belum terhubung: token Meta belum diisi di server.", "Instagram isn't connected yet: the Meta token hasn't been added on the server.")}</p>
                )}
                <label className="flex items-start gap-2 rounded-xl border bg-white px-3 py-2.5 text-[13px]" style={{ borderColor: C.border, color: C.body }}>
                  <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setConfirming(false); }} className="mt-0.5" />
                  <span>{t("Klien sudah setuju profilnya diposting seperti di pratinjau ini.", "The client agreed to their profile being posted as shown in this preview.")}</span>
                </label>
                {confirming ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setConfirming(false)} disabled={posting} className="h-11 flex-1 rounded-xl border bg-white text-sm font-bold" style={{ borderColor: C.border, color: C.body }}>{t("Batal", "Cancel")}</button>
                    <button type="button" onClick={post} disabled={posting} className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl text-sm font-bold text-white" style={{ background: C.rose }}>
                      {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {posting ? t("Memposting…", "Posting…") : t(`Ya, posting sekarang ke @${pageInfo.handle}`, `Yes, post now to @${pageInfo.handle}`)}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirming(true)} disabled={!canPost}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #1B3A6B, #C4294A)" }}>
                    <Send className="h-4 w-4" />{t(`Posting ke @${pageInfo.handle}`, `Post to @${pageInfo.handle}`)}
                  </button>
                )}
                <p className="text-center text-[11px]" style={{ color: C.muted }}>{t("Posting langsung tampil publik di Instagram.", "Posts go public on Instagram straight away.")}</p>
              </>
            )}
          </div>
        </div>
  );
}
