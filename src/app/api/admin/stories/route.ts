import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireSocial } from "@/lib/social-access";
import { findSocialAccount } from "@/lib/social-accounts";
import { metaAccount } from "@/lib/meta-social";
import { errorText } from "@/lib/social-server";
import {
  SOCIAL_STORIES, StoryError, cleanMedia, finishStory, hostStoryImage, listStories, postStory, setStoryNote, storyCards, videoUploadTicket,
} from "@/lib/social-stories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* Instagram Stories for one account: putting them up, and the dated record of every one.
   For admins and workers with "Manage social media". */

// GET /api/admin/stories?account=… — whether its Instagram can post, every story on record, and the client cards it can reuse
export async function GET(req: NextRequest) {
  if (!(await requireSocial(req.headers.get("authorization")))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const account = findSocialAccount(req.nextUrl.searchParams.get("account") ?? "");
  if (!account) return NextResponse.json({ error: "Unknown account." }, { status: 400 });
  const meta = await metaAccount(account.handle).catch(() => null);
  const [stories, cards] = await Promise.all([listStories(account.key, meta), storyCards(account.key)]);
  return NextResponse.json({ connected: Boolean(meta?.igId), stories, cards });
}

/* POST /api/admin/stories — { action, account, … }
   upload { dataUrl } → { url }: a picture, hosted story-shaped
   ticket → { url, fields }: lets the browser send a video straight to Cloudinary
   post { media, note, candidateId? } → { id, status }: one story; "publishing" means Instagram is still processing the video
   finish { id } → { status, error? }: publishes that video once Instagram is ready
   note { id, note }: what the story was for */
export async function POST(req: NextRequest) {
  const started = Date.now();
  const actor = await requireSocial(req.headers.get("authorization"));
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const account = findSocialAccount(typeof body.account === "string" ? body.account : "");
  if (!account) return NextResponse.json({ error: "Unknown account." }, { status: 400 });
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  try {
    switch (body.action) {
      case "upload": {
        const dataUrl = str(body.dataUrl);
        if (!/^data:image\/(jpeg|png|webp);base64,/.test(dataUrl)) return NextResponse.json({ error: "Only JPEG, PNG or WebP images." }, { status: 400 });
        return NextResponse.json({ url: await hostStoryImage(dataUrl) });
      }
      case "ticket":
        return NextResponse.json(videoUploadTicket());
      case "post": {
        const media = cleanMedia(body.media);
        if (!media) return NextResponse.json({ error: "Add a picture or video first." }, { status: 400 });
        const meta = await metaAccount(account.handle);
        if (!meta?.igId) return NextResponse.json({ error: `The poster can't see @${account.handle}'s Instagram. Assign it to the system user in Meta Business Settings.` }, { status: 400 });
        // Leave room inside the 60s request limit; a video still processing is finished by "finish"
        return NextResponse.json(await postStory({
          account: account.key, acct: meta, media, note: str(body.note), candidateId: str(body.candidateId) || null, actor, deadline: started + 45_000,
        }));
      }
      case "finish": {
        const ref = adminDb().collection(SOCIAL_STORIES).doc(str(body.id) || "-");
        if ((await ref.get()).data()?.account !== account.key) return NextResponse.json({ status: "failed", error: "This story was not posted." });
        return NextResponse.json(await finishStory(ref));
      }
      case "note":
        await setStoryNote(account.key, str(body.id) || "-", str(body.note));
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: errorText(err) || "Request failed." }, { status: err instanceof StoryError ? err.status : 502 });
  }
}
