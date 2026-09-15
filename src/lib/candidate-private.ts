/**
 * Candidate fields only the Jodohmu team may read. Everything else in a
 * candidate's own intake doc is theirs to see; assessment results are shown
 * to them read-only, but the team's working notes on those results are not.
 */
export const TEAM_ONLY_FIELDS = new Set([
  // team notes
  "salesLeadNotes", "profileMakerNotes", "imamNotes", "psychologistNotes", "receptionistNotes",
  "internalTeamNotes", "emotionalReadinessAssessment", "backgroundCheckerNotes",
  // pipeline / CRM
  "lastContact", "nextFollowUp", "paket", "pic", "sumberLead", "targetWaktuMenikah",
  "catatanPersiapan", "profileActivatedBy", "profileNotes",
  // notes attached to assessments
  "psychTestNotes", "bgCheckNotes", "idCheckNotes", "jodohmuCriteriaSpecialNotes", "ktpNumber",
  // bookkeeping
  "assignedWorkers", "createdBy", "updatedBy", "_sectionMeta",
  "leadSource", "sourceShareId", "sourceShareCode",
]);

export function stripTeamOnly(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(data).filter(([k]) => !TEAM_ONLY_FIELDS.has(k)));
}
