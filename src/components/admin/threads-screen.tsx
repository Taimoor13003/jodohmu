"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle, AtSign, CheckCircle2, Clock, CornerDownRight, ExternalLink, Eye, EyeOff, ImagePlus, Loader2, RefreshCw, Send, X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { authFetch } from "@/components/admin/share-api";

type AccountKey = "nikahin_foreigner" | "nikah_lagiyuk" | "taaruf_sekarang" | "temu_chindo" | "kristenmatch" | "jodohmu";
type AccountStatus = { key: AccountKey; connected: boolean; username: string | null; expiresAt: number | null; connectedByName: string | null };
type Card = { candidateId: string; code: string; candidateName: string; caption: string; imageUrls: string[]; at: string | null; sharedToThreads: boolean };
type InboxPost = { id: string; text: string; permalink: string | null; timestamp: string; mediaType: string; imageUrl: string | null; replyCount: number; open: number };
type InboxItem = {
  id: string; postId: string; text: string; username: string; timestamp: string; permalink: string | null;
  hidden: boolean; answered: boolean; ourAnswer: string | null; answeredByName: string | null; done: boolean; doneByName: string | null;
  followUp: boolean; inReplyToOurs: string | null;
};
type AccountData = { configured: boolean; accounts: AccountStatus[]; cards?: Card[]; posts?: InboxPost[]; items?: InboxItem[]; error?: string };

