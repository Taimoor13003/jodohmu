"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, ImagePlus, Loader2, Pencil, Play, RefreshCw, Send, Smartphone, Video, X } from "lucide-react";
import { authFetch } from "@/components/admin/share-api";
import { findSocialAccount, type SocialAccountKey } from "@/lib/social-accounts";
import type { StoryCard, StoryMedia, StoryRow } from "@/lib/social-stories";

type Lang = "id" | "en";
type Data = { connected: boolean; stories: StoryRow[]; cards: StoryCard[] };
// One picture or video waiting to go up. `preview` is what the queue draws; `local` marks a video still on this computer.
type Queued = StoryMedia & { key: string; preview: string; local: boolean; candidateId: string | null };
type Act = (body: Record<string, unknown>) => Promise<Record<string, unknown>>;

const C = { border: "#E2E8F0", text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8", navy: "#1B3A6B" };
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_QUEUE = 10;
// Instagram's limits for a story video
const VIDEO = { minSeconds: 3, maxSeconds: 60, maxMb: 100 };
// How many stories the log draws at once
const PAGE = 60;

// Photos are shrunk in the browser first: a story is 1080×1920, and the upload stays small
function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1920 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = URL.createObjectURL(file);
  });
}

// How long a video runs, or null when this browser can't read it (some phone formats); Instagram still checks it
function videoSeconds(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const done = (seconds: number | null) => { URL.revokeObjectURL(video.src); resolve(seconds); };
    video.preload = "metadata";
    video.onloadedmetadata = () => done(Number.isFinite(video.duration) ? video.duration : null);
    video.onerror = () => done(null);
    video.src = URL.createObjectURL(file);
  });
}

/* One account's Instagram Stories: put pictures and videos up, and see every story that has gone up, by day.
   Shown by the Subpages screen under each account's tab. */
export default function SocialStories({ accountKey, lang }: { accountKey: SocialAccountKey; lang: Lang }) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const account = findSocialAccount(accountKey)!;
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await authFetch<Data>(`/api/admin/stories?account=${accountKey}`));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [accountKey]);
  useEffect(() => { load(); }, [load]);

  const act: Act = (body) => authFetch<Record<string, unknown>>("/api/admin/stories", { method: "POST", body: JSON.stringify({ account: accountKey, ...body }) });

  if (!data) {
    return (
      <div className="grid place-items-center py-20">
        {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : <Loader2 className="h-6 w-6 animate-spin text-[#1B3A6B]" />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}
      {!data.connected && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
          {t(`Instagram @${account.handle} belum terhubung ke poster, jadi story belum bisa diposting dari sini.`, `@${account.handle}'s Instagram isn't connected to the poster yet, so stories can't be posted from here.`)}
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,430px)_1fr]">
        <Composer key={accountKey} connected={data.connected} accent={account.accent} handle={account.handle} cards={data.cards} lang={lang} act={act} onPosted={load} />
        <StoryLog stories={data.stories} handle={account.handle} accent={account.accent} lang={lang} act={act} loading={loading} onChanged={load} />
      </div>
    </div>
  );
}

