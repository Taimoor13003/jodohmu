import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { withLiveAge } from "@/lib/age";
import { TEAM_INVITES } from "@/lib/calldesk";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth().verifyIdToken(token);

    const requesterRole = (await adminDb().collection("user_roles").doc(decoded.uid).get()).data()?.role;
    // Admins can list any role; workers may only list candidates (scoped to their own assignments below)
    if (requesterRole !== "admin" && !(requesterRole === "worker" && req.nextUrl.searchParams.get("role") === "candidate")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const roleFilter = req.nextUrl.searchParams.get("role");

    // Fetch all docs without a compound filter to avoid requiring a composite index.
    // Filter by role and sort in memory — user count is small.
    const snap = await adminDb().collection("user_roles").get();

    const users = snap.docs
      .map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name ?? "—",
          email: data.email ?? "—",
          role: (data.role ?? "candidate") as string,
          source: (data.source as string | undefined) ?? null,
          position: (data.position as string | undefined) ?? null,
          permissions: Array.isArray(data.permissions) ? (data.permissions as string[]) : [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        };
      })
      .filter(u => !roleFilter || u.role === roleFilter)
      .sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    // Join lightweight lead fields from candidate_intake for candidate rows —
    // dataset is small, so per-row lookups are fine (same tradeoff as above).
    const candidateUids = users.filter(u => u.role === "candidate").map(u => u.uid);
    if (candidateUids.length) {
      const intakeSnaps = await Promise.all(
        candidateUids.map(uid => adminDb().collection("candidate_intake").doc(uid).get())
      );
      const intakeByUid = new Map(
        intakeSnaps.map(s => [s.id, s.data()])
      );
      for (const u of users) {
        const intake = intakeByUid.get(u.uid);
        const assigned = (intake?.assignedWorkers as string[] | undefined) ?? [];
        (u as Record<string, unknown>).personStatus = intake?.personStatus ?? null;
        (u as Record<string, unknown>).phone = intake?.whatsappNumber ?? null;
        (u as Record<string, unknown>).location = intake?.location ?? null;
        (u as Record<string, unknown>).age = intake ? (withLiveAge(intake).age ?? null) : null;
        (u as Record<string, unknown>).gender = intake?.gender ?? null;
        // Workers see every candidate but may only edit the ones assigned to them
        (u as Record<string, unknown>).canEdit = requesterRole === "admin" || assigned.includes(decoded.uid);
      }
    }

    // Pending team invites show up alongside workers until the person first signs in
    if (requesterRole === "admin" && roleFilter === "worker") {
      const invites = await adminDb().collection(TEAM_INVITES).where("claimedUid", "==", null).get();
      const pending = invites.docs.map(doc => ({
        uid: `invite:${doc.id}`,
        name: doc.data().name ?? "—",
        email: doc.id,
        role: "worker",
        source: "team_invite",
        position: doc.data().position ?? null,
        permissions: doc.data().permissions ?? [],
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
        pending: true,
      }));
      return NextResponse.json({ users: [...pending, ...users] });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("list-users error", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
