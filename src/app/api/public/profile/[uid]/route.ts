import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const PUBLIC_FIELDS = new Set([
  "fullName","age","gender","location","occupation","educations",
  "aboutMe","photoUrls","photoVisibility",
  "smokingStatus","alcoholUse","exerciseFrequency","socialPreference",
  "quranReading","islamicKnowledgeLevel","halalLifestyleStrictness","viewsOnMixedSocializing",
  "religion","religiousPracticeLevel","prayerHabit","hijab","beard","polygamyView","waliAvailability",
  "maritalStatus","maritalTimeline","weddingPreference","financialManagementStyle","decisionMakingStyle",
  "roleExpectationsHusband","roleExpectationsWife",
  "siblingCount","childOrder","maleSiblingCount","femaleSiblingCount",
  "childrenCount","childrenLivingWith","childCustody",
  "waliName","waliRelationship",
  "openToTaaruf","personStatus","publicPhotosVisible",
  "height","weight","dateOfBirth","nationality","ethnicity","bloodType",
  "birthPlace","currentlyLivingWith","ownHealthCondition",
  "preferredMinAge","preferredMaxAge","preferredReligion","prefReligionLevel",
  "prefHijabBeard","prefMazhab","preferredEducationLevel","prefPreviousStatus",
  "openToDivorcedOrWidowed","openToDifferentEthnicity","preferredLocationOfSpouse",
  "prefDomicile","prefWorkStatus","prefJobField","prefMinIncome","prefMinHeight",
  "prefMaxHeight","prefBodyType","prefChildrenFromPrevious","prefMaxChildren",
  "prefLivingWithFamily","prefPersonalityType","prefSmokingAcceptance","prefWifeCareer",
  "prefHealthCondition","preferredPersonalityTraits","physicalPreferences","spouseDealBreakers",
]);

export async function GET(_req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  try {
    const snap = await adminDb().collection("candidate_intake").doc(uid).get();
    if (!snap.exists) return NextResponse.json({ available: false });

    const raw = snap.data() as Record<string, unknown>;
    if (!raw.profileLinkActive) return NextResponse.json({ available: false });

    const safe: Record<string, unknown> = {};
    for (const key of Array.from(PUBLIC_FIELDS)) {
      if (key in raw) safe[key] = raw[key];
    }

    return NextResponse.json({ available: true, data: safe });
  } catch {
    return NextResponse.json({ available: false }, { status: 500 });
  }
}
