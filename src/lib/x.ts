import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { SOCIAL_ACCOUNTS, findSocialAccount, type SocialAccountKey } from "@/lib/social-accounts";
import { X_TEXT_LIMIT, xLength } from "@/lib/x-text";

/* Posting to Jodohmu's X (Twitter) accounts from the Subpages screen, usually alongside Threads.
   Each account logs in once through "Connect X" (OAuth 2.0 with PKCE). X access tokens last two hours,
   so the refresh token is kept too, both encrypted on x_accounts/<key>, and swapped for fresh ones as needed.
   Only posting: reading replies on X is a paid API tier, so the inbox stays Threads/Instagram/Facebook. */

const API = "https://api.x.com/2";
const TIMEOUT_MS = 30_000;
export const X_ACCOUNTS_COLLECTION = "x_accounts";
export const X_POSTS = "x_posts";
export const X_MAX_IMAGES = 4;
const SCOPES = ["tweet.read", "tweet.write", "users.read", "media.write", "offline.access"];

const clientId = () => process.env.X_CLIENT_ID?.trim() || null;
const clientSecret = () => process.env.X_CLIENT_SECRET?.trim() || null;
export const xConfigured = () => Boolean(clientId() && clientSecret());
const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.jodohmu.com").replace(/\/$/, "");
// Must match the callback URL in the X app's settings exactly
export const xRedirectUri = () => process.env.X_REDIRECT_URI?.trim() || `${siteUrl()}/api/admin/x/callback`;

/* ── tokens at rest ── */

const cipherKey = () => createHash("sha256").update(`x-token:${clientSecret()}`).digest();
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

/* ── the login ("Connect X") ── */

const sign = (payload: string) => createHmac("sha256", clientSecret() ?? "").update(payload).digest("base64url");
// PKCE needs the same secret "verifier" at both ends of the login. It is derived from the signed state,
// so nothing has to be stored in between: only this server can work it out again.
const verifierFor = (payload: string) => createHmac("sha256", `x-pkce:${clientSecret()}`).update(payload).digest("base64url");

export function xAuthorizeUrl(key: SocialAccountKey, uid: string) {
  const payload = Buffer.from(JSON.stringify({ key, uid, at: Date.now(), n: randomBytes(6).toString("base64url") })).toString("base64url");
  const challenge = createHash("sha256").update(verifierFor(payload)).digest("base64url");
  const q = new URLSearchParams({
    response_type: "code", client_id: clientId() ?? "", redirect_uri: xRedirectUri(), scope: SCOPES.join(" "),
    state: `${payload}.${sign(payload)}`, code_challenge: challenge, code_challenge_method: "S256",
  });
  return `https://x.com/i/oauth2/authorize?${q.toString()}`;
}

export function readXState(state: string): { key: SocialAccountKey; uid: string; verifier: string } | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  if (expected.length !== Buffer.from(sig).length || !timingSafeEqual(expected, Buffer.from(sig))) return null;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { key: string; uid: string; at: number };
  if (Date.now() - data.at > 30 * 60 * 1000 || !findSocialAccount(data.key)) return null;
  return { key: data.key as SocialAccountKey, uid: data.uid, verifier: verifierFor(payload) };
}

type XError = { detail?: string; title?: string; error_description?: string; error?: string; errors?: { message?: string; detail?: string }[] };
async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS), ...init });
  const json = (await res.json().catch(() => ({}))) as T & XError;
  if (!res.ok) {
    const why = json.errors?.[0]?.detail || json.errors?.[0]?.message || json.detail || json.error_description || json.title || json.error || res.statusText;
    // 402/429 are X's paid-plan and rate limits; say so plainly
    if (res.status === 402) throw new Error(`X: the developer plan has no posting credit left (${why}).`);
    if (res.status === 429) throw new Error("X: posting limit reached for now. Try again later.");
    throw new Error(`X: ${why}`);
  }
  return json;
}

