"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Upload, X as XIcon } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "admin" | "worker" | "candidate";

interface UserRow {
  uid: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date | null;
}

interface CandidateDetails {
  gender: string;
  dateOfBirth: string;
  age: string;
  phone: string;
  phoneCountryCode: string;
  location: string;
  nationality: string;
  nationalityCustom: string;
  ethnicity: string;
  ethnicityCustom: string;
  height: string;
  weight: string;

  maritalStatus: string;
  previousMarriageCount: string;
  divorceYear: string;
  divorceInitiatedBy: string;
  previousDivorceReason: string;
  timeToHealFromDivorce: string;
  childrenFromPreviousMarriage: string;
  custodyArrangement: string;
  coParentingRelationship: string;
  lessonsFromPastRelationships: string;

  religion: string;
  religiousPracticeLevel: string;
  viewsOnMixedSocializing: string;

  // Muslim
  prayerHabit: string;
  quranReading: string;
  hijab: string;
  beard: string;
  islamicKnowledgeLevel: string;
  halalLifestyleStrictness: string;
  waliAvailability: string;
  maharExpectation: string;
  maharBudget: string;
  polygamyView: string;

  // Christian
  churchAttendance: string;
  isBaptized: string;
  biblicalKnowledge: string;
  pastorReference: string;

  educationLevel: string;
  fieldOfStudy: string;
  occupation: string;
  employmentStatus: string;
  incomeRange: string;
  financialReadiness: string;
  careerAmbition: string;
  willingToRelocate: string;
  willingToRelocateDetails: string;

  propertyStatus: string;
  livingSituation: string;
  hasDebts: string;
  financialGoalsAfterMarriage: string;
  savingsHabits: string;

  parentsMaritalStatus: string;
  relationshipWithParents: string;
  numberOfSiblings: string;
  familyInvolvement: string;
  familyReligiousBackground: string;
  familyExpectationsOfSpouse: string;
  livingArrangementAfterMarriage: string;

  introvertExtrovert: string;
  personalityType: string;
  conflictHandling: string;
  loveLanguage: string;
  attachmentStyle: string;
  emotionalMaturity: string;
  strengthsInMarriage: string;
  areasOfPersonalGrowth: string;
  dealBreakers: string;
  biggestFearAboutMarriage: string;
  mentalHealthNotes: string;

  preferredCommunicationFrequency: string;
  aloneTimeNeeds: string;
  lovePracticalExpression: string;
  digitalHabits: string;

  whyMarryNow: string;
  maritalTimeline: string;
  weddingPreference: string;
  financialManagementStyle: string;
  decisionMakingStyle: string;
  viewsOnWorkingSpouse: string;
  roleExpectationsHusband: string;
  roleExpectationsWife: string;

  desireForChildren: string;
  numberOfChildrenDesired: string;
  parentingStyle: string;
  educationPlanForChildren: string;
  childrenTimeline: string;

  bloodType: string;
  smokingStatus: string;
  alcoholUse: string;
  drugUse: string;
  exerciseFrequency: string;
  sleepSchedule: string;
  chronicConditions: string;
  hasDisabilityStatus: string;
  disabilityDetails: string;
  sportsLiked: string;
  sportsGoodAt: string;

  socialPreference: string;
  dietaryRestrictions: string;
  travelInterest: string;
  hobbiesAndInterests: string;
  dailyRoutineDescription: string;
  petsRelationship: string;
  volunteerWork: string;

  languagesSpoken: string;
  passportHolder: string;

  preferredMinAge: string;
  preferredMaxAge: string;
  preferredEducationLevel: string;
  preferredReligion: string;
  preferredPersonalityTraits: string;
  openToDivorcedOrWidowed: string;
  openToDivorcedOrWidowedPriority: string;
  openToDifferentEthnicity: string;
  preferredLocationOfSpouse: string;
  physicalPreferences: string;
  spouseDealBreakers: string;

  longTermLifeGoals: string;

  religiousLeaderReference: string;
  familyMemberReference: string;
  friendReference: string;

  salesLeadNotes: string;
  profileMakerNotes: string;
  backgroundCheckerNotes: string;
  imamNotes: string;
  receptionistNotes: string;
  psychologistNotes: string;
  emotionalReadinessAssessment: string;
  internalTeamNotes: string;
}

const EMPTY: CandidateDetails = {
  gender: "", dateOfBirth: "", age: "", phone: "", phoneCountryCode: "+62",
  location: "", nationality: "", nationalityCustom: "", ethnicity: "", ethnicityCustom: "",
  height: "", weight: "",
  maritalStatus: "", previousMarriageCount: "", divorceYear: "", divorceInitiatedBy: "",
  previousDivorceReason: "", timeToHealFromDivorce: "", childrenFromPreviousMarriage: "",
  custodyArrangement: "", coParentingRelationship: "", lessonsFromPastRelationships: "",
  religion: "", religiousPracticeLevel: "", viewsOnMixedSocializing: "",
  prayerHabit: "", quranReading: "", hijab: "", beard: "", islamicKnowledgeLevel: "",
  halalLifestyleStrictness: "", waliAvailability: "", maharExpectation: "", maharBudget: "",
  polygamyView: "",
  churchAttendance: "", isBaptized: "", biblicalKnowledge: "", pastorReference: "",
  educationLevel: "", fieldOfStudy: "", occupation: "", employmentStatus: "",
  incomeRange: "", financialReadiness: "", careerAmbition: "", willingToRelocate: "",
  willingToRelocateDetails: "",
  propertyStatus: "", livingSituation: "", hasDebts: "", financialGoalsAfterMarriage: "",
  savingsHabits: "",
  parentsMaritalStatus: "", relationshipWithParents: "", numberOfSiblings: "",
  familyInvolvement: "", familyReligiousBackground: "", familyExpectationsOfSpouse: "",
  livingArrangementAfterMarriage: "",
  introvertExtrovert: "", personalityType: "", conflictHandling: "", loveLanguage: "",
  attachmentStyle: "", emotionalMaturity: "", strengthsInMarriage: "", areasOfPersonalGrowth: "",
  dealBreakers: "", biggestFearAboutMarriage: "", mentalHealthNotes: "",
  preferredCommunicationFrequency: "", aloneTimeNeeds: "", lovePracticalExpression: "",
  digitalHabits: "",
  whyMarryNow: "", maritalTimeline: "", weddingPreference: "", financialManagementStyle: "",
  decisionMakingStyle: "", viewsOnWorkingSpouse: "", roleExpectationsHusband: "",
  roleExpectationsWife: "",
  desireForChildren: "", numberOfChildrenDesired: "", parentingStyle: "",
  educationPlanForChildren: "", childrenTimeline: "",
  bloodType: "", smokingStatus: "", alcoholUse: "", drugUse: "", exerciseFrequency: "",
  sleepSchedule: "", chronicConditions: "", hasDisabilityStatus: "", disabilityDetails: "",
  sportsLiked: "", sportsGoodAt: "",
  socialPreference: "", dietaryRestrictions: "", travelInterest: "", hobbiesAndInterests: "",
  dailyRoutineDescription: "", petsRelationship: "", volunteerWork: "",
  languagesSpoken: "", passportHolder: "",
  preferredMinAge: "", preferredMaxAge: "", preferredEducationLevel: "", preferredReligion: "",
  preferredPersonalityTraits: "", openToDivorcedOrWidowed: "",
  openToDivorcedOrWidowedPriority: "", openToDifferentEthnicity: "",
  preferredLocationOfSpouse: "", physicalPreferences: "", spouseDealBreakers: "",
  longTermLifeGoals: "",
  religiousLeaderReference: "", familyMemberReference: "", friendReference: "",
  salesLeadNotes: "", profileMakerNotes: "", backgroundCheckerNotes: "", imamNotes: "",
  receptionistNotes: "", psychologistNotes: "", emotionalReadinessAssessment: "",
  internalTeamNotes: "",
};

