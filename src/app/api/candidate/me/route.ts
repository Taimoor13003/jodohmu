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
    const existing = snap.data();
    const lockedFields: string[] = Array.isArray(existing?.lockedFields)
      ? (existing!.lockedFields as string[])
      : [];

    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (ALL_WRITABLE.has(k) && !lockedFields.includes(k)) safe[k] = v;
    }

    // Candidates may manage their own photos, capped at 5, unless admin-locked
    if (
      Array.isArray(body.photoUrls) &&
      !lockedFields.includes("photoUrls") &&
      (body.photoUrls as unknown[]).every((u) => typeof u === "string")
    ) {
      const photoUrls = body.photoUrls as string[];
      if (photoUrls.length > 5) {
        return NextResponse.json({ error: "Max 5 photos" }, { status: 400 });
      }
      safe.photoUrls = photoUrls;
    }

    if (!Object.keys(safe).length) return NextResponse.json({ error: "No writable fields" }, { status: 400 });

    // First time a lead supplies name + phone + gender, mark them ready for a
    // discovery call and notify the ops team so they can reach out via WhatsApp.
    const currentStatus = existing?.personStatus;
    const completingOnboarding =
      (!currentStatus || currentStatus === "new_lead") &&
      !!safe.fullName && !!safe.whatsappNumber && !!safe.gender;

    if (completingOnboarding) {
      safe.personStatus = "awaiting_discovery_call";
      safe.discoveryCallDone = false;
      safe.onboardingCompletedAt = FieldValue.serverTimestamp();
    }

    await adminDb().collection("candidate_intake").doc(decoded.uid).set(
      { ...safe, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    if (completingOnboarding) {
      const phoneDigits = String(safe.whatsappNumber).replace(/[^\d+]/g, "").replace(/^\+/, "");
      try {
        await adminDb().collection("admin_notifications").add({
          type: "discovery_call_pending",
          uid: decoded.uid,
          name: safe.fullName,
          phone: safe.whatsappNumber,
          waLink: `https://wa.me/${phoneDigits}`,
          gender: safe.gender,
          age: safe.age ?? null,
          city: safe.location ?? null,
          email: existing?.email ?? null,
          read: false,
          createdAt: FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error("admin notification write failed", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