// Mirrors THREADS_ACCOUNTS in lib/threads (server-only because of the token code)
const ACCOUNTS: { key: AccountKey; handle: string; label: string; accent: string }[] = [
  { key: "nikahin_foreigner", handle: "nikahin_foreigner", label: "WNI & WNA", accent: "#761410" },
  { key: "nikah_lagiyuk", handle: "nikah_lagiyuk", label: "Janda / duda", accent: "#9B2242" },
  { key: "taaruf_sekarang", handle: "taaruf_sekarang", label: "Muslim", accent: "#3E5A4C" },
  { key: "temu_chindo", handle: "temu_chindo", label: "Chindo", accent: "#B4232C" },
  { key: "kristenmatch", handle: "kristenmatch.indo", label: "Kristen", accent: "#1D4E89" },
  { key: "jodohmu", handle: "jodohmu_official", label: "Jodohmu", accent: "#C4294A" },
];
const LIMIT = 500;
const C = { border: "#E2E8F0", text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8", navy: "#1B3A6B" };

function ago(iso: string, lang: "id" | "en") {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return lang === "id" ? "baru saja" : "just now";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// Photos are shrunk in the browser first: Threads takes up to 1440px wide, and the upload stays small
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

/* Admin → Threads: one tab per account. Post, see every reply in one list, answer, hide, and mark follow-ups done. */
export default function ThreadsScreen() {
  const { lang: rawLang } = useLanguage();
  const lang = rawLang === "id" ? "id" : "en";
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const key = (ACCOUNTS.find((a) => a.key === params.get("account"))?.key ?? "nikahin_foreigner") as AccountKey;
  const account = ACCOUNTS.find((a) => a.key === key)!;
  const notice = params.get("connected") ? t("Threads terhubung.", "Threads connected.") : null;
  const loginError = params.get("error");
  const go = (next: AccountKey) => router.replace(`${pathname}?account=${next}`, { scroll: false });

  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await authFetch<AccountData>(`/api/admin/threads?account=${key}`));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [key]);
  useEffect(() => { setData(null); load(); }, [load]);

  const status = data?.accounts.find((a) => a.key === key) ?? null;
  const act = (body: Record<string, unknown>) => authFetch<Record<string, unknown>>("/api/admin/threads", { method: "POST", body: JSON.stringify({ account: key, ...body }) });

  const connect = async () => {
    try {
      const { url } = await act({ action: "connect" });
      window.location.href = url as string;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the Threads login");
    }
  };
  const disconnect = async () => {
    if (!confirm(t(`Putuskan @${account.handle} dari Threads?`, `Disconnect @${account.handle} from Threads?`))) return;
    await act({ action: "disconnect" }).catch(() => null);
    load();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-[#C4294A]">Threads</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("Posting & balas di Threads", "Post and reply on Threads")}</h1>

      <div className="mt-5 flex gap-1 overflow-x-auto rounded-xl border bg-white p-1" style={{ borderColor: C.border }}>
        {ACCOUNTS.map((a) => {
          const s = data?.accounts.find((x) => x.key === a.key);
          return (
            <button key={a.key} type="button" onClick={() => go(a.key)}
              className="flex shrink-0 flex-col items-start rounded-lg px-4 py-2 text-left transition"
              style={key === a.key ? { background: a.accent, color: "white" } : { color: C.label }}>
              <span className="flex items-center gap-1.5 text-sm font-bold"><AtSign className="h-3.5 w-3.5" />{a.handle}</span>
              <span className="text-[11px] opacity-80">{a.label}{s && !s.connected && ` · ${t("belum terhubung", "not connected")}`}</span>
            </button>
          );
        })}
      </div>

      {notice && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{notice}</p>}
      {(loginError || error || data?.error) && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{loginError || error || data?.error}</p>
      )}

      {!data && loading && <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[#1B3A6B]" /></div>}

      {data && !data.configured && (
        <div className="mt-5 rounded-2xl border bg-white p-5 text-sm" style={{ borderColor: C.border, color: C.body }}>
          <p className="font-bold" style={{ color: C.text }}>{t("Threads belum diatur", "Threads isn't set up yet")}</p>
          <p className="mt-1">{t("Tambahkan THREADS_APP_ID dan THREADS_APP_SECRET dari aplikasi Meta.", "Add THREADS_APP_ID and THREADS_APP_SECRET from the Meta app.")}</p>
        </div>
      )}

      {data && data.configured && status && !status.connected && (
        <div className="mt-5 max-w-2xl rounded-2xl border bg-white p-6" style={{ borderColor: C.border }}>
          <p className="text-lg font-bold" style={{ color: C.text }}>{t(`Hubungkan @${account.handle}`, `Connect @${account.handle}`)}</p>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm" style={{ color: C.body }}>
            <li>{t("Buka threads.com dan pastikan Anda masuk sebagai ", "Open threads.com and make sure you're logged in as ")}<b>@{account.handle}</b>.</li>
            <li>{t("Klik tombol di bawah, lalu izinkan.", "Click the button below and allow access.")}</li>
            <li>{t("Sekali saja. Login diperbarui otomatis.", "Once only. The login renews itself.")}</li>
          </ol>
          {status.expiresAt && <p className="mt-3 text-sm font-semibold text-amber-700">{t("Login sebelumnya kedaluwarsa; hubungkan lagi.", "The previous login expired; connect again.")}</p>}
          <button type="button" onClick={connect} className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white" style={{ background: account.accent }}>
            <AtSign className="h-4 w-4" />{t("Hubungkan Threads", "Connect Threads")}
          </button>
        </div>
      )}

      {data && status?.connected && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="min-w-0 space-y-5">
            <Composer key={key} handle={account.handle} accent={account.accent} cards={data.cards ?? []} lang={lang} act={act} onPosted={load} />
            <RecentPosts posts={data.posts ?? []} lang={lang} />
            <p className="px-1 text-[11.5px]" style={{ color: C.muted }}>
              {t("Terhubung", "Connected")}{status.connectedByName && ` ${t("oleh", "by")} ${status.connectedByName}`} · {t("login diperbarui otomatis", "login renews itself")} ·{" "}
              <button type="button" onClick={disconnect} className="font-bold underline">{t("Putuskan", "Disconnect")}</button>
            </p>
          </div>
          <Inbox items={data.items ?? []} posts={data.posts ?? []} accent={account.accent} lang={lang} act={act} loading={loading} onChanged={load} />
        </div>
      )}
    </div>
  );
}

type Act = (body: Record<string, unknown>) => Promise<Record<string, unknown>>;

function Composer({ handle, accent, cards, lang, act, onPosted }: {
  handle: string; accent: string; cards: Card[]; lang: "id" | "en"; act: Act; onPosted: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [card, setCard] = useState<Card | null>(null);
  const [busy, setBusy] = useState<"upload" | "post" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const unshared = cards.filter((c) => !c.sharedToThreads);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy("upload");
    setError(null);
    try {
      for (const file of Array.from(files).slice(0, 20 - images.length)) {
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

  const pickCard = (id: string) => {
    const c = cards.find((x) => x.candidateId === id) ?? null;
    setCard(c);
    if (c) {
      setImages(c.imageUrls);
      setText(c.caption.slice(0, LIMIT));
    } else {
      setImages([]);
    }
  };

  const post = async () => {
    setBusy("post");
    setError(null);
    try {
      const res = await act({ action: "post", text, imageUrls: images, candidateId: card?.candidateId ?? null });
      setPosted((res.permalink as string | null) ?? "");
      setText("");
      setImages([]);
      setCard(null);
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Posting failed");
    } finally {
      setBusy(null);
    }
  };

  const over = text.length > LIMIT;
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: C.border }}>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t(`Posting baru di @${handle}`, `New post on @${handle}`)}</p>

      {cards.length > 0 && (
        <select value={card?.candidateId ?? ""} onChange={(e) => pickCard(e.target.value)} className="mt-3 h-9 w-full rounded-lg border px-2 text-sm" style={{ borderColor: C.border }}>
          <option value="">{t("Bagikan kartu klien dari Instagram… (opsional)", "Share a client card from Instagram… (optional)")}</option>
          {unshared.map((c) => <option key={c.candidateId} value={c.candidateId}>{c.code} · {c.candidateName}</option>)}
          {cards.length > unshared.length && <option disabled>— {cards.length - unshared.length} {t("sudah di Threads", "already on Threads")} —</option>}
        </select>
      )}

      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={t("Tulis sesuatu…", "Write something…")}
        className="mt-3 w-full resize-y rounded-lg border p-3 text-sm" style={{ borderColor: over ? "#E11D48" : C.border, color: C.text }} />
      <div className="flex items-center justify-between text-[11.5px]" style={{ color: over ? "#E11D48" : C.muted }}>
        <span>{over && t("Terlalu panjang untuk Threads", "Too long for Threads")}</span>
        <span>{text.length}/{LIMIT}</span>
      </div>

      {images.length > 0 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((url, i) => (
            <div key={url} className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-24 w-20 rounded-md border object-cover" style={{ borderColor: C.border }} />
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-slate-800 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => addFiles(e.target.files)} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy !== null || images.length >= 20}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: C.border, color: C.body }}>
          {busy === "upload" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{t("Gambar", "Images")}
        </button>
        <button type="button" onClick={post} disabled={busy !== null || over || (!text.trim() && !images.length)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: accent }}>
          {busy === "post" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{t("Posting", "Post")}
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-rose-700">{error}</p>}
      {posted !== null && !error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />{t("Terposting.", "Posted.")}
          {posted && <a href={posted} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline">{t("Lihat", "View")}<ExternalLink className="h-3 w-3" /></a>}
        </p>
      )}
    </div>
  );
}

