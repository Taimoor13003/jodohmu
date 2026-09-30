"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, AtSign, CheckCircle2, Clock, CornerDownRight, ExternalLink, Eye, EyeOff, Facebook, ImagePlus, Instagram, Loader2, RefreshCw, Send, X,
} from "lucide-react";
import { authFetch } from "@/components/admin/share-api";
import { findSocialAccount, type SocialAccountKey } from "@/lib/social-accounts";

type Lang = "id" | "en";
type Platform = "threads" | "instagram" | "facebook";
type PlatformState = { connected: boolean; label: string | null; error: string | null };
type Card = { candidateId: string; code: string; candidateName: string; caption: string; imageUrls: string[]; at: string | null; sharedTo: Platform[] };
type Post = { platform: Platform; id: string; text: string; permalink: string | null; timestamp: string; imageUrl: string | null; replyCount: number; open: number };
type Item = {
  platform: Platform; id: string; postId: string; text: string; username: string; timestamp: string; permalink: string | null;
  hidden: boolean; answered: boolean; ourAnswer: string | null; answeredByName: string | null; done: boolean; doneByName: string | null;
  followUp: boolean; inReplyToOurs: string | null;
};
export type HubData = {
  threadsConfigured: boolean; accounts: { key: SocialAccountKey; threads: boolean }[];
  platforms: Record<Platform, PlatformState>; posts: Post[]; items: Item[]; cards: Card[];
};
type Act = (body: Record<string, unknown>) => Promise<Record<string, unknown>>;

const C = { border: "#E2E8F0", text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8", navy: "#1B3A6B" };
const ORDER: Platform[] = ["instagram", "facebook", "threads"];
const META: Record<Platform, { name: string; color: string; Icon: typeof Instagram; limit: number }> = {
  instagram: { name: "Instagram", color: "#C13584", Icon: Instagram, limit: 2200 },
  facebook: { name: "Facebook", color: "#1877F2", Icon: Facebook, limit: 5000 },
  threads: { name: "Threads", color: "#18181B", Icon: AtSign, limit: 500 },
};

function ago(iso: string, lang: Lang) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return lang === "id" ? "baru saja" : "just now";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Badge({ platform, size = "sm" }: { platform: Platform; size?: "sm" | "xs" }) {
  const { Icon, color, name } = META[platform];
  return (
    <span title={name} className={`inline-grid shrink-0 place-items-center rounded-full text-white ${size === "sm" ? "h-5 w-5" : "h-4 w-4"}`} style={{ background: color }}>
      <Icon className={size === "sm" ? "h-3 w-3" : "h-2.5 w-2.5"} />
    </span>
  );
}

// Photos are shrunk in the browser first: the platforms take up to 1440px wide, and the upload stays small
function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1440 / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = URL.createObjectURL(file);
  });
}

/* One account's Instagram, Facebook and Threads: post to any of them, and answer every comment from one list.
   Shown by the Subpages screen under each account's tab. */
