import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import cloudinary from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebase-admin";
import { authenticateTeam } from "@/lib/team-access";
import { SOCIAL_POSTS } from "@/lib/social";
import { errorText } from "@/lib/social-server";
import {
  THREADS_POSTS, accountStatuses, authorizeUrl, disconnectAccount, findThreadsAccount, inbox, markDone,
  postThread, replyTo, setHidden, threadsConfigured, type ThreadsAccountKey,
} from "@/lib/threads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Speaking publicly for Jodohmu is admin-only, as with Instagram
async function requireAdmin(req: NextRequest) {
  const actor = await authenticateTeam(req.headers.get("authorization"));
  return actor?.role === "admin" ? actor : null;
}

const iso = (t: unknown) => (t instanceof Timestamp ? t.toDate().toISOString() : null);

/* GET /api/admin/threads                 — every account and whether it is connected
   GET /api/admin/threads?account=…       — that account's recent posts, the replies to them, and its client cards on Instagram */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const accounts = await accountStatuses();
  const key = req.nextUrl.searchParams.get("account");
  const account = key ? findThreadsAccount(key) : null;
  if (!account) return NextResponse.json({ configured: threadsConfigured(), accounts });

  const status = accounts.find((a) => a.key === account.key)!;
  const db = adminDb();
  // Client cards already live on the Instagram page of the same name can be shared to Threads as they are
  const [cardSnap, sharedSnap] = await Promise.all([
    db.collection(SOCIAL_POSTS).where("page", "==", account.key).where("status", "==", "published").get(),
    db.collection(THREADS_POSTS).where("account", "==", account.key).get(),
  ]);
  const shared = new Set(sharedSnap.docs.map((d) => d.data().candidateId as string | null).filter(Boolean));
  const cards = cardSnap.docs.map((d) => {
    const x = d.data();
    return {
      candidateId: x.candidateId as string, code: (x.code as string) ?? "", candidateName: (x.candidateName as string) ?? "",
      caption: (x.caption as string) ?? "", imageUrls: ((x.imageUrls as string[] | undefined) ?? []).filter(Boolean),
      at: iso(x.publishedAt), sharedToThreads: shared.has(x.candidateId as string),
    };
  }).filter((c) => c.imageUrls.length).sort((a, b) => (b.at ?? "").localeCompare(a.at ?? ""));

  if (!status.connected) return NextResponse.json({ configured: threadsConfigured(), accounts, cards, posts: [], items: [] });
  try {
    const data = await inbox(account.key);
    return NextResponse.json({ configured: threadsConfigured(), accounts, cards, ...data });
  } catch (err) {
    return NextResponse.json({ configured: threadsConfigured(), accounts, cards, posts: [], items: [], error: errorText(err) });
  }
}

/* POST /api/admin/threads — { action, account, … }
   connect → { url } to send the browser to; disconnect; upload { dataUrl } → { url };
   post { text, imageUrls, candidateId? }; reply { replyToId, text }; hide { replyId, hide }; done { replyId, done } */
export async function POST(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const account = findThreadsAccount(typeof body.account === "string" ? body.account : "");
  if (!account) return NextResponse.json({ error: "Unknown account." }, { status: 400 });
  const key = account.key as ThreadsAccountKey;
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  try {
    switch (body.action) {
      case "connect":
        if (!threadsConfigured()) return NextResponse.json({ error: "Add THREADS_APP_ID and THREADS_APP_SECRET first." }, { status: 400 });
        return NextResponse.json({ url: authorizeUrl(key, actor.uid) });
      case "disconnect":
        await disconnectAccount(key);
        return NextResponse.json({ success: true });
      case "upload": {
        // Threads fetches images from a public URL, so an image from the computer goes to Cloudinary first
        const dataUrl = str(body.dataUrl);
        if (!/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl)) return NextResponse.json({ error: "Only JPEG, PNG or WebP images." }, { status: 400 });
        const res = await cloudinary.uploader.upload(dataUrl, { folder: "threads-posts", format: "jpg" });
        return NextResponse.json({ url: res.secure_url });
      }
      case "post": {
        const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls.filter((u): u is string => typeof u === "string" && u.startsWith("https://")) : [];
        const candidateId = str(body.candidateId) || null;
        if (candidateId) {
          const dup = await adminDb().collection(THREADS_POSTS).where("account", "==", key).where("candidateId", "==", candidateId).limit(1).get();
          if (!dup.empty) return NextResponse.json({ error: `This client is already on @${account.handle}'s Threads.` }, { status: 409 });
        }
        const result = await postThread({ key, text: str(body.text), imageUrls, candidateId, actor });
        return NextResponse.json({ success: true, ...result });
      }
      case "reply": {
        const result = await replyTo(key, str(body.replyToId), str(body.text), actor);
        return NextResponse.json({ success: true, ...result });
      }
      case "hide":
        await setHidden(key, str(body.replyId), body.hide === true);
        return NextResponse.json({ success: true });
      case "done":
        await markDone(key, str(body.replyId), body.done === true, actor);
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: errorText(err) || "Threads request failed." }, { status: 502 });
  }
}
