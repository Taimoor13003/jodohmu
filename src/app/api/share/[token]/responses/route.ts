import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { FINAL_CHOICE_NONE, checkProfileAnswers, type ProfileAnswers } from "@/lib/share-questions";
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

const bodySchema = z.object({
  /** keyed by profile slot */
  answers: z.record(z.string(), z.record(z.string(), z.string().max(4000))),
  finalChoice: z.string().max(10).nullable().optional(),
  finalNote: z.string().max(2000).optional(),
});

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
    if (accessGate(share.access, viewer)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const viewerSnap = await ref.collection(SHARE_VIEWERS_SUBCOLLECTION).doc(`u_${viewer.uid}`).get();
    if (!viewerSnap.exists) return NextResponse.json({ error: "Open the link before answering" }, { status: 403 });

    const tier = tierFor(viewer);
    const candidateSnaps = await adminDb().getAll(
      ...share.candidateIds.map(id => adminDb().collection("candidate_intake").doc(id)),
    );

    const answersByCandidate: Record<string, ProfileAnswers> = {};
    for (let slot = 0; slot < share.candidateIds.length; slot++) {
      const candidateId = share.candidateIds[slot];
      const { photosHidden } = projectProfile({
        slot,
        candidate: (candidateSnaps[slot]?.data() ?? {}) as Record<string, unknown>,
        audiences: share.audiences,
        tier,
        photoSelection: share.photoSelection[candidateId] ?? null,
        anonymousLabel: anonymousLabel(token, slot),
        photoSrc: () => "",
      });
      const check = checkProfileAnswers(share.questionnaire.questions, body.answers[String(slot)], photosHidden);
      if (!check.ok) {
        return NextResponse.json(
          { error: "Please complete every required question", slot, questionId: check.questionId, reason: check.reason },
          { status: 400 },
        );
      }
      answersByCandidate[candidateId] = check.value;
    }

    let finalChoice: string | null = null;
    if (share.candidateIds.length > 1) {
      const choice = body.finalChoice ?? "";
      if (choice === FINAL_CHOICE_NONE) {
        finalChoice = FINAL_CHOICE_NONE;
      } else if (/^\d$/.test(choice) && share.candidateIds[Number(choice)]) {
        finalChoice = share.candidateIds[Number(choice)];
      } else {
        return NextResponse.json({ error: "Choose a profile to proceed with, or none", reason: "final_choice" }, { status: 400 });
      }
    }

    const responseRef = ref.collection(SHARE_RESPONSES_SUBCOLLECTION).doc(viewer.uid);
    await adminDb().runTransaction(async tx => {
      const existing = await tx.get(responseRef);
      tx.set(responseRef, {
        uid: viewer.uid,
        email: viewer.email,
        name: viewer.name,
        answers: answersByCandidate,
        finalChoice,
        finalNote: (body.finalNote ?? "").trim(),
        updatedAt: FieldValue.serverTimestamp(),
        submittedAt: existing.exists ? existing.data()?.submittedAt ?? FieldValue.serverTimestamp() : FieldValue.serverTimestamp(),
      });
      if (!existing.exists) tx.update(ref, { responseCount: FieldValue.increment(1) });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("share response error", err);
    return NextResponse.json({ error: "Failed to save your answers" }, { status: 500 });
  }
}
