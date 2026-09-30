import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { metaToken, publishImages } from "@/lib/social-server";
import { inboxMarks, isOpen, markReplied, toItem, type InboxItem, type InboxPost, type Platform } from "@/lib/social-inbox";

/* Instagram and Facebook for the combined social screen: our recent posts, the comments under them,
   answering and hiding comments, and posting. Everything goes through the "Jodohmu Poster Bot" system
   user; Facebook calls use the Page's own token, which the system user can ask for. */

const GRAPH = "https://graph.facebook.com/v23.0";
const TIMEOUT_MS = 20_000;
export const HUB_POSTS = "social_hub_posts";

async function graph<T>(token: string, path: string, init?: { method?: "GET" | "POST"; params?: Record<string, string> }): Promise<T> {
  const params = new URLSearchParams({ ...(init?.params ?? {}), access_token: token });
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const res = init?.method === "POST"
    ? await fetch(`${GRAPH}/${path}`, { method: "POST", body: params, cache: "no-store", signal })
    : await fetch(`${GRAPH}/${path}?${params.toString()}`, { cache: "no-store", signal });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; error_user_msg?: string } };
  if (!res.ok || json.error) throw new Error(json.error?.error_user_msg || json.error?.message || res.statusText);
  return json;
}

// What each permission is needed for, so the screen can say what stops working without it
export const META_PERMISSIONS: { scope: string; for: string }[] = [
  { scope: "pages_show_list", for: "finding the Pages" },
  { scope: "business_management", for: "reaching the Pages in the business portfolio" },
  { scope: "instagram_basic", for: "reading Instagram posts" },
  { scope: "instagram_content_publish", for: "posting to Instagram" },
  { scope: "instagram_manage_comments", for: "answering and hiding Instagram comments" },
  { scope: "pages_read_engagement", for: "reading Facebook posts" },
  { scope: "pages_manage_posts", for: "posting to Facebook" },
  { scope: "pages_read_user_content", for: "reading Facebook comments" },
  { scope: "pages_manage_engagement", for: "answering and hiding Facebook comments" },
];

export type MetaTokenInfo = {
  present: boolean; valid: boolean;
  // ms since epoch; null when Meta says it never expires
  expiresAt: number | null;
  missing: { scope: string; for: string }[];
  // Meta's own words when the login no longer works (an expired token can't even be looked up)
  error: string | null;
};

let tokenInfoCache: { token: string; at: number; info: MetaTokenInfo } | null = null;

// When the "Jodohmu Poster Bot" login stops working and what it's allowed to do; asked of Meta at most every 10 minutes
export async function metaTokenInfo(): Promise<MetaTokenInfo> {
  const token = metaToken();
  if (!token) return { present: false, valid: false, expiresAt: null, missing: [], error: null };
  if (tokenInfoCache?.token === token && Date.now() - tokenInfoCache.at < 10 * 60 * 1000) return tokenInfoCache.info;
  let data: { is_valid?: boolean; expires_at?: number; scopes?: string[]; error?: { message?: string } };
  try {
    ({ data } = await graph<{ data: typeof data }>(token, "debug_token", { params: { input_token: token } }));
  } catch (err) {
    // Not cached, so a renewed token shows up on the next load
    return { present: true, valid: false, expiresAt: null, missing: [], error: err instanceof Error ? err.message : String(err) };
  }
  const scopes = new Set(data.scopes ?? []);
  const info: MetaTokenInfo = {
    present: true, valid: data.is_valid === true,
    expiresAt: data.expires_at ? data.expires_at * 1000 : null,
    missing: META_PERMISSIONS.filter((p) => !scopes.has(p.scope)),
    error: data.is_valid === true ? null : (data.error?.message ?? "Meta says this login is no longer valid."),
  };
  tokenInfoCache = { token, at: Date.now(), info };
  return info;
}

export type MetaAccount ={ pageId: string; pageName: string; pageToken: string; igId: string | null; igUsername: string | null };

// The Page behind an Instagram handle (or with that name), from the Pages the system user was given
export async function metaAccount(handle: string): Promise<MetaAccount | null> {
  const token = metaToken();
  if (!token) return null;
  const { data } = await graph<{ data: { id: string; name: string; access_token?: string; instagram_business_account?: { id: string; username: string } }[] }>(
    token, "me/accounts", { params: { fields: "id,name,access_token,instagram_business_account{id,username}", limit: "100" } },
  );
  const page = data.find((p) => p.instagram_business_account?.username?.toLowerCase() === handle.toLowerCase());
  if (!page) return null;
  return {
    pageId: page.id, pageName: page.name, pageToken: page.access_token ?? token,
    igId: page.instagram_business_account?.id ?? null, igUsername: page.instagram_business_account?.username ?? null,
  };
}