// ─── Static data ─────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "+62", label: "🇮🇩 +62 Indonesia" },
  { code: "+60", label: "🇲🇾 +60 Malaysia" },
  { code: "+65", label: "🇸🇬 +65 Singapore" },
  { code: "+63", label: "🇵🇭 +63 Philippines" },
  { code: "+66", label: "🇹🇭 +66 Thailand" },
  { code: "+84", label: "🇻🇳 +84 Vietnam" },
  { code: "+673", label: "🇧🇳 +673 Brunei" },
  { code: "+92", label: "🇵🇰 +92 Pakistan" },
  { code: "+91", label: "🇮🇳 +91 India" },
  { code: "+880", label: "🇧🇩 +880 Bangladesh" },
  { code: "+94", label: "🇱🇰 +94 Sri Lanka" },
  { code: "+966", label: "🇸🇦 +966 Saudi Arabia" },
  { code: "+971", label: "🇦🇪 +971 UAE" },
  { code: "+965", label: "🇰🇼 +965 Kuwait" },
  { code: "+974", label: "🇶🇦 +974 Qatar" },
  { code: "+973", label: "🇧🇭 +973 Bahrain" },
  { code: "+968", label: "🇴🇲 +968 Oman" },
  { code: "+962", label: "🇯🇴 +962 Jordan" },
  { code: "+961", label: "🇱🇧 +961 Lebanon" },
  { code: "+20", label: "🇪🇬 +20 Egypt" },
  { code: "+212", label: "🇲🇦 +212 Morocco" },
  { code: "+90", label: "🇹🇷 +90 Turkey" },
  { code: "+1", label: "🇺🇸 +1 USA / Canada" },
  { code: "+44", label: "🇬🇧 +44 UK" },
  { code: "+61", label: "🇦🇺 +61 Australia" },
  { code: "+31", label: "🇳🇱 +31 Netherlands" },
  { code: "+49", label: "🇩🇪 +49 Germany" },
  { code: "+86", label: "🇨🇳 +86 China" },
  { code: "+81", label: "🇯🇵 +81 Japan" },
  { code: "+82", label: "🇰🇷 +82 South Korea" },
  { code: "+234", label: "🇳🇬 +234 Nigeria" },
  { code: "+27", label: "🇿🇦 +27 South Africa" },
];

const NATIONALITIES = [
  "Indonesian", "Malaysian", "Singaporean", "Filipino", "Vietnamese", "Thai",
  "Bruneian", "Cambodian", "Burmese", "Pakistani", "Indian", "Bangladeshi",
  "Sri Lankan", "Saudi Arabian", "Emirati", "Kuwaiti", "Qatari", "Bahraini",
  "Omani", "Jordanian", "Lebanese", "Egyptian", "Moroccan", "Libyan",
  "Sudanese", "Yemeni", "Syrian", "Iraqi", "Iranian", "Turkish", "American",
  "British", "Australian", "Canadian", "Dutch", "German", "French", "Chinese",
  "Japanese", "Korean", "Nigerian", "South African", "Other",
];

const INDONESIAN_ETHNICITIES = [
  "Javanese", "Sundanese", "Batak Toba", "Batak Karo", "Batak Mandailing",
  "Minangkabau (Minang)", "Betawi", "Bugis", "Makassar", "Acehnese",
  "Banjar", "Dayak", "Sasak", "Balinese", "Madurese", "Palembang",
  "Lampung", "Ambonese", "Minahasa", "Gorontalo", "Toraja", "Mandar",
  "Papua", "Chinese-Indonesian", "Arab-Indonesian", "Indian-Indonesian",
  "Malay", "Mixed", "Other",
];

