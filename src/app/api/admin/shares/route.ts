import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { authenticateTeam, canManageCandidate } from "@/lib/team-access";
import { questionsSchema } from "@/lib/share-questions";
import { candidateDisplayName, normalizeAudiences } from "@/lib/share-sections";
import { accessSchema, audiencesSchema, photoSelectionSchema } from "@/lib/share-schemas";
import {
  DEFAULT_SESSION_MINUTES,
  MAX_PROFILES_PER_SHARE,
  SHARES_COLLECTION,
  generateShareToken,
  readShare,
  serialiseShare,
} from "@/lib/shares";

const createSchema = z.object({
  candidateIds: z
    .array(z.string().min(1))
    .min(1)
    .max(MAX_PROFILES_PER_SHARE)
    .refine(ids => new Set(ids).size === ids.length, { message: "Duplicate profiles" }),
  purpose: z.enum(["matchmaking", "promotion"]),
  recipientLabel: z.string().trim().min(1).max(120),
  recipientNote: z.string().trim().max(1000).default(""),
  access: accessSchema,
  audiences: audiencesSchema,
  photoSelection: photoSelectionSchema.default({}),
  /** null = never expires */
  expiresInHours: z.number().int().positive().max(24 * 365).nullable(),
  /** null = unlimited */
  maxOpens: z.number().int().positive().max(10_000).nullable(),
  maxOpensPerViewer: z.number().int().positive().max(1000).nullable(),
  sessionMinutes: z.number().int().min(1).max(24 * 60).default(DEFAULT_SESSION_MINUTES),
  questionnaire: z.object({ enabled: z.boolean(), questions: z.array(z.unknown()).max(15) }),
});

function sortNewestFirst(docs: FirebaseFirestore.QueryDocumentSnapshot[]) {
  const ms = (d: FirebaseFirestore.QueryDocumentSnapshot) =>
    (d.data().createdAt as Timestamp | undefined)?.toMillis?.() ?? 0;
  return [...docs].sort((a, b) => ms(b) - ms(a));
}

export async function GET(req: NextRequest) {
  const actor = await authenticateTeam(req.headers.get("authorization"));
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin" && actor.role !== "worker") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const candidateId = req.nextUrl.searchParams.get("candidateId");

  try {
    const col = adminDb().collection(SHARES_COLLECTION);
    let docs: FirebaseFirestore.QueryDocumentSnapshot[];

    // Filtered queries are sorted in memory so they need no composite index.
    if (candidateId) {
      if (!(await canManageCandidate(actor, candidateId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      docs = sortNewestFirst((await col.where("candidateIds", "array-contains", candidateId).get()).docs);
    } else if (actor.role !== "admin") {
      docs = sortNewestFirst((await col.where("createdBy", "==", actor.uid).get()).docs);
    } else {
      docs = (await col.orderBy("createdAt", "desc").limit(300).get()).docs;
    }

    const now = Date.now();
    return NextResponse.json({ shares: docs.slice(0, 300).map(d => serialiseShare(d.id, readShare(d.data()), now)) });
  } catch (err) {
    console.error("list shares error", err);
    return NextResponse.json({ error: "Failed to list links" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const actor = await authenticateTeam(req.headers.get("authorization"));
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request", details: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const audiences = normalizeAudiences(input.audiences);
  if (audiences.candidate.fields.length === 0 && !audiences.candidate.showName && !audiences.candidate.showPhotos) {
    return NextResponse.json({ error: "Choose at least one thing to show" }, { status: 400 });
  }

  let questionnaire = { enabled: false, questions: [] as z.infer<typeof questionsSchema> };
  if (input.purpose === "matchmaking" && input.questionnaire.enabled) {
    const questions = questionsSchema.safeParse(input.questionnaire.questions);
    if (!questions.success) {
      return NextResponse.json({ error: questions.error.issues[0]?.message ?? "Invalid questions" }, { status: 400 });
    }
    questionnaire = { enabled: true, questions: questions.data };
  }

  for (const candidateId of input.candidateIds) {
    if (!(await canManageCandidate(actor, candidateId))) {
      return NextResponse.json({ error: "You can only share candidates assigned to you" }, { status: 403 });
    }
  }

  try {
    const snaps = await adminDb().getAll(
      ...input.candidateIds.map(id => adminDb().collection("candidate_intake").doc(id)),
    );
    if (snaps.some(s => !s.exists)) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const candidateNames = Object.fromEntries(
      snaps.map(s => [s.id, candidateDisplayName(s.data() as Record<string, unknown>) || "Kandidat"]),
    );
    const photoSelection = Object.fromEntries(
      input.candidateIds.map(id => [id, input.photoSelection[id] ?? null]),
    );

    const token = generateShareToken();
    await adminDb().collection(SHARES_COLLECTION).doc(token).set({
      candidateIds: input.candidateIds,
      candidateNames,
      purpose: input.purpose,
      recipientLabel: input.recipientLabel,
      recipientNote: input.recipientNote,
      access: input.access,
      audiences,
      photoSelection,
      expiresAt: input.expiresInHours ? Timestamp.fromMillis(Date.now() + input.expiresInHours * 3600_000) : null,
      maxOpens: input.maxOpens,
      maxOpensPerViewer: input.maxOpensPerViewer,
      opens: 0,
      sessionMinutes: input.sessionMinutes,
      questionnaire,
      viewerCount: 0,
      responseCount: 0,
      createdBy: actor.uid,
      createdByName: actor.name,
      createdAt: FieldValue.serverTimestamp(),
      revokedAt: null,
      revokedBy: null,
      firstOpenedAt: null,
      lastOpenedAt: null,
    });

    const created = await adminDb().collection(SHARES_COLLECTION).doc(token).get();
    return NextResponse.json({ share: serialiseShare(token, readShare(created.data() ?? {})) }, { status: 201 });
  } catch (err) {
    console.error("create share error", err);
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