/* ── the inbox ── */

type IgComment = { id: string; text?: string; username?: string; timestamp: string; hidden?: boolean; replies?: { data: IgComment[] } };
type IgMedia = { id: string; caption?: string; permalink?: string; timestamp: string; media_type?: string; media_url?: string; thumbnail_url?: string };

export async function instagramInbox(key: string, acct: MetaAccount): Promise<{ posts: InboxPost[]; items: InboxItem[] }> {
  const token = metaToken()!;
  const { data: media } = await graph<{ data: IgMedia[] }>(token, `${acct.igId}/media`, {
    params: { fields: "id,caption,permalink,timestamp,media_type,media_url,thumbnail_url", limit: "20" },
  });
  const [threads, marks] = await Promise.all([
    Promise.all(media.map((m) => graph<{ data: IgComment[] }>(token, `${m.id}/comments`, {
      params: { fields: "id,text,username,timestamp,hidden,replies{id,text,username,timestamp}", limit: "50" },
    }).then((r) => r.data).catch(() => [] as IgComment[]))),
    inboxMarks("instagram", key),
  ]);
  const ours = (c: IgComment) => c.username?.toLowerCase() === acct.igUsername?.toLowerCase();

  const items: InboxItem[] = [];
  const posts: InboxPost[] = media.map((m, i) => {
    const rows: InboxItem[] = [];
    for (const c of threads[i]) {
      if (ours(c)) continue;
      const replies = c.replies?.data ?? [];
      // Instagram threads one level deep: our answer is a reply of ours under the comment
      const answer = [...replies].reverse().find(ours) ?? null;
      rows.push(toItem("instagram", {
        id: c.id, postId: m.id, text: c.text ?? "", username: c.username ?? "someone", timestamp: c.timestamp, permalink: m.permalink ?? null,
        hidden: c.hidden === true, answer: answer ? (answer.text ?? "") : null, inReplyToOurs: null,
      }, marks.get(c.id)));
      // Someone answering inside the thread after our reply is a new comment to deal with
      const last = replies[replies.length - 1];
      if (last && !ours(last) && answer) {
        rows.push(toItem("instagram", {
          id: last.id, postId: m.id, text: last.text ?? "", username: last.username ?? "someone", timestamp: last.timestamp, permalink: m.permalink ?? null,
          hidden: false, answer: null, inReplyToOurs: answer.text ?? null,
        }, marks.get(last.id)));
      }
    }
    items.push(...rows);
    return {
      platform: "instagram" as const, id: m.id, text: m.caption ?? "", permalink: m.permalink ?? null, timestamp: m.timestamp,
      imageUrl: m.media_type === "VIDEO" ? (m.thumbnail_url ?? null) : (m.media_url ?? null),
      replyCount: rows.length, open: rows.filter(isOpen).length,
    };
  });
  return { posts, items };
}

type FbComment = { id: string; message?: string; from?: { id: string; name: string }; created_time: string; is_hidden?: boolean; permalink_url?: string; comments?: { data: FbComment[] } };
type FbPost = { id: string; message?: string; permalink_url?: string; created_time: string; full_picture?: string };

export async function facebookInbox(key: string, acct: MetaAccount): Promise<{ posts: InboxPost[]; items: InboxItem[] }> {
  const token = acct.pageToken;
  const { data: fbPosts } = await graph<{ data: FbPost[] }>(token, `${acct.pageId}/published_posts`, {
    params: { fields: "id,message,permalink_url,created_time,full_picture", limit: "20" },
  });
  const [threads, marks] = await Promise.all([
    Promise.all(fbPosts.map((p) => graph<{ data: FbComment[] }>(token, `${p.id}/comments`, {
      params: { fields: "id,message,from,created_time,is_hidden,permalink_url,comments{id,message,from,created_time}", filter: "toplevel", limit: "50" },
    }).then((r) => r.data).catch(() => [] as FbComment[]))),
    inboxMarks("facebook", key),
  ]);
  const ours = (c: FbComment) => c.from?.id === acct.pageId;

  const items: InboxItem[] = [];
  const posts: InboxPost[] = fbPosts.map((p, i) => {
    const rows: InboxItem[] = [];
    for (const c of threads[i]) {
      if (ours(c)) continue;
      const replies = c.comments?.data ?? [];
      const answer = [...replies].reverse().find(ours) ?? null;
      rows.push(toItem("facebook", {
        id: c.id, postId: p.id, text: c.message ?? "", username: c.from?.name ?? "someone", timestamp: c.created_time,
        permalink: c.permalink_url ?? p.permalink_url ?? null, hidden: c.is_hidden === true,
        answer: answer ? (answer.message ?? "") : null, inReplyToOurs: null,
      }, marks.get(c.id)));
      const last = replies[replies.length - 1];
      if (last && !ours(last) && answer) {
        rows.push(toItem("facebook", {
          id: last.id, postId: p.id, text: last.message ?? "", username: last.from?.name ?? "someone", timestamp: last.created_time,
          permalink: c.permalink_url ?? p.permalink_url ?? null, hidden: false, answer: null, inReplyToOurs: answer.message ?? null,
        }, marks.get(last.id)));
      }
    }
    items.push(...rows);
    return {
      platform: "facebook" as const, id: p.id, text: p.message ?? "", permalink: p.permalink_url ?? null, timestamp: p.created_time,
      imageUrl: p.full_picture ?? null, replyCount: rows.length, open: rows.filter(isOpen).length,
    };
  });
  return { posts, items };
}

