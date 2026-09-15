/*
 * Where a signed-in candidate belongs on first load.
 *
 * Self-signups must supply name, WhatsApp and gender, then wait for a
 * discovery call. Profiles the team created were already captured by a
 * worker or admin, so those people go straight to their dashboard.
 *
 * Server code sees `createdBy`; the candidate's own browser only gets the
 * `createdByTeam` flag (who created it is team-only data).
 */

type Data = Record<string, unknown> | null | undefined;

function createdByTeam(data: Data): boolean {
  return !!(data?.createdBy || data?.createdByTeam);
}

export function needsOnboarding(data: Data): boolean {
  if (!data) return true;
  if (createdByTeam(data)) return false;
  return !data.fullName || !data.whatsappNumber || !data.gender;
}

/** Self-signups waiting for their discovery call see the "request submitted" page. */
export function awaitingDiscoveryCall(data: Data): boolean {
  if (!data || createdByTeam(data)) return false;
  return data.personStatus === "new_lead" || data.personStatus === "awaiting_discovery_call";
}
