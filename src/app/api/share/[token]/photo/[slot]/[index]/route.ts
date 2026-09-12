import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  SHARES_COLLECTION,
  SHARE_VIEWERS_SUBCOLLECTION,
  buildWatermarkedUrl,
  evaluateShare,
  parseCloudinaryUrl,
  readShare,
  sessionCookieName,
  shareCode,
  verifySession,
} from "@/lib/shares";

export const dynamic = "force-dynamic";

/**
 * Photo proxy. A photo is delivered only to a browser inside a live viewing
 * session whose audience tier may see photos, only for photos selected on the
 * link, and only after a watermark naming the recipient is burned in. The
 * Cloudinary URL is signed server-side and never reaches the client.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string; slot: string; index: string }> },
) {
  const { token, slot, index } = await params;
  const now = Date.now();
  const slotNum = Number.parseInt(slot, 10);
  const photoIndex = Number.parseInt(index, 10);
  if (!Number.isInteger(slotNum) || slotNum < 0 || !Number.isInteger(photoIndex) || photoIndex < 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const claims = verifySession(token, req.cookies.get(sessionCookieName(token))?.value, now);
    if (!claims) return new NextResponse("Forbidden", { status: 403 });

    const ref = adminDb().collection(SHARES_COLLECTION).doc(token);
    const snap = await ref.get();
    if (!snap.exists) return new NextResponse("Not found", { status: 404 });
    const share = readShare(snap.data()!);

    if (evaluateShare(share, now, true) !== "active") return new NextResponse("Gone", { status: 410 });
    if (!share.audiences[claims.tier].showPhotos) return new NextResponse("Forbidden", { status: 403 });

    const candidateId = share.candidateIds[slotNum];
    if (!candidateId) return new NextResponse("Not found", { status: 404 });
    const selection = share.photoSelection[candidateId] ?? null;
    if (selection !== null && !selection.includes(photoIndex)) return new NextResponse("Forbidden", { status: 403 });

    const [candidateSnap, viewerSnap] = await Promise.all([
      adminDb().collection("candidate_intake").doc(candidateId).get(),
      ref.collection(SHARE_VIEWERS_SUBCOLLECTION).doc(claims.vk).get(),
    ]);
    const photos = candidateSnap.data()?.photoUrls;
    if (!Array.isArray(photos) || typeof photos[photoIndex] !== "string") {
      return new NextResponse("Not found", { status: 404 });
    }

    const cloudRef = parseCloudinaryUrl(photos[photoIndex] as string);
    if (!cloudRef) return new NextResponse("Not found", { status: 404 });

    const stamp = new Date(now).toISOString().slice(0, 10);
    const who = (viewerSnap.data()?.email as string | null) || share.recipientLabel || "—";
    const label = `Jodohmu · ${who} · ${shareCode(token)} · ${stamp}`;
    const variant = req.nextUrl.searchParams.get("size") === "full" ? "full" : "card";
    const upstream = await fetch(
      buildWatermarkedUrl(cloudRef, { label, tile: `Jodohmu · ${shareCode(token)}`, variant }),
      { cache: "no-store" },
    );

    if (!upstream.ok || !upstream.body) {
      console.error("share photo upstream failed", upstream.status);
      return new NextResponse("Image unavailable", { status: 502 });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Robots-Tag": "noindex, nofollow, noimageindex",
        "Content-Disposition": "inline",
      },
    });
  } catch (err) {
    console.error("share photo error", err);
    return new NextResponse("Image unavailable", { status: 500 });
  }
}