function Composer({ connected, accent, handle, cards, lang, act, onPosted }: {
  connected: boolean; accent: string; handle: string; cards: StoryCard[]; lang: Lang; act: Act; onPosted: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [queue, setQueue] = useState<Queued[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"upload" | "post" | null>(null);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(0);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const room = MAX_QUEUE - queue.length;

  const add = (items: Queued[]) => { setPosted(0); setQueue((prev) => [...prev, ...items.filter((i) => !prev.some((p) => p.url === i.url))].slice(0, MAX_QUEUE)); };
  const remove = (item: Queued) => {
    if (item.local) URL.revokeObjectURL(item.preview);
    setQueue((prev) => prev.filter((p) => p.key !== item.key));
  };

  const addImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy("upload");
    setError(null);
    try {
      for (const file of Array.from(files).slice(0, room)) {
        const { url } = await act({ action: "upload", dataUrl: await shrink(file) });
        add([{ key: url as string, kind: "image", url: url as string, thumbUrl: null, preview: url as string, local: false, candidateId: null }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(null);
      if (imageRef.current) imageRef.current.value = "";
    }
  };

  // A video goes from the browser straight to Cloudinary, which is given a signed permission for it first
  const addVideo = async (file: File | undefined) => {
    if (!file) return;
    setBusy("upload");
    setError(null);
    try {
      if (file.size > VIDEO.maxMb * 1024 * 1024) throw new Error(t(`Video terlalu besar (maks ${VIDEO.maxMb} MB).`, `That video is too big (max ${VIDEO.maxMb} MB).`));
      const seconds = await videoSeconds(file);
      if (seconds !== null && (seconds < VIDEO.minSeconds || seconds > VIDEO.maxSeconds)) {
        throw new Error(t(`Video story harus ${VIDEO.minSeconds}–${VIDEO.maxSeconds} detik; ini ${Math.round(seconds)} detik.`, `A story video has to be ${VIDEO.minSeconds}–${VIDEO.maxSeconds} seconds; this one is ${Math.round(seconds)}.`));
      }
      const ticket = await act({ action: "ticket" }) as { url: string; fields: Record<string, string> };
      const form = new FormData();
      Object.entries(ticket.fields).forEach(([k, v]) => form.append(k, v));
      form.append("file", file);
      const res = await fetch(ticket.url, { method: "POST", body: form });
      const json = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
      if (!res.ok || !json.secure_url) throw new Error(json.error?.message ?? "Upload failed");
      add([{ key: json.secure_url, kind: "video", url: json.secure_url, thumbUrl: null, preview: URL.createObjectURL(file), local: true, candidateId: null }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(null);
      if (videoRef.current) videoRef.current.value = "";
    }
  };

  const addCard = (candidateId: string) => {
    const card = cards.find((c) => c.candidateId === candidateId);
    if (!card) return;
    add(card.media.map((m) => ({ ...m, key: m.url, preview: m.thumbUrl ?? m.url, local: false, candidateId })));
  };

  // Asks every few seconds until Instagram has finished a video and it's up (up to 5 minutes)
  const waitFor = async (id: string) => {
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const res = await act({ action: "finish", id });
      if (res.status === "published") return;
      if (res.status !== "publishing") throw new Error((res.error as string) || t("Instagram gagal memproses video.", "Instagram couldn't process the video."));
    }
    throw new Error(t("Instagram masih memproses video. Story akan tayang sendiri begitu selesai.", "Instagram is still processing the video. The story will go up by itself once it's done."));
  };

  // One at a time, so the stories go up in the order shown; whatever fails stays in the queue to try again
  const post = async () => {
    setBusy("post");
    setError(null);
    setPosted(0);
    const all = queue;
    let count = 0;
    try {
      for (const item of all) {
        setProgress(all.length > 1 ? ` ${count + 1}/${all.length}` : "");
        const res = await act({ action: "post", media: { kind: item.kind, url: item.url, thumbUrl: item.thumbUrl }, note, candidateId: item.candidateId });
        if (res.status === "publishing") await waitFor(res.id as string);
        remove(item);
        count += 1;
      }
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Posting failed");
    } finally {
      setPosted(count);
      setBusy(null);
      setProgress("");
      onPosted();
    }
  };

  return (
    <div className="self-start rounded-2xl border bg-white p-4" style={{ borderColor: C.border }}>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t(`Story baru · @${handle}`, `New story · @${handle}`)}</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: C.label }}>
        {t(
          "Tiap gambar atau video jadi satu story, urut seperti di bawah, dan tayang 24 jam. Teks, stiker, dan link harus sudah ada di gambarnya: Instagram tidak mengizinkan menambahkannya dari sini.",
          "Each picture or video becomes one story, in the order below, and stays up for 24 hours. Text, stickers and links have to be part of the picture already: Instagram doesn't let them be added from here.",
        )}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => addImages(e.target.files)} />
        <input ref={videoRef} type="file" accept="video/mp4,video/quicktime" hidden onChange={(e) => addVideo(e.target.files?.[0])} />
        <button type="button" onClick={() => imageRef.current?.click()} disabled={!connected || busy !== null || room <= 0}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: C.border, color: C.body }}>
          <ImagePlus className="h-4 w-4" />{t("Gambar", "Images")}
        </button>
        <button type="button" onClick={() => videoRef.current?.click()} disabled={!connected || busy !== null || room <= 0}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: C.border, color: C.body }}>
          <Video className="h-4 w-4" />Video
        </button>
        {busy === "upload" && <span className="inline-flex items-center gap-1.5 text-[12.5px]" style={{ color: C.label }}><Loader2 className="h-4 w-4 animate-spin" />{t("Mengunggah…", "Uploading…")}</span>}
      </div>

      {cards.length > 0 && (
        <select value="" onChange={(e) => addCard(e.target.value)} disabled={!connected || busy !== null || room <= 0}
          className="mt-2 h-9 w-full rounded-lg border px-2 text-sm disabled:opacity-50" style={{ borderColor: C.border }}>
          <option value="">{t("Pakai kartu klien yang sudah diposting… (opsional)", "Use a client card that's already posted… (optional)")}</option>
          {cards.map((c) => <option key={c.candidateId} value={c.candidateId}>{c.code} · {c.candidateName}{c.media[0]?.kind === "video" ? " · Reel" : ""}</option>)}
        </select>
      )}

      {queue.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 pt-2">
          {queue.map((item, i) => (
            <div key={item.key} className="relative shrink-0">
              <div className="relative h-40 w-[90px] overflow-hidden rounded-lg border bg-slate-900" style={{ borderColor: C.border }}>
                {item.local
                  ? <video src={item.preview} muted playsInline preload="metadata" className="h-full w-full object-contain" />
                  // eslint-disable-next-line @next/next/no-img-element
                  : <img src={item.preview} alt="" className="h-full w-full object-contain" />}
                {item.kind === "video" && <span className="absolute inset-0 grid place-items-center"><Play className="h-6 w-6 fill-white text-white drop-shadow" /></span>}
                <span className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-[11px] font-bold text-white">{i + 1}</span>
              </div>
              {busy === null && (
                <button type="button" onClick={() => remove(item)} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-slate-800 text-white">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <label className="mt-3 block text-[12px] font-bold" style={{ color: C.label }}>
        {t("Catatan untuk tim (tidak tampil di Instagram)", "Note for the team (not shown on Instagram)")}
        <input value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder={t("mis. Promo konsultasi gratis minggu ini", "e.g. This week's free consultation offer")}
          className="mt-1 h-9 w-full rounded-lg border px-3 text-sm font-normal" style={{ borderColor: C.border, color: C.text }} />
      </label>

      <button type="button" onClick={post} disabled={!connected || busy !== null || !queue.length}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-bold text-white disabled:opacity-50" style={{ background: accent }}>
        {busy === "post" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {busy === "post" ? t(`Memposting story${progress}…`, `Posting story${progress}…`)
          : queue.length > 1 ? t(`Posting ${queue.length} story ke @${handle}`, `Post ${queue.length} stories to @${handle}`) : t(`Posting story ke @${handle}`, `Post story to @${handle}`)}
      </button>
      <p className="mt-1.5 text-center text-[11px]" style={{ color: C.muted }}>{t("Story langsung tampil publik di Instagram.", "Stories go public on Instagram straight away.")}</p>

      {posted > 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />{posted > 1 ? t(`${posted} story terposting dan tercatat.`, `${posted} stories posted and logged.`) : t("Story terposting dan tercatat.", "Story posted and logged.")}
        </p>
      )}
      {error && <p className="mt-2 flex items-start gap-1.5 text-[12.5px] font-semibold text-rose-700"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}</p>}
    </div>
  );
}

function StoryLog({ stories, handle, accent, lang, act, loading, onChanged }: {
  stories: StoryRow[]; handle: string; accent: string; lang: Lang; act: Act; loading: boolean; onChanged: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [limit, setLimit] = useState(PAGE);
  const locale = lang === "id" ? "id-ID" : "en-GB";
  const isLive = (s: StoryRow) => s.status === "published" && s.postedAt !== null && Date.now() - new Date(s.postedAt).getTime() < DAY_MS;
  const liveCount = stories.filter(isLive).length;

  // Newest day first; the key is the viewer's own calendar day
  const days = useMemo(() => {
    const byDay = new Map<string, StoryRow[]>();
    for (const s of stories.slice(0, limit)) {
      const day = s.postedAt ? new Date(s.postedAt).toLocaleDateString("en-CA") : "";
      byDay.set(day, [...(byDay.get(day) ?? []), s]);
    }
    return Array.from(byDay.entries());
  }, [stories, limit]);

  return (
    <section className="min-w-0 rounded-2xl border bg-white" style={{ borderColor: C.border }}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: C.border }}>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t(`Catatan story · @${handle}`, `Story log · @${handle}`)}</p>
          <p className="mt-0.5 text-[12.5px]" style={{ color: C.muted }}>
            {stories.length} {t("story tercatat", stories.length === 1 ? "story on record" : "stories on record")}
            {liveCount > 0 && <span className="font-bold text-emerald-700"> · {liveCount} {t("sedang tayang", "live now")}</span>}
          </p>
        </div>
        <button type="button" onClick={onChanged} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ color: C.label }} title={t("Muat ulang", "Refresh")}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {!stories.length && (
        <p className="px-4 py-14 text-center text-sm" style={{ color: C.muted }}>
          {t("Belum ada story. Yang diposting dari sini, atau dari aplikasi Instagram selagi masih tayang, akan tercatat di sini.", "No stories yet. Ones posted from here, or from the Instagram app while they're still live, are logged here.")}
        </p>
      )}

      {days.map(([day, rows]) => (
        <div key={day}>
          <p className="flex items-center justify-between border-b bg-slate-50 px-4 py-2 text-[12px] font-bold" style={{ borderColor: C.border, color: C.body }}>
            <span>{day ? new Date(`${day}T12:00:00`).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"}</span>
            <span style={{ color: C.muted }}>{rows.length} {t("story", rows.length === 1 ? "story" : "stories")}</span>
          </p>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {rows.map((s) => <StoryItem key={s.id} story={s} live={isLive(s)} accent={accent} lang={lang} act={act} onChanged={onChanged} />)}
          </div>
        </div>
      ))}

      {stories.length > limit && (
        <button type="button" onClick={() => setLimit(limit + PAGE)} className="w-full border-t px-4 py-3 text-[13px] font-bold" style={{ borderColor: C.border, color: C.navy }}>
          {t("Tampilkan yang lebih lama", "Show older")}
        </button>
      )}
    </section>
  );
}

