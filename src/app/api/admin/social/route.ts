import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { requireSocial } from "@/lib/social-access";
import {
  SOCIAL_POSTS, buildCard, defaultChoices, fieldsFor, findPage, formatsFor,
  type FieldChoices, type FieldMode, type FigureChoice, type PostFormat, type SocialPageKey,
} from "@/lib/social";
import { PostError, createPost, finishPost, mediaExists, metaToken, renderSlides } from "@/lib/social-server";
import { LeadError, addLead, cardSubject, editLead, listCardPeople } from "@/lib/social-leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODES: FieldMode[] = ["show", "custom", "hide"];
const FIGURES: FigureChoice[] = ["auto", "man", "man_peci", "man_peci_beard", "woman", "hijab"];

// Public posting: admins, and workers with "Manage social media"
const requireAdmin = (req: NextRequest) => requireSocial(req.headers.get("authorization"));

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
  format: ((x.format as PostFormat | undefined) ?? "carousel"),
  videoUrl: (x.videoUrl as string | null) ?? null,
  permalink: (x.permalink as string | null) ?? null,
  imageUrl: (x.imageUrl as string | null) ?? null,
  imageUrls: (x.imageUrls as string[] | undefined) ?? (x.imageUrl ? [x.imageUrl as string] : []),
  error: (x.error as string | null) ?? null,
  changes: (x.changes as string[] | undefined) ?? [],
  caption: (x.caption as string) ?? "",
  byName: (x.byName as string) ?? "",
  at: iso(x.publishedAt) ?? iso(x.updatedAt),
});

/* GET /api/admin/social?candidateId=…  — this client's (or lead's, "lead:…") posts (profile panel, CRM)
   GET /api/admin/social?page=…         — that page's posts plus every client and Call Desk lead to choose from (Subpages) */
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
      // A Reel Instagram was still processing gets published as soon as it's ready
      if (d.data().status === "publishing" && d.data().containerId) await finishPost(d.ref).catch(() => null);
      const x = (await d.ref.get()).data()!;
      if (x.status === "published" && x.mediaId && (await mediaExists(x.mediaId)) === false) {
        await d.ref.update({ status: "deleted", deletedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
        return toPost({ ...x, status: "deleted" });
      }
      return toPost(x);
    }));
    return NextResponse.json({ connected: Boolean(metaToken()), posts });
  }
  if (page && findPage(page)) {
    const [postSnap, profiles] = await Promise.all([
      db.collection(SOCIAL_POSTS).where("page", "==", page).get(),
      listCardPeople(),
    ]);
    return NextResponse.json({ connected: Boolean(metaToken()), posts: postSnap.docs.map((d) => toPost(d.data())), profiles });
  }
  return NextResponse.json({ error: "Missing candidateId or page" }, { status: 400 });
}

/* POST /api/admin/social — { action: "preview" | "post" | "finish", candidateId, page, choices, figure, format, caption, consent, slide }
   "finish" publishes a Reel that Instagram was still processing when "post" returned { pending: true }
   { action: "add_lead", page, lead }          — a new lead from that subpage; it lands in the Call Desk tagged with the page
   { action: "edit_lead", candidateId, lead }  — corrects a lead's name, city and card facts */
export async function POST(req: NextRequest) {
  const actor = await requireAdmin(req);
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const candidateId = typeof body.candidateId === "string" ? body.candidateId : "";
  const page = findPage(typeof body.page === "string" ? body.page : "");

  if (body.action === "add_lead" || body.action === "edit_lead") {
    const lead = (body.lead && typeof body.lead === "object" ? body.lead : {}) as Record<string, unknown>;
    try {
      if (body.action === "edit_lead") {
        await editLead(candidateId, lead, actor);
        return NextResponse.json({ success: true, id: candidateId });
      }
      if (!page) return NextResponse.json({ error: "Missing page." }, { status: 400 });
      return NextResponse.json({ success: true, id: await addLead(page.key, lead, actor) });
    } catch (err) {
      if (err instanceof LeadError) return NextResponse.json({ error: err.message }, { status: err.status });
      console.error("Subpages lead error", err);
      return NextResponse.json({ error: "Could not save the lead." }, { status: 500 });
    }
  }

  if (!candidateId || !page) return NextResponse.json({ error: "Missing client or page." }, { status: 400 });
  const choices = cleanChoices(page.key, body.choices);
  const figure = FIGURES.includes(body.figure as FigureChoice) ? (body.figure as FigureChoice) : "auto";
  const format: PostFormat = formatsFor(page.key).includes(body.format as PostFormat) ? (body.format as PostFormat) : "carousel";

  if (body.action === "finish") {
    const result = await finishPost(adminDb().collection(SOCIAL_POSTS).doc(`${candidateId}_${page.key}`));
    return NextResponse.json(result);
  }

  if (body.action === "preview") {
    const subject = await cardSubject(candidateId);
    if (!subject) return NextResponse.json({ error: "Client not found." }, { status: 404 });
    const slides = await renderSlides(buildCard(page.key, candidateId, subject.profile, choices, figure), format);
    const slide = slides[Math.min(Math.max(Number(body.slide) || 0, 0), slides.length - 1)];
    return new NextResponse(slide, { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
  }

  if (body.action !== "post") return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "Confirm that the client agreed to this post." }, { status: 400 });
  try {
    const { permalink, pending } = await createPost({
      candidateId, pageKey: page.key, choices, figure, format, caption: typeof body.caption === "string" ? body.caption : "", actor,
    });
    return NextResponse.json({ success: true, permalink, pending: Boolean(pending) });
  } catch (err) {
    const status = err instanceof PostError ? err.status : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : "Posting failed." }, { status });
  }
}
