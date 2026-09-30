import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

/* Posting to and answering on Jodohmu's Threads accounts from the admin.
   Unlike Instagram (one system-user token), every Threads account logs in once through
   "Connect Threads"; its token is kept encrypted on threads_accounts/<key> and renewed here. */

const HOST = "https://graph.threads.net";
const API = `${HOST}/v1.0`;
const TIMEOUT_MS = 20_000;
export const THREADS_ACCOUNTS_COLLECTION = "threads_accounts";
export const THREADS_POSTS = "threads_posts";
export const THREADS_INBOX = "threads_inbox";
export const THREADS_TEXT_LIMIT = 500;
// A reply nobody has answered for this long is flagged as a follow-up
export const FOLLOW_UP_MS = 6 * 60 * 60 * 1000;
const SCOPES = ["threads_basic", "threads_content_publish", "threads_read_replies", "threads_manage_replies", "threads_manage_insights"];

export type ThreadsAccountKey = "nikahin_foreigner" | "nikah_lagiyuk" | "taaruf_sekarang" | "temu_chindo" | "kristenmatch" | "jodohmu";

// The same handles as the Instagram pages (a Threads profile is made from its Instagram account), plus the main account
export const THREADS_ACCOUNTS: { key: ThreadsAccountKey; handle: string; label: string; accent: string }[] = [
  { key: "nikahin_foreigner", handle: "nikahin_foreigner", label: "WNI & WNA", accent: "#761410" },
  { key: "nikah_lagiyuk", handle: "nikah_lagiyuk", label: "Janda / duda", accent: "#9B2242" },
  { key: "taaruf_sekarang", handle: "taaruf_sekarang", label: "Muslim", accent: "#3E5A4C" },
  { key: "temu_chindo", handle: "temu_chindo", label: "Chindo", accent: "#B4232C" },
  { key: "kristenmatch", handle: "kristenmatch.indo", label: "Kristen", accent: "#1D4E89" },
  { key: "jodohmu", handle: "jodohmu_official", label: "Jodohmu", accent: "#C4294A" },
];
export const findThreadsAccount = (key: string) => THREADS_ACCOUNTS.find((a) => a.key === key) ?? null;

const appId = () => process.env.THREADS_APP_ID?.trim() || null;
const appSecret = () => process.env.THREADS_APP_SECRET?.trim() || null;
export const threadsConfigured = () => Boolean(appId() && appSecret());
const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com").replace(/\/$/, "");
// Must match one of the redirect URLs in the Meta app exactly, so it is fixed rather than taken from the request
export const redirectUri = () => process.env.THREADS_REDIRECT_URI?.trim() || `${siteUrl()}/api/admin/threads/callback`;

/* ── tokens at rest ── */

const cipherKey = () => createHash("sha256").update(`threads-token:${appSecret()}`).digest();
function seal(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", cipherKey(), iv);
  const data = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}
function unseal(sealed: string) {
  const [iv, tag, data] = sealed.split(".").map((s) => Buffer.from(s, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", cipherKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

/* ── the login ("Connect Threads") ── */

const sign = (payload: string) => createHmac("sha256", appSecret() ?? "").update(payload).digest("base64url");

// state carries which account is being connected and by whom, signed so the callback can trust it
export function authorizeUrl(key: ThreadsAccountKey, uid: string) {
  const payload = Buffer.from(JSON.stringify({ key, uid, at: Date.now() })).toString("base64url");
  const q = new URLSearchParams({
    client_id: appId() ?? "", redirect_uri: redirectUri(), response_type: "code", scope: SCOPES.join(","), state: `${payload}.${sign(payload)}`,
  });
  return `https://threads.com/oauth/authorize?${q.toString()}`;
}

export function readState(state: string): { key: ThreadsAccountKey; uid: string } | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  if (expected.length !== Buffer.from(sig).length || !timingSafeEqual(expected, Buffer.from(sig))) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { key: string; uid: string; at: number };
  if (Date.now() - data.at > 30 * 60 * 1000 || !findThreadsAccount(data.key)) return null;
  return { key: data.key as ThreadsAccountKey, uid: data.uid };
}

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS), ...init });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; error_user_msg?: string } };
  if (!res.ok || json.error) throw new Error(`Threads: ${json.error?.error_user_msg || json.error?.message || res.statusText}`);
  return json;
}

