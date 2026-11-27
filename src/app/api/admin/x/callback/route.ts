import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { errorText } from "@/lib/social-server";
import { connectX, readXState } from "@/lib/x";
import { hasSocialAccess } from "@/lib/social-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Where X sends the browser after "Connect" next to X. The signed state says which account
   and which admin started it, since this request carries no login of ours. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const back = (key: string | null, result: Record<string, string>) =>
    NextResponse.redirect(new URL(`/admin/subpages?${new URLSearchParams({ ...(key ? { page: key } : {}), ...result })}`, req.nextUrl.origin));

  const state = readXState(params.get("state") ?? "");
  if (!state) return back(null, { error: "The X login link expired. Try Connect again." });
  const code = params.get("code");
  if (!code) return back(state.key, { error: params.get("error_description") || "X login was cancelled." });

  const role = (await adminDb().collection("user_roles").doc(state.uid).get()).data();
  if (!hasSocialAccess(role)) return back(state.key, { error: "Only admins and the social media team can connect X." });
  // Same fallbacks as authenticateTeam: the role's name, then the login's name or email
  const user = await adminAuth().getUser(state.uid).catch(() => null);
  const name = (role?.name as string | undefined) ?? user?.displayName ?? user?.email ?? state.uid;
  try {
    await connectX(state.key, code, state.verifier, { uid: state.uid, name });
    return back(state.key, { connected: "x" });
  } catch (err) {
    return back(state.key, { error: errorText(err) });
  }
}
