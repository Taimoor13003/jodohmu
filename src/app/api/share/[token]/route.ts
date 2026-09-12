import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { describeVisit } from "@/lib/share-analytics";
import { defaultAvatarFor } from "@/lib/share-avatars";
import { projectProfile } from "@/lib/share-sections";
import {
  ANON_COOKIE,
  SHARES_COLLECTION,
  SHARE_RESPONSES_SUBCOLLECTION,
  SHARE_VIEWERS_SUBCOLLECTION,
  SHARE_VIEWS_SUBCOLLECTION,
  accessGate,
  anonymousLabel,
  evaluateShare,
  generateAnonId,
  isTeamViewer,
  readShare,
  resolveViewer,
  sessionCookieName,
  shareCode,
  signAnonId,
  signSession,
  tierFor,
  toIso,
  verifyAnonId,
  verifySession,
  viewerKeyFor,
} from "@/lib/shares";
import type { ShareGatePayload, ShareGateState, ShareProgress, ShareViewPayload } from "@/lib/share-types";

export const dynamic = "force-dynamic";

const DUPLICATE_OPEN_WINDOW_MS = 60_000;

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(`share-ip:${ip}`).digest("hex").slice(0, 16);
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, private");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res;
}

function gate(state: ShareGateState, extra: Omit<ShareGatePayload, "available" | "state"> = {}) {
  const status = state === "missing" ? 404 : state === "signin_required" ? 401 : state === "not_invited" ? 403 : 410;
  return noStore(NextResponse.json({ available: false, state, ...extra } satisfies ShareGatePayload, { status }));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const now = Date.now();
  const visit = describeVisit(req.headers, req.nextUrl.searchParams.get("r"));

  try {
    const ref = adminDb().collection(SHARES_COLLECTION).doc(token);
    const snap = await ref.get();
    if (!snap.exists) return gate("missing");
    const share = readShare(snap.data()!);

    const linkState = evaluateShare(share, now, true);
    if (linkState !== "active") return gate(linkState);

    const viewer = await resolveViewer(req.headers.get("authorization"));
    const blocked = accessGate(share, viewer);
    if (blocked) {
      return gate(blocked, {
        purpose: share.purpose,
        recipientLabel: share.recipientLabel,
        profileCount: share.candidateIds.length,
      });
    }

    /* Where this viewer got to. Someone who already swiped the whole deck
       cannot reopen it — the team always can, to check what was sent. */
    let progress: ShareProgress = { decidedSlots: [], completed: false, finalNote: "" };
    if (viewer && share.questionnaire.enabled) {
      const responseSnap = await ref.collection(SHARE_RESPONSES_SUBCOLLECTION).doc(viewer.uid).get();
      if (responseSnap.exists) {
        const data = responseSnap.data()!;
        const decisions = (data.decisions ?? {}) as Record<string, string>;
        progress = {
          decidedSlots: share.candidateIds.map((id, i) => (decisions[id] ? i : -1)).filter(i => i >= 0),
          completed: share.candidateIds.length > 0 && share.candidateIds.every(id => decisions[id]),
          finalNote: data.finalNote ?? "",
        };
      }
    }
    if (progress.completed && !isTeamViewer(viewer)) {
      return gate("completed", {
        purpose: share.purpose,
        recipientLabel: share.recipientLabel,
        profileCount: share.candidateIds.length,
      });
    }

    let anonId = viewer ? null : verifyAnonId(req.cookies.get(ANON_COOKIE)?.value);
    const issueAnonCookie = !viewer && !anonId;
    if (issueAnonCookie) anonId = generateAnonId();

    const vk = viewerKeyFor(viewer, anonId);
    const tier = tierFor(viewer);
    const cookieName = sessionCookieName(token);
    const claims = verifySession(token, req.cookies.get(cookieName)?.value, now);
    // A session only counts for the identity it was charged to: signing in
    // mid-window starts a fresh, separately tracked open for that person.
    const hasSession = !!claims && claims.vk === vk;

    const viewerRef = ref.collection(SHARE_VIEWERS_SUBCOLLECTION).doc(vk);
    let totalOpens = share.opens;
    let viewerOpens = 0;

    if (!hasSession) {
      const outcome = await adminDb().runTransaction(async tx => {
        const [freshShare, freshViewer] = await Promise.all([tx.get(ref), tx.get(viewerRef)]);
        const fresh = readShare(freshShare.data() ?? {});
        const state = evaluateShare(fresh, now);
        if (state !== "active") return { denied: state as ShareGateState };

        const priorOpens = (freshViewer.data()?.opens as number | undefined) ?? 0;
        // bonusOpens lets the team grant one person another look without rewriting their real count
        const bonus = (freshViewer.data()?.bonusOpens as number | undefined) ?? 0;

        // A repeat request moments after an open (double-mount, cookie not stored yet) isn't a new open.
        const lastAtMs = (freshViewer.data()?.lastAt as { toMillis(): number } | undefined)?.toMillis?.() ?? 0;
        if (freshViewer.exists && now - lastAtMs < DUPLICATE_OPEN_WINDOW_MS) {
          return { denied: null, totalOpens: fresh.opens, viewerOpens: priorOpens - bonus };
        }
        if (fresh.maxOpensPerViewer != null && priorOpens >= fresh.maxOpensPerViewer + bonus) {
          return { denied: "exhausted_for_you" as ShareGateState };
        }

        tx.update(ref, {
          opens: FieldValue.increment(1),
          lastOpenedAt: FieldValue.serverTimestamp(),
          ...(fresh.firstOpenedAt ? {} : { firstOpenedAt: FieldValue.serverTimestamp() }),
          ...(freshViewer.exists ? {} : { viewerCount: FieldValue.increment(1) }),
        });
        tx.set(
          viewerRef,
          {
            uid: viewer?.uid ?? null,
            email: viewer?.email ?? null,
            name: viewer?.name ?? null,
            role: viewer?.role ?? null,
            tier,
            opens: FieldValue.increment(1),
            lastAt: FieldValue.serverTimestamp(),
            lastVisit: visit,
            userAgent: (req.headers.get("user-agent") ?? "").slice(0, 200),
            ...(freshViewer.exists ? {} : { firstAt: FieldValue.serverTimestamp() }),
          },
          { merge: true },
        );
        return { denied: null, totalOpens: fresh.opens + 1, viewerOpens: priorOpens + 1 - bonus };
      });

      if (outcome.denied) return gate(outcome.denied);
      totalOpens = outcome.totalOpens!;
      viewerOpens = outcome.viewerOpens!;
    } else {
      const viewerSnap = await viewerRef.get();
      viewerOpens =
        ((viewerSnap.data()?.opens as number | undefined) ?? 1) - ((viewerSnap.data()?.bonusOpens as number | undefined) ?? 0);
      await Promise.all([
        ref.update({ lastOpenedAt: FieldValue.serverTimestamp() }),
        viewerRef.set({ lastAt: FieldValue.serverTimestamp(), tier, lastVisit: visit }, { merge: true }),
      ]);
    }

    ref.collection(SHARE_VIEWS_SUBCOLLECTION)
      .add({
        at: FieldValue.serverTimestamp(),
        viewerKey: vk,
        tier,
        ipHash: hashIp(clientIp(req)),
        userAgent: (req.headers.get("user-agent") ?? "").slice(0, 200),
        visit,
        countedAsOpen: !hasSession,
      })
      .catch(() => {});

    /* ── build this viewer's view ── */
    const candidateSnaps = share.candidateIds.length
      ? await adminDb().getAll(...share.candidateIds.map(id => adminDb().collection("candidate_intake").doc(id)))
      : [];

    const profiles = share.candidateIds.map((candidateId, slot) => {
      const candidate = (candidateSnaps[slot]?.data() ?? {}) as Record<string, unknown>;
      return projectProfile({
        slot,
        candidate,
        audiences: share.audiences,
        tier,
        avatar: share.avatarSelection[candidateId] ?? defaultAvatarFor(candidate),
        photoSelection: share.photoSelection[candidateId] ?? null,
        anonymousLabel: anonymousLabel(token, slot),
        photoSrc: index => `/api/share/${token}/photo/${slot}/${index}`,
      });
    });

    const sessionExpiresAtMs = hasSession ? claims!.exp : now + share.sessionMinutes * 60_000;

    const payload: ShareViewPayload = {
      available: true,
      code: shareCode(token),
      purpose: share.purpose,
      accessMode: share.access.mode,
      recipientLabel: share.recipientLabel,
      recipientNote: share.recipientNote,
      tier,
      viewer: viewer ? { name: viewer.name, email: viewer.email } : null,
      profiles,
      questionnaire: share.questionnaire,
      progress,
      expiresAt: toIso(share.expiresAt),
      opensRemaining: share.maxOpens == null ? null : Math.max(0, share.maxOpens - totalOpens),
      opensRemainingForYou: share.maxOpensPerViewer == null ? null : Math.max(0, share.maxOpensPerViewer - viewerOpens),
      sessionExpiresAt: new Date(sessionExpiresAtMs).toISOString(),
    };

    const res = noStore(NextResponse.json(payload));
    const secure = process.env.NODE_ENV === "production";
    res.cookies.set({
      name: cookieName,
      value: signSession(token, { exp: sessionExpiresAtMs, tier, vk }),
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: Math.max(1, Math.ceil((sessionExpiresAtMs - now) / 1000)),
    });
    if (issueAnonCookie && anonId) {
      res.cookies.set({
        name: ANON_COOKIE,
        value: signAnonId(anonId),
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  } catch (err) {
    console.error("resolve share error", err);
    return NextResponse.json({ available: false, state: "error" } satisfies ShareGatePayload, { status: 500 });
  }
}