function StoryItem({ story, live, accent, lang, act, onChanged }: {
  story: StoryRow; live: boolean; accent: string; lang: Lang; act: Act; onChanged: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(story.note);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const at = story.postedAt ? new Date(story.postedAt) : null;
  const minutesLeft = at ? Math.max(0, Math.ceil((at.getTime() + DAY_MS - Date.now()) / 60000)) : 0;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await act({ action: "note", id: story.id, note });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-3 px-4 py-3">
      <a href={story.mediaUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="relative block h-28 w-[63px] shrink-0 overflow-hidden rounded-lg border bg-slate-900" style={{ borderColor: C.border }}
        title={t("Buka salinan yang tersimpan", "Open the saved copy")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {story.thumbUrl && <img src={story.thumbUrl} alt="" className="h-full w-full object-cover" />}
        {story.kind === "video" && <span className="absolute inset-0 grid place-items-center"><Play className="h-5 w-5 fill-white text-white drop-shadow" /></span>}
      </a>
      <div className="min-w-0 flex-1 text-[12.5px]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-bold" style={{ color: C.text }}>{at ? at.toLocaleTimeString(lang === "id" ? "id-ID" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
          {story.status === "publishing"
            ? <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 text-[10.5px] font-bold text-blue-700"><Loader2 className="h-3 w-3 animate-spin" />{t("Instagram memproses video", "Instagram is processing the video")}</span>
            : live
              ? <span className="rounded bg-emerald-50 px-1.5 text-[10.5px] font-bold text-emerald-700">
                  {t("tayang", "live")} · {minutesLeft >= 60 ? t(`sisa ${Math.floor(minutesLeft / 60)} jam`, `${Math.floor(minutesLeft / 60)}h left`) : t(`sisa ${minutesLeft} menit`, `${minutesLeft}m left`)}
                </span>
              : <span className="rounded bg-slate-100 px-1.5 text-[10.5px] font-bold text-slate-500">{t("selesai", "ended")}</span>}
          <span className="rounded bg-slate-100 px-1.5 text-[10.5px] font-bold text-slate-600">{story.kind === "video" ? "Video" : t("Gambar", "Image")}</span>
          {live && story.permalink && (
            <a href={story.permalink} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 font-bold" style={{ color: C.navy }}>
              {t("Lihat di Instagram", "View on Instagram")}<ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1" style={{ color: C.muted }}>
          {story.source === "app"
            ? <><Smartphone className="h-3 w-3" />{t("Diposting dari aplikasi Instagram", "Posted from the Instagram app")}</>
            : t(`Diposting oleh ${story.byName ?? "tim"}`, `Posted by ${story.byName ?? "the team"}`)}
          {story.code && <span> · {t("kartu klien", "client card")} {story.code}{story.candidateName && ` (${story.candidateName})`}</span>}
        </p>

        {editing ? (
          <div className="mt-1.5 flex items-center gap-1.5">
            <input value={note} maxLength={300} autoFocus onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") save(); }}
              placeholder={t("Story ini tentang apa?", "What was this story about?")} className="h-8 min-w-0 flex-1 rounded-lg border px-2 text-[13px]" style={{ borderColor: C.border, color: C.text }} />
            <button type="button" onClick={save} disabled={busy} className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-[12.5px] font-bold text-white disabled:opacity-50" style={{ background: accent }}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{t("Simpan", "Save")}
            </button>
            <button type="button" onClick={() => { setEditing(false); setNote(story.note); }} className="h-8 rounded-lg px-2 text-[12.5px] font-semibold" style={{ color: C.label }}>{t("Batal", "Cancel")}</button>
          </div>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="mt-1.5 flex items-start gap-1.5 text-left text-[13px]" style={{ color: story.note ? C.text : C.muted }}>
            <Pencil className="mt-0.5 h-3 w-3 shrink-0" style={{ color: C.muted }} />{story.note || t("Tambah catatan", "Add a note")}
          </button>
        )}
        {error && <p className="mt-1 text-[12px] font-semibold text-rose-700">{error}</p>}
      </div>
    </div>
  );
}
