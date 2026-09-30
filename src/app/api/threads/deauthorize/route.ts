import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { forgetUser, readSignedRequest } from "@/lib/threads";

export const runtime = "nodejs";

/* Meta's "Uninstall" and "Delete" callbacks for the Threads app: when an account removes the app
   in Threads, its saved login is dropped. Delete requests also expect a confirmation code back. */
export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const data = readSignedRequest(String(form?.get("signed_request") ?? ""));
  if (!data) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (data.user_id) await forgetUser(data.user_id);
  const code = randomUUID();
  return NextResponse.json({ url: `${req.nextUrl.origin}/privacy`, confirmation_code: code });
}
