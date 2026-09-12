import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { authenticateTeam } from "@/lib/team-access";
import { DEFAULT_SHARE_QUESTIONS, questionsSchema } from "@/lib/share-questions";
import { QUESTION_SETTINGS_REF, loadDefaultQuestions } from "@/lib/shares";

const putSchema = z.union([z.object({ questions: z.unknown() }), z.object({ reset: z.literal(true) })]);

function settingsRef() {
  return adminDb().collection(QUESTION_SETTINGS_REF.collection).doc(QUESTION_SETTINGS_REF.doc);
}

export async function GET(req: NextRequest) {
  const actor = await authenticateTeam(req.headers.get("authorization"));
  if (!actor || (actor.role !== "admin" && actor.role !== "worker")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const snap = await settingsRef().get();
  return NextResponse.json({
    questions: await loadDefaultQuestions(),
    builtIn: DEFAULT_SHARE_QUESTIONS,
    customized: snap.exists,
    updatedByName: snap.data()?.updatedByName ?? null,
  });
}

export async function PUT(req: NextRequest) {
  const actor = await authenticateTeam(req.headers.get("authorization"));
  if (!actor || actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = putSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  if ("reset" in parsed.data) {
    await settingsRef().delete();
    return NextResponse.json({ questions: DEFAULT_SHARE_QUESTIONS, customized: false });
  }

  const questions = questionsSchema.safeParse(parsed.data.questions);
  if (!questions.success) {
    return NextResponse.json({ error: questions.error.issues[0]?.message ?? "Invalid questions" }, { status: 400 });
  }

  await settingsRef().set({
    questions: questions.data,
    updatedBy: actor.uid,
    updatedByName: actor.name,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ questions: questions.data, customized: true });
}
