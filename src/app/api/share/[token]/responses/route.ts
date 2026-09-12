import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { defaultAvatarFor } from "@/lib/share-avatars";
import { checkProfileAnswers, swipeQuestionId } from "@/lib/share-questions";
import { projectProfile } from "@/lib/share-sections";
import {
  SHARES_COLLECTION,
  SHARE_RESPONSES_SUBCOLLECTION,
  SHARE_VIEWERS_SUBCOLLECTION,
  accessGate,
  anonymousLabel,
  evaluateShare,
  readShare,
  resolveViewer,
  tierFor,
} from "@/lib/shares";

export const dynamic = "force-dynamic";

/**
 * One swipe at a time: the recipient decides on a profile, answers that
 * profile's questions, and moves on. Progress is kept per viewer so a
 * half-finished deck resumes where it left off.
 */
const bodySchema = z.union([
  z.object({
    kind: z.literal("decision"),
    slot: z.number().int().min(0).max(4),
    decision: z.enum(["yes", "no"]),
    answers: z.record(z.string(), z.string().max(4000)),
  }),
  z.object({ kind: z.literal("note"), finalNote: z.string().max(2000) }),
]);

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const now = Date.now();

  const viewer = await resolveViewer(req.headers.get("authorization"));
  if (!viewer) return NextResponse.json({ error: "Sign in to answer" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const body = parsed.data;

  try {
    const ref = adminDb().collection(SHARES_COLLECTION).doc(token);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const share = readShare(snap.data()!);

    if (evaluateShare(share, now, true) !== "active") {
      return NextResponse.json({ error: "This link is no longer active" }, { status: 410 });
    }
    if (!share.questionnaire.enabled) {
      return NextResponse.json({ error: "This link has no questions" }, { status: 400 });
    }
    if (accessGate(share, viewer)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const viewerSnap = await ref.collection(SHARE_VIEWERS_SUBCOLLECTION).doc(`u_${viewer.uid}`).get();
    if (!viewerSnap.exists) return NextResponse.json({ error: "Open the link before answering" }, { status: 403 });

    const responseRef = ref.collection(SHARE_RESPONSES_SUBCOLLECTION).doc(viewer.uid);

    /* ── a closing note for the matchmaker ── */
    if (body.kind === "note") {
      await responseRef.set(
        { finalNote: body.finalNote.trim(), updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
      return NextResponse.json({ success: true });
    }

    /* ── a swipe plus that profile's answers ── */
    const candidateId = share.candidateIds[body.slot];
    if (!candidateId) return NextResponse.json({ error: "Unknown profile" }, { status: 400 });

    const candidateSnap = await adminDb().collection("candidate_intake").doc(candidateId).get();
    const candidate = (candidateSnap.data() ?? {}) as Record<string, unknown>;
    const { photosHidden } = projectProfile({
      slot: body.slot,
      candidate,
      audiences: share.audiences,
      tier: tierFor(viewer),
      avatar: share.avatarSelection[candidateId] ?? defaultAvatarFor(candidate),
      photoSelection: share.photoSelection[candidateId] ?? null,
      anonymousLabel: anonymousLabel(token, body.slot),
      photoSrc: () => "",
    });

    // The swipe itself answers the deck's yes/no question.
    const swipeId = swipeQuestionId(share.questionnaire.questions);
    const submitted = { ...body.answers, ...(swipeId ? { [swipeId]: body.decision } : {}) };
    const check = checkProfileAnswers(share.questionnaire.questions, submitted, photosHidden);
    if (!check.ok) {
      return NextResponse.json(
        { error: "Please complete every required question", questionId: check.questionId, reason: check.reason },
        { status: 400 },
      );
    }

    const decidedSlots = await adminDb().runTransaction(async tx => {
      const existing = await tx.get(responseRef);
      const decisions: Record<string, string> = { ...(existing.data()?.decisions ?? {}) };
      decisions[candidateId] = body.decision;
      const complete = share.candidateIds.every(id => decisions[id]);

      tx.set(
        responseRef,
        {
          uid: viewer.uid,
          email: viewer.email,
          name: viewer.name,
          answers: { [candidateId]: check.value },
          decisions: { [candidateId]: body.decision },
          updatedAt: FieldValue.serverTimestamp(),
          ...(existing.exists ? {} : { submittedAt: FieldValue.serverTimestamp(), finalNote: "" }),
          ...(complete && !existing.data()?.completedAt ? { completedAt: FieldValue.serverTimestamp() } : {}),
        },
        { merge: true },
      );
      if (!existing.exists) tx.update(ref, { responseCount: FieldValue.increment(1) });

      return share.candidateIds.map((id, i) => (decisions[id] ? i : -1)).filter(i => i >= 0);
    });

    return NextResponse.json({
      success: true,
      decidedSlots,
      completed: decidedSlots.length === share.candidateIds.length,
    });
  } catch (err) {
    console.error("share response error", err);
    return NextResponse.json({ error: "Failed to save your answer" }, { status: 500 });
  }
}