function RecentPosts({ posts, lang }: { posts: InboxPost[]; lang: "id" | "en" }) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  return (
    <div className="rounded-2xl border bg-white p-4" style={{ borderColor: C.border }}>
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.label }}>{t("Posting terbaru", "Recent posts")}</p>
      {!posts.length && <p className="mt-2 text-sm" style={{ color: C.muted }}>{t("Belum ada.", "Nothing yet.")}</p>}
      <div className="mt-2 divide-y" style={{ borderColor: C.border }}>
        {posts.map((p) => (
          <div key={p.id} className="flex gap-3 py-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.imageUrl && <img src={p.imageUrl} alt="" className="h-14 w-11 shrink-0 rounded object-cover" />}
            <div className="min-w-0 flex-1 text-[12.5px]">
              <p className="line-clamp-2" style={{ color: C.text }}>{p.text || t("(tanpa teks)", "(no text)")}</p>
              <p className="mt-0.5 flex items-center gap-2" style={{ color: C.muted }}>
                {ago(p.timestamp, lang)} · {p.replyCount} {t("balasan", p.replyCount === 1 ? "reply" : "replies")}
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

function Inbox({ items, posts, accent, lang, act, loading, onChanged }: {
  items: InboxItem[]; posts: InboxPost[]; accent: string; lang: "id" | "en"; act: Act; loading: boolean; onChanged: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [filter, setFilter] = useState<Filter>("open");
  const postText = useMemo(() => new Map(posts.map((p) => [p.id, p.text])), [posts]);
  const isOpen = (i: InboxItem) => !i.answered && !i.done && !i.hidden;
  const counts = {
    open: items.filter(isOpen).length,
    followUp: items.filter((i) => i.followUp).length,
    all: items.filter((i) => !i.hidden).length,
    hidden: items.filter((i) => i.hidden).length,
  };
  const shown = items.filter((i) => (filter === "open" ? isOpen(i) : filter === "followUp" ? i.followUp : filter === "hidden" ? i.hidden : !i.hidden));
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
      {filter === "followUp" && <p className="border-b px-4 py-2 text-[12px]" style={{ borderColor: C.border, color: C.label }}>{t("Belum dibalas lebih dari 6 jam.", "Unanswered for more than 6 hours.")}</p>}

      <div className="divide-y" style={{ borderColor: C.border }}>
        {!shown.length && (
          <p className="px-4 py-14 text-center text-sm" style={{ color: C.muted }}>
            {filter === "open" ? t("Semua sudah dibalas 🎉", "All caught up") : t("Tidak ada.", "Nothing here.")}
          </p>
        )}
        {shown.map((item) => <InboxRow key={item.id} item={item} postText={postText.get(item.postId) ?? ""} accent={accent} lang={lang} act={act} onChanged={onChanged} />)}
      </div>
    </section>
  );
}

function InboxRow({ item, postText, accent, lang, act, onChanged }: {
  item: InboxItem; postText: string; accent: string; lang: "id" | "en"; act: Act; onChanged: () => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await act({ ...body, replyId: item.id });
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
    if (await run({ action: "reply", replyToId: item.id, text })) {
      setText("");
      setReplying(false);
    }
  };

  return (
    <div className="px-4 py-3" style={item.followUp ? { background: "#FFFBEB" } : undefined}>
      <div className="flex items-center gap-2 text-[12.5px]">
        <a href={`https://www.threads.com/@${item.username}`} target="_blank" rel="noopener noreferrer" className="font-bold" style={{ color: C.text }}>@{item.username}</a>
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
      {item.ourAnswer && (
        <p className="mt-1.5 flex gap-1.5 text-[13px]" style={{ color: C.body }}><CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />{item.ourAnswer}</p>
      )}

      {replying ? (
        <div className="mt-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} autoFocus placeholder={t(`Balas @${item.username}…`, `Reply to @${item.username}…`)}
            className="w-full resize-y rounded-lg border p-2.5 text-sm" style={{ borderColor: text.length > LIMIT ? "#E11D48" : C.border }} />
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[11px]" style={{ color: text.length > LIMIT ? "#E11D48" : C.muted }}>{text.length}/{LIMIT}</span>
            <button type="button" onClick={() => setReplying(false)} className="ml-auto rounded-lg px-3 py-1.5 text-[13px] font-semibold" style={{ color: C.label }}>{t("Batal", "Cancel")}</button>
            <button type="button" onClick={send} disabled={busy || !text.trim() || text.length > LIMIT}
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
