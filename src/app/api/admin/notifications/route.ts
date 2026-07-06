import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const decoded = await adminAuth().verifyIdToken(token);
  const roleSnap = await adminDb().collection("user_roles").doc(decoded.uid).get();
  if (roleSnap.data()?.role !== "admin") return null;
  return decoded.uid;
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Small dataset — fetch and sort in memory rather than requiring a composite index.
    const snap = await adminDb().collection("admin_notifications").get();
    const notifications = snap.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type as string,
          uid: data.uid as string,
          name: data.name ?? "—",
          phone: data.phone ?? null,
          waLink: data.waLink ?? null,
          gender: data.gender ?? null,
          age: data.age ?? null,
          city: data.city ?? null,
          email: data.email ?? null,
          read: !!data.read,
          createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        };
      })
      .sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 50);

    const unreadCount = notifications.filter(n => !n.read).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("GET admin notifications error", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json() as { id?: string; markAllRead?: boolean };

    if (body.markAllRead) {
      const snap = await adminDb().collection("admin_notifications").where("read", "==", false).get();
      await Promise.all(snap.docs.map(doc => doc.ref.update({ read: true })));
      return NextResponse.json({ success: true });
    }

    if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await adminDb().collection("admin_notifications").doc(body.id).update({ read: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH admin notifications error", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
