/* ──────────────────────────────────────────────────────────────────────
   Wire types for profile links, shared by API routes and client UI.
   Type-only — no runtime imports.
   ────────────────────────────────────────────────────────────────────── */

import type { AudienceTier, Audiences, ProjectedProfile } from "@/lib/share-sections";
import type { ProfileAnswers, Question } from "@/lib/share-questions";
import type { VisitContext } from "@/lib/share-analytics";
import type { AvatarVariant } from "@/lib/share-avatars";

export type SharePurpose = "matchmaking" | "promotion";
export type AccessMode = "anyone" | "signin" | "invited";
export type ShareState = "active" | "expired" | "exhausted" | "revoked";

export interface ShareAccess {
  mode: AccessMode;
  invitedEmails: string[];
}

export interface ShareQuestionnaire {
  enabled: boolean;
  questions: Question[];
}

/* ── team-facing ───────────────────────────────────────────────────── */

export interface ShareSummary {
  id: string;
  code: string;
  purpose: SharePurpose;
  candidateIds: string[];
  candidateNames: Record<string, string>;
  recipientLabel: string;
  recipientNote: string;
  access: ShareAccess;
  audiences: Audiences;
  photoSelection: Record<string, number[] | null>;
  avatarSelection: Record<string, AvatarVariant>;
  expiresAt: string | null;
  maxOpens: number | null;
  maxOpensPerViewer: number | null;
  opens: number;
  sessionMinutes: number;
  questionnaire: ShareQuestionnaire;
  viewerCount: number;
  responseCount: number;
  createdByName: string;
  createdAt: string | null;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
  revokedAt: string | null;
  state: ShareState;
}

export interface ShareViewerRow {
  key: string;
  uid: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
  tier: AudienceTier;
  opens: number;
  firstAt: string | null;
  lastAt: string | null;
  lastActiveAt: string | null;
  lastVisit: VisitContext | null;
  engagement: {
    seconds: number;
    /** keyed by profile slot ("0".."4") or "decision" */
    stepSeconds: Record<string, number>;
    photoViews: number;
  };
  answered: boolean;
}

export interface ShareViewEvent {
  id: string;
  at: string | null;
  viewerKey: string;
  tier: AudienceTier;
  countedAsOpen: boolean;
  visit: VisitContext | null;
}

export type SwipeDecision = "yes" | "no";

export interface ShareResponseRow {
  uid: string;
  email: string;
  name: string;
  /** keyed by candidateId */
  answers: Record<string, ProfileAnswers>;
  /** the swipe on each profile, keyed by candidateId */
  decisions: Record<string, SwipeDecision>;
  finalNote: string;
  submittedAt: string | null;
  updatedAt: string | null;
  /** set once every profile in the link has been swiped */
  completedAt: string | null;
}

export interface ShareDetail {
  share: ShareSummary;
  viewers: ShareViewerRow[];
  responses: ShareResponseRow[];
  views: ShareViewEvent[];
}

/* ── recipient-facing ──────────────────────────────────────────────── */

export type ShareGateState =
  | "expired"
  | "exhausted"
  | "revoked"
  | "missing"
  | "signin_required"
  | "not_invited"
  | "exhausted_for_you"
  /** this viewer already swiped through every profile */
  | "completed"
  | "error";

export interface ShareGatePayload {
  available: false;
  state: ShareGateState;
  purpose?: SharePurpose;
  recipientLabel?: string;
  profileCount?: number;
}

/** Where this viewer got to. Slots, never candidate ids. */
export interface ShareProgress {
  decidedSlots: number[];
  completed: boolean;
  finalNote: string;
}

export interface ShareViewPayload {
  available: true;
  code: string;
  purpose: SharePurpose;
  accessMode: AccessMode;
  recipientLabel: string;
  recipientNote: string;
  tier: AudienceTier;
  viewer: { name: string; email: string } | null;
  profiles: ProjectedProfile[];
  questionnaire: ShareQuestionnaire;
  progress: ShareProgress;
  expiresAt: string | null;
  opensRemaining: number | null;
  opensRemainingForYou: number | null;
  sessionExpiresAt: string;
}