// Code from the login → short-lived token → 60-day token, then saved against the account it was meant for
export async function connectAccount(key: ThreadsAccountKey, code: string, actor: { uid: string; name: string }) {
  const account = findThreadsAccount(key)!;
  const short = await call<{ access_token: string }>(`${HOST}/oauth/access_token`, {
    method: "POST",
    body: new URLSearchParams({ client_id: appId()!, client_secret: appSecret()!, code, grant_type: "authorization_code", redirect_uri: redirectUri() }),
  });
  const long = await call<{ access_token: string; expires_in: number }>(
    `${HOST}/access_token?${new URLSearchParams({ grant_type: "th_exchange_token", client_secret: appSecret()!, access_token: short.access_token })}`,
  );
  const me = await call<{ id: string; username: string }>(`${API}/me?fields=id,username&access_token=${encodeURIComponent(long.access_token)}`);
  // Whoever is logged into Threads in that browser is who gets connected; refuse the wrong account
  if (me.username.toLowerCase() !== account.handle.toLowerCase()) {
    throw new Error(`You were logged into Threads as @${me.username}. Log into @${account.handle} on threads.com first, then connect again.`);
  }
  await adminDb().collection(THREADS_ACCOUNTS_COLLECTION).doc(key).set({
    userId: me.id, username: me.username, token: seal(long.access_token),
    tokenIssuedAt: Date.now(), expiresAt: Date.now() + long.expires_in * 1000,
    connectedAt: FieldValue.serverTimestamp(), connectedByUid: actor.uid, connectedByName: actor.name,
  });
}

export async function disconnectAccount(key: ThreadsAccountKey) {
  await adminDb().collection(THREADS_ACCOUNTS_COLLECTION).doc(key).delete();
}

export type ThreadsAccountStatus = { key: ThreadsAccountKey; connected: boolean; username: string | null; expiresAt: number | null; connectedByName: string | null };

export async function accountStatuses(): Promise<ThreadsAccountStatus[]> {
  const snap = await adminDb().collection(THREADS_ACCOUNTS_COLLECTION).get();
  const byKey = new Map(snap.docs.map((d) => [d.id, d.data()]));
  return THREADS_ACCOUNTS.map((a) => {
    const x = byKey.get(a.key);
    const live = Boolean(x && (x.expiresAt as number) > Date.now());
    return { key: a.key, connected: live, username: (x?.username as string) ?? null, expiresAt: (x?.expiresAt as number) ?? null, connectedByName: (x?.connectedByName as string) ?? null };
  });
}

// The account's token, renewed once it is a week old so it never reaches its 60-day end while in use
async function session(key: ThreadsAccountKey): Promise<{ userId: string; username: string; token: string }> {
  const ref = adminDb().collection(THREADS_ACCOUNTS_COLLECTION).doc(key);
  const x = (await ref.get()).data();
  const handle = findThreadsAccount(key)?.handle ?? key;
  if (!x || (x.expiresAt as number) <= Date.now()) throw new Error(`@${handle} is not connected to Threads. Click "Connect Threads".`);
  let token = unseal(x.token as string);
  if (Date.now() - (x.tokenIssuedAt as number) > 7 * 24 * 60 * 60 * 1000) {
    try {
      const fresh = await call<{ access_token: string; expires_in: number }>(
        `${HOST}/refresh_access_token?grant_type=th_refresh_token&access_token=${encodeURIComponent(token)}`,
      );
      token = fresh.access_token;
      await ref.update({ token: seal(token), tokenIssuedAt: Date.now(), expiresAt: Date.now() + fresh.expires_in * 1000 });
    } catch { /* the current token still works until it expires; try again next time */ }
  }
  return { userId: x.userId as string, username: x.username as string, token };
}

async function api<T>(token: string, path: string, init?: { method?: "GET" | "POST"; params?: Record<string, string> }): Promise<T> {
  const params = new URLSearchParams({ ...(init?.params ?? {}), access_token: token });
  return init?.method === "POST"
    ? call<T>(`${API}/${path}`, { method: "POST", body: params })
    : call<T>(`${API}/${path}?${params.toString()}`);
}

/* ── posting ── */

