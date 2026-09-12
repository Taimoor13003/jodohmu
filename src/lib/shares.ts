import crypto from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import cloudinary from "@/lib/cloudinary";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { DEFAULT_SHARE_QUESTIONS, questionsSchema, type Question } from "@/lib/share-questions";
import { AUDIENCE_TIERS, normalizeAudiences, type AudienceTier, type Audiences } from "@/lib/share-sections";
import type {
  AccessMode, ShareAccess, ShareGateState, SharePurpose, ShareQuestionnaire, ShareState, ShareSummary,
} from "@/lib/share-types";

/* ──────────────────────────────────────────────────────────────────────
   Profile links — server core.

   A link is a revocable capability to view 1–5 candidate profiles under
   its own rules: who may open it, what each audience sees, how long and
   how often. Nothing here trusts the client; every limit is enforced in
   the API routes that import this module.
   ────────────────────────────────────────────────────────────────────── */

export const SHARES_COLLECTION = "profile_shares";
export const SHARE_VIEWS_SUBCOLLECTION = "views";
export const SHARE_VIEWERS_SUBCOLLECTION = "viewers";
export const SHARE_RESPONSES_SUBCOLLECTION = "responses";
export const MAX_PROFILES_PER_SHARE = 5;
export const DEFAULT_SESSION_MINUTES = 20;

export interface ShareRecord {
  candidateIds: string[];
  candidateNames: Record<string, string>;
  purpose: SharePurpose;
  recipientLabel: string;
  recipientNote: string;
  access: ShareAccess;
  audiences: Audiences;
  photoSelection: Record<string, number[] | null>;
  expiresAt: Timestamp | null;
  maxOpens: number | null;
  maxOpensPerViewer: number | null;
  opens: number;
  sessionMinutes: number;
  questionnaire: ShareQuestionnaire;
  viewerCount: number;
  responseCount: number;
  createdBy: string;
  createdByName: string;
  createdAt?: Timestamp;
  revokedAt: Timestamp | null;
  revokedBy: string | null;
  firstOpenedAt: Timestamp | null;
  lastOpenedAt: Timestamp | null;
}

/* ── tokens ─────────────────────────────────────────────────────────── */

/** 144 bits of entropy, URL-safe. Not guessable, not enumerable. */
export function generateShareToken(): string {
  return crypto.randomBytes(18).toString("base64url");
}

/** Short human-quotable code shown in the UI and stamped on watermarks. */
export function shareCode(token: string): string {
  return token.slice(0, 6).toUpperCase();
}

export function anonymousLabel(token: string, slot: number): string {
  return `${shareCode(token)}-${slot + 1}`;
}

/* ── signing ────────────────────────────────────────────────────────── */

/**
 * Uses SHARE_LINK_SECRET when set; otherwise derives a stable key from the
 * Firebase service account so existing deployments need no new config.
 */
function signingSecret(): string {
  const explicit = process.env.SHARE_LINK_SECRET;
  if (explicit) return explicit;
  const fallback = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!fallback) throw new Error("Missing SHARE_LINK_SECRET (and no service account to derive one from)");
  return crypto.createHash("sha256").update(`share-link:${fallback}`).digest("hex");
}

function mac(input: string): string {
  return crypto.createHmac("sha256", signingSecret()).update(input).digest("base64url");
}

