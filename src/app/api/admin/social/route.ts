import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { authenticateTeam } from "@/lib/team-access";
import {
  CARD_PROFILE_KEYS, SOCIAL_POSTS, buildCard, defaultChoices, fieldsFor, findPage,
  type FieldChoices, type FieldMode, type FigureChoice, type SocialPageKey,
} from "@/lib/social";
import { PostError, createPost, mediaExists, metaToken, renderSlides } from "@/lib/social-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODES: FieldMode[] = ["show", "custom", "hide"];
const FIGURES: FigureChoice[] = ["auto", "man", "woman", "hijab"];

// Public posting is admin-only
async function requireAdmin(req: NextRequest) {
  const actor = await authenticateTeam(req.headers.get("authorization"));
  return actor?.role === "admin" ? actor : null;
}

function cleanChoices(pageKey: SocialPageKey, input: unknown): FieldChoices {
  const out = defaultChoices(pageKey);
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, { mode?: unknown; custom?: unknown }>;
  for (const f of fieldsFor(pageKey)) {
    const c = raw[f.key];
    if (!c) continue;
    out[f.key] = {
      mode: MODES.includes(c.mode as FieldMode) ? (c.mode as FieldMode) : f.defaultMode,
      custom: typeof c.custom === "string" ? c.custom.slice(0, 140) : "",
    };
  }
  return out;
}

const iso = (t: unknown) => (t instanceof Timestamp ? t.toDate().toISOString() : null);
const toPost = (x: FirebaseFirestore.DocumentData) => ({
  candidateId: x.candidateId as string,
  candidateName: (x.candidateName as string) ?? "",
  page: x.page as string,
  handle: x.handle as string,
  code: (x.code as string) ?? "",
  status: x.status as "publishing" | "published" | "failed" | "deleted",
  permalink: (x.permalink as string | null) ?? null,
  imageUrl: (x.imageUrl as string | null) ?? null,
  imageUrls: (x.imageUrls as string[] | undefined) ?? (x.imageUrl ? [x.imageUrl as string] : []),
  error: (x.error as string | null) ?? null,
  changes: (x.changes as string[] | undefined) ?? [],
  caption: (x.caption as string) ?? "",
  byName: (x.byName as string) ?? "",
  at: iso(x.publishedAt) ?? iso(x.updatedAt),
});

/* GET /api/admin/social?candidateId=…  — this client's posts (profile panel, CRM)
   GET /api/admin/social?page=…         — that page's posts plus every profile to choose from (Subpages) */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = adminDb();
  const params = req.nextUrl.searchParams;
  const candidateId = params.get("candidateId");
  const page = params.get("page");

  if (candidateId) {
    const snap = await db.collection(SOCIAL_POSTS).where("candidateId", "==", candidateId).get();
    // A post deleted on Instagram is marked so, which frees the client to be posted there again
    const posts = await Promise.all(snap.docs.map(async (d) => {
      const x = d.data();
      if (x.status === "published" && x.mediaId && (await mediaExists(x.mediaId)) === false) {
        await d.ref.update({ status: "deleted", deletedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
        return toPost({ ...x, status: "deleted" });
      }
      return toPost(x);
    }));
    return NextResponse.json({ connected: Boolean(metaToken()), posts });
  }
  if (page && findPage(page)) {
    const [postSnap, candidateSnap] = await Promise.all([
      db.collection(SOCIAL_POSTS).where("page", "==", page).get(),
      db.collection("candidate_intake").get(),
    ]);
    const profiles = candidateSnap.docs.map((d) => {
      const x = d.data();
      const fields = Object.fromEntries(CARD_PROFILE_KEYS.filter((k) => x[k] !== undefined).map((k) => [k, x[k]]));
      return { id: d.id, personStatus: (x.personStatus as string) ?? null, isTest: x.isTestProfile === true, profile: fields };
    });
    return NextResponse.json({ connected: Boolean(metaToken()), posts: postSnap.docs.map((d) => toPost(d.data())), profiles });
  }
  return NextResponse.json({ error: "Missing candidateId or page" }, { status: 400 });
}

/* POST /api/admin/social — { action: "preview" | "post", candidateId, page, choices, figure, caption, consent, slide } */
export async function POST(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const candidateId = typeof body.candidateId === "string" ? body.candidateId : "";
  const page = findPage(typeof body.page === "string" ? body.page : "");
  if (!candidateId || !page) return NextResponse.json({ error: "Missing client or page." }, { status: 400 });
  const choices = cleanChoices(page.key, body.choices);
  const figure = FIGURES.includes(body.figure as FigureChoice) ? (body.figure as FigureChoice) : "auto";

  if (body.action === "preview") {
    const snap = await adminDb().collection("candidate_intake").doc(candidateId).get();
    if (!snap.exists) return NextResponse.json({ error: "Client not found." }, { status: 404 });
    const slides = await renderSlides(buildCard(page.key, candidateId, snap.data()!, choices, figure));
    const slide = slides[Math.min(Math.max(Number(body.slide) || 0, 0), slides.length - 1)];
    return new NextResponse(slide, { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
  }

  if (body.action !== "post") return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "Confirm that the client agreed to this post." }, { status: 400 });
  try {
    const { permalink } = await createPost({
      candidateId, pageKey: page.key, choices, figure, caption: typeof body.caption === "string" ? body.caption : "", actor,
    });
    return NextResponse.json({ success: true, permalink });
  } catch (err) {
    const status = err instanceof PostError ? err.status : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Posting failed." }, { status });
  }
}
