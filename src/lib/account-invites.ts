import { randomBytes } from "crypto";
import type { Timestamp } from "firebase-admin/firestore";

/* ──────────────────────────────────────────────────────────────────────
   Account invites: a link the team sends to a candidate whose account
   they created, so the candidate can sign in and take over their profile.
   ────────────────────────────────────────────────────────────────────── */

export const INVITES_COLLECTION = "account_invites";
export const INVITE_TTL_DAYS = 14;
export const INVITE_TOKEN_RE = /^[A-Za-z0-9_-]{24,64}$/;

export type InviteState = "valid" | "accepted" | "expired" | "revoked" | "missing";

export interface InviteRecord {
  uid: string;
  email: string;
  name: string;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp | null;
  expiresAt: Timestamp | null;
  acceptedAt: Timestamp | null;
  revokedAt: Timestamp | null;
  opens: number;
}

/** What the team sees about a candidate's account and latest invite. */
export interface CandidateAccessStatus {
  account: {
    email: string;
    lastSignInAt: string | null;
    providers: string[];
  } | null;
  invite: {
    token: string;
    state: InviteState;
    createdAt: string | null;
    expiresAt: string | null;
    acceptedAt: string | null;
    createdByName: string;
    opens: number;
  } | null;
}

/** What anyone holding the link sees — never the full email. */
export interface InvitePublicPayload {
  state: InviteState;
  firstName?: string;
  emailHint?: string;
  googleEmail?: boolean;
}

export function newInviteToken(): string {
  return randomBytes(18).toString("base64url");
}

export function inviteState(inv: Partial<InviteRecord> | undefined): InviteState {
  if (!inv) return "missing";
  if (inv.revokedAt) return "revoked";
  // Once claimed the link keeps working as a sign-in shortcut
  if (inv.acceptedAt) return "accepted";
  if (inv.expiresAt && inv.expiresAt.toMillis() < Date.now()) return "expired";
  return "valid";
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const shown = user.slice(0, Math.min(2, user.length));
  return `${shown}${"*".repeat(Math.max(3, user.length - shown.length))}@${domain}`;
}

export function isGoogleEmail(email: string): boolean {
  return /@(gmail|googlemail)\.com$/i.test(email);
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

export function tsToIso(v: unknown): string | null {
  const t = v as { toDate?: () => Date } | null | undefined;
  return t?.toDate ? t.toDate().toISOString() : null;
}