function macMatches(expected: string, given: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ── viewing session (per link, per viewer) ─────────────────────────── */

export interface SessionClaims {
  /** ms epoch the window closes */
  exp: number;
  tier: AudienceTier;
  /** viewer key the open was charged to */
  vk: string;
}

export function sessionCookieName(token: string): string {
  return `jm_share_${crypto.createHash("sha256").update(token).digest("hex").slice(0, 16)}`;
}

export function signSession(token: string, claims: SessionClaims): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${mac(`session.${token}.${payload}`)}`;
}

export function verifySession(token: string, value: string | undefined, nowMs: number): SessionClaims | null {
  if (!value) return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig || !macMatches(mac(`session.${token}.${payload}`), sig)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionClaims;
    if (!Number.isFinite(claims.exp) || claims.exp <= nowMs) return null;
    if (!AUDIENCE_TIERS.includes(claims.tier) || typeof claims.vk !== "string") return null;
    return claims;
  } catch {
    return null;
  }
}

/* ── anonymous viewer identity ──────────────────────────────────────── */

/** Lets "once per person" and the viewer log work for people who never sign in. */
export const ANON_COOKIE = "jm_share_viewer";

export function generateAnonId(): string {
  return crypto.randomBytes(12).toString("base64url");
}

export function signAnonId(id: string): string {
  return `${id}.${mac(`anon.${id}`)}`;
}

export function verifyAnonId(value: string | undefined): string | null {
  if (!value) return null;
  const [id, sig] = value.split(".");
  if (!id || !sig || !/^[A-Za-z0-9_-]{8,40}$/.test(id)) return null;
  return macMatches(mac(`anon.${id}`), sig) ? id : null;
}

/* ── link state ─────────────────────────────────────────────────────── */

interface EvaluateInput {
  revokedAt?: unknown;
  expiresAt?: { toMillis(): number } | null;
  maxOpens?: number | null;
  opens?: number;
}

/**
 * Whether the link itself may still be opened. `hasSession` means this
 * viewer is inside an already-charged window, so a refresh on a one-open
 * link doesn't burn a second open.
 */
export function evaluateShare(share: EvaluateInput, nowMs: number, hasSession = false): ShareState {
  if (share.revokedAt) return "revoked";
  if (share.expiresAt && share.expiresAt.toMillis() <= nowMs) return "expired";
  if (!hasSession && share.maxOpens != null && (share.opens ?? 0) >= share.maxOpens) return "exhausted";
  return "active";
}

/* ── viewers ────────────────────────────────────────────────────────── */

export interface ShareViewer {
  uid: string;
  email: string;
  name: string;
  role: string;
  personStatus: string | null;
}

/** Candidates still in the intake funnel don't count as "registered" yet. */
const PRE_ONBOARDING_STATUSES = new Set(["new_lead", "awaiting_discovery_call"]);

export async function resolveViewer(authHeader: string | null): Promise<ShareViewer | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(authHeader.slice("Bearer ".length));
    const roleSnap = await adminDb().collection("user_roles").doc(decoded.uid).get();
    const role = (roleSnap.data()?.role as string | undefined) ?? "candidate";
    let personStatus: string | null = null;
    if (role === "candidate") {
      const intake = await adminDb().collection("candidate_intake").doc(decoded.uid).get();
      personStatus = (intake.data()?.personStatus as string | undefined) ?? null;
    }
    return {
      uid: decoded.uid,
      email: (decoded.email ?? "").toLowerCase(),
      name: (roleSnap.data()?.name as string | undefined) ?? decoded.name ?? decoded.email ?? "",
      role,
      personStatus,
    };
  } catch {
    return null;
  }
}

export function isTeamViewer(viewer: ShareViewer | null): boolean {
  return viewer?.role === "admin" || viewer?.role === "worker";
}

export function tierFor(viewer: ShareViewer | null): AudienceTier {
  if (!viewer) return "public";
  if (isTeamViewer(viewer)) return "candidate";
  if (viewer.role === "candidate" && viewer.personStatus && !PRE_ONBOARDING_STATUSES.has(viewer.personStatus)) {
    return "candidate";
  }
  return "member";
}

/** Team members can always open a link, so they can check what they sent. */
export function accessGate(access: ShareAccess, viewer: ShareViewer | null): Extract<ShareGateState, "signin_required" | "not_invited"> | null {
  if (access.mode === "anyone") return null;
  if (!viewer) return "signin_required";
  if (access.mode === "invited" && !isTeamViewer(viewer) && !access.invitedEmails.includes(viewer.email)) {
    return "not_invited";
  }
  return null;
}

export function viewerKeyFor(viewer: ShareViewer | null, anonId: string | null): string {
  return viewer ? `u_${viewer.uid}` : `a_${anonId}`;
}

/* ── record helpers ─────────────────────────────────────────────────── */

export const ACCESS_MODES: AccessMode[] = ["anyone", "signin", "invited"];

/** Reads a stored link defensively so a malformed doc can never widen access. */
export function readShare(data: FirebaseFirestore.DocumentData): ShareRecord {
  const access = (data.access ?? {}) as Partial<ShareAccess>;
  return {
    candidateIds: Array.isArray(data.candidateIds) ? data.candidateIds : [],
    candidateNames: data.candidateNames ?? {},
    purpose: data.purpose === "promotion" ? "promotion" : "matchmaking",
    recipientLabel: data.recipientLabel ?? "",
    recipientNote: data.recipientNote ?? "",
    access: {
      mode: ACCESS_MODES.includes(access.mode as AccessMode) ? (access.mode as AccessMode) : "signin",
      invitedEmails: Array.isArray(access.invitedEmails) ? access.invitedEmails : [],
    },
    audiences: normalizeAudiences(data.audiences ?? {}),
    photoSelection: data.photoSelection ?? {},
    expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt : null,
    maxOpens: data.maxOpens ?? null,
    maxOpensPerViewer: data.maxOpensPerViewer ?? null,
    opens: data.opens ?? 0,
    sessionMinutes: data.sessionMinutes ?? DEFAULT_SESSION_MINUTES,
    questionnaire: {
      enabled: !!data.questionnaire?.enabled,
      questions: Array.isArray(data.questionnaire?.questions) ? data.questionnaire.questions : [],
    },
    viewerCount: data.viewerCount ?? 0,
    responseCount: data.responseCount ?? 0,
    createdBy: data.createdBy ?? "",
    createdByName: data.createdByName ?? "",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
    revokedAt: data.revokedAt instanceof Timestamp ? data.revokedAt : null,
    revokedBy: data.revokedBy ?? null,
    firstOpenedAt: data.firstOpenedAt instanceof Timestamp ? data.firstOpenedAt : null,
    lastOpenedAt: data.lastOpenedAt instanceof Timestamp ? data.lastOpenedAt : null,
  };
}

export function toIso(value: unknown): string | null {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

export function serialiseShare(id: string, share: ShareRecord, nowMs = Date.now()): ShareSummary {
  return {
    id,
    code: shareCode(id),
    purpose: share.purpose,
    candidateIds: share.candidateIds,
    candidateNames: share.candidateNames,
    recipientLabel: share.recipientLabel,
    recipientNote: share.recipientNote,
    access: share.access,
    audiences: share.audiences,
    photoSelection: share.photoSelection,
    expiresAt: toIso(share.expiresAt),
    maxOpens: share.maxOpens,
    maxOpensPerViewer: share.maxOpensPerViewer,
    opens: share.opens,
    sessionMinutes: share.sessionMinutes,
    questionnaire: share.questionnaire,
    viewerCount: share.viewerCount,
    responseCount: share.responseCount,
    createdByName: share.createdByName,
    createdAt: toIso(share.createdAt),
    firstOpenedAt: toIso(share.firstOpenedAt),
    lastOpenedAt: toIso(share.lastOpenedAt),
    revokedAt: toIso(share.revokedAt),
    state: evaluateShare(share, nowMs),
  };
}

/* ── default questionnaire ──────────────────────────────────────────── */

export const QUESTION_SETTINGS_REF = { collection: "app_settings", doc: "share_questionnaire" } as const;

export async function loadDefaultQuestions(): Promise<Question[]> {
  const snap = await adminDb().collection(QUESTION_SETTINGS_REF.collection).doc(QUESTION_SETTINGS_REF.doc).get();
  const parsed = questionsSchema.safeParse(snap.data()?.questions);
  return parsed.success ? parsed.data : DEFAULT_SHARE_QUESTIONS;
}

/* ── cloudinary ─────────────────────────────────────────────────────── */

export interface CloudinaryRef {
  publicId: string;
  deliveryType: string;
  resourceType: string;
}

/**
 * Pulls the public id and delivery type back out of a stored Cloudinary
 * URL so we can re-sign it. Handles both the public `upload` assets this
 * codebase created historically and `authenticated`/`private` ones.
 */
export function parseCloudinaryUrl(url: string): CloudinaryRef | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("cloudinary.com")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    // /<cloud_name>/<resource_type>/<delivery_type>/[transformations]/[v123]/<public_id>.<ext>
    const resourceIdx = parts.findIndex(p => p === "image" || p === "video" || p === "raw");
    if (resourceIdx === -1 || parts.length < resourceIdx + 3) return null;

    const resourceType = parts[resourceIdx];
    const deliveryType = parts[resourceIdx + 1];
    const rest = parts.slice(resourceIdx + 2);

    const startsPublicId = rest.findIndex((p, i) => {
      if (/^v\d+$/.test(p)) return false;
      if (i === 0 && /^[a-z]{1,3}_[^/]+/.test(p) && p.includes(",")) return false;
      return true;
    });
    if (startsPublicId === -1) return null;

    const withExt = rest.slice(startsPublicId).join("/");
    const publicId = withExt.replace(/\.[a-zA-Z0-9]+$/, "");
    if (!publicId) return null;

    return { publicId: decodeURIComponent(publicId), deliveryType, resourceType };
  } catch {
    return null;
  }
}

export interface WatermarkOptions {
  /** Who this copy was released to — stamped along the bottom edge. */
  label: string;
  /** Short mark repeated across the photo. Kept narrow on purpose — see below. */
  tile: string;
  /** "card" crops to a consistent portrait; "full" keeps the whole photo. */
  variant?: "card" | "full";
}

function overlayText(text: string, max: number): string {
  // Strip characters that break a Cloudinary text layer; the SDK URL-encodes
  // the rest itself, and encoding here too would render literal "%20".
  return text.replace(/[,/%]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * Signed, watermarked, server-only Cloudinary URL. It is fetched by our
 * proxy and never handed to the browser.
 *
 * The tiled mark is deliberately small: Cloudinary widens the canvas to fit a
 * text layer wider than the image — which rendered as white bars beside the
 * photo — and fl_no_overflow does not apply to tiled layers.
 */
export function buildWatermarkedUrl(ref: CloudinaryRef, opts: WatermarkOptions): string {
  const label = overlayText(opts.label, 64);
  const tile = overlayText(opts.tile, 34);
  const base =
    opts.variant === "full"
      ? { width: 1400, crop: "limit", quality: "auto:good", fetch_format: "jpg" }
      : { width: 900, height: 1200, crop: "fill", gravity: "auto", quality: "auto:good", fetch_format: "jpg" };

  return cloudinary.url(ref.publicId, {
    resource_type: ref.resourceType,
    type: ref.deliveryType,
    sign_url: true,
    secure: true,
    transformation: [
      base,
      {
        overlay: { font_family: "Arial", font_size: 20, font_weight: "bold", text: tile },
        color: "#FFFFFF",
        opacity: 10,
        angle: -30,
        flags: "tiled",
      },
      {
        overlay: { font_family: "Arial", font_size: 22, font_weight: "bold", text: label },
        color: "#FFFFFF",
        opacity: 45,
        gravity: "south_east",
        x: 18,
        y: 16,
        flags: "no_overflow",
      },
    ],
  });
}