export async function metaReply(platform: Exclude<Platform, "threads">, key: string, acct: MetaAccount, commentId: string, text: string, actor: { uid: string; name: string }) {
  const body = text.trim();
  if (!body) throw new Error("Write a reply first.");
  if (platform === "instagram") await graph(metaToken()!, `${commentId}/replies`, { method: "POST", params: { message: body } });
  else await graph(acct.pageToken, `${commentId}/comments`, { method: "POST", params: { message: body } });
  await markReplied(platform, key, commentId, actor);
}

export async function metaHide(platform: Exclude<Platform, "threads">, acct: MetaAccount, commentId: string, hide: boolean) {
  if (platform === "instagram") await graph(metaToken()!, commentId, { method: "POST", params: { hide: String(hide) } });
  else await graph(acct.pageToken, commentId, { method: "POST", params: { is_hidden: String(hide) } });
}

/* ── posting ── */

// Text alone, one photo, or several photos in one post
export async function postFacebook(acct: MetaAccount, text: string, imageUrls: string[]): Promise<{ id: string; permalink: string | null }> {
  const token = acct.pageToken;
  let id: string;
  if (!imageUrls.length) {
    id = (await graph<{ id: string }>(token, `${acct.pageId}/feed`, { method: "POST", params: { message: text } })).id;
  } else if (imageUrls.length === 1) {
    const photo = await graph<{ id: string; post_id?: string }>(token, `${acct.pageId}/photos`, { method: "POST", params: { url: imageUrls[0], message: text } });
    id = photo.post_id ?? photo.id;
  } else {
    // Photos are uploaded unpublished first, then attached to one post in order
    const photoIds = await Promise.all(imageUrls.map((url) =>
      graph<{ id: string }>(token, `${acct.pageId}/photos`, { method: "POST", params: { url, published: "false" } }).then((r) => r.id)));
    const params: Record<string, string> = { message: text };
    photoIds.forEach((pid, i) => { params[`attached_media[${i}]`] = JSON.stringify({ media_fbid: pid }); });
    id = (await graph<{ id: string }>(token, `${acct.pageId}/feed`, { method: "POST", params })).id;
  }
  const { permalink_url } = await graph<{ permalink_url?: string }>(token, id, { params: { fields: "permalink_url" } }).catch(() => ({ permalink_url: undefined }));
  return { id, permalink: permalink_url ?? null };
}

// Instagram needs at least one image; several become a carousel
export async function postInstagram(acct: MetaAccount, text: string, imageUrls: string[]): Promise<{ id: string; permalink: string | null }> {
  if (!acct.igId) throw new Error("No Instagram account is linked to this Page.");
  if (!imageUrls.length) throw new Error("Instagram needs at least one image.");
  if (imageUrls.length > 10) throw new Error("Instagram allows up to 10 images.");
  const { mediaId, permalink } = await publishImages(acct.igId, imageUrls, text.slice(0, 2200));
  return { id: mediaId, permalink };
}

export async function recordHubPost(entry: {
  account: string; platform: Exclude<Platform, "threads">; id: string; permalink: string | null; text: string; imageUrls: string[];
  candidateId: string | null; actor: { uid: string; name: string };
}) {
  await adminDb().collection(HUB_POSTS).doc(`${entry.platform}_${entry.id}`).set({
    account: entry.account, platform: entry.platform, mediaId: entry.id, permalink: entry.permalink, text: entry.text, imageUrls: entry.imageUrls,
    candidateId: entry.candidateId, byUid: entry.actor.uid, byName: entry.actor.name, createdAt: FieldValue.serverTimestamp(),
  });
}
