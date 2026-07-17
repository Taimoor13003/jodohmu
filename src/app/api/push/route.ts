import { NextRequest, NextResponse } from "next/server";
import { pushToAdmin, pushToUid } from "@/lib/push-server";

export async function POST(req: NextRequest) {
  try {
    const { targetUid, targetRole, title, body, link } = await req.json() as {
      targetUid?: string;
      targetRole?: string;
      title: string;
      body: string;
      link?: string;
    };

    if (!title || !body) {
      return NextResponse.json({ error: "Missing title or body" }, { status: 400 });
    }

    if (targetRole === "admin") {
      await pushToAdmin(title, body, link);
    } else if (targetUid) {
      await pushToUid(targetUid, title, body, link);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push route] error:", err);
    return NextResponse.json({ error: "Push failed" }, { status: 500 });
  }
}