export default function SocialHub({ accountKey, lang, notice, onAccounts }: {
  accountKey: SocialAccountKey; lang: Lang; notice?: string | null;
  // Which accounts have Threads connected, for the tabs above
  onAccounts?: (accounts: HubData["accounts"]) => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const account = findSocialAccount(accountKey)!;
  const [data, setData] = useState<HubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await authFetch<HubData>(`/api/admin/hub?account=${accountKey}`);
      setData(next);
      onAccounts?.(next.accounts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [accountKey, onAccounts]);
  useEffect(() => { setData(null); load(); }, [load]);

  const act: Act = (body) => authFetch<Record<string, unknown>>("/api/admin/hub", { method: "POST", body: JSON.stringify({ account: accountKey, ...body }) });
  const connectThreads = async () => {
    try {
      const { url } = await act({ action: "connect" });
      window.location.href = url as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the Threads login");
    }
  };

  if (!data) {
    return (
      <div className="grid place-items-center py-20">
        {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : <Loader2 className="h-6 w-6 animate-spin text-[#1B3A6B]" />}
      </div>
    );
  }
  const live = ORDER.filter((p) => data.platforms[p].connected);

  return (
    <div className="space-y-4">
      {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{notice}</p>}
      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

      {/* where this account is connected */}
      <div className="flex flex-wrap gap-2">
        {ORDER.map((p) => {
          const s = data.platforms[p];
          return (
            <div key={p} className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-[12.5px]" style={{ borderColor: s.error ? "#FDA4AF" : C.border }}>
              <Badge platform={p} />
              <span className="font-bold" style={{ color: C.text }}>{META[p].name}</span>
              {s.connected ? (
                <span className="flex items-center gap-1" style={{ color: s.error ? "#BE123C" : "#047857" }}>
                  {s.error ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}{s.label}
                </span>
              ) : p === "threads" && data.threadsConfigured ? (
                <button type="button" onClick={connectThreads} className="rounded-md px-2 py-0.5 font-bold text-white" style={{ background: account.accent }}>
                  {t("Hubungkan", "Connect")}
                </button>
              ) : (
                <span style={{ color: C.muted }}>{t("belum terhubung", "not connected")}</span>
              )}
            </div>
          );
        })}
      </div>
      {ORDER.filter((p) => data.platforms[p].error).map((p) => (
        <p key={p} className="rounded-lg bg-rose-50 px-3 py-2 text-[12.5px] font-semibold text-rose-700">{META[p].name}: {data.platforms[p].error}</p>
      ))}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,430px)_1fr]">
        <div className="min-w-0 space-y-5">
          <Composer key={accountKey} live={live} accent={account.accent} handle={account.handle} cards={data.cards} lang={lang} act={act} onPosted={load} />
          <RecentPosts posts={data.posts} lang={lang} />
        </div>
        <Inbox items={data.items} posts={data.posts} live={live} accent={account.accent} lang={lang} act={act} loading={loading} onChanged={load} />
      </div>
    </div>
  );
}

