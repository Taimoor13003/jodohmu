import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import {
  SHARES_COLLECTION,
  SHARE_VIEWERS_SUBCOLLECTION,
  evaluateShare,
  readShare,
  sessionCookieName,
  verifySession,
} from "@/lib/shares";

export const dynamic = "force-dynamic";

/**
 * Engagement beacon from the recipient page: time spent per profile and
 * photos opened. Authorised by the link's viewing-session cookie, so it can
 * only ever add to the record of the viewer whose open was charged.
 */
const bodySchema = z.object({
  /** profile slot, or -1 for the decision step */
  slot: z.number().int().min(-1).max(4),
  /** visible seconds since the last beacon; capped so a stuck tab can't inflate totals */
  seconds: z.number().int().min(0).max(120).default(0),
  photo: z.boolean().default(false),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const now = Date.now();

  const claims = verifySession(token, req.cookies.get(sessionCookieName(token))?.value, now);
  if (!claims) return new NextResponse(null, { status: 204 });

  let parsed;
  try {
    parsed = bodySchema.safeParse(JSON.parse(await req.text()));
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const { slot, seconds, photo } = parsed.data;
  if (seconds === 0 && !photo) return new NextResponse(null, { status: 204 });

  try {
    const ref = adminDb().collection(SHARES_COLLECTION).doc(token);
    const snap = await ref.get();
    if (!snap.exists) return new NextResponse(null, { status: 204 });
    const share = readShare(snap.data()!);
    if (evaluateShare(share, now, true) !== "active" || slot >= share.candidateIds.length) {
      return new NextResponse(null, { status: 204 });
    }

    const key = slot === -1 ? "decision" : String(slot);
    await ref.collection(SHARE_VIEWERS_SUBCOLLECTION).doc(claims.vk).set(
      {
        lastActiveAt: FieldValue.serverTimestamp(),
        engagement: {
          seconds: FieldValue.increment(seconds),
          stepSeconds: { [key]: FieldValue.increment(seconds) },
          ...(photo ? { photoViews: FieldValue.increment(1) } : {}),
        },
      },
      { merge: true },
    );
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("share activity error", err);
    return new NextResponse(null, { status: 204 });
  }
}