const ROLE_BADGE: Record<Role, string> = {
  admin: "bg-[#0b3a86]/10 text-[#0b3a86]",
  worker: "bg-amber-100 text-amber-700",
  candidate: "bg-[#9B2242]/10 text-[#9B2242]",
};

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function Sec({ title, note }: { title: string; note?: string }) {
  return (
    <div className="col-span-2 pt-5 pb-1 border-b border-[#0b3a86]/10">
      <p className="text-xs font-bold text-[#0b3a86] uppercase tracking-widest">{title}</p>
      {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
    </div>
  );
}

function F({ label, note, wide, children }: {
  label: string; note?: string; wide?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={`${wide ? "col-span-2" : ""} space-y-1.5`}>
      <label className="text-sm font-semibold text-[#0b3a86]">{label}</label>
      {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
      {children}
    </div>
  );
}

function Sel({ value, onChange, placeholder, options }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MultiCheck({ label, note, wide, options, value, onChange }: {
  label: string; note?: string; wide?: boolean;
  options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void;
}) {
  const selected = value ? value.split(",") : [];
  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v];
    onChange(next.join(","));
  };
  return (
    <div className={`${wide ? "col-span-2" : ""} space-y-1.5`}>
      <label className="text-sm font-semibold text-[#0b3a86]">{label}</label>
      {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
      <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-input bg-background p-3">
        {options.map(o => (
          <label key={o.value} className="flex items-start gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={selected.includes(o.value)}
              onChange={() => toggle(o.value)}
              className="mt-0.5 h-4 w-4 rounded accent-[#0b3a86]"
            />
            <span className="leading-snug">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formRole, setFormRole] = useState<Role>("candidate");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [basic, setBasic] = useState({ name: "", email: "", password: "", note: "" });
  const [d, setD] = useState<CandidateDetails>(EMPTY);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const MAX_PHOTOS = 10;

  // Helper setters
  const set = (field: keyof CandidateDetails) => (v: string) =>
    setD(prev => ({ ...prev, [field]: v }));
  const inp = (field: keyof CandidateDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setD(prev => ({ ...prev, [field]: e.target.value }));

  // Derived flags
  const isFemale     = d.gender === "female";
  const isMale       = d.gender === "male";
  const isMuslim     = d.religion === "islam";
  const isChristian  = d.religion === "christian_protestant" || d.religion === "christian_catholic";
  const isDivorced   = d.maritalStatus === "divorced";
  const isWidowed    = d.maritalStatus === "widowed";
  const wasMarried   = isDivorced || isWidowed;
  const hadChildren  = wasMarried && d.childrenFromPreviousMarriage && d.childrenFromPreviousMarriage !== "none";
  const willRelocate = d.willingToRelocate === "yes_anywhere" || d.willingToRelocate === "yes_open";
  const hasDisability = d.hasDisabilityStatus === "yes";
  const multiDivorcedWidowed = d.openToDivorcedOrWidowed.split(",").filter(Boolean).length > 1;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "user_roles"), orderBy("createdAt", "desc")));
      setUsers(snap.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.name ?? "—",
          email: data.email ?? "—",
          role: data.role ?? "candidate",
          createdAt: data.createdAt?.toDate() ?? null,
        };
      }));
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (role === "admin") fetchUsers(); }, [role, fetchUsers]);

  if (role !== "admin") {
    return (
      <div className="container mx-auto max-w-3xl p-6">
        <Card><CardHeader><CardTitle>Unauthorized</CardTitle></CardHeader>
          <CardContent>You need admin access to view this page.</CardContent></Card>
      </div>
    );
  }

  const handlePhotoUpload = async (file: File) => {
    if (photoUrls.length >= MAX_PHOTOS) return;
    setPhotoUploading(true);
    try {
      const current = auth.currentUser;
      if (!current) return;
      const token = await current.getIdToken();
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "candidates");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setPhotoUrls(prev => [...prev, data.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setPhotoUploading(false);
    }
  };

  const reset = () => {
    setFormRole("candidate");
    setBasic({ name: "", email: "", password: "", note: "" });
    setD(EMPTY);
    setPhotoUrls([]);
    setStatus("idle");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const current = auth.currentUser;
      if (!current) throw new Error("Not authenticated");
      const token = await current.getIdToken();
      const payload = formRole === "candidate"
        ? { role: formRole, name: basic.name, email: basic.email, password: basic.password, details: { ...d, photoUrls } }
        : { role: formRole, name: basic.name, email: basic.email, password: basic.password, details: { note: basic.note } };

      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create user");
      }
      setStatus("success");
      await fetchUsers();
      setTimeout(() => { setDialogOpen(false); reset(); }, 1200);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0b3a86]">Users</h1>
          <p className="text-muted-foreground">All registered users across all roles.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) reset(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-[#9B2242] to-[#0b3a86] text-white gap-2">
              <UserPlus className="h-4 w-4" /> Create user
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#0b3a86]">Create User</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-2 pt-2">

              {/* ── Account ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Account" />
                <F label="Role">
                  <Sel value={formRole} onChange={v => setFormRole(v as Role)} placeholder="Select role"
                    options={[{ value: "candidate", label: "Candidate" }, { value: "worker", label: "Worker" }, { value: "admin", label: "Admin" }]} />
                </F>
                <F label="Full Name">
                  <Input className="h-9 text-sm" value={basic.name} onChange={e => setBasic({ ...basic, name: e.target.value })} required placeholder="Full name" />
                </F>
                <F label="Email">
                  <Input className="h-9 text-sm" type="email" value={basic.email} onChange={e => setBasic({ ...basic, email: e.target.value })} required placeholder="user@example.com" />
                </F>
                <F label="Temporary Password">
                  <Input className="h-9 text-sm" type="password" value={basic.password} onChange={e => setBasic({ ...basic, password: e.target.value })} required placeholder="Temporary password" />
                </F>
              </div>

              {formRole !== "candidate" ? (
                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-semibold text-[#0b3a86]">Note</label>
                  <Textarea value={basic.note} onChange={e => setBasic({ ...basic, note: e.target.value })} placeholder="Optional notes" />
                </div>
              ) : (<>

              {/* ── Personal ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Personal Information" />

                {/* Photo upload */}
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#0b3a86]">Photos ({photoUrls.length}/{MAX_PHOTOS})</label>
                    <p className="text-[11px] text-muted-foreground">Max {MAX_PHOTOS} photos — auto-resized to under 500KB</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {photoUrls.map((url, i) => (
                      <div key={url} className="relative h-20 w-20 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Photo ${i + 1}`} className="h-20 w-20 rounded-xl object-cover border border-[#0b3a86]/15" />
                        <button type="button"
                          onClick={() => setPhotoUrls(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 rounded-full bg-[#9B2242] text-white p-0.5 shadow">
                          <XIcon className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {photoUrls.length < MAX_PHOTOS && (
                      <label className="h-20 w-20 shrink-0 cursor-pointer rounded-xl border-2 border-dashed border-[#0b3a86]/25 flex flex-col items-center justify-center gap-1 bg-[#f8f9ff] hover:bg-[#eef1fb] hover:border-[#0b3a86]/40 transition-colors">
                        {photoUploading ? (
                          <span className="text-[10px] text-[#0b3a86]/60 font-medium">Uploading…</span>
                        ) : (<>
                          <Upload className="h-5 w-5 text-[#0b3a86]/40" />
                          <span className="text-[10px] text-[#0b3a86]/50 font-medium">Add photo</span>
                        </>)}
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="hidden"
                          disabled={photoUploading}
                          onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); e.target.value = ""; }} />
                      </label>
                    )}
                  </div>
                </div>

                <F label="Gender">
                  <Sel value={d.gender} onChange={set("gender")} placeholder="Select"
                    options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} />
                </F>
                <F label="Date of Birth">
                  <Input className="h-9 text-sm" type="date" value={d.dateOfBirth} onChange={inp("dateOfBirth")} />
                </F>
                <F label="Age">
                  <Input className="h-9 text-sm" type="number" value={d.age} onChange={inp("age")} placeholder="e.g. 27" min={18} max={70} />
                </F>

                {/* Phone with country code */}
                <F label="Phone / WhatsApp">
                  <div className="flex gap-2">
                    <Select value={d.phoneCountryCode} onValueChange={set("phoneCountryCode")}>
                      <SelectTrigger className="h-9 text-sm w-44 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input className="h-9 text-sm" value={d.phone} onChange={inp("phone")} placeholder="8xx xxxx xxxx" />
                  </div>
                </F>

                <F label="City / Location">
                  <Input className="h-9 text-sm" value={d.location} onChange={inp("location")} placeholder="Bandung, West Java" />
                </F>

                {/* Nationality with "Other" option */}
                <F label="Nationality">
                  <Sel value={d.nationality} onChange={set("nationality")} placeholder="Select"
                    options={NATIONALITIES.map(n => ({ value: n.toLowerCase().replace(/ /g, "_"), label: n }))} />
                </F>
                {d.nationality === "other" && (
                  <F label="Specify Nationality">
                    <Input className="h-9 text-sm" value={d.nationalityCustom} onChange={inp("nationalityCustom")} placeholder="Enter nationality" />
                  </F>
                )}

                {/* Ethnicity with "Other" option */}
                <F label="Ethnicity / Background">
                  <Sel value={d.ethnicity} onChange={set("ethnicity")} placeholder="Select"
                    options={INDONESIAN_ETHNICITIES.map(e => ({ value: e.toLowerCase().replace(/ /g, "_").replace(/[()]/g, ""), label: e }))} />
                </F>
                {d.ethnicity === "other" && (
                  <F label="Specify Ethnicity">
                    <Input className="h-9 text-sm" value={d.ethnicityCustom} onChange={inp("ethnicityCustom")} placeholder="Enter ethnicity" />
                  </F>
                )}

                <F label="Height (cm)">
                  <Input className="h-9 text-sm" type="number" value={d.height} onChange={inp("height")} placeholder="e.g. 165" />
                </F>
                <F label="Weight (kg)">
                  <Input className="h-9 text-sm" type="number" value={d.weight} onChange={inp("weight")} placeholder="e.g. 58" />
                </F>
              </div>

              {/* ── Marital History ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Marital History" />

                <F label="Current Marital Status">
                  <Sel value={d.maritalStatus} onChange={set("maritalStatus")} placeholder="Select"
                    options={[
                      { value: "single", label: "Single — never married" },
                      { value: "divorced", label: "Divorced" },
                      { value: "widowed", label: "Widowed" },
                    ]} />
                </F>

                {/* Only show if previously married */}
                {wasMarried && (
                  <F label="Number of Previous Marriages">
                    <Sel value={d.previousMarriageCount} onChange={set("previousMarriageCount")} placeholder="Select"
                      options={[{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3+", label: "3 or more" }]} />
                  </F>
                )}

                {/* Divorce specific */}
                {isDivorced && (<>
                  <F label="Year of Divorce">
                    <Input className="h-9 text-sm" type="number" value={d.divorceYear} onChange={inp("divorceYear")} placeholder="e.g. 2021" min={1990} max={2025} />
                  </F>
                  <F label="Who Initiated the Divorce">
                    <Sel value={d.divorceInitiatedBy} onChange={set("divorceInitiatedBy")} placeholder="Select"
                      options={[
                        { value: "i_initiated", label: "I initiated it" },
                        { value: "spouse_initiated", label: "My spouse initiated it" },
                        { value: "mutual", label: "Mutual decision" },
                      ]} />
                  </F>
                  <F label="Main Reason for Divorce" wide note="Honest — helps us understand and match better">
                    <Textarea className="text-sm" rows={2} value={d.previousDivorceReason} onChange={inp("previousDivorceReason")} placeholder="e.g. incompatibility, communication breakdown, financial issues..." />
                  </F>
                  <F label="How Long to Heal / Move On">
                    <Sel value={d.timeToHealFromDivorce} onChange={set("timeToHealFromDivorce")} placeholder="Select"
                      options={[
                        { value: "less_6m", label: "Less than 6 months" },
                        { value: "6m_1y", label: "6 months – 1 year" },
                        { value: "1y_2y", label: "1–2 years" },
                        { value: "2y_plus", label: "More than 2 years" },
                        { value: "still_healing", label: "Still working through it" },
                      ]} />
                  </F>
                </>)}

                {/* Widowed context */}
                {isWidowed && (
                  <F label="Brief Context (optional)" wide note="Only share what they are comfortable with">
                    <Textarea className="text-sm" rows={2} value={d.previousDivorceReason} onChange={inp("previousDivorceReason")} placeholder="How long ago, any relevant context..." />
                  </F>
                )}

                {/* Children from previous marriage */}
                {wasMarried && (<>
                  <F label="Children from Previous Marriage">
                    <Sel value={d.childrenFromPreviousMarriage} onChange={set("childrenFromPreviousMarriage")} placeholder="Select"
                      options={[
                        { value: "none", label: "None" }, { value: "1", label: "1" },
                        { value: "2", label: "2" }, { value: "3+", label: "3 or more" },
                      ]} />
                  </F>
                  {hadChildren && (
                    <F label="Custody Arrangement">
                      <Sel value={d.custodyArrangement} onChange={set("custodyArrangement")} placeholder="Select"
                        options={[
                          { value: "full_mine", label: "Full custody — children live with me" },
                          { value: "shared", label: "Shared custody" },
                          { value: "ex_has_custody", label: "Ex-spouse has custody" },
                          { value: "children_adults", label: "Children are adults" },
                        ]} />
                    </F>
                  )}
                  <F label="Relationship with Ex-Spouse">
                    <Sel value={d.coParentingRelationship} onChange={set("coParentingRelationship")} placeholder="Select"
                      options={[
                        { value: "amicable", label: "Amicable — civil and cooperative" },
                        { value: "minimal", label: "Minimal contact — only when necessary" },
                        { value: "no_contact", label: "No contact" },
                        { value: "difficult", label: "Difficult / ongoing conflict" },
                        { value: "na", label: "N/A — no children" },
                      ]} />
                  </F>
                </>)}

                <F label="Lessons from Past Relationships" wide>
                  <Textarea className="text-sm" rows={2} value={d.lessonsFromPastRelationships} onChange={inp("lessonsFromPastRelationships")} placeholder="What did they grow from? What would they do differently?" />
                </F>
              </div>

              {/* ── Religious Profile ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Religious & Spiritual Profile" />

                <F label="Religion">
                  <Sel value={d.religion} onChange={set("religion")} placeholder="Select"
                    options={[
                      { value: "islam", label: "Islam" },
                      { value: "christian_protestant", label: "Christian — Protestant" },
                      { value: "christian_catholic", label: "Christian — Catholic" },
                      { value: "hindu", label: "Hindu" },
                      { value: "buddhist", label: "Buddhist" },
                      { value: "other", label: "Other" },
                    ]} />
                </F>
                <F label="Overall Level of Religious Practice">
                  <Sel value={d.religiousPracticeLevel} onChange={set("religiousPracticeLevel")} placeholder="Select"
                    options={[
                      { value: "very_devout", label: "Very devout — religion guides all decisions" },
                      { value: "practicing", label: "Practicing — regularly observant" },
                      { value: "moderate", label: "Moderate — some practices, personal faith" },
                      { value: "cultural", label: "Cultural — religious by identity, not practice" },
                      { value: "spiritual", label: "Spiritual but not formally religious" },
                    ]} />
                </F>
                <F label="Views on Mixed-Gender Socializing">
                  <Sel value={d.viewsOnMixedSocializing} onChange={set("viewsOnMixedSocializing")} placeholder="Select"
                    options={[
                      { value: "not_comfortable", label: "Not comfortable — prefers separation" },
                      { value: "limited_professional", label: "Limited — professional settings only" },
                      { value: "comfortable", label: "Comfortable in mixed settings" },
                      { value: "no_preference", label: "No preference" },
                    ]} />
                </F>

                {/* Muslim-specific */}
                {isMuslim && (<>
                  <F label="Prayer Habit (Salat)">
                    <Sel value={d.prayerHabit} onChange={set("prayerHabit")} placeholder="Select"
                      options={[
                        { value: "5x_always", label: "5× daily — always, on time" },
                        { value: "5x_mostly", label: "5× daily — mostly" },
                        { value: "sometimes", label: "Sometimes" },
                        { value: "friday_only", label: "Friday only (men)" },
                        { value: "rarely", label: "Rarely" },
                      ]} />
                  </F>
                  <F label="Quran Reading">
                    <Sel value={d.quranReading} onChange={set("quranReading")} placeholder="Select"
                      options={[
                        { value: "fluent_tajweed", label: "Fluent with Tajweed" },
                        { value: "can_read", label: "Can read — improving" },
                        { value: "learning", label: "Still learning" },
                        { value: "cannot_read", label: "Cannot read yet" },
                      ]} />
                  </F>
                  {/* Gender-specific Islamic appearance */}
                  {isFemale && (
                    <F label="Hijab">
                      <Sel value={d.hijab} onChange={set("hijab")} placeholder="Select"
                        options={[
                          { value: "yes_always", label: "Yes — always" },
                          { value: "yes_in_progress", label: "In progress / working toward" },
                          { value: "no", label: "No" },
                        ]} />
                    </F>
                  )}
                  {isMale && (
                    <F label="Beard">
                      <Sel value={d.beard} onChange={set("beard")} placeholder="Select"
                        options={[
                          { value: "yes_full", label: "Yes — full beard" },
                          { value: "yes_trimmed", label: "Yes — trimmed / short" },
                          { value: "sometimes", label: "Sometimes" },
                          { value: "no", label: "No beard" },
                        ]} />
                    </F>
                  )}
                  <F label="Islamic Knowledge Level">
                    <Sel value={d.islamicKnowledgeLevel} onChange={set("islamicKnowledgeLevel")} placeholder="Select"
                      options={[
                        { value: "advanced", label: "Advanced — pesantren / Islamic university" },
                        { value: "good", label: "Good — self-study, regular classes" },
                        { value: "basic", label: "Basic" },
                        { value: "limited", label: "Limited — still learning" },
                      ]} />
                  </F>
                  <F label="Halal Lifestyle Strictness">
                    <Sel value={d.halalLifestyleStrictness} onChange={set("halalLifestyleStrictness")} placeholder="Select"
                      options={[
                        { value: "very_strict", label: "Very strict — halal in all aspects" },
                        { value: "strict", label: "Strict" },
                        { value: "moderate", label: "Moderate" },
                        { value: "flexible", label: "Flexible" },
                      ]} />
                  </F>
                  {isFemale && (
                    <F label="Wali (Guardian) Availability">
                      <Sel value={d.waliAvailability} onChange={set("waliAvailability")} placeholder="Select"
                        options={[
                          { value: "yes_father", label: "Yes — father" },
                          { value: "yes_brother", label: "Yes — brother" },
                          { value: "yes_other", label: "Yes — other male guardian" },
                          { value: "wali_hakim", label: "No wali — will use Wali Hakim" },
                        ]} />
                    </F>
                  )}
                  {isFemale && (
                    <F label="Mahar (Dowry) Expectation" note="What she expects to receive">
                      <Input className="h-9 text-sm" value={d.maharExpectation} onChange={inp("maharExpectation")} placeholder="e.g. Quran + gold ring, cash Rp X, open to discuss..." />
                    </F>
                  )}
                  {isMale && (
                    <F label="Mahar (Dowry) Budget" note="What he is prepared to give">
                      <Input className="h-9 text-sm" value={d.maharBudget} onChange={inp("maharBudget")} placeholder="e.g. Rp 5 juta + ring, open to discuss..." />
                    </F>
                  )}
                  <F label={isFemale ? "View on Polygamy (accepting as second/third wife)" : "View on Polygamy (as potential husband)"}>
                    <Sel value={d.polygamyView} onChange={set("polygamyView")} placeholder="Select"
                      options={isFemale ? [
                        { value: "not_open", label: "Not open to it" },
                        { value: "understand_but_difficult", label: "Understand islamically but personally difficult" },
                        { value: "open_if_right", label: "Open if conditions are right and just" },
                        { value: "prefer_not_say", label: "Prefer not to say" },
                      ] : [
                        { value: "not_considering", label: "Not considering it" },
                        { value: "open_future", label: "Open to it in the future if circumstances allow" },
                        { value: "actively_considering", label: "Actively considering it" },
                        { value: "prefer_not_say", label: "Prefer not to say" },
                      ]} />
                  </F>
                </>)}

                {/* Christian-specific */}
                {isChristian && (<>
                  <F label="Church Attendance">
                    <Sel value={d.churchAttendance} onChange={set("churchAttendance")} placeholder="Select"
                      options={[
                        { value: "every_week", label: "Every week" },
                        { value: "most_weeks", label: "Most weeks" },
                        { value: "monthly", label: "Monthly" },
                        { value: "special_occasions", label: "Special occasions only" },
                        { value: "rarely", label: "Rarely" },
                      ]} />
                  </F>
                  <F label="Baptized">
                    <Sel value={d.isBaptized} onChange={set("isBaptized")} placeholder="Select"
                      options={[
                        { value: "yes", label: "Yes" },
                        { value: "yes_infant", label: "Yes — infant baptism" },
                        { value: "no", label: "No" },
                      ]} />
                  </F>
                  <F label="Biblical Knowledge Level">
                    <Sel value={d.biblicalKnowledge} onChange={set("biblicalKnowledge")} placeholder="Select"
                      options={[
                        { value: "advanced", label: "Advanced — ministry, deep study" },
                        { value: "good", label: "Good — regular reading and church" },
                        { value: "basic", label: "Basic" },
                        { value: "limited", label: "Limited" },
                      ]} />
                  </F>
                  <F label="Pastor / Church Name" note="For reference verification" wide>
                    <Input className="h-9 text-sm" value={d.pastorReference} onChange={inp("pastorReference")} placeholder="Pastor name — church name" />
                  </F>
                </>)}
              </div>

              {/* ── Education & Career ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Education & Career" />

                <F label="Highest Education Level">
                  <Sel value={d.educationLevel} onChange={set("educationLevel")} placeholder="Select"
                    options={[
                      { value: "phd", label: "PhD / Doctorate" },
                      { value: "masters", label: "Master's Degree" },
                      { value: "bachelors", label: "Bachelor's Degree" },
                      { value: "diploma", label: "Diploma / Associate" },
                      { value: "high_school", label: "High School" },
                      { value: "pesantren", label: "Pesantren / Islamic Boarding School" },
                      { value: "other", label: "Other" },
                    ]} />
                </F>
                <F label="Field of Study">
                  <Input className="h-9 text-sm" value={d.fieldOfStudy} onChange={inp("fieldOfStudy")} placeholder="e.g. Business, Medicine, Engineering" />
                </F>
                <F label="Occupation / Job Title">
                  <Input className="h-9 text-sm" value={d.occupation} onChange={inp("occupation")} placeholder="e.g. Software Engineer" />
                </F>
                <F label="Employment Status">
                  <Sel value={d.employmentStatus} onChange={set("employmentStatus")} placeholder="Select"
                    options={[
                      { value: "employed_full", label: "Employed — full time" },
                      { value: "employed_part", label: "Employed — part time" },
                      { value: "self_employed", label: "Self-employed / entrepreneur" },
                      { value: "freelance", label: "Freelance" },
                      { value: "student", label: "Student" },
                      { value: "unemployed", label: "Currently not working" },
                    ]} />
                </F>
                <F label="Monthly Income Range (IDR)">
                  <Sel value={d.incomeRange} onChange={set("incomeRange")} placeholder="Select"
                    options={[
                      { value: "under_3m", label: "Under Rp 3 juta" },
                      { value: "3m_7m", label: "Rp 3–7 juta" },
                      { value: "7m_15m", label: "Rp 7–15 juta" },
                      { value: "15m_30m", label: "Rp 15–30 juta" },
                      { value: "30m_plus", label: "Rp 30 juta+" },
                      { value: "prefer_not_say", label: "Prefer not to say" },
                    ]} />
                </F>
                <F label="Financial Readiness for Marriage">
                  <Sel value={d.financialReadiness} onChange={set("financialReadiness")} placeholder="Select"
                    options={[
                      { value: "fully_ready", label: "Fully ready — savings and stable income" },
                      { value: "mostly_ready", label: "Mostly ready" },
                      { value: "working_toward", label: "Working toward it" },
                      { value: "need_support", label: "Will need some family support" },
                      { value: "not_ready", label: "Not financially ready yet" },
                    ]} />
                </F>
                <F label="Career Ambition">
                  <Sel value={d.careerAmbition} onChange={set("careerAmbition")} placeholder="Select"
                    options={[
                      { value: "very_ambitious", label: "Very ambitious — career is a major priority" },
                      { value: "balanced", label: "Balanced — career and family equally" },
                      { value: "family_first", label: "Family first — career is secondary" },
                      { value: "flexible", label: "Flexible" },
                    ]} />
                </F>
                <F label="Willing to Relocate After Marriage">
                  <Sel value={d.willingToRelocate} onChange={set("willingToRelocate")} placeholder="Select"
                    options={[
                      { value: "yes_anywhere", label: "Yes — anywhere" },
                      { value: "yes_open", label: "Open to it — prefer same city but flexible" },
                      { value: "same_city_only", label: "Same city only" },
                      { value: "no", label: "Not willing to relocate" },
                    ]} />
                </F>
                {willRelocate && (
                  <F label="Relocation Preferences / Details" wide>
                    <Input className="h-9 text-sm" value={d.willingToRelocateDetails} onChange={inp("willingToRelocateDetails")} placeholder="e.g. anywhere in Indonesia, open to abroad, prefer Java..." />
                  </F>
                )}
              </div>

              {/* ── Financial Details ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Financial Details" note="Confidential — internal team and matchmaker only" />

                <F label="Property Status">
                  <Sel value={d.propertyStatus} onChange={set("propertyStatus")} placeholder="Select"
                    options={[
                      { value: "own_property", label: "Own property (house / apartment)" },
                      { value: "renting", label: "Currently renting" },
                      { value: "live_with_family", label: "Living with family — no rent" },
                      { value: "kos", label: "Boarding / kos" },
                      { value: "in_process", label: "In process of buying" },
                    ]} />
                </F>
                <F label="Current Living Situation">
                  <Sel value={d.livingSituation} onChange={set("livingSituation")} placeholder="Select"
                    options={[
                      { value: "alone", label: "Alone" },
                      { value: "with_family", label: "With family (parents / siblings)" },
                      { value: "with_roommates", label: "With roommates" },
                      { value: "with_children", label: "With my children" },
                    ]} />
                </F>
                <F label="Outstanding Debts">
                  <Sel value={d.hasDebts} onChange={set("hasDebts")} placeholder="Select"
                    options={[
                      { value: "no", label: "No debts" },
                      { value: "kpr", label: "KPR / mortgage only" },
                      { value: "business_loan", label: "Business loan" },
                      { value: "personal_loan", label: "Personal loan" },
                      { value: "multiple", label: "Multiple" },
                      { value: "prefer_not_say", label: "Prefer not to say" },
                    ]} />
                </F>
                <F label="Savings Habits">
                  <Sel value={d.savingsHabits} onChange={set("savingsHabits")} placeholder="Select"
                    options={[
                      { value: "disciplined", label: "Disciplined — fixed monthly amount" },
                      { value: "save_when_can", label: "Save when possible" },
                      { value: "minimal", label: "Minimal savings currently" },
                      { value: "no_savings", label: "No savings at the moment" },
                      { value: "invest", label: "Prefer investing over saving" },
                    ]} />
                </F>
                <F label="Financial Goals After Marriage" wide>
                  <Textarea className="text-sm" rows={2} value={d.financialGoalsAfterMarriage} onChange={inp("financialGoalsAfterMarriage")} placeholder="e.g. buy a house in 2 years, build emergency fund, start a business together..." />
                </F>
              </div>

              {/* ── Family Background ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Family Background" />

                <F label="Parents' Marital Status">
                  <Sel value={d.parentsMaritalStatus} onChange={set("parentsMaritalStatus")} placeholder="Select"
                    options={[
                      { value: "married", label: "Married / together" },
                      { value: "divorced", label: "Divorced" },
                      { value: "widowed_father", label: "Father passed away" },
                      { value: "widowed_mother", label: "Mother passed away" },
                      { value: "both_passed", label: "Both passed away" },
                      { value: "separated", label: "Separated" },
                    ]} />
                </F>
                <F label="Relationship with Parents">
                  <Sel value={d.relationshipWithParents} onChange={set("relationshipWithParents")} placeholder="Select"
                    options={[
                      { value: "very_close", label: "Very close" },
                      { value: "close", label: "Close" },
                      { value: "neutral", label: "Neutral / normal" },
                      { value: "distant", label: "Distant" },
                      { value: "complicated", label: "Complicated" },
                    ]} />
                </F>
                <F label="Number of Siblings">
                  <Sel value={d.numberOfSiblings} onChange={set("numberOfSiblings")} placeholder="Select"
                    options={[
                      { value: "0", label: "Only child" }, { value: "1", label: "1" },
                      { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4+", label: "4+" },
                    ]} />
                </F>
                <F label="Family Involvement in Marriage Decision">
                  <Sel value={d.familyInvolvement} onChange={set("familyInvolvement")} placeholder="Select"
                    options={[
                      { value: "full_family", label: "Family decides together" },
                      { value: "consult", label: "I decide, but consult family" },
                      { value: "inform", label: "I decide, then inform family" },
                      { value: "independent", label: "Fully independent" },
                    ]} />
                </F>
                <F label="Family's Religious Background">
                  <Sel value={d.familyReligiousBackground} onChange={set("familyReligiousBackground")} placeholder="Select"
                    options={[
                      { value: "very_religious", label: "Very religious" },
                      { value: "religious", label: "Religious" },
                      { value: "moderate", label: "Moderate" },
                      { value: "cultural", label: "Cultural" },
                    ]} />
                </F>
                <F label="Living Arrangement After Marriage">
                  <Sel value={d.livingArrangementAfterMarriage} onChange={set("livingArrangementAfterMarriage")} placeholder="Select"
                    options={[
                      { value: "own_home", label: "Own home — just the two of us" },
                      { value: "near_family", label: "Separate but near family" },
                      { value: "with_husbands_family", label: "With husband's family" },
                      { value: "with_wifes_family", label: "With wife's family" },
                      { value: "flexible", label: "Flexible / open to discuss" },
                    ]} />
                </F>
                <F label="Family's Expectations of Future Spouse" wide>
                  <Textarea className="text-sm" rows={2} value={d.familyExpectationsOfSpouse} onChange={inp("familyExpectationsOfSpouse")} placeholder="What does the family expect from a son/daughter-in-law?" />
                </F>
              </div>

              {/* ── Health & Wellness ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Health & Wellness" note="Confidential — psychologist and internal team only" />

                <F label="Blood Type">
                  <Sel value={d.bloodType} onChange={set("bloodType")} placeholder="Select"
                    options={["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"].map(v => ({ value: v.toLowerCase().replace("+","_pos").replace("-","_neg"), label: v }))} />
                </F>
                <F label="Smoking Status">
                  <Sel value={d.smokingStatus} onChange={set("smokingStatus")} placeholder="Select"
                    options={[
                      { value: "never", label: "Never smoked" },
                      { value: "quit", label: "Quit smoking" },
                      { value: "occasional", label: "Occasional / social" },
                      { value: "regular", label: "Regular smoker" },
                    ]} />
                </F>
                <F label="Alcohol Use">
                  <Sel value={d.alcoholUse} onChange={set("alcoholUse")} placeholder="Select"
                    options={[
                      { value: "never", label: "Never" },
                      { value: "quit", label: "Quit" },
                      { value: "occasional", label: "Occasional / social" },
                      { value: "regular", label: "Regular" },
                    ]} />
                </F>
                <F label="Drug Use">
                  <Sel value={d.drugUse} onChange={set("drugUse")} placeholder="Select"
                    options={[
                      { value: "never", label: "Never" },
                      { value: "quit", label: "Quit — recovering" },
                      { value: "past_use", label: "Past use — not current" },
                      { value: "current", label: "Current use" },
                      { value: "prefer_not_say", label: "Prefer not to say" },
                    ]} />
                </F>
                <F label="Exercise Frequency">
                  <Sel value={d.exerciseFrequency} onChange={set("exerciseFrequency")} placeholder="Select"
                    options={[
                      { value: "daily", label: "Daily" },
                      { value: "4_5x", label: "4–5x per week" },
                      { value: "2_3x", label: "2–3x per week" },
                      { value: "once_week", label: "Once a week" },
                      { value: "rarely", label: "Rarely" },
                      { value: "never", label: "Never" },
                    ]} />
                </F>
                <F label="Sleep Schedule">
                  <Sel value={d.sleepSchedule} onChange={set("sleepSchedule")} placeholder="Select"
                    options={[
                      { value: "early_bird", label: "Early bird — sleep early, wake early" },
                      { value: "balanced", label: "Balanced — normal schedule" },
                      { value: "night_owl", label: "Night owl — sleep late, wake late" },
                      { value: "irregular", label: "Irregular" },
                    ]} />
                </F>
                <F label="Any Disability">
                  <Sel value={d.hasDisabilityStatus} onChange={set("hasDisabilityStatus")} placeholder="Select"
                    options={[
                      { value: "no", label: "No" },
                      { value: "yes", label: "Yes" },
                      { value: "prefer_not_say", label: "Prefer not to say" },
                    ]} />
                </F>
                {hasDisability && (
                  <F label="Disability Details">
                    <Input className="h-9 text-sm" value={d.disabilityDetails} onChange={inp("disabilityDetails")} placeholder="Brief description — type, impact on daily life..." />
                  </F>
                )}
                <F label="Sports / Physical Activities They Like" wide>
                  <Input className="h-9 text-sm" value={d.sportsLiked} onChange={inp("sportsLiked")} placeholder="e.g. football, swimming, badminton, hiking, yoga..." />
                </F>
                <F label="Sports / Activities They Are Good At" wide>
                  <Input className="h-9 text-sm" value={d.sportsGoodAt} onChange={inp("sportsGoodAt")} placeholder="e.g. badminton (played at club level), swimming, etc." />
                </F>
                <F label="Chronic Health Conditions (if any)" wide note="Optional — share only what they are comfortable with">
                  <Textarea className="text-sm" rows={2} value={d.chronicConditions} onChange={inp("chronicConditions")} placeholder="e.g. diabetes, hypertension, PCOS, none..." />
                </F>
              </div>

              {/* ── Personal Character & Psychology ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Personal Character & Psychology" />

                <F label="Introvert / Extrovert">
                  <Sel value={d.introvertExtrovert} onChange={set("introvertExtrovert")} placeholder="Select"
                    options={[
                      { value: "strong_introvert", label: "Strong introvert" },
                      { value: "introverted", label: "Introverted" },
                      { value: "ambivert", label: "Ambivert" },
                      { value: "extroverted", label: "Extroverted" },
                      { value: "strong_extrovert", label: "Strong extrovert" },
                    ]} />
                </F>
                <F label="Personality Type (MBTI if known)">
                  <Input className="h-9 text-sm" value={d.personalityType} onChange={inp("personalityType")} placeholder="e.g. INFJ, ENFP, or describe in words" />
                </F>
                <F label="How They Handle Conflict">
                  <Sel value={d.conflictHandling} onChange={set("conflictHandling")} placeholder="Select"
                    options={[
                      { value: "address_immediately", label: "Address it immediately and directly" },
                      { value: "calm_down_first", label: "Need time to calm down, then talk" },
                      { value: "avoid", label: "Tend to avoid conflict" },
                      { value: "mediator", label: "Prefer a third party" },
                      { value: "internalize", label: "Keep it inside (working on this)" },
                    ]} />
                </F>
                <F label="Primary Love Language">
                  <Sel value={d.loveLanguage} onChange={set("loveLanguage")} placeholder="Select"
                    options={[
                      { value: "words", label: "Words of Affirmation" },
                      { value: "acts", label: "Acts of Service" },
                      { value: "gifts", label: "Receiving Gifts" },
                      { value: "time", label: "Quality Time" },
                      { value: "touch", label: "Physical Touch (within marriage)" },
                      { value: "unsure", label: "Unsure / multiple" },
                    ]} />
                </F>
                <F label="Attachment Style">
                  <Sel value={d.attachmentStyle} onChange={set("attachmentStyle")} placeholder="Select"
                    options={[
                      { value: "secure", label: "Secure — comfortable with closeness and independence" },
                      { value: "anxious", label: "Anxious — needs reassurance" },
                      { value: "avoidant", label: "Avoidant — values independence" },
                      { value: "disorganized", label: "Disorganized / mixed" },
                      { value: "unsure", label: "Unsure" },
                    ]} />
                </F>
                <F label="Emotional Maturity (self-assessed)">
                  <Sel value={d.emotionalMaturity} onChange={set("emotionalMaturity")} placeholder="Select"
                    options={[
                      { value: "very_mature", label: "Very mature — highly self-aware" },
                      { value: "mature", label: "Mature" },
                      { value: "developing", label: "Still developing" },
                      { value: "early_stages", label: "Early stages" },
                    ]} />
                </F>
                <F label="Greatest Strengths in Marriage" wide>
                  <Textarea className="text-sm" rows={2} value={d.strengthsInMarriage} onChange={inp("strengthsInMarriage")} placeholder="e.g. patience, loyalty, communication, emotional support..." />
                </F>
                <F label="Areas of Personal Growth They Acknowledge" wide>
                  <Textarea className="text-sm" rows={2} value={d.areasOfPersonalGrowth} onChange={inp("areasOfPersonalGrowth")} placeholder="Honest self-reflection — what are they actively working on?" />
                </F>
                <F label="Biggest Fear About Marriage" wide>
                  <Textarea className="text-sm" rows={2} value={d.biggestFearAboutMarriage} onChange={inp("biggestFearAboutMarriage")} placeholder="e.g. repeating parents' mistakes, losing independence, being rejected..." />
                </F>
                <F label="Personal Deal-Breakers (non-negotiables for themselves)" wide>
                  <Textarea className="text-sm" rows={2} value={d.dealBreakers} onChange={inp("dealBreakers")} placeholder="e.g. dishonesty, smoking, different religion, no desire for children..." />
                </F>
                <F label="Mental Health Notes" wide note="Optional — for psychologist review, confidential">
                  <Textarea className="text-sm" rows={2} value={d.mentalHealthNotes} onChange={inp("mentalHealthNotes")} placeholder="Any history of anxiety, depression, therapy, trauma..." />
                </F>
              </div>

              {/* ── Communication Style ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Communication Style" />

                <F label="Preferred Contact Frequency with Partner">
                  <Sel value={d.preferredCommunicationFrequency} onChange={set("preferredCommunicationFrequency")} placeholder="Select"
                    options={[
                      { value: "constant", label: "Constant — throughout the day" },
                      { value: "frequent", label: "Frequent — morning, afternoon, evening" },
                      { value: "moderate", label: "Moderate — a few times a day" },
                      { value: "when_needed", label: "When needed — not into constant texting" },
                      { value: "minimal", label: "Minimal — prefers in-person" },
                    ]} />
                </F>
                <F label="Need for Alone Time">
                  <Sel value={d.aloneTimeNeeds} onChange={set("aloneTimeNeeds")} placeholder="Select"
                    options={[
                      { value: "very_high", label: "Very high — needs significant alone time daily" },
                      { value: "moderate", label: "Moderate — some personal space regularly" },
                      { value: "low", label: "Low — prefers being together most of the time" },
                      { value: "minimal", label: "Minimal — rarely needs time alone" },
                    ]} />
                </F>
                <F label="Digital Habits / Screen Time">
                  <Sel value={d.digitalHabits} onChange={set("digitalHabits")} placeholder="Select"
                    options={[
                      { value: "very_high", label: "Very high — always online" },
                      { value: "moderate", label: "Moderate — balanced use" },
                      { value: "low", label: "Low — minimal social media" },
                      { value: "minimal", label: "Minimal — phone is a tool only" },
                    ]} />
                </F>
                <F label="How They Express Love Practically" wide>
                  <Textarea className="text-sm" rows={2} value={d.lovePracticalExpression} onChange={inp("lovePracticalExpression")} placeholder="e.g. cooking, good morning messages, spontaneous gifts, acts of service..." />
                </F>
              </div>

              {/* ── Marriage Vision ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Marriage Vision & Expectations" />

                <MultiCheck wide label="Why They Want to Get Married Now" note="Select all that apply"
                  value={d.whyMarryNow} onChange={set("whyMarryNow")}
                  options={[
                    { value: "religious_duty", label: "Religious duty / completing half of deen" },
                    { value: "life_stage", label: "Right life stage" },
                    { value: "family_encouragement", label: "Family encouragement" },
                    { value: "personally_ready", label: "Personally feel ready" },
                    { value: "companionship", label: "Desire for companionship and love" },
                    { value: "children", label: "Want to have children" },
                    { value: "stability", label: "Financial / emotional stability" },
                    { value: "tired_of_single", label: "Ready to settle down" },
                  ]} />

                <F label="Desired Marriage Timeline">
                  <Sel value={d.maritalTimeline} onChange={set("maritalTimeline")} placeholder="Select"
                    options={[
                      { value: "asap", label: "As soon as possible" },
                      { value: "3_months", label: "Within 3 months" },
                      { value: "6_months", label: "Within 6 months" },
                      { value: "1_year", label: "Within 1 year" },
                      { value: "1_2_years", label: "1–2 years" },
                      { value: "flexible", label: "Flexible / when the right person comes" },
                    ]} />
                </F>
                <F label="Wedding Preference">
                  <Sel value={d.weddingPreference} onChange={set("weddingPreference")} placeholder="Select"
                    options={[
                      { value: "simple", label: "Simple & small — close family only" },
                      { value: "moderate", label: "Moderate — family and close friends" },
                      { value: "large", label: "Large — traditional full celebration" },
                      { value: "flexible", label: "Flexible" },
                    ]} />
                </F>
                <F label="Financial Management in Marriage">
                  <Sel value={d.financialManagementStyle} onChange={set("financialManagementStyle")} placeholder="Select"
                    options={[
                      { value: "husband_manages", label: "Husband manages finances" },
                      { value: "wife_manages", label: "Wife manages finances" },
                      { value: "joint", label: "Fully joint — shared account" },
                      { value: "separate_contribute", label: "Separate but both contribute" },
                      { value: "discuss", label: "Open to discuss" },
                    ]} />
                </F>
                <F label="Decision-Making in Marriage">
                  <Sel value={d.decisionMakingStyle} onChange={set("decisionMakingStyle")} placeholder="Select"
                    options={[
                      { value: "husband_leads", label: "Husband leads, wife supports" },
                      { value: "mutual", label: "Mutual — discuss everything" },
                      { value: "domain_based", label: "Domain-based — each has their area" },
                      { value: "flexible", label: "Flexible" },
                    ]} />
                </F>
                <F label="Views on Working Spouse">
                  <Sel value={d.viewsOnWorkingSpouse} onChange={set("viewsOnWorkingSpouse")} placeholder="Select"
                    options={isFemale ? [
                      { value: "want_to_work", label: "Want to continue working after marriage" },
                      { value: "work_until_children", label: "Work until children arrive, then reassess" },
                      { value: "prefer_stay_home", label: "Prefer to be a full-time homemaker" },
                      { value: "flexible", label: "Flexible — depends on situation" },
                    ] : [
                      { value: "encouraged", label: "Encourage wife to work if she wants" },
                      { value: "ok_family_not_affected", label: "OK as long as family is not affected" },
                      { value: "prefer_stay_home", label: "Prefer wife stays home" },
                      { value: "up_to_her", label: "Fully up to her" },
                    ]} />
                </F>
                <F label={isFemale ? "What She Expects from a Husband" : "What He Expects from a Wife"} wide>
                  <Textarea className="text-sm" rows={2}
                    value={isFemale ? d.roleExpectationsHusband : d.roleExpectationsWife}
                    onChange={isFemale ? inp("roleExpectationsHusband") : inp("roleExpectationsWife")}
                    placeholder={isFemale ? "What does she expect from a husband?" : "What does he expect from a wife?"} />
                </F>
              </div>

              {/* ── Children & Parenting ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Children & Parenting" />

                <F label="Desire for Children">
                  <Sel value={d.desireForChildren} onChange={set("desireForChildren")} placeholder="Select"
                    options={[
                      { value: "strongly_want", label: "Strongly want children" },
                      { value: "want", label: "Want children" },
                      { value: "open", label: "Open but not a priority" },
                      { value: "undecided", label: "Undecided" },
                      { value: "do_not_want", label: "Do not want children" },
                      { value: "medical", label: "Medical limitations — open to discuss" },
                    ]} />
                </F>
                <F label="Ideal Number of Children">
                  <Sel value={d.numberOfChildrenDesired} onChange={set("numberOfChildrenDesired")} placeholder="Select"
                    options={[
                      { value: "1", label: "1" }, { value: "2", label: "2" },
                      { value: "3", label: "3" }, { value: "4+", label: "4+" },
                      { value: "as_blessed", label: "As many as blessed" },
                      { value: "flexible", label: "Flexible" }, { value: "none", label: "None" },
                    ]} />
                </F>
                <F label="First Child Timeline">
                  <Sel value={d.childrenTimeline} onChange={set("childrenTimeline")} placeholder="Select"
                    options={[
                      { value: "immediately", label: "Right after marriage" },
                      { value: "1_year", label: "Within 1 year" },
                      { value: "2_years", label: "1–2 years after" },
                      { value: "when_stable", label: "When financially stable" },
                      { value: "flexible", label: "Flexible" },
                      { value: "na", label: "N/A" },
                    ]} />
                </F>
                <F label="Parenting Style">
                  <Sel value={d.parentingStyle} onChange={set("parentingStyle")} placeholder="Select"
                    options={[
                      { value: "authoritative", label: "Authoritative — warm but structured" },
                      { value: "nurturing", label: "Nurturing — emotionally led" },
                      { value: "traditional", label: "Traditional — respect and discipline focused" },
                      { value: "faith_centered", label: "Faith-centered — Quran/Bible centered" },
                      { value: "balanced", label: "Balanced mix" },
                      { value: "still_figuring", label: "Still figuring out" },
                    ]} />
                </F>
                <F label="Education Plans for Children" wide>
                  <Textarea className="text-sm" rows={2} value={d.educationPlanForChildren} onChange={inp("educationPlanForChildren")} placeholder="Islamic school, public school, pesantren, international, homeschool..." />
                </F>
              </div>

              {/* ── Lifestyle ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Lifestyle" />

                <F label="Social Life Preference">
                  <Sel value={d.socialPreference} onChange={set("socialPreference")} placeholder="Select"
                    options={[
                      { value: "very_social", label: "Very social — lots of gatherings" },
                      { value: "balanced", label: "Balanced — social but values home time" },
                      { value: "homebody", label: "Homebody — quiet, small circles" },
                      { value: "minimal", label: "Minimal social life" },
                    ]} />
                </F>
                <F label="Travel Interest">
                  <Sel value={d.travelInterest} onChange={set("travelInterest")} placeholder="Select"
                    options={[
                      { value: "loves_travel", label: "Loves traveling frequently" },
                      { value: "occasional", label: "Occasional — a few times a year" },
                      { value: "rare", label: "Travel rarely" },
                      { value: "no_interest", label: "Prefers staying home" },
                    ]} />
                </F>
                <F label="Pets">
                  <Sel value={d.petsRelationship} onChange={set("petsRelationship")} placeholder="Select"
                    options={[
                      { value: "have_love", label: "Have pets and love them" },
                      { value: "love_no_pets", label: "Love animals but no pets" },
                      { value: "neutral", label: "Neutral" },
                      { value: "prefer_none", label: "Prefer no pets in the home" },
                      { value: "allergic", label: "Allergic" },
                    ]} />
                </F>
                <F label="Dietary Restrictions">
                  <Input className="h-9 text-sm" value={d.dietaryRestrictions} onChange={inp("dietaryRestrictions")} placeholder="e.g. vegetarian, no seafood, halal only..." />
                </F>
                <F label="Volunteer / Community Work" wide>
                  <Input className="h-9 text-sm" value={d.volunteerWork} onChange={inp("volunteerWork")} placeholder="e.g. mosque committee, NGO, teaching, or none" />
                </F>
                <F label="Hobbies & Interests" wide>
                  <Textarea className="text-sm" rows={2} value={d.hobbiesAndInterests} onChange={inp("hobbiesAndInterests")} placeholder="e.g. reading, cooking, sports, Islamic lectures, photography..." />
                </F>
                <F label="Describe a Typical Day in Their Life" wide>
                  <Textarea className="text-sm" rows={2} value={d.dailyRoutineDescription} onChange={inp("dailyRoutineDescription")} placeholder="Morning to evening — helps us understand their pace and lifestyle" />
                </F>
              </div>

              {/* ── Languages & International ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Languages & International" />
                <F label="Languages Spoken" wide>
                  <Input className="h-9 text-sm" value={d.languagesSpoken} onChange={inp("languagesSpoken")} placeholder="e.g. Indonesian, English, Arabic, Sundanese..." />
                </F>
                <F label="Passport Holder">
                  <Sel value={d.passportHolder} onChange={set("passportHolder")} placeholder="Select"
                    options={[
                      { value: "yes_active", label: "Yes — active" },
                      { value: "yes_expired", label: "Yes — expired" },
                      { value: "no", label: "No passport" },
                      { value: "dual", label: "Dual citizenship" },
                    ]} />
                </F>
              </div>

              {/* ── Spouse Criteria ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Spouse Criteria & Preferences" />

                {/* Age range as number inputs */}
                <F label="Preferred Age Range of Spouse">
                  <div className="flex items-center gap-2">
                    <Input className="h-9 text-sm" type="number" value={d.preferredMinAge} onChange={inp("preferredMinAge")} placeholder="Min" min={18} max={70} />
                    <span className="text-muted-foreground text-sm">–</span>
                    <Input className="h-9 text-sm" type="number" value={d.preferredMaxAge} onChange={inp("preferredMaxAge")} placeholder="Max" min={18} max={70} />
                  </div>
                </F>
                <F label="Preferred Education Level">
                  <Sel value={d.preferredEducationLevel} onChange={set("preferredEducationLevel")} placeholder="Select"
                    options={[
                      { value: "phd_masters", label: "PhD or Master's preferred" },
                      { value: "bachelors_min", label: "Bachelor's minimum" },
                      { value: "any_educated", label: "Any — as long as educated" },
                      { value: "no_preference", label: "No preference" },
                    ]} />
                </F>
                <F label="Required Religion of Spouse">
                  <Sel value={d.preferredReligion} onChange={set("preferredReligion")} placeholder="Select"
                    options={[
                      { value: "must_be_muslim", label: "Must be Muslim" },
                      { value: "same_religion", label: "Must be same religion" },
                      { value: "people_of_book", label: "Muslim or People of the Book" },
                      { value: "open", label: "Open to any religion" },
                    ]} />
                </F>
                <F label="Open to Different Ethnicity">
                  <Sel value={d.openToDifferentEthnicity} onChange={set("openToDifferentEthnicity")} placeholder="Select"
                    options={[
                      { value: "yes_fully", label: "Yes — fully open" },
                      { value: "prefer_same", label: "Prefer same but open" },
                      { value: "same_only", label: "Same ethnicity only" },
                    ]} />
                </F>
                <F label="Preferred Location of Spouse" wide>
                  <Input className="h-9 text-sm" value={d.preferredLocationOfSpouse} onChange={inp("preferredLocationOfSpouse")} placeholder="e.g. same city, anywhere in Indonesia, open to LDR" />
                </F>

                {/* Open to divorced/widowed — multi-select */}
                <MultiCheck wide label="Open to Divorced / Widowed Spouse" note="Select all that apply"
                  value={d.openToDivorcedOrWidowed} onChange={set("openToDivorcedOrWidowed")}
                  options={[
                    { value: "divorced_no_kids", label: "Divorced — no children" },
                    { value: "divorced_with_kids", label: "Divorced — has children" },
                    { value: "widowed_no_kids", label: "Widowed — no children" },
                    { value: "widowed_with_kids", label: "Widowed — has children" },
                    { value: "not_open", label: "Not open — single only" },
                  ]} />

                {multiDivorcedWidowed && (
                  <F label="Priority Order (if open to multiple)" wide note="e.g. 1st divorced no kids, 2nd widowed no kids...">
                    <Input className="h-9 text-sm" value={d.openToDivorcedOrWidowedPriority} onChange={inp("openToDivorcedOrWidowedPriority")} placeholder="1st preference, 2nd preference, 3rd..." />
                  </F>
                )}

                <F label="Preferred Personality Traits in Spouse" wide>
                  <Textarea className="text-sm" rows={2} value={d.preferredPersonalityTraits} onChange={inp("preferredPersonalityTraits")} placeholder="e.g. calm, religious, ambitious, family-oriented, patient..." />
                </F>
                <F label="Physical Preferences" wide note="Honest — for matching purposes only">
                  <Textarea className="text-sm" rows={2} value={d.physicalPreferences} onChange={inp("physicalPreferences")} placeholder="Height range, general appearance preferences..." />
                </F>
                <F label="Spouse Deal-Breakers (absolute non-negotiables)" wide>
                  <Textarea className="text-sm" rows={2} value={d.spouseDealBreakers} onChange={inp("spouseDealBreakers")} placeholder="What would make a potential match an immediate no?" />
                </F>
              </div>

              {/* ── Long-Term Goals ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Long-Term Life Goals" />
                <F label="5–10 Year Vision Beyond Marriage" wide>
                  <Textarea className="text-sm" rows={3} value={d.longTermLifeGoals} onChange={inp("longTermLifeGoals")} placeholder="Where do they see themselves? Career, family, spiritual growth, contribution to society..." />
                </F>
              </div>

              {/* ── References ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="References" note="Name + phone number — for trust verification" />
                <F label={isMuslim ? "Ustaz / Imam Reference" : "Pastor / Religious Leader Reference"} wide note="Someone who knows them personally and can vouch for their character">
                  <Input className="h-9 text-sm" value={d.religiousLeaderReference} onChange={inp("religiousLeaderReference")} placeholder="Name — phone number" />
                </F>
                <F label="Family Member Reference" wide note="Parent or sibling">
                  <Input className="h-9 text-sm" value={d.familyMemberReference} onChange={inp("familyMemberReference")} placeholder="Name / relationship — phone number" />
                </F>
                <F label="Friend Reference" wide note="Close friend who knows them well">
                  <Input className="h-9 text-sm" value={d.friendReference} onChange={inp("friendReference")} placeholder="Name — phone number" />
                </F>
              </div>

              {/* ── Staff Notes ── */}
              <div className="grid grid-cols-2 gap-4">
                <Sec title="Staff Notes" note="Internal only — never shared with candidates or partners" />
                <F label="Sales Lead Notes" wide note="First impressions, how they heard about us, urgency level">
                  <Textarea className="text-sm" rows={2} value={d.salesLeadNotes} onChange={inp("salesLeadNotes")} placeholder="Notes from the first call / lead conversation..." />
                </F>
                <F label="Receptionist / Intake Notes" wide note="Walk-in observations, demeanor, body language">
                  <Textarea className="text-sm" rows={2} value={d.receptionistNotes} onChange={inp("receptionistNotes")} placeholder="Notes from reception / first in-person visit..." />
                </F>
                <F label="Profile Maker Notes" wide note="Quality of intake form, completeness, honesty flags">
                  <Textarea className="text-sm" rows={2} value={d.profileMakerNotes} onChange={inp("profileMakerNotes")} placeholder="Notes while building this profile..." />
                </F>
                <F label="Background Checker Notes" wide note="Verification results, red flags, confirmed details">
                  <Textarea className="text-sm" rows={2} value={d.backgroundCheckerNotes} onChange={inp("backgroundCheckerNotes")} placeholder="ID verified, employment confirmed, reference calls..." />
                </F>
                <F label={isMuslim ? "Imam Notes" : "Pastor / Religious Leader Notes"} wide note="Character assessment from religious leader interview">
                  <Textarea className="text-sm" rows={2} value={d.imamNotes} onChange={inp("imamNotes")} placeholder="Religious character, sincerity, readiness observed..." />
                </F>
                <F label="Psychologist Notes" wide note="Confidential — clinical observations">
                  <Textarea className="text-sm" rows={2} value={d.psychologistNotes} onChange={inp("psychologistNotes")} placeholder="Psychological observations — for internal use only..." />
                </F>
                <F label="Emotional Readiness Assessment" wide>
                  <Textarea className="text-sm" rows={2} value={d.emotionalReadinessAssessment} onChange={inp("emotionalReadinessAssessment")} placeholder="Matchmaker or psychologist assessment of readiness for marriage..." />
                </F>
                <F label="General Internal Team Notes" wide>
                  <Textarea className="text-sm" rows={2} value={d.internalTeamNotes} onChange={inp("internalTeamNotes")} placeholder="Anything the team needs to know — flags, history, follow-up reminders..." />
                </F>
              </div>

              </>)}

              {/* Submit */}
              <div className="pt-4">
                <Button type="submit" disabled={status === "loading"}
                  className="w-full rounded-full bg-gradient-to-r from-[#9B2242] to-[#0b3a86] text-white py-5">
                  {status === "loading" ? "Creating..." : "Create user"}
                </Button>
                {status === "success" && <p className="mt-2 text-sm font-semibold text-[#0b3a86]">User created successfully.</p>}
                {status === "error" && error && <p className="mt-2 text-sm font-semibold text-[#9B2242]">{error}</p>}
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users table */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.uid}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[u.role]}`}>
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {u.createdAt ? u.createdAt.toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
