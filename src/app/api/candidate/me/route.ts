import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const snap = await adminDb().collection("candidate_intake").doc(decoded.uid).get();
    return NextResponse.json({ uid: decoded.uid, data: snap.exists ? snap.data() : null });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* PATCH — candidate updates their own profile fields; locked fields (set by admin) are skipped */
const ALL_WRITABLE = new Set([
  // settings
  "profileLinkActive", "publicPhotosVisible",
  // about
  "aboutMe",
  // personal
  "fullName", "age", "gender", "dateOfBirth", "nationality", "ethnicity",
  "height", "weight", "bloodType", "birthPlace", "currentlyLivingWith",
  "ownHealthCondition", "whatsappNumber", "location",
  // career
  "occupation", "employmentStatus", "incomeRange", "propertyStatus", "hasDebts",
  // lifestyle
  "smokingStatus", "alcoholUse", "exerciseFrequency", "socialPreference",
  // values
  "quranReading", "islamicKnowledgeLevel", "halalLifestyleStrictness",
  "viewsOnMixedSocializing", "openToPolygamy",
  // religion
  "religion", "religiousPracticeLevel", "prayerHabit", "hijab", "beard",
  "waliAvailability", "islamicOrganization", "churchAttendance", "baptized",
  "bibleReading", "religionNotes",
  // marriage
  "maritalTimeline", "weddingPreference", "financialManagementStyle", "decisionMakingStyle",
  // role expectations
  "myRoleExpectation", "roleExpectationsHusband", "roleExpectationsWife",
  // family
  "siblingCount", "childOrder", "maleSiblingCount", "femaleSiblingCount",
  "fatherAlive", "motherAlive", "hasChildren", "childrenCount", "childCustody",
  "childrenLivingWith", "childrenNotes", "waliName", "waliRelationship", "waliContact",
  // section update timestamps (auto-set by client on save)
  "maritalGoalsUpdatedAt",
  // ideal partner
  "preferredMinAge", "preferredMaxAge", "preferredReligion", "prefReligionLevel",
  "preferredEducationLevel", "prefPreviousStatus", "preferredLocationOfSpouse",
  "prefMinHeight", "prefMaxHeight", "openToDifferentEthnicity", "prefBodyType",
  "physicalPreferences", "preferredPersonalityTraits", "spouseDealBreakers",
]);

export async function PATCH(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const body = await req.json() as Record<string, unknown>;

    // Read lockedFields from existing doc
    const snap = await adminDb().collection("candidate_intake").doc(decoded.uid).get();
    const lockedFields: string[] = Array.isArray(snap.data()?.lockedFields)
      ? (snap.data()!.lockedFields as string[])
      : [];

    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (ALL_WRITABLE.has(k) && !lockedFields.includes(k)) safe[k] = v;
    }
    if (!Object.keys(safe).length) return NextResponse.json({ error: "No writable fields" }, { status: 400 });

    await adminDb().collection("candidate_intake").doc(decoded.uid).set(
      { ...safe, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
