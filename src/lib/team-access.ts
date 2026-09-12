import { adminAuth, adminDb } from "@/lib/firebase-admin";

export interface TeamActor {
  uid: string;
  role: string;
  name: string;
}

/** Verifies the bearer token and resolves the caller's role. */
export async function authenticateTeam(authHeader: string | null): Promise<TeamActor | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(authHeader.replace("Bearer ", ""));
    const snap = await adminDb().collection("user_roles").doc(decoded.uid).get();
    const role = (snap.data()?.role as string | undefined) ?? "candidate";
    const name = (snap.data()?.name as string | undefined) ?? decoded.name ?? decoded.email ?? decoded.uid;
    return { uid: decoded.uid, role, name };
  } catch {
    return null;
  }
}

/**
 * Admins reach every candidate; workers only the ones assigned to them.
 * Mirrors the rule already enforced in /api/admin/candidate/[id].
 */
export async function canManageCandidate(actor: TeamActor, candidateId: string): Promise<boolean> {
  if (actor.role === "admin") return true;
  if (actor.role !== "worker") return false;
  const snap = await adminDb().collection("candidate_intake").doc(candidateId).get();
  const assigned: string[] = snap.data()?.assignedWorkers ?? [];
  return assigned.includes(actor.uid);
}
