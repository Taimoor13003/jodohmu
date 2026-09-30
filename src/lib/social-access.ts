import { adminAuth, adminDb } from "@/lib/firebase-admin";

/* Who may speak for Jodohmu on its public accounts: admins, and workers an admin has given
   the "social" permission (Manage social media). */

export type SocialActor = { uid: string; name: string };

export function hasSocialAccess(roleDoc: FirebaseFirestore.DocumentData | undefined) {
  const permissions: string[] = Array.isArray(roleDoc?.permissions) ? roleDoc!.permissions : [];
  return roleDoc?.role === "admin" || (roleDoc?.role === "worker" && permissions.includes("social"));
}

export async function requireSocial(authHeader: string | null): Promise<SocialActor | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(authHeader.replace("Bearer ", ""));
    const data = (await adminDb().collection("user_roles").doc(decoded.uid).get()).data();
    if (!hasSocialAccess(data)) return null;
    return { uid: decoded.uid, name: (data?.name as string | undefined) ?? decoded.name ?? decoded.email ?? decoded.uid };
  } catch {
    return null;
  }
}
