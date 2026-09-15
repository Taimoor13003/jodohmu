import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { authenticateTeam, canManageCandidate, type TeamActor } from "@/lib/team-access";
import { normalizeAudiences } from "@/lib/share-sections";
import {
  SHARES_COLLECTION,
  SHARE_RESPONSES_SUBCOLLECTION,
  SHARE_VIEWERS_SUBCOLLECTION,
  SHARE_VIEWS_SUBCOLLECTION,
  readShare,
  serialiseShare,
  toIso,
  type ShareRecord,
} from "@/lib/shares";
import type { ShareDetail, ShareResponseRow, ShareViewEvent, ShareViewerRow } from "@/lib/share-types";
import { accessSchema, audiencesSchema, avatarSelectionSchema, photoSelectionSchema } from "@/lib/share-schemas";

const patchSchema = z.object({
  revoke: z.boolean().optional(),
  restore: z.boolean().optional(),
  recipientLabel: z.string().trim().min(1).max(120).optional(),
  recipientNote: z.string().trim().max(1000).optional(),
  /** Absolute new expiry in ms, or null to remove the expiry. */
  expiresAtMs: z.number().int().positive().nullable().optional(),
  maxOpens: z.number().int().positive().max(10_000).nullable().optional(),
  /** More total opens on top of what's already been used. */
  grantExtraOpens: z.number().int().positive().max(100).optional(),
  maxOpensPerViewer: z.number().int().positive().max(1000).nullable().optional(),
  /** Let one specific person open the link again without erasing their history. */
  grantViewerOpen: z.string().regex(/^[ua]_[A-Za-z0-9_-]{1,128}$/).optional(),
  access: accessSchema.optional(),
  audiences: audiencesSchema.optional(),
  photoSelection: photoSelectionSchema.optional(),
  avatarSelection: avatarSelectionSchema.optional(),
});

async function loadShare(shareId: string) {
  const ref = adminDb().collection(SHARES_COLLECTION).doc(shareId);
  const snap = await ref.get();
  return snap.exists ? { ref, share: readShare(snap.data()!) } : null;
}

