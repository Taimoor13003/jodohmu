/* Daily Mitra outreach run: the scheduled Claude task uses this to read today's Instagram DMs and to record what
   happened to each one. It writes straight to Firestore with the service account in .env, the same fields the
   Subpages → Mitra outreach tab reads (see src/lib/mitra.ts and src/app/api/admin/outreach/route.ts).

     node scripts/outreach.mjs due                      today's DMs (at most 2 per account) and emails (at most 3), as JSON
     node scripts/outreach.mjs sent <id> [file]          it went out; file = the exact text sent, if changed
     node scripts/outreach.mjs issue <id> <kind> "<note>" [retryInDays]
        kind: follow_first (we followed, try again later) · not_found · no_fit · needs_person (a teammate takes it)
     node scripts/outreach.mjs undo <id> <kind> "<note>" [retryInDays]
        a message recorded as sent turned out not delivered (e.g. Instagram later says they don't accept requests):
        takes back the "sent" record and records the issue instead
     node scripts/outreach.mjs plan [days]               the coming days, for a quick look
*/
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const COLLECTION = "mitra_prospects";
const PER_ACCOUNT = 2;
// Emails all go out from info@jodohmu.com, so they share one small daily cap to keep the domain off spam lists
const EMAILS_PER_DAY = 3;
const EMAIL_FROM = "info@jodohmu.com";
const REPLY_WAIT = 3;
const MAX_LOG = 100;
const ACTOR = "Claude (auto)";
const ISSUES = ["follow_first", "not_found", "no_fit", "needs_person"];
const HANDLES = {
  jodohmu: "jodohmu_official", taaruf_sekarang: "taaruf_sekarang", nikahin_foreigner: "nikahin_foreigner", temu_chindo: "temu_chindo",
  nikah_lagiyuk: "nikah_lagiyuk", kristenmatch: "kristenmatch.indo", poligami_indonesia: "poligami.indonesia",
};

// Load .env the way Next does, so the script runs on any Node without --env-file
createRequire(import.meta.url)("@next/env").loadEnvConfig(new URL("..", import.meta.url).pathname, false, { info() {}, error: console.error });
initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)) });
const db = getFirestore();

