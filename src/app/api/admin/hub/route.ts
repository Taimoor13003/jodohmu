import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import cloudinary from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebase-admin";
import { requireSocial } from "@/lib/social-access";
import { SOCIAL_POSTS } from "@/lib/social";
import { errorText } from "@/lib/social-server";
import {
  THREADS_POSTS, accountStatuses, authorizeUrl, disconnectAccount, findThreadsAccount, inbox as threadsInbox,
  postThread, replyTo, setHidden, threadsConfigured, type ThreadsAccountKey,
} from "@/lib/threads";
import {
  HUB_POSTS, facebookInbox, instagramInbox, metaAccount, metaTokenInfo, metaHide, metaReply, postFacebook, postInstagram, recordHubPost, type MetaAccount,
} from "@/lib/meta-social";
import { PLATFORMS, markDone, type InboxItem, type InboxPost, type Platform } from "@/lib/social-inbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* One account's Threads, Instagram and Facebook in one place: posting to any of them,
   and every comment and reply in one inbox. For admins and workers with "Manage social media". */

const requireAdmin = (req: NextRequest) => requireSocial(req.headers.get("authorization"));

const iso = (t: unknown) => (t instanceof Timestamp ? t.toDate().toISOString() : null);
type PlatformState = { connected: boolean; label: string | null; error: string | null };

/* GET /api/admin/hub?account=…           — the account's platforms, recent posts, inbox, and client cards it can share
   GET /api/admin/hub?account=…&logins=1  — only when its logins stop working, for the banner on every Subpages view */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const account = findThreadsAccount(req.nextUrl.searchParams.get("account") ?? "");
  if (!account) return NextResponse.json({ error: "Unknown account." }, { status: 400 });
  const key = account.key;
  const db = adminDb();

  if (req.nextUrl.searchParams.get("logins")) {
    const [meta, statuses] = await Promise.all([
      metaTokenInfo().catch((err) => ({ present: true, valid: false, expiresAt: null, missing: [], error: errorText(err) })),
      accountStatuses(),
    ]);
    const threads = statuses.find((s) => s.key === key)!;
    return NextResponse.json({ meta, threads: { connected: threads.connected, expiresAt: threads.expiresAt }, threadsConfigured: threadsConfigured() });
  }

  const [statuses, meta, cardSnap, threadsShared, hubShared] = await Promise.all([
    accountStatuses(),
    metaAccount(account.handle).catch(() => null),
    db.collection(SOCIAL_POSTS).where("page", "==", key).where("status", "==", "published").get(),
    db.collection(THREADS_POSTS).where("account", "==", key).get(),
    db.collection(HUB_POSTS).where("account", "==", key).get(),
  ]);
  const threadsStatus = statuses.find((s) => s.key === key)!;

  const platforms: Record<Platform, PlatformState> = {
    threads: { connected: threadsStatus.connected, label: threadsStatus.username ? `@${threadsStatus.username}` : null, error: null },
    instagram: { connected: Boolean(meta?.igId), label: meta?.igUsername ? `@${meta.igUsername}` : null, error: null },
    facebook: { connected: Boolean(meta), label: meta?.pageName ?? null, error: null },
  };

  // Each platform loads on its own, so one failing (an expired login, a missing permission) doesn't hide the others
  const load = async (platform: Platform, run: () => Promise<{ posts: InboxPost[]; items: InboxItem[] }>) => {
    if (!platforms[platform].connected) return { posts: [], items: [] };
    try {
      return await run();
    } catch (err) {
      platforms[platform].error = errorText(err);
      return { posts: [], items: [] };
    }
  };
  const results = await Promise.all([
    load("threads", () => threadsInbox(key)),
    load("instagram", () => instagramInbox(key, meta!)),
    load("facebook", () => facebookInbox(key, meta!)),
  ]);
  const posts = results.flatMap((r) => r.posts).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const items = results.flatMap((r) => r.items).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Client cards already on this page's Instagram, and where else each one has been shared
  const sharedTo = new Map<string, Set<Platform>>();
  const share = (candidateId: unknown, platform: Platform) => {
    if (typeof candidateId !== "string" || !candidateId) return;
    if (!sharedTo.has(candidateId)) sharedTo.set(candidateId, new Set());
    sharedTo.get(candidateId)!.add(platform);
  };
  threadsShared.docs.forEach((d) => share(d.data().candidateId, "threads"));
  hubShared.docs.forEach((d) => share(d.data().candidateId, d.data().platform as Platform));
  const cards = cardSnap.docs.map((d) => {
    const x = d.data();
    share(x.candidateId, "instagram");
    return {
      candidateId: x.candidateId as string, code: (x.code as string) ?? "", candidateName: (x.candidateName as string) ?? "",
      caption: (x.caption as string) ?? "", imageUrls: ((x.imageUrls as string[] | undefined) ?? []).filter(Boolean), at: iso(x.publishedAt),
    };
  }).filter((c) => c.imageUrls.length).sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""))
    .map((c) => ({ ...c, sharedTo: Array.from(sharedTo.get(c.candidateId) ?? []) }));

  return NextResponse.json({
    threadsConfigured: threadsConfigured(),
    accounts: statuses.map((s) => ({ key: s.key, threads: s.connected })),
    platforms, posts, items, cards,
  });
}