/** Admins manage any link; workers manage links they created or whose profiles are all theirs. */
async function canManageShare(actor: TeamActor, share: ShareRecord): Promise<boolean> {
  if (actor.role === "admin") return true;
  if (actor.role !== "worker") return false;
  if (share.createdBy === actor.uid) return true;
  for (const id of share.candidateIds) {
    if (!(await canManageCandidate(actor, id))) return false;
  }
  return share.candidateIds.length > 0;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const actor = await authenticateTeam(req.headers.get("authorization"));
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const found = await loadShare(shareId);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await canManageShare(actor, found.share))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [viewersSnap, responsesSnap, viewsSnap] = await Promise.all([
      found.ref.collection(SHARE_VIEWERS_SUBCOLLECTION).orderBy("lastAt", "desc").limit(200).get(),
      found.ref.collection(SHARE_RESPONSES_SUBCOLLECTION).orderBy("updatedAt", "desc").limit(200).get(),
      found.ref.collection(SHARE_VIEWS_SUBCOLLECTION).orderBy("at", "desc").limit(300).get(),
    ]);

    const answeredUids = new Set(responsesSnap.docs.map(d => d.id));

    const viewers: ShareViewerRow[] = viewersSnap.docs.map(d => {
      const v = d.data();
      return {
        key: d.id,
        uid: v.uid ?? null,
        email: v.email ?? null,
        name: v.name ?? null,
        role: v.role ?? null,
        tier: v.tier ?? "public",
        opens: v.opens ?? 0,
        firstAt: toIso(v.firstAt),
        lastAt: toIso(v.lastAt),
        lastActiveAt: toIso(v.lastActiveAt),
        lastVisit: v.lastVisit ?? null,
        engagement: {
          seconds: v.engagement?.seconds ?? 0,
          stepSeconds: v.engagement?.stepSeconds ?? {},
          photoViews: v.engagement?.photoViews ?? 0,
        },
        answered: !!v.uid && answeredUids.has(v.uid),
      };
    });

    const views: ShareViewEvent[] = viewsSnap.docs.map(d => {
      const e = d.data();
      return {
        id: d.id,
        at: toIso(e.at),
        viewerKey: e.viewerKey ?? "",
        tier: e.tier ?? "public",
        countedAsOpen: !!e.countedAsOpen,
        capture: e.capture ?? null,
        visit: e.visit ?? null,
      };
    });

    const responses: ShareResponseRow[] = responsesSnap.docs.map(d => {
      const r = d.data();
      return {
        uid: d.id,
        email: r.email ?? "",
        name: r.name ?? "",
        answers: r.answers ?? {},
        decisions: r.decisions ?? {},
        finalNote: r.finalNote ?? "",
        submittedAt: toIso(r.submittedAt),
        updatedAt: toIso(r.updatedAt),
        completedAt: toIso(r.completedAt),
      };
    });

    const detail: ShareDetail = { share: serialiseShare(shareId, found.share), viewers, responses, views };
    return NextResponse.json(detail);
  } catch (err) {
    console.error("share detail error", err);
    return NextResponse.json({ error: "Failed to load link details" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const actor = await authenticateTeam(req.headers.get("authorization"));
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  const found = await loadShare(shareId);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { ref, share } = found;
  if (!(await canManageShare(actor, share))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = parsed.data;
  const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp(), updatedBy: actor.uid };

  if (body.revoke) {
    update.revokedAt = FieldValue.serverTimestamp();
    update.revokedBy = actor.uid;
  }
  if (body.restore) {
    update.revokedAt = null;
    update.revokedBy = null;
  }
  if (body.recipientLabel !== undefined) update.recipientLabel = body.recipientLabel;
  if (body.recipientNote !== undefined) update.recipientNote = body.recipientNote;
  if (body.expiresAtMs !== undefined) {
    update.expiresAt = body.expiresAtMs === null ? null : Timestamp.fromMillis(body.expiresAtMs);
  }
  if (body.maxOpens !== undefined) update.maxOpens = body.maxOpens;
  if (body.grantExtraOpens !== undefined) {
    // Unlimited stays unlimited; capped links are topped up from where the
    // recipient actually is, so "one more look" always works.
    update.maxOpens = share.maxOpens === null ? null : Math.max(share.maxOpens, share.opens) + body.grantExtraOpens;
  }
  if (body.maxOpensPerViewer !== undefined) update.maxOpensPerViewer = body.maxOpensPerViewer;
  if (body.access !== undefined) update.access = body.access;
  if (body.audiences !== undefined) update.audiences = normalizeAudiences(body.audiences);
  if (body.photoSelection !== undefined) {
    update.photoSelection = Object.fromEntries(
      share.candidateIds.map(id => [id, body.photoSelection![id] ?? null]),
    );
  }
  if (body.avatarSelection !== undefined) {
    update.avatarSelection = Object.fromEntries(
      share.candidateIds.map(id => [id, body.avatarSelection![id] ?? share.avatarSelection[id] ?? "man"]),
    );
  }

  try {
    if (body.grantViewerOpen) {
      const viewerRef = ref.collection(SHARE_VIEWERS_SUBCOLLECTION).doc(body.grantViewerOpen);
      const viewerSnap = await viewerRef.get();
      if (!viewerSnap.exists) return NextResponse.json({ error: "Viewer not found" }, { status: 404 });
      await viewerRef.update({ bonusOpens: FieldValue.increment(1) });
    }

    await ref.set(update, { merge: true });
    const after = await ref.get();
    return NextResponse.json({ success: true, share: serialiseShare(shareId, readShare(after.data() ?? {})) });
  } catch (err) {
    console.error("update share error", err);
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  }
}
