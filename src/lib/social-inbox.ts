import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

/* What the team has done with comments and replies on our social accounts, shared by
   Threads, Instagram and Facebook: who answered, and which ones were marked "no reply needed". */

export const SOCIAL_INBOX = "social_inbox";
// A comment nobody has answered for this long is flagged as a follow-up
export const FOLLOW_UP_MS = 6 * 60 * 60 * 1000;

export type Platform = "threads" | "instagram" | "facebook";
export const PLATFORMS: Platform[] = ["threads", "instagram", "facebook"];

// One row of the combined inbox, whatever platform it came from
export type InboxItem = {
  platform: Platform; id: string; postId: string; text: string; username: string; timestamp: string; permalink: string | null;
  hidden: boolean; answered: boolean; ourAnswer: string | null; answeredByName: string | null;
  done: boolean; doneByName: string | null; followUp: boolean;
  // When this answers one of our replies, what we had said
  inReplyToOurs: string | null;
};
export type InboxPost = {
  platform: Platform; id: string; text: string; permalink: string | null; timestamp: string; imageUrl: string | null; replyCount: number; open: number;
};

type Mark = { byUid?: string; byName?: string; repliedByName?: string };
const docId = (platform: Platform, id: string) => `${platform}_${id}`;

export async function inboxMarks(platform: Platform, account: string): Promise<Map<string, Mark>> {
  const snap = await adminDb().collection(SOCIAL_INBOX).where("account", "==", account).where("platform", "==", platform).get();
  return new Map(snap.docs.map((d) => [d.data().id as string, d.data() as Mark]));
}

// Builds an inbox row from what the platform says plus what the team recorded
export function toItem(platform: Platform, raw: {
  id: string; postId: string; text: string; username: string; timestamp: string; permalink: string | null; hidden: boolean;
  answer: string | null; inReplyToOurs: string | null;
}, mark: Mark | undefined): InboxItem {
  const done = Boolean(mark?.byUid);
  const answered = raw.answer !== null;
  const settled = answered || done || raw.hidden;
  return {
    platform, id: raw.id, postId: raw.postId, text: raw.text, username: raw.username, timestamp: raw.timestamp, permalink: raw.permalink,
    hidden: raw.hidden, answered, ourAnswer: raw.answer, answeredByName: answered ? (mark?.repliedByName ?? null) : null,
    done, doneByName: done ? (mark?.byName ?? null) : null,
    followUp: !settled && Date.now() - new Date(raw.timestamp).getTime() > FOLLOW_UP_MS,
    inReplyToOurs: raw.inReplyToOurs,
  };
}

export const isOpen = (i: InboxItem) => !i.answered && !i.done && !i.hidden;

export async function markReplied(platform: Platform, account: string, id: string, actor: { uid: string; name: string }) {
  await adminDb().collection(SOCIAL_INBOX).doc(docId(platform, id)).set(
    { platform, account, id, repliedByUid: actor.uid, repliedByName: actor.name, repliedAt: FieldValue.serverTimestamp() }, { merge: true },
  );
}

// "No reply needed" for comments like a thank-you or an emoji, so they leave the follow-up list
export async function markDone(platform: Platform, account: string, id: string, done: boolean, actor: { uid: string; name: string }) {
  await adminDb().collection(SOCIAL_INBOX).doc(docId(platform, id)).set(done
    ? { platform, account, id, byUid: actor.uid, byName: actor.name, at: Timestamp.now() }
    : { platform, account, id, byUid: FieldValue.delete(), byName: FieldValue.delete(), at: FieldValue.delete() }, { merge: true });
}