const jakartaDay = (date = new Date()) => new Date(date.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
const addDays = (day, n) => { const d = new Date(`${day}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const nextWorkday = (day, after = 1) => {
  const date = new Date(`${day}T00:00:00Z`);
  let left = after;
  while (left > 0) { date.setUTCDate(date.getUTCDate() + 1); if (date.getUTCDay() !== 0) left--; }
  return date.toISOString().slice(0, 10);
};
const fail = (msg) => { console.error(msg); process.exit(1); };

async function planned() {
  const snap = await db.collection(COLLECTION).where("outreach.day", ">=", "2000-01-01").get();
  return snap.docs.map((doc) => ({ id: doc.id, ref: doc.ref, ...doc.data() }));
}

async function due() {
  const today = jakartaDay();
  const all = await planned();
  // The cap is per account per day, whoever sent: count earlier runs and anything a teammate sent by hand today
  const sentToday = {};
  for (const p of all) {
    const o = p.outreach;
    if (o.sentAt && jakartaDay(new Date(o.sentAt)) === today) {
      const key = o.channel === "email" ? "email" : o.account;
      sentToday[key] = (sentToday[key] ?? 0) + 1;
    }
  }
  const accounts = {};
  const emails = [];
  const handledByTeam = [];
  for (const p of all.sort((a, b) => a.outreach.day.localeCompare(b.outreach.day))) {
    const o = p.outreach;
    if (o.sentAt || o.day > today) continue;
    // A teammate already reached them some other way: record that so they never get a second "first" message
    if ((p.stage ?? "prospect") !== "prospect") {
      const first = (p.log ?? []).find((l) => l.stageTo === "contacted");
      const by = first?.by ?? p.updatedBy ?? "team";
      await p.ref.update({ outreach: { ...o, sentAt: first?.at ?? p.lastContactedAt ?? new Date().toISOString(), sentBy: by, issue: null } });
      handledByTeam.push(`${p.organization || p.name} (${p.stage}, by ${by})`);
      continue;
    }
    if (o.issue && o.issue.kind !== "follow_first") continue;
    if (o.channel === "email") {
      if (p.email && emails.length + (sentToday.email ?? 0) < EMAILS_PER_DAY) {
        emails.push({ id: p.id, organization: p.organization || p.name, to: p.email, day: o.day, reason: p.reason ?? "", subject: o.subject, message: o.message });
      }
      continue;
    }
    const list = (accounts[o.account] ??= { handle: HANDLES[o.account] ?? o.account, items: [] }).items;
    if (list.length + (sentToday[o.account] ?? 0) >= PER_ACCOUNT) continue;
    list.push({
      id: p.id, organization: p.organization || p.name, instagram: (p.instagram ?? "").replace(/^@/, ""), day: o.day,
      reason: p.reason ?? "", notes: p.notes ?? "", message: o.message, issue: o.issue ?? null,
    });
  }
  console.log(JSON.stringify({ today, warnings: warnings(all, today), handledByTeam, accounts, emails: { from: EMAIL_FROM, items: emails } }, null, 2));
}

// Things Taimoor must hear about before the outreach quietly stops: a queue running dry, or nothing sent yesterday
function warnings(all, today) {
  const out = [];
  const left = {};
  const lastSent = {};
  for (const p of all) {
    const o = p.outreach;
    const key = o.channel === "email" ? "email" : o.account;
    if (o.sentAt) {
      const day = jakartaDay(new Date(o.sentAt));
      if (!lastSent[key] || day > lastSent[key]) lastSent[key] = day;
    } else if ((p.stage ?? "prospect") === "prospect" && (!o.issue || o.issue.kind === "follow_first")) {
      left[key] = (left[key] ?? 0) + 1;
    }
  }
  for (const key of [...Object.keys(HANDLES), "email"]) {
    const perDay = key === "email" ? EMAILS_PER_DAY : PER_ACCOUNT;
    const name = key === "email" ? `emails (${EMAIL_FROM})` : `@${HANDLES[key]}`;
    const n = left[key] ?? 0;
    if (n === 0) out.push(`${name}: nothing left to send, needs new prospects`);
    else if (n < perDay * 3) out.push(`${name}: only ${n} left (under 3 days), research more soon`);
    if (n > 0 && lastSent[key] && lastSent[key] < addDays(today, -2)) out.push(`${name}: nothing sent since ${lastSent[key]}`);
  }
  const yesterday = addDays(today, -1);
  if (!Object.values(lastSent).includes(yesterday) && !Object.values(lastSent).some((d) => d > yesterday)) {
    out.push(`Nothing at all was sent yesterday (${yesterday}): check why the runs failed`);
  }
  return out;
}

async function load(id) {
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists || !snap.data().outreach) fail(`No planned outreach for ${id}`);
  return { ref, data: snap.data(), outreach: snap.data().outreach };
}

async function sent(id, file) {
  const { ref, data, outreach } = await load(id);
  if (outreach.sentAt) return console.log(`Already sent ${outreach.sentAt}`);
  const now = new Date().toISOString();
  const message = file ? readFileSync(file, "utf8").trim() : outreach.message;
  const from = data.stage ?? "prospect";
  const handle = HANDLES[outreach.account] ?? outreach.account;
  const adjusted = message !== outreach.message ? " (wording adjusted after reading their profile)" : "";
  const entry = {
    at: now, by: ACTOR, channel: outreach.channel,
    note: outreach.channel === "email" ? `First email sent from ${EMAIL_FROM}: "${outreach.subject}"${adjusted}` : `First DM sent from @${handle}${adjusted}`,
    stageFrom: from === "prospect" ? "prospect" : null, stageTo: from === "prospect" ? "contacted" : null,
  };
  await ref.update({
    outreach: { ...outreach, message, sentAt: now, sentBy: ACTOR, issue: null },
    stage: from === "prospect" ? "contacted" : from,
    lastContactedAt: now,
    followUpDate: nextWorkday(jakartaDay(), REPLY_WAIT),
    log: [entry, ...(data.log ?? [])].slice(0, MAX_LOG),
    updatedAt: FieldValue.serverTimestamp(), updatedBy: ACTOR,
  });
  console.log(`Recorded: ${data.organization || data.name}`);
}

async function issue(id, kind, note, retryInDays) {
  if (!ISSUES.includes(kind)) fail(`kind must be one of ${ISSUES.join(", ")}`);
  const { ref, data, outreach } = await load(id);
  const now = new Date().toISOString();
  const day = retryInDays ? addDays(jakartaDay(), Number(retryInDays)) : outreach.day;
  await ref.update({
    outreach: { ...outreach, day, issue: { kind, note: note ?? "", at: now } },
    log: [{ at: now, by: ACTOR, channel: "note", note: `Outreach not sent (${kind}): ${note ?? ""}`, stageFrom: null, stageTo: null }, ...(data.log ?? [])].slice(0, MAX_LOG),
    updatedAt: FieldValue.serverTimestamp(), updatedBy: ACTOR,
  });
  console.log(`Recorded ${kind} for ${data.organization || data.name}${retryInDays ? `, retry on ${day}` : ""}`);
}

async function undo(id, kind, note, retryInDays) {
  const { ref, data, outreach } = await load(id);
  if (!outreach.sentAt || outreach.sentBy !== ACTOR) fail("Only a send recorded by this run can be taken back");
  const [latest, ...rest] = data.log ?? [];
  if (!latest || latest.at !== outreach.sentAt) fail("Something else was logged since; fix it on the Mitra page instead");
  await ref.update({
    outreach: { ...outreach, sentAt: null, sentBy: "" },
    stage: latest.stageTo === "contacted" ? latest.stageFrom ?? "prospect" : data.stage,
    lastContactedAt: null, followUpDate: outreach.day, log: rest,
    updatedAt: FieldValue.serverTimestamp(), updatedBy: ACTOR,
  });
  await issue(id, kind, note, retryInDays);
}

async function plan(days = 10) {
  const today = jakartaDay();
  const last = addDays(today, Number(days));
  for (const p of (await planned()).filter((x) => !x.outreach.sentAt && x.outreach.day <= last)
    .sort((a, b) => a.outreach.day.localeCompare(b.outreach.day) || a.outreach.account.localeCompare(b.outreach.account))) {
    console.log(`${p.outreach.day}  ${p.outreach.account.padEnd(18)} ${p.outreach.channel.padEnd(9)} ${p.stage.padEnd(10)} ${p.organization || p.name}${p.outreach.issue ? `  [${p.outreach.issue.kind}]` : ""}`);
  }
}

const [cmd, ...args] = process.argv.slice(2);
const run = { due, undo: () => undo(args[0], args[1], args[2], args[3]), sent: () => sent(args[0], args[1]), issue: () => issue(args[0], args[1], args[2], args[3]), plan: () => plan(args[0]) }[cmd];
if (!run) fail("Usage: due | sent <id> [file] | issue <id> <kind> <note> [retryInDays] | undo <id> <kind> <note> [retryInDays] | plan [days]");
await run();
process.exit(0);
