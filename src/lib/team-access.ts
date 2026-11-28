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
 * Admins reach every candidate; workers the ones assigned to them, or every
 * candidate when they hold the "all_profiles" permission. Every route that
 * edits or shares a candidate goes through this.
 */
export async function canManageCandidate(actor: Pick<TeamActor, "uid" | "role">, candidateId: string): Promise<boolean> {
  if (actor.role === "admin") return true;
  if (actor.role !== "worker") return false;
  if (await hasPermission(actor, "all_profiles")) return true;
  const snap = await adminDb().collection("candidate_intake").doc(candidateId).get();
  const assigned: string[] = snap.data()?.assignedWorkers ?? [];
  return assigned.includes(actor.uid);
}

/** Whether a worker has been given an extra permission (admins have them all). */
export async function hasPermission(actor: Pick<TeamActor, "uid" | "role">, permission: string): Promise<boolean> {
  if (actor.role === "admin") return true;
  if (actor.role !== "worker") return false;
  const snap = await adminDb().collection("user_roles").doc(actor.uid).get();
  const perms: string[] = snap.data()?.permissions ?? [];
  return perms.includes(permission);
}

/** Match suggestions: everyone with the "matches" permission, otherwise only for clients the worker manages. */
export async function canManageSuggestionFor(actor: TeamActor, clientUid: string): Promise<boolean> {
  return (await hasPermission(actor, "matches")) || canManageCandidate(actor, clientUid);
}