const basicAuth = () => `Basic ${Buffer.from(`${clientId()}:${clientSecret()}`).toString("base64")}`;
type TokenSet = { access_token: string; refresh_token?: string; expires_in: number };
const tokenRequest = (params: Record<string, string>) => call<TokenSet>(`${API}/oauth2/token`, {
  method: "POST",
  headers: { Authorization: basicAuth(), "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ client_id: clientId()!, ...params }),
});

export async function connectX(key: SocialAccountKey, code: string, verifier: string, actor: { uid: string; name: string }) {
  const account = findSocialAccount(key)!;
  const tokens = await tokenRequest({ grant_type: "authorization_code", code, redirect_uri: xRedirectUri(), code_verifier: verifier });
  if (!tokens.refresh_token) throw new Error("X did not give a refresh token. Check that the X app allows offline access.");
  const { data: me } = await call<{ data: { id: string; username: string } }>(`${API}/users/me`, { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  // Whoever is logged into X in that browser is who gets connected; refuse the wrong account
  if (me.username.toLowerCase() !== account.xHandle.toLowerCase()) {
    throw new Error(`You were logged into X as @${me.username}. Log into @${account.xHandle} on x.com first, then connect again.`);
  }
  await adminDb().collection(X_ACCOUNTS_COLLECTION).doc(key).set({
    userId: me.id, username: me.username, token: seal(tokens.access_token), refreshToken: seal(tokens.refresh_token),
    expiresAt: Date.now() + tokens.expires_in * 1000,
    connectedAt: FieldValue.serverTimestamp(), connectedByUid: actor.uid, connectedByName: actor.name,
  });
}

export async function disconnectX(key: SocialAccountKey) {
  await adminDb().collection(X_ACCOUNTS_COLLECTION).doc(key).delete();
}

export type XAccountStatus = { key: SocialAccountKey; connected: boolean; username: string | null; error: string | null };

export async function xStatuses(): Promise<XAccountStatus[]> {
  const snap = await adminDb().collection(X_ACCOUNTS_COLLECTION).get();
  const byKey = new Map(snap.docs.map((d) => [d.id, d.data()]));
  return SOCIAL_ACCOUNTS.map((a) => {
    const x = byKey.get(a.key);
    return { key: a.key, connected: Boolean(x && !x.broken), username: (x?.username as string) ?? null, error: (x?.broken as string) ?? null };
  });
}

// A working access token, renewed when it has under five minutes left. X replaces the refresh token
// every time it is used, so the new one is saved straight away; if renewing fails the login has to be redone.
async function session(key: SocialAccountKey): Promise<{ username: string; token: string }> {
  const ref = adminDb().collection(X_ACCOUNTS_COLLECTION).doc(key);
  const x = (await ref.get()).data();
  const handle = findSocialAccount(key)?.xHandle ?? key;
  if (!x || x.broken) throw new Error(`@${handle} is not connected to X. Click "Connect" next to X.`);
  if ((x.expiresAt as number) - Date.now() > 5 * 60 * 1000) return { username: x.username as string, token: unseal(x.token as string) };
  try {
    const fresh = await tokenRequest({ grant_type: "refresh_token", refresh_token: unseal(x.refreshToken as string) });
    await ref.update({
      token: seal(fresh.access_token), expiresAt: Date.now() + fresh.expires_in * 1000,
      ...(fresh.refresh_token ? { refreshToken: seal(fresh.refresh_token) } : {}),
    });
    return { username: x.username as string, token: fresh.access_token };
  } catch (err) {
    const why = err instanceof Error ? err.message : "renewing the login failed";
    await ref.update({ broken: why });
    throw new Error(`@${handle}'s X login stopped working (${why}). Click "Connect" next to X again.`);
  }
}

/* ── posting ── */

// X takes the image bytes rather than a link, so each one is fetched from Cloudinary and uploaded
async function uploadImage(token: string, url: string) {
  const img = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!img.ok) throw new Error(`Could not fetch an image for X (${img.status}).`);
  const type = img.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  const form = new FormData();
  form.append("media", new Blob([await img.arrayBuffer()], { type }), "image");
  form.append("media_category", "tweet_image");
  form.append("media_type", type);
  const { data } = await call<{ data: { id: string } }>(`${API}/media/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
  return data.id;
}

// Text with up to 4 images. Recorded on x_posts for the history.
export async function postX({ key, text, imageUrls, candidateId, actor }: {
  key: SocialAccountKey; text: string; imageUrls: string[]; candidateId?: string | null; actor: { uid: string; name: string };
}) {
  const body = text.trim();
  if (!body && !imageUrls.length) throw new Error("Write something or add an image.");
  if (xLength(body) > X_TEXT_LIMIT) throw new Error(`X allows ${X_TEXT_LIMIT} characters; this has ${xLength(body)}. Shorten the X version.`);
  const s = await session(key);
  const mediaIds = await Promise.all(imageUrls.slice(0, X_MAX_IMAGES).map((u) => uploadImage(s.token, u)));
  const { data } = await call<{ data: { id: string } }>(`${API}/tweets`, {
    method: "POST",
    headers: { Authorization: `Bearer ${s.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...(body ? { text: body } : {}), ...(mediaIds.length ? { media: { media_ids: mediaIds } } : {}) }),
  });
  const permalink = `https://x.com/${s.username}/status/${data.id}`;
  await adminDb().collection(X_POSTS).doc(data.id).set({
    account: key, id: data.id, permalink, text: body, imageUrls: imageUrls.slice(0, X_MAX_IMAGES),
    candidateId: candidateId ?? null, byUid: actor.uid, byName: actor.name, createdAt: FieldValue.serverTimestamp(),
  });
  return { id: data.id, permalink };
}
