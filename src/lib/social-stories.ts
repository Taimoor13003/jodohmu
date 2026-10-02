import { FieldValue, Timestamp } from "firebase-admin/firestore";
import cloudinary from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebase-admin";
import { SOCIAL_POSTS } from "@/lib/social";
import { errorText, metaToken } from "@/lib/social-server";
import { graph, type MetaAccount } from "@/lib/meta-social";

/* Instagram Stories from the admin, and the record of them. A story leaves Instagram after 24 hours,
   so each one is kept on social_stories with its picture or video, when it went up, who posted it and
   a note on what it was for. Stories put up in the Instagram app are picked up too, whenever the list
   is opened while they are still live. */

export const SOCIAL_STORIES = "social_stories";
const FOLDER = "social-stories";
// Anything that isn't story-shaped is set on a background of its own colours rather than cropped
const IMAGE_SHAPE = "b_auto,c_pad,h_1920,w_1080";
// Phone videos come in every size and codec; Instagram takes H.264 + AAC up to 1920 tall
const VIDEO_SHAPE = "ac_aac,c_limit,h_1920,q_auto,vc_h264,w_1080";
// A video Instagram never finishes is given up on after this long
const STALE_MS = 20 * 60 * 1000;

type Actor = { uid: string; name: string };
export type StoryKind = "image" | "video";
export type StoryMedia = { kind: StoryKind; url: string; thumbUrl: string | null };
export type StoryRow = {
  id: string; kind: StoryKind; mediaUrl: string | null; thumbUrl: string | null; note: string;
  // "app": put up in the Instagram app and found here while it was live
  source: "admin" | "app"; status: "published" | "publishing"; byName: string | null;
  postedAt: string | null; permalink: string | null;
  candidateId: string | null; candidateName: string | null; code: string | null;
};
export type StoryCard = { candidateId: string; code: string; candidateName: string; at: string | null; media: StoryMedia[] };

export class StoryError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

const cloud = () => process.env.CLOUDINARY_CLOUD_NAME ?? "";
const iso = (t: unknown) => (t instanceof Timestamp ? t.toDate().toISOString() : null);
// Only files on our own Cloudinary are ever sent to Instagram
const ours = (url: unknown): url is string => typeof url === "string" && url.startsWith(`https://res.cloudinary.com/${cloud()}/`);

// An upload's plain address gets the story shape; one that already carries its own design (a client card's Reel) is left alone
function shaped(kind: StoryKind, url: string) {
  const plain = new RegExp(`/${kind}/upload/(v\\d+/)`);
  if (!plain.test(url)) return url;
  return url.replace(plain, `/${kind}/upload/${kind === "video" ? VIDEO_SHAPE : IMAGE_SHAPE}/$1`).replace(/\.[a-z0-9]+$/i, kind === "video" ? ".mp4" : ".jpg");
}
const videoThumb = (url: string) => url.replace(/\/video\/upload\/(v\d+\/)/, "/video/upload/c_limit,h_640,so_0,w_360/$1").replace(/\.[a-z0-9]+$/i, ".jpg");

/* ── getting the media somewhere Instagram can fetch it ── */

// A photo from the computer, hosted story-shaped; the shaped version is made straight away so the preview is the story
export async function hostStoryImage(dataUrl: string): Promise<string> {
  const res = await cloudinary.uploader.upload(dataUrl, { folder: FOLDER, eager: [{ raw_transformation: IMAGE_SHAPE, format: "jpg" }] })
    .catch((err) => { throw new Error(`Image upload failed: ${errorText(err)}`); });
  return shaped("image", res.secure_url);
}

// Videos are too big to pass through our server, so the browser sends them to Cloudinary itself with this signed permission
export function videoUploadTicket() {
  const params = { eager: `${VIDEO_SHAPE}/mp4`, eager_async: "true", folder: FOLDER, timestamp: String(Math.round(Date.now() / 1000)) };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET ?? "");
  return {
    url: `https://api.cloudinary.com/v1_1/${cloud()}/video/upload`,
    fields: { ...params, api_key: process.env.CLOUDINARY_API_KEY ?? "", signature },
  };
}

// Cloudinary makes the story-shaped video in the background; wait for it so Instagram doesn't fetch a half-made file
async function waitForVideo(url: string, until: number) {
  while (Date.now() < until) {
    const res = await fetch(url, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(Math.max(until - Date.now(), 1000)) }).catch(() => null);
    if (res?.ok) return;
    if (res && res.status !== 423) throw new StoryError(`The video couldn't be prepared (${res.status} ${res.headers.get("x-cld-error") ?? ""}).`.trim(), 502);
    await new Promise((r) => setTimeout(r, 2500));
  }
  throw new StoryError("The video is still being prepared. Try again in a minute.", 503);
}

/* ── posting ── */

async function containerState(containerId: string): Promise<"ready" | "processing"> {
  const { status_code, status } = await graph<{ status_code?: string; status?: string }>(metaToken()!, containerId, { params: { fields: "status_code,status" } });
  if (status_code === "FINISHED") return "ready";
  if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`Instagram could not process the story (${status || status_code}).`);
  return "processing";
}