async function needMeta(handle: string): Promise<MetaAccount> {
  const acct = await metaAccount(handle);
  if (!acct) throw new Error(`The poster can't see @${handle}'s Facebook Page. Assign it to the system user in Meta Business Settings.`);
  return acct;
}

/* POST /api/admin/hub — { action, account, … }
   post { platforms, text, imageUrls, candidateId? } → a result per platform
   reply { platform, id, text }; hide { platform, id, hide }; done { platform, id, done }
   upload { dataUrl } → { url }; connect → { url } (Threads login); disconnect (Threads) */
export async function POST(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const account = findThreadsAccount(typeof body.account === "string" ? body.account : "");
  if (!account) return NextResponse.json({ error: "Unknown account." }, { status: 400 });
  const key = account.key as ThreadsAccountKey;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const platform = PLATFORMS.includes(body.platform as Platform) ? (body.platform as Platform) : null;

  try {
    switch (body.action) {
      case "connect":
        if (!threadsConfigured()) return NextResponse.json({ error: "Add THREADS_APP_ID and THREADS_APP_SECRET first." }, { status: 400 });
        return NextResponse.json({ url: authorizeUrl(key, actor.uid) });
      case "disconnect":
        await disconnectAccount(key);
        return NextResponse.json({ success: true });
      case "upload": {
        // The platforms fetch images from a public URL, so an image from the computer goes to Cloudinary first
        const dataUrl = str(body.dataUrl);
        if (!/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl)) return NextResponse.json({ error: "Only JPEG, PNG or WebP images." }, { status: 400 });
        const res = await cloudinary.uploader.upload(dataUrl, { folder: "social-hub", format: "jpg" });
        return NextResponse.json({ url: res.secure_url });
      }
      case "post": {
        const targets = (Array.isArray(body.platforms) ? body.platforms : []).filter((p): p is Platform => PLATFORMS.includes(p as Platform));
        if (!targets.length) return NextResponse.json({ error: "Choose where to post." }, { status: 400 });
        const text = str(body.text).trim();
        const imageUrls = (Array.isArray(body.imageUrls) ? body.imageUrls : []).filter((u): u is string => typeof u === "string" && u.startsWith("https://"));
        const candidateId = str(body.candidateId) || null;
        const meta = targets.some((p) => p !== "threads") ? await needMeta(account.handle) : null;

        // Each platform is tried even if another fails, and reported separately
        const results: Partial<Record<Platform, { ok: boolean; permalink?: string | null; error?: string }>> = {};
        await Promise.all(targets.map(async (p) => {
          try {
            let permalink: string | null;
            if (p === "threads") {
              permalink = (await postThread({ key, text, imageUrls, candidateId, actor })).permalink;
            } else {
              const posted = p === "facebook" ? await postFacebook(meta!, text, imageUrls) : await postInstagram(meta!, text, imageUrls);
              await recordHubPost({ account: key, platform: p, id: posted.id, permalink: posted.permalink, text, imageUrls, candidateId, actor });
              permalink = posted.permalink;
            }
            results[p] = { ok: true, permalink };
          } catch (err) {
            results[p] = { ok: false, error: errorText(err) };
          }
        }));
        return NextResponse.json({ results });
      }
      case "reply":
        if (!platform) return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
        if (platform === "threads") await replyTo(key, str(body.id), str(body.text), actor);
        else await metaReply(platform, key, await needMeta(account.handle), str(body.id), str(body.text), actor);
        return NextResponse.json({ success: true });
      case "hide":
        if (!platform) return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
        if (platform === "threads") await setHidden(key, str(body.id), body.hide === true);
        else await metaHide(platform, await needMeta(account.handle), str(body.id), body.hide === true);
        return NextResponse.json({ success: true });
      case "done":
        if (!platform) return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
        await markDone(platform, key, str(body.id), body.done === true, actor);
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: errorText(err) || "Request failed." }, { status: 502 });
  }
}
