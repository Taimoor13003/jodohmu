"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Instagram } from "lucide-react";
import { authFetch } from "./share-api";
import type { PostRow } from "./social-post-panel";

const C = { card: "#FFFFFF", border: "#E2E8F0", div: "#F1F5F9", text: "#0F172A", body: "#334155", muted: "#94A3B8", navy: "#1B3A6B" };
const STATUS = {
  published: { id: "Terposting", en: "Posted", bg: "#ECFDF5", fg: "#047857" },
  publishing: { id: "Sedang diposting", en: "Posting", bg: "#EFF6FF", fg: "#1D4ED8" },
  failed: { id: "Gagal", en: "Failed", bg: "#FEF2F2", fg: "#B91C1C" },
  deleted: { id: "Dihapus di Instagram", en: "Deleted on Instagram", bg: "#F1F5F9", fg: "#475569" },
} as const;

// Where this client has been posted on our Instagram pages, and how their card differed from the profile
export default function SocialPostHistory({ candidateId, lang }: { candidateId: string; lang: "id" | "en" }) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const [posts, setPosts] = useState<PostRow[] | null>(null);

  useEffect(() => {
    authFetch<{ posts: PostRow[] }>(`/api/admin/social?candidateId=${encodeURIComponent(candidateId)}`)
      .then((data) => setPosts(data.posts))
      .catch(() => setPosts(null));
  }, [candidateId]);

  // Admin-only data; teammates without access simply don't see the section
  if (!posts) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${C.div}` }}>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>
          <Instagram style={{ width: 12, height: 12 }} />{t("Posting media sosial", "Social media posts")} ({posts.length})
        </span>
        <Link href={`/admin/subpages?profile=${candidateId}`} className="text-[11.5px] font-bold" style={{ color: C.navy }}>
          {t("Posting ke subpage", "Post to a subpage")}
        </Link>
      </div>
      {posts.length ? (
        <div className="divide-y" style={{ borderColor: C.div }}>
          {posts.map((p) => {
            const s = STATUS[p.status];
            return (
              <div key={p.page} className="flex gap-4 px-5 py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.imageUrl && <img src={p.imageUrl} alt="" className="h-24 w-[77px] shrink-0 rounded-lg border object-cover" style={{ borderColor: C.border }} />}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-bold" style={{ color: C.text }}>@{p.handle}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: s.bg, color: s.fg }}>{lang === "id" ? s.id : s.en}</span>
                    <span className="text-[11.5px]" style={{ color: C.muted }}>
                      {p.code}{p.at && ` · ${new Date(p.at).toLocaleString(lang === "id" ? "id-ID" : "en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}{p.byName && ` · ${p.byName}`}
                    </span>
                    {p.permalink && (
                      <a href={p.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11.5px] font-bold" style={{ color: C.navy }}>
                        {t("Lihat post", "View post")}<ExternalLink style={{ width: 11, height: 11 }} />
                      </a>
                    )}
                  </div>
                  {p.error && <p className="text-[12px] font-semibold" style={{ color: STATUS.failed.fg }}>{p.error}</p>}
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: C.muted }}>{t("Diubah dari profil", "Changed from the profile")}</p>
                    {p.changes.length ? (
                      <ul className="mt-0.5 list-disc pl-4 text-[12.5px]" style={{ color: C.body }}>{p.changes.map((c) => <li key={c}>{c}</li>)}</ul>
                    ) : (
                      <p className="text-[12.5px]" style={{ color: C.body }}>{t("Tidak ada; ditampilkan seperti di profil.", "Nothing; shown as in the profile.")}</p>
                    )}
                  </div>
                  <details className="text-[12px]" style={{ color: C.body }}>
                    <summary className="cursor-pointer font-semibold" style={{ color: C.muted }}>Caption</summary>
                    <p className="mt-1 whitespace-pre-wrap rounded-lg px-3 py-2" style={{ background: "#F8FAFC" }}>{p.caption}</p>
                  </details>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-4 text-[12.5px]" style={{ color: C.muted }}>{t("Belum pernah diposting di halaman Instagram kita.", "Not posted on any of our Instagram pages yet.")}</p>
      )}
    </div>
  );
}