// Publishes a story's processed container, once: whoever claims it first (the post request or finishStory) publishes it
async function claimAndPublish(ref: FirebaseFirestore.DocumentReference): Promise<boolean> {
  const story = await adminDb().runTransaction(async (tx) => {
    const now = (await tx.get(ref)).data();
    if (now?.status !== "publishing" || now.publishClaimed || !now.containerId || !now.igUserId) return null;
    tx.update(ref, { publishClaimed: true });
    return now;
  });
  if (!story) return false;
  const token = metaToken()!;
  const published = await graph<{ id: string }>(token, `${story.igUserId}/media_publish`, { method: "POST", params: { creation_id: story.containerId } });
  await ref.update({ status: "published", mediaId: published.id, postedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  const { permalink } = await graph<{ permalink?: string }>(token, published.id, { params: { fields: "permalink" } }).catch(() => ({ permalink: undefined }));
  if (permalink) await ref.update({ permalink });
  return true;
}

/* Puts one picture or video up as a story and records it. A video Instagram is still processing when the
   deadline comes is left as "publishing" and finished later (finishStory). */
export async function postStory({ account, acct, media, note, candidateId, actor, deadline }: {
  account: string; acct: MetaAccount; media: StoryMedia; note: string; candidateId: string | null; actor: Actor; deadline: number;
}): Promise<{ id: string; status: "published" | "publishing" }> {
  if (!acct.igId) throw new StoryError("No Instagram account is linked to this Page.", 400);
  if (!ours(media.url)) throw new StoryError("Upload the picture or video first.", 400);
  const url = shaped(media.kind, media.url);
  if (media.kind === "video") await waitForVideo(url, Math.min(Date.now() + 25_000, deadline));

  // A story made from a client card carries the client's name and code on the record
  const card = candidateId ? (await adminDb().collection(SOCIAL_POSTS).doc(`${candidateId}_${account}`).get()).data() : undefined;
  const { id: containerId } = await graph<{ id: string }>(metaToken()!, `${acct.igId}/media`, {
    method: "POST", params: { media_type: "STORIES", [media.kind === "video" ? "video_url" : "image_url"]: url },
  });
  const ref = adminDb().collection(SOCIAL_STORIES).doc();
  await ref.set({
    account, platform: "instagram", source: "admin", kind: media.kind, mediaUrl: url,
    thumbUrl: media.kind === "image" ? url : ours(media.thumbUrl) ? media.thumbUrl : videoThumb(media.url),
    note: note.trim().slice(0, 300), candidateId: card ? candidateId : null, candidateName: (card?.candidateName as string) ?? null, code: (card?.code as string) ?? null,
    status: "publishing", containerId, igUserId: acct.igId, publishClaimed: false, mediaId: null, permalink: null, postedAt: null,
    byUid: actor.uid, byName: actor.name, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
  try {
    while (Date.now() < deadline) {
      if ((await containerState(containerId)) === "ready") {
        await claimAndPublish(ref);
        return { id: ref.id, status: "published" };
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    return { id: ref.id, status: "publishing" };
  } catch (err) {
    // Nothing went up, so nothing stays on the record
    await ref.delete().catch(() => null);
    throw new StoryError(errorText(err) || "Posting the story failed.", 502);
  }
}

// A story Instagram was still processing: publish it once it is ready, or drop it if Instagram gave up
export async function finishStory(ref: FirebaseFirestore.DocumentReference): Promise<{ status: "published" | "publishing" | "failed"; error?: string }> {
  const story = (await ref.get()).data();
  if (!story) return { status: "failed", error: "This story was not posted." };
  if (story.status !== "publishing" || !story.containerId) return { status: story.status };
  try {
    if ((await containerState(story.containerId)) === "processing") {
      const created = (story.createdAt as Timestamp | undefined)?.toMillis() ?? 0;
      if (Date.now() - created < STALE_MS) return { status: "publishing" };
      throw new Error("Instagram took too long to process the video.");
    }
    await claimAndPublish(ref);
    return { status: ((await ref.get()).data()?.status as "published" | "publishing") ?? "publishing" };
  } catch (err) {
    await ref.delete().catch(() => null);
    return { status: "failed", error: errorText(err) || "Posting the story failed." };
  }
}

/* ── the record ── */

type LiveStory = { id: string; media_type?: string; media_url?: string; thumbnail_url?: string; permalink?: string; timestamp: string };

// A story put up in the Instagram app: keep our own copy of it, because Instagram's disappears with the story
async function recordAppStory(account: string, story: LiveStory) {
  const video = story.media_type === "VIDEO";
  const save = (url: string | undefined, name: string, resource_type: "image" | "video") => (url
    ? cloudinary.uploader.upload(url, { folder: FOLDER, public_id: name, overwrite: true, resource_type }).then((r) => r.secure_url).catch(() => null)
    : Promise.resolve(null));
  const [media, thumb] = await Promise.all([
    save(story.media_url, `ig-${story.id}`, video ? "video" : "image"),
    video ? save(story.thumbnail_url, `ig-${story.id}-thumb`, "image") : Promise.resolve(null),
  ]);
  await adminDb().collection(SOCIAL_STORIES).doc(`ig_${story.id}`).set({
    account, platform: "instagram", source: "app", kind: video ? "video" : "image", mediaUrl: media ?? thumb, thumbUrl: thumb ?? (video && media ? videoThumb(media) : media),
    note: "", candidateId: null, candidateName: null, code: null, status: "published", mediaId: story.id, permalink: story.permalink ?? null,
    postedAt: Timestamp.fromDate(new Date(story.timestamp)), byUid: null, byName: null,
    createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
}

// Every story on record for an account, newest first, after catching up with Instagram
export async function listStories(account: string, acct: MetaAccount | null): Promise<StoryRow[]> {
  const col = adminDb().collection(SOCIAL_STORIES);
  const load = () => col.where("account", "==", account).get();
  let snap = await load();

  const pending = snap.docs.filter((d) => d.data().status === "publishing");
  await Promise.all(pending.map((d) => finishStory(d.ref).catch(() => null)));
  let changed = pending.length > 0;

  if (acct?.igId && metaToken()) {
    const live = await graph<{ data: LiveStory[] }>(metaToken()!, `${acct.igId}/stories`, {
      params: { fields: "id,media_type,media_url,thumbnail_url,permalink,timestamp", limit: "100" },
    }).then((r) => r.data).catch(() => [] as LiveStory[]);
    if (changed) snap = await load();
    const known = new Set(snap.docs.map((d) => d.data().mediaId as string | null));
    // One we are in the middle of publishing is ours, not the app's
    const fresh = snap.docs.some((d) => d.data().status === "publishing") ? [] : live.filter((s) => !known.has(s.id));
    await Promise.all(fresh.map((s) => recordAppStory(account, s).catch(() => null)));
    changed = changed || fresh.length > 0;
  }
  if (changed) snap = await load();

  // The same story recorded both ways (ours was mid-publish when the list was opened elsewhere): ours stays
  const mine = new Set(snap.docs.filter((d) => d.data().source === "admin").map((d) => d.data().mediaId as string | null));
  const docs = snap.docs.filter((d) => {
    const twin = d.data().source === "app" && mine.has(d.data().mediaId);
    if (twin) d.ref.delete().catch(() => null);
    return !twin;
  });

  return docs.map((d) => {
    const x = d.data();
    return {
      id: d.id, kind: (x.kind as StoryKind) ?? "image", mediaUrl: (x.mediaUrl as string | null) ?? null, thumbUrl: (x.thumbUrl as string | null) ?? null,
      note: (x.note as string) ?? "", source: x.source === "app" ? "app" as const : "admin" as const,
      status: x.status === "publishing" ? "publishing" as const : "published" as const, byName: (x.byName as string | null) ?? null,
      postedAt: iso(x.postedAt) ?? iso(x.createdAt), permalink: (x.permalink as string | null) ?? null,
      candidateId: (x.candidateId as string | null) ?? null, candidateName: (x.candidateName as string | null) ?? null, code: (x.code as string | null) ?? null,
    };
  }).sort((a, b) => (b.postedAt ?? "").localeCompare(a.postedAt ?? ""));
}

// Client cards already on this page's Instagram, ready to go up as a story: a Reel as its video, a carousel as its slides
export async function storyCards(account: string): Promise<StoryCard[]> {
  const snap = await adminDb().collection(SOCIAL_POSTS).where("page", "==", account).where("status", "==", "published").get();
  return snap.docs.map((d) => {
    const x = d.data();
    const images = ((x.imageUrls as string[] | undefined) ?? []).filter(ours);
    const media: StoryMedia[] = x.format === "reel" && ours(x.videoUrl)
      ? [{ kind: "video", url: x.videoUrl, thumbUrl: images[0] ?? null }]
      : images.map((url) => ({ kind: "image" as const, url: shaped("image", url), thumbUrl: null }));
    return { candidateId: x.candidateId as string, code: (x.code as string) ?? "", candidateName: (x.candidateName as string) ?? "", at: iso(x.publishedAt), media };
  }).filter((c) => c.media.length).sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));
}

// What the story was for, in the team's words; never shown on Instagram
export async function setStoryNote(account: string, id: string, note: string) {
  const ref = adminDb().collection(SOCIAL_STORIES).doc(id);
  if ((await ref.get()).data()?.account !== account) throw new StoryError("Story not found.", 404);
  await ref.update({ note: note.trim().slice(0, 300), updatedAt: FieldValue.serverTimestamp() });
}

export function cleanMedia(input: unknown): StoryMedia | null {
  const { kind, url, thumbUrl } = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  if (!ours(url) || (kind !== "image" && kind !== "video")) return null;
  return { kind, url, thumbUrl: ours(thumbUrl) ? thumbUrl : null };
}