function Composer({ live, accent, handle, cards, lang, act, onPosted }: {
  live: Platform[]; accent: string; handle: string; cards: Card[]; lang: Lang; act: Act; onPosted: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [targets, setTargets] = useState<Platform[]>(live.filter((p) => p !== "instagram"));
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [card, setCard] = useState<Card | null>(null);
  const [busy, setBusy] = useState<"upload" | "post" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Partial<Record<Platform, { ok: boolean; permalink?: string | null; error?: string }>> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // A card is already on Instagram (that's where it came from); elsewhere only once
  const blocked = (p: Platform) => (card ? card.sharedTo.includes(p) : false) || (p === "instagram" && !images.length);
  const chosen = targets.filter((p) => live.includes(p) && !blocked(p));
  const limit = Math.min(...(chosen.length ? chosen : live).map((p) => META[p].limit));
  const over = text.length > limit;

  const toggle = (p: Platform) => setTargets((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  const pickCard = (id: string) => {
    const c = cards.find((x) => x.candidateId === id) ?? null;
    setCard(c);
    setResults(null);
    if (c) {
      setImages(c.imageUrls);
      setText(c.caption);
      setTargets(live.filter((p) => !c.sharedTo.includes(p)));
    } else {
      setImages([]);
    }
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy("upload");
    setError(null);
    try {
      for (const file of Array.from(files).slice(0, 10 - images.length)) {
        const { url } = await act({ action: "upload", dataUrl: await shrink(file) });
        setImages((prev) => [...prev, url as string]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const post = async () => {
    setBusy("post");
    setError(null);
    setResults(null);
    try {
      const res = await act({ action: "post", platforms: chosen, text, imageUrls: images, candidateId: card?.candidateId ?? null });
      const r = res.results as NonNullable<typeof results>;
      setResults(r);
      // Keep the draft if anything failed, so it can be retried on just those platforms
      const failed = chosen.filter((p) => !r[p]?.ok);
      if (!failed.length) {
        setText("");
        setImages([]);
        setCard(null);
      } else {
        setTargets(failed);
      }
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Posting failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: C.border }}>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t(`Posting baru · @${handle}`, `New post · @${handle}`)}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ORDER.map((p) => {
          const on = chosen.includes(p);
          const disabled = !live.includes(p) || blocked(p);
          const why = !live.includes(p) ? t("belum terhubung", "not connected")
            : card?.sharedTo.includes(p) ? t("sudah diposting", "already posted")
              : p === "instagram" && !images.length ? t("butuh gambar", "needs an image") : "";
          return (
            <button key={p} type="button" disabled={disabled} onClick={() => toggle(p)} title={why}
              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
              style={on ? { background: META[p].color, borderColor: META[p].color, color: "white" } : { borderColor: C.border, color: C.body }}>
              {(() => { const I = META[p].Icon; return <I className="h-3.5 w-3.5" />; })()}{META[p].name}
              {why && <span className="font-medium opacity-80">· {why}</span>}
            </button>
          );
        })}
      </div>

      {cards.length > 0 && (
        <select value={card?.candidateId ?? ""} onChange={(e) => pickCard(e.target.value)} className="mt-3 h-9 w-full rounded-lg border px-2 text-sm" style={{ borderColor: C.border }}>
          <option value="">{t("Bagikan kartu klien dari Instagram… (opsional)", "Share a client card from Instagram… (optional)")}</option>
          {cards.map((c) => {
            const left = live.filter((p) => !c.sharedTo.includes(p));
            return <option key={c.candidateId} value={c.candidateId} disabled={!left.length}>{c.code} · {c.candidateName}{!left.length ? ` (${t("sudah di semua", "everywhere already")})` : ""}</option>;
          })}
        </select>
      )}

      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={t("Tulis sesuatu…", "Write something…")}
        className="mt-3 w-full resize-y rounded-lg border p-3 text-sm" style={{ borderColor: over ? "#E11D48" : C.border, color: C.text }} />
      <div className="flex items-center justify-between text-[11.5px]" style={{ color: over ? "#E11D48" : C.muted }}>
        <span>{over && t(`Terlalu panjang (maks ${limit} untuk ${chosen.includes("threads") ? "Threads" : "platform ini"})`, `Too long (max ${limit}${chosen.includes("threads") ? " for Threads" : ""})`)}</span>
        <span>{text.length}/{limit}</span>
      </div>

      {images.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <div key={url} className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-24 w-20 rounded-md border object-cover" style={{ borderColor: C.border }} />
              {!card && (
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-slate-800 text-white">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        {!card && (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy !== null || images.length >= 10}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: C.border, color: C.body }}>
            {busy === "upload" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{t("Gambar", "Images")}
          </button>
        )}
        <button type="button" onClick={post} disabled={busy !== null || over || !chosen.length || (!text.trim() && !images.length)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: accent }}>
          {busy === "post" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {chosen.length > 1 ? t(`Posting ke ${chosen.length}`, `Post to ${chosen.length}`) : t("Posting", "Post")}
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-rose-700">{error}</p>}
      {results && (
        <div className="mt-2 space-y-1">
          {ORDER.filter((p) => results[p]).map((p) => (
            <p key={p} className={`flex items-center gap-1.5 text-[12.5px] font-semibold ${results[p]!.ok ? "text-emerald-700" : "text-rose-700"}`}>
              <Badge platform={p} size="xs" />
              {results[p]!.ok ? t("Terposting.", "Posted.") : `${t("Gagal", "Failed")}: ${results[p]!.error}`}
              {results[p]!.permalink && <a href={results[p]!.permalink!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">{t("Lihat", "View")}<ExternalLink className="h-3 w-3" /></a>}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentPosts({ posts, lang }: { posts: Post[]; lang: Lang }) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: C.border }}>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t("Posting terbaru", "Recent posts")}</p>
      {!posts.length && <p className="mt-2 text-sm" style={{ color: C.muted }}>{t("Belum ada.", "Nothing yet.")}</p>}
      <div className="mt-2 max-h-[520px] divide-y overflow-y-auto" style={{ borderColor: C.border }}>
        {posts.map((p) => (
          <div key={`${p.platform}_${p.id}`} className="flex gap-3 py-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-14 w-11 shrink-0 rounded object-cover" /> : <div className="h-14 w-11 shrink-0 rounded bg-slate-50" />}
            <div className="min-w-0 flex-1 text-[12.5px]">
              <p className="line-clamp-2" style={{ color: C.text }}>{p.text || t("(tanpa teks)", "(no text)")}</p>
              <p className="mt-0.5 flex items-center gap-1.5" style={{ color: C.muted }}>
                <Badge platform={p.platform} size="xs" />
                {ago(p.timestamp, lang)} · {p.replyCount} {t("komentar", p.replyCount === 1 ? "comment" : "comments")}
                {p.open > 0 && <span className="rounded bg-amber-50 px-1.5 text-[10.5px] font-bold text-amber-700">{p.open} {t("perlu dibalas", "to answer")}</span>}
                {p.permalink && <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex" style={{ color: C.navy }}><ExternalLink className="h-3.5 w-3.5" /></a>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Filter = "open" | "followUp" | "all" | "hidden";

function Inbox({ items, posts, live, accent, lang, act, loading, onChanged }: {
  items: Item[]; posts: Post[]; live: Platform[]; accent: string; lang: Lang; act: Act; loading: boolean; onChanged: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [filter, setFilter] = useState<Filter>("open");
  const [only, setOnly] = useState<Platform | null>(null);
  const postText = useMemo(() => new Map(posts.map((p) => [`${p.platform}_${p.id}`, p.text])), [posts]);
  const isOpen = (i: Item) => !i.answered && !i.done && !i.hidden;
  const scoped = items.filter((i) => !only || i.platform === only);
  const counts = {
    open: scoped.filter(isOpen).length,
    followUp: scoped.filter((i) => i.followUp).length,
    all: scoped.filter((i) => !i.hidden).length,
    hidden: scoped.filter((i) => i.hidden).length,
  };
  const shown = scoped.filter((i) => (filter === "open" ? isOpen(i) : filter === "followUp" ? i.followUp : filter === "hidden" ? i.hidden : !i.hidden));
  const tabs: { key: Filter; label: string }[] = [
    { key: "open", label: t("Perlu dibalas", "Needs reply") },
    { key: "followUp", label: t("Tindak lanjut", "Follow up") },
    { key: "all", label: t("Semua", "All") },
    { key: "hidden", label: t("Disembunyikan", "Hidden") },
  ];

  return (
    <section className="min-w-0 rounded-2xl border bg-white" style={{ borderColor: C.border }}>
      <div className="flex items-center gap-1 overflow-x-auto border-b px-3 py-2" style={{ borderColor: C.border }}>
        {tabs.map((tab) => (
          <button key={tab.key} type="button" onClick={() => setFilter(tab.key)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-bold"
            style={filter === tab.key ? { background: "#F1F5F9", color: C.text } : { color: C.label }}>
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className="ml-1.5 rounded-full px-1.5 text-[11px]" style={tab.key === "followUp" ? { background: "#FEF3C7", color: "#B45309" } : { background: "#E2E8F0", color: C.body }}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
        <button type="button" onClick={onChanged} className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ color: C.label }} title={t("Muat ulang", "Refresh")}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: C.border }}>
        <button type="button" onClick={() => setOnly(null)} className="rounded-full px-2.5 py-1 text-[12px] font-bold"
          style={!only ? { background: C.text, color: "white" } : { color: C.label }}>{t("Semua platform", "All platforms")}</button>
        {live.map((p) => (
          <button key={p} type="button" onClick={() => setOnly(only === p ? null : p)} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold"
            style={only === p ? { background: META[p].color, color: "white" } : { color: C.label }}>
            {(() => { const I = META[p].Icon; return <I className="h-3 w-3" />; })()}{META[p].name}
          </button>
        ))}
      </div>
      {filter === "followUp" && <p className="border-b px-4 py-2 text-[12px]" style={{ borderColor: C.border, color: C.label }}>{t("Belum dibalas lebih dari 6 jam.", "Unanswered for more than 6 hours.")}</p>}

      <div className="divide-y" style={{ borderColor: C.border }}>
        {!shown.length && (
          <p className="px-4 py-14 text-center text-sm" style={{ color: C.muted }}>
            {filter === "open" ? t("Semua sudah dibalas", "All caught up") : t("Tidak ada.", "Nothing here.")}
          </p>
        )}
        {shown.map((item) => (
          <InboxRow key={`${item.platform}_${item.id}`} item={item} postText={postText.get(`${item.platform}_${item.postId}`) ?? ""} accent={accent} lang={lang} act={act} onChanged={onChanged} />
        ))}
      </div>
    </section>
  );
}

function InboxRow({ item, postText, accent, lang, act, onChanged }: {
  item: Item; postText: string; accent: string; lang: Lang; act: Act; onChanged: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = META[item.platform].limit;
  const profileUrl = item.platform === "threads" ? `https://www.threads.com/@${item.username}`
    : item.platform === "instagram" ? `https://www.instagram.com/${item.username}` : null;

  const run = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await act({ ...body, platform: item.platform, id: item.id });
      onChanged();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      return false;
    } finally {
      setBusy(false);
    }
  };
  const send = async () => {
    if (await run({ action: "reply", text })) {
      setText("");
      setReplying(false);
    }
  };

  return (
    <div className="px-4 py-3" style={item.followUp ? { background: "#FFFBEB" } : undefined}>
      <div className="flex items-center gap-2 text-[12.5px]">
        <Badge platform={item.platform} />
        {profileUrl
          ? <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="font-bold" style={{ color: C.text }}>@{item.username}</a>
          : <span className="font-bold" style={{ color: C.text }}>{item.username}</span>}
        <span style={{ color: C.muted }}>{ago(item.timestamp, lang)}</span>
        {item.followUp && <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 text-[10.5px] font-bold text-amber-800"><Clock className="h-3 w-3" />{t("tindak lanjut", "follow up")}</span>}
        {item.answered && <span className="rounded bg-emerald-50 px-1.5 text-[10.5px] font-bold text-emerald-700">{t("dibalas", "answered")}{item.answeredByName && ` · ${item.answeredByName}`}</span>}
        {item.done && <span className="rounded bg-slate-100 px-1.5 text-[10.5px] font-bold text-slate-600">{t("selesai", "done")}{item.doneByName && ` · ${item.doneByName}`}</span>}
        {item.hidden && <span className="rounded bg-slate-100 px-1.5 text-[10.5px] font-bold text-slate-600">{t("disembunyikan", "hidden")}</span>}
        {item.permalink && <a href={item.permalink} target="_blank" rel="noopener noreferrer" className="ml-auto" style={{ color: C.navy }}><ExternalLink className="h-3.5 w-3.5" /></a>}
      </div>
      <p className="mt-0.5 truncate text-[11.5px]" style={{ color: C.muted }}>
        {item.inReplyToOurs ? `${t("Menjawab balasan kita", "Replying to our answer")}: “${item.inReplyToOurs}”` : `${t("Di posting", "On post")}: “${postText || "…"}”`}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap text-sm" style={{ color: C.text }}>{item.text || t("(tanpa teks, mungkin gambar)", "(no text, maybe an image)")}</p>
      {item.ourAnswer !== null && item.ourAnswer !== "" && (
        <p className="mt-1.5 flex gap-1.5 text-[13px]" style={{ color: C.body }}><CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />{item.ourAnswer}</p>
      )}

      {replying ? (
        <div className="mt-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} autoFocus placeholder={t(`Balas ${item.username}…`, `Reply to ${item.username}…`)}
            className="w-full resize-y rounded-lg border p-2.5 text-sm" style={{ borderColor: text.length > limit ? "#E11D48" : C.border }} />
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px]" style={{ color: text.length > limit ? "#E11D48" : C.muted }}>{text.length}/{limit}</span>
            <button type="button" onClick={() => setReplying(false)} className="ml-auto rounded-lg px-3 py-1.5 text-[13px] font-semibold" style={{ color: C.label }}>{t("Batal", "Cancel")}</button>
            <button type="button" onClick={send} disabled={busy || !text.trim() || text.length > limit}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-bold text-white disabled:opacity-50" style={{ background: accent }}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}{t("Kirim", "Send")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {!item.hidden && (
            <button type="button" onClick={() => setReplying(true)} className="rounded-lg px-3 py-1.5 text-[12.5px] font-bold text-white" style={{ background: accent }}>
              {item.answered ? t("Balas lagi", "Reply again") : t("Balas", "Reply")}
            </button>
          )}
          {!item.answered && !item.hidden && (
            <button type="button" onClick={() => run({ action: "done", done: !item.done })} disabled={busy}
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold disabled:opacity-50" style={{ borderColor: C.border, color: C.body }}>
              <CheckCircle2 className="h-3.5 w-3.5" />{item.done ? t("Buka lagi", "Reopen") : t("Tidak perlu dibalas", "No reply needed")}
            </button>
          )}
          <button type="button" onClick={() => run({ action: "hide", hide: !item.hidden })} disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold disabled:opacity-50" style={{ borderColor: C.border, color: C.body }}>
            {item.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{item.hidden ? t("Tampilkan", "Unhide") : t("Sembunyikan", "Hide")}
          </button>
          {busy && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </div>
      )}
      {error && <p className="mt-1.5 flex items-center gap-1 text-[12.5px] font-semibold text-rose-700"><AlertTriangle className="h-3.5 w-3.5" />{error}</p>}
    </div>
  );
}