// Threads fetches images first; a text post is usually ready at once
async function waitFinished(token: string, containerId: string) {
  for (let i = 0; i < 25; i++) {
    const { status, error_message } = await api<{ status?: string; error_message?: string }>(token, containerId, { params: { fields: "status,error_message" } });
    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") throw new Error(`Threads could not process the post (${error_message || status}).`);
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("Threads is taking too long to process the post. Try again in a minute.");
}

async function publishContainer(s: { userId: string; token: string }, params: Record<string, string>) {
  const { id } = await api<{ id: string }>(s.token, `${s.userId}/threads`, { method: "POST", params });
  await waitFinished(s.token, id);
  const published = await api<{ id: string }>(s.token, `${s.userId}/threads_publish`, { method: "POST", params: { creation_id: id } });
  const media = await api<{ permalink?: string }>(s.token, published.id, { params: { fields: "permalink" } }).catch(() => ({ permalink: undefined }));
  return { mediaId: published.id, permalink: media.permalink ?? null };
}

// Text alone, one image, or 2–20 images as a carousel. Recorded on threads_posts for the history list.
export async function postThread({ key, text, imageUrls, candidateId, actor }: {
  key: ThreadsAccountKey; text: string; imageUrls: string[]; candidateId?: string | null; actor: { uid: string; name: string };
}) {
  const body = text.trim();
  if (!body && !imageUrls.length) throw new Error("Write something or add an image.");
  if (body.length > THREADS_TEXT_LIMIT) throw new Error(`Threads allows ${THREADS_TEXT_LIMIT} characters; this has ${body.length}.`);
  if (imageUrls.length > 20) throw new Error("Threads allows up to 20 images.");
  const s = await session(key);
  const textParam: Record<string, string> = body ? { text: body } : {};

  let result: { mediaId: string; permalink: string | null };
  if (!imageUrls.length) {
    result = await publishContainer(s, { media_type: "TEXT", ...textParam });
  } else if (imageUrls.length === 1) {
    result = await publishContainer(s, { media_type: "IMAGE", image_url: imageUrls[0], ...textParam });
  } else {
    const children = await Promise.all(imageUrls.map(async (url) => {
      const { id } = await api<{ id: string }>(s.token, `${s.userId}/threads`, { method: "POST", params: { media_type: "IMAGE", image_url: url, is_carousel_item: "true" } });
      await waitFinished(s.token, id);
      return id;
    }));
    result = await publishContainer(s, { media_type: "CAROUSEL", children: children.join(","), ...textParam });
  }

  await adminDb().collection(THREADS_POSTS).doc(result.mediaId).set({
    account: key, mediaId: result.mediaId, permalink: result.permalink, text: body, imageUrls,
    candidateId: candidateId ?? null, byUid: actor.uid, byName: actor.name, createdAt: FieldValue.serverTimestamp(),
  });
  return result;
}

/* ── replies (the inbox) ── */

type RawPost = { id: string; text?: string; permalink?: string; timestamp: string; media_type?: string; media_url?: string };
type RawReply = {
  id: string; text?: string; username?: string; timestamp: string; permalink?: string;
  hide_status?: string; is_reply_owned_by_me?: boolean; replied_to?: { id: string };
};

export type InboxItem = {
  id: string; postId: string; text: string; username: string; timestamp: string; permalink: string | null;
  hidden: boolean; answered: boolean; ourAnswer: string | null; answeredByName: string | null; done: boolean; doneByName: string | null; followUp: boolean;
  // When this is a reply to one of our replies, what we had said
  inReplyToOurs: string | null;
};
export type InboxPost = { id: string; text: string; permalink: string | null; timestamp: string; mediaType: string; imageUrl: string | null; replyCount: number; open: number };

// Our recent posts and every reply under them, marked answered once we have replied to it
export async function inbox(key: ThreadsAccountKey): Promise<{ username: string; posts: InboxPost[]; items: InboxItem[] }> {
  const s = await session(key);
  const { data: posts } = await api<{ data: RawPost[] }>(s.token, "me/threads", {
    params: { fields: "id,text,permalink,timestamp,media_type,media_url", limit: "20" },
  });
  const conversations = await Promise.all(posts.map((p) =>
    api<{ data: RawReply[] }>(s.token, `${p.id}/conversation`, {
      params: { fields: "id,text,username,timestamp,permalink,hide_status,is_reply_owned_by_me,replied_to", reverse: "false", limit: "100" },
    }).then((r) => r.data).catch(() => [] as RawReply[])));

  const doneSnap = await adminDb().collection(THREADS_INBOX).where("account", "==", key).get();
  const done = new Map(doneSnap.docs.map((d) => [d.id, d.data()]));
  const isOurs = (r: RawReply) => r.is_reply_owned_by_me === true || r.username?.toLowerCase() === s.username.toLowerCase();

  const items: InboxItem[] = [];
  const summaries: InboxPost[] = posts.map((p, i) => {
    const replies = conversations[i];
    const ours = new Map(replies.filter(isOurs).map((r) => [r.id, r]));
    const answers = new Map<string, RawReply>();
    for (const r of Array.from(ours.values())) if (r.replied_to?.id && !answers.has(r.replied_to.id)) answers.set(r.replied_to.id, r);
    let open = 0;
    for (const r of replies) {
      if (isOurs(r)) continue;
      const answer = answers.get(r.id) ?? null;
      const mark = done.get(r.id);
      const isDone = Boolean(mark?.byUid);
      const hidden = r.hide_status === "HIDDEN";
      const settled = Boolean(answer) || isDone || hidden;
      if (!settled) open++;
      items.push({
        id: r.id, postId: p.id, text: r.text ?? "", username: r.username ?? "someone", timestamp: r.timestamp, permalink: r.permalink ?? null,
        hidden, answered: Boolean(answer), ourAnswer: answer?.text ?? null, answeredByName: answer ? ((mark?.repliedByName as string) ?? null) : null,
        done: isDone, doneByName: isDone ? ((mark?.byName as string) ?? null) : null,
        followUp: !settled && Date.now() - new Date(r.timestamp).getTime() > FOLLOW_UP_MS,
        inReplyToOurs: r.replied_to?.id ? (ours.get(r.replied_to.id)?.text ?? null) : null,
      });
    }
    return {
      id: p.id, text: p.text ?? "", permalink: p.permalink ?? null, timestamp: p.timestamp, mediaType: p.media_type ?? "TEXT",
      imageUrl: p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM" ? (p.media_url ?? null) : null,
      replyCount: replies.filter((r) => !isOurs(r)).length, open,
    };
  });
  items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return { username: s.username, posts: summaries, items };
}

export async function replyTo(key: ThreadsAccountKey, replyToId: string, text: string, actor: { uid: string; name: string }) {
  const body = text.trim();
  if (!body) throw new Error("Write a reply first.");
  if (body.length > THREADS_TEXT_LIMIT) throw new Error(`Threads allows ${THREADS_TEXT_LIMIT} characters; this has ${body.length}.`);
  const s = await session(key);
  const result = await publishContainer(s, { media_type: "TEXT", text: body, reply_to_id: replyToId });
  await adminDb().collection(THREADS_INBOX).doc(replyToId).set(
    { account: key, repliedByUid: actor.uid, repliedByName: actor.name, repliedAt: FieldValue.serverTimestamp() }, { merge: true },
  );
  return result;
}

export async function setHidden(key: ThreadsAccountKey, replyId: string, hide: boolean) {
  const s = await session(key);
  await api(s.token, `${replyId}/manage_reply`, { method: "POST", params: { hide: String(hide) } });
}

// "Done" for replies that need no answer (a thank-you, an emoji), so they leave the follow-up list
export async function markDone(key: ThreadsAccountKey, replyId: string, done: boolean, actor: { uid: string; name: string }) {
  const ref = adminDb().collection(THREADS_INBOX).doc(replyId);
  await ref.set(done
    ? { account: key, byUid: actor.uid, byName: actor.name, at: Timestamp.now() }
    : { account: key, byUid: FieldValue.delete(), byName: FieldValue.delete(), at: FieldValue.delete() }, { merge: true });
}

/* ── Meta's deauthorize / data-deletion callbacks ── */

export function readSignedRequest(signed: string): { user_id?: string } | null {
  const [sig, payload] = signed.split(".");
  if (!sig || !payload) return null;
  const expected = createHmac("sha256", appSecret() ?? "").update(payload).digest("base64url");
  if (expected !== sig) return null;
  return JSON.parse(Buffer.from(payload, "base64url").toString());
}

export async function forgetUser(userId: string) {
  const snap = await adminDb().collection(THREADS_ACCOUNTS_COLLECTION).where("userId", "==", userId).get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
}
