import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { isDay, jakartaDay } from "@/lib/calldesk";
import { requireMitra } from "@/lib/calldesk-server";
import { requireSocial } from "@/lib/social-access";
import { findSocialAccount } from "@/lib/social-accounts";
import { MITRA_PROSPECTS, nextWorkday, toOutreach, type MitraLogEntry, type OutreachItem } from "@/lib/mitra";

/* Planned first messages to Mitra prospects, one queue per account. Sending happens by hand in the Instagram app or
   email; this only lists what is due and records that it went out. Open to whoever manages our social accounts and
   whoever works the Mitra list. */

// The log lives on the prospect doc; same cap as the Mitra API
const MAX_LOG = 100;
// Working days to wait for a reply before following up
const REPLY_WAIT = 3;

async function caller(req: NextRequest) {
  return (await requireSocial(req.headers.get("authorization"))) ?? (await requireMitra(req));
}

const str = (value: unknown) => (typeof value === "string" ? value : "");

/* GET /api/admin/outreach — every prospect with a planned first message, oldest day first */
export async function GET(req: NextRequest) {
  if (!(await caller(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const snap = await adminDb().collection(MITRA_PROSPECTS).where("outreach.day", ">=", "2000-01-01").get();
    const items: OutreachItem[] = snap.docs.flatMap((doc) => {
      const d = doc.data();
      const outreach = toOutreach(d.outreach);
      if (!outreach) return [];
      return [{
        id: doc.id, name: str(d.name), organization: str(d.organization), city: str(d.city), instagram: str(d.instagram),
        email: str(d.email), phone: str(d.phone), reason: str(d.reason), notes: str(d.notes), stage: str(d.stage) || "prospect",
        followUpDate: d.followUpDate ?? null, outreach,
      }];
    });
    items.sort((a, b) => a.outreach.day.localeCompare(b.outreach.day) || a.organization.localeCompare(b.organization));
    return NextResponse.json({ today: jakartaDay(), items });
  } catch (err) {
    console.error("GET outreach error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* POST /api/admin/outreach — { action: "sent" | "undo" | "move", id, day? } */
export async function POST(req: NextRequest) {
  const actor = await caller(req);
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const ref = id && !id.includes("/") ? adminDb().collection(MITRA_PROSPECTS).doc(id) : null;
    const snap = ref ? await ref.get() : null;
    if (!ref || !snap?.exists) return NextResponse.json({ error: "Prospect not found." }, { status: 404 });
    const current = snap.data()!;
    const outreach = toOutreach(current.outreach);
    if (!outreach) return NextResponse.json({ error: "No message is planned for this prospect." }, { status: 400 });
    const log: MitraLogEntry[] = Array.isArray(current.log) ? current.log : [];
    const today = jakartaDay();

    // Sent from the app: write it to the Mitra history, mark them contacted, and plan the follow-up
    if (body.action === "sent") {
      if (outreach.sentAt) return NextResponse.json({ success: true });
      const now = new Date().toISOString();
      const handle = findSocialAccount(outreach.account)?.handle ?? outreach.account;
      const from = current.stage ?? "prospect";
      const entry: MitraLogEntry = {
        at: now, by: actor.name, channel: outreach.channel,
        note: outreach.channel === "email" ? `First email sent as @${handle}: "${outreach.subject}"` : `First DM sent from @${handle}`,
        stageFrom: from === "prospect" ? "prospect" : null, stageTo: from === "prospect" ? "contacted" : null,
      };
      await ref.update({
        outreach: { ...outreach, sentAt: now, sentBy: actor.name },
        stage: from === "prospect" ? "contacted" : from,
        lastContactedAt: now,
        followUpDate: nextWorkday(today, REPLY_WAIT),
        log: [entry, ...log].slice(0, MAX_LOG),
        updatedAt: FieldValue.serverTimestamp(), updatedBy: actor.name,
      });
      return NextResponse.json({ success: true });
    }

    // A wrong tap on "Sent": take back what "sent" did, as long as nothing else has happened since
    if (body.action === "undo") {
      if (!outreach.sentAt) return NextResponse.json({ success: true });
      const [latest, ...rest] = log;
      if (!latest || latest.at !== outreach.sentAt) {
        return NextResponse.json({ error: "Someone has logged more since then. Fix it from the Mitra page instead." }, { status: 409 });
      }
      await ref.update({
        outreach: { ...outreach, sentAt: null, sentBy: "" },
        stage: latest.stageTo === "contacted" ? latest.stageFrom ?? "prospect" : current.stage,
        followUpDate: outreach.day,
        log: rest,
        updatedAt: FieldValue.serverTimestamp(), updatedBy: actor.name,
      });
      return NextResponse.json({ success: true });
    }

    // Not today: move it to another working day
    if (body.action === "move") {
      if (outreach.sentAt) return NextResponse.json({ error: "Already sent." }, { status: 400 });
      let day = isDay(body.day) ? body.day : nextWorkday(today);
      if (new Date(`${day}T00:00:00Z`).getUTCDay() === 0) day = nextWorkday(day);
      await ref.update({
        outreach: { ...outreach, day }, followUpDate: day,
        updatedAt: FieldValue.serverTimestamp(), updatedBy: actor.name,
      });
      return NextResponse.json({ success: true, day });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("POST outreach error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
