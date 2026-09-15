/**
 * Age is never entered by hand — it always follows the date of birth, so it
 * stays correct as time passes.
 */

function toDate(dob: unknown): Date | null {
  if (typeof dob === "string") {
    const s = dob.trim();
    if (!s) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // Firestore Timestamp, live or serialised
  const t = dob as { toDate?: () => Date; _seconds?: number; seconds?: number } | null | undefined;
  if (t && typeof t.toDate === "function") return t.toDate();
  const secs = t?._seconds ?? t?.seconds;
  return typeof secs === "number" ? new Date(secs * 1000) : null;
}

/** Whole years between the date of birth and today, or null if there's no usable date. */
export function ageFromDob(dob: unknown, now: Date = new Date()): number | null {
  const d = toDate(dob);
  if (!d) return null;
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age > 0 && age < 120 ? age : null;
}

/** Replaces any stored age with the one computed from dateOfBirth. */
export function withLiveAge<T extends Record<string, unknown>>(data: T): T {
  const age = ageFromDob(data.dateOfBirth);
  return age === null ? data : { ...data, age: String(age) };
}
