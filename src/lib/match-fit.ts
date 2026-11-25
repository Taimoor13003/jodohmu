import type { SuggestionPerson } from "@/lib/match-suggestions";

/* ──────────────────────────────────────────────────────────────────────
   Fit check: compares two profiles against each other's stated wishes.
   It only reads what both people filled in; anything missing is "unknown"
   so the team knows what to ask, rather than a silent pass.
   ────────────────────────────────────────────────────────────────────── */

export type FitResult = "good" | "bad" | "unknown";
type Lang = "id" | "en";

export interface FitCheck {
  key: string;
  result: FitResult;
  text: Record<Lang, string>;
}

const s = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const num = (v: unknown) => { const n = parseFloat(s(v)); return Number.isFinite(n) && n > 0 ? n : null; };
const first = (p: SuggestionPerson) => p.name.split(" ")[0];

const PRACTICE = ["not_practicing", "moderate", "practicing", "very_practicing"];
const TIMELINE = ["asap", "6_months", "1_year", "2_years", "3_plus_years"];
const TIMELINE_LABEL: Record<string, Record<Lang, string>> = {
  asap: { id: "secepatnya", en: "ASAP" }, "6_months": { id: "6 bulan", en: "6 months" },
  "1_year": { id: "1 tahun", en: "1 year" }, "2_years": { id: "2 tahun", en: "2 years" },
  "3_plus_years": { id: "3+ tahun", en: "3+ years" }, not_sure: { id: "belum pasti", en: "not sure" },
};
const PRACTICE_LABEL: Record<string, Record<Lang, string>> = {
  not_practicing: { id: "kurang taat", en: "not practising" }, moderate: { id: "sedang", en: "moderate" },
  practicing: { id: "taat", en: "practising" }, very_practicing: { id: "sangat taat", en: "very practising" },
};

function nationalityKey(v: unknown) {
  const t = s(v).toLowerCase();
  if (!t) return "";
  if (t.startsWith("indones")) return "indonesia";
  return t.replace(/s$/, "").replace(/ian$|an$/, "");
}

/** What `wisher` wants, checked against `other`. */
function oneWay(wisher: SuggestionPerson, other: SuggestionPerson): FitCheck[] {
  const w = wisher.facts ?? {}, o = other.facts ?? {};
  const W = first(wisher), O = first(other);
  const out: FitCheck[] = [];

  // Age range
  const min = num(w.preferredMinAge), max = num(w.preferredMaxAge), age = num(other.age);
  if (min || max) {
    const range = `${min ?? "?"}–${max ?? "?"}`;
    if (age == null) out.push({ key: `age-${wisher.uid}`, result: "unknown", text: { id: `Usia ${O} belum diisi (${W} mau ${range})`, en: `${O}'s age unknown (${W} wants ${range})` } });
    else {
      const ok = (!min || age >= min) && (!max || age <= max);
      out.push({ key: `age-${wisher.uid}`, result: ok ? "good" : "bad",
        text: ok
          ? { id: `${O} (${age}) masuk rentang usia ${W}: ${range}`, en: `${O} (${age}) is in ${W}'s age range ${range}` }
          : { id: `${O} (${age}) di luar rentang usia ${W}: ${range}`, en: `${O} (${age}) is outside ${W}'s age range ${range}` } });
    }
  }

  // Religion
  const wantRel = s(w.preferredReligion).toLowerCase(), rel = s(o.religion).toLowerCase();
  if (wantRel && wantRel !== "no_pref") {
    if (!rel) out.push({ key: `rel-${wisher.uid}`, result: "unknown", text: { id: `Agama ${O} belum diisi`, en: `${O}'s religion not filled in` } });
    else out.push({ key: `rel-${wisher.uid}`, result: rel === wantRel ? "good" : "bad",
      text: rel === wantRel
        ? { id: `${W} mau ${s(w.preferredReligion)} — ${O} ${s(o.religion)}`, en: `${W} wants ${s(w.preferredReligion)} — ${O} is ${s(o.religion)}` }
        : { id: `${W} mau ${s(w.preferredReligion)}, tapi ${O} ${s(o.religion)}`, en: `${W} wants ${s(w.preferredReligion)}, but ${O} is ${s(o.religion)}` } });
  }

  // Practice level
  const wantLvl = s(w.prefReligionLevel), lvl = s(o.religiousPracticeLevel);
  if (wantLvl && wantLvl !== "no_pref" && PRACTICE.includes(wantLvl)) {
    const L = (k: string, lang: Lang) => PRACTICE_LABEL[k]?.[lang] ?? k;
    if (!PRACTICE.includes(lvl)) out.push({ key: `lvl-${wisher.uid}`, result: "unknown", text: { id: `Tingkat ibadah ${O} belum diisi (${W} mau ${L(wantLvl, "id")})`, en: `${O}'s practice level unknown (${W} wants ${L(wantLvl, "en")})` } });
    else {
      const ok = PRACTICE.indexOf(lvl) >= PRACTICE.indexOf(wantLvl);
      out.push({ key: `lvl-${wisher.uid}`, result: ok ? "good" : "bad",
        text: { id: `${W} mau pasangan ${L(wantLvl, "id")} — ${O} ${L(lvl, "id")}`, en: `${W} wants ${L(wantLvl, "en")} — ${O} is ${L(lvl, "en")}` } });
    }
  }

  // Previous marriage
  const status = s(o.maritalStatus);
  const singleOnly = s(w.prefPreviousStatus) === "single_only" || ["no", "not_open"].includes(s(w.openToDivorcedOrWidowed));
  if (singleOnly && status) {
    const ok = status === "single";
    out.push({ key: `prev-${wisher.uid}`, result: ok ? "good" : "bad",
      text: ok ? { id: `${W} mau yang belum pernah menikah — ${O} lajang`, en: `${W} wants never-married — ${O} is single` }
               : { id: `${W} hanya mau yang belum pernah menikah, ${O} ${status === "divorced" ? "cerai" : "pernah menikah"}`, en: `${W} only wants never-married; ${O} is ${status}` } });
  } else if (status && status !== "single" && (s(w.prefPreviousStatus) === "open_all" || ["yes"].includes(s(w.openToDivorcedOrWidowed)))) {
    out.push({ key: `prev-${wisher.uid}`, result: "good", text: { id: `${W} terbuka untuk yang pernah menikah`, en: `${W} is open to someone previously married` } });
  }

  // Children from before
  const kids = num(o.childrenCount);
  const kidsPref = s(w.prefChildrenFromPrevious);
  if (kids && kidsPref) {
    const ok = kidsPref !== "not_accepted";
    out.push({ key: `kids-${wisher.uid}`, result: ok ? "good" : "bad",
      text: ok ? { id: `${O} punya ${kids} anak — ${W} menerima`, en: `${O} has ${kids} child${kids === 1 ? "" : "ren"} — ${W} accepts that` }
               : { id: `${O} punya ${kids} anak, tapi ${W} tidak menerima anak dari pernikahan sebelumnya`, en: `${O} has ${kids} child${kids === 1 ? "" : "ren"}, but ${W} doesn't accept children from before` } });
  }

  // Smoking
  if (s(w.prefSmokingAcceptance) === "not_accepted") {
    const smoke = s(o.smokingStatus);
    if (!smoke) out.push({ key: `smoke-${wisher.uid}`, result: "unknown", text: { id: `${W} tidak mau perokok — ${O} belum mengisi soal rokok`, en: `${W} won't accept a smoker — ${O} hasn't said if they smoke` } });
    else {
      const ok = smoke === "never" || smoke === "quit";
      out.push({ key: `smoke-${wisher.uid}`, result: ok ? "good" : "bad",
        text: ok ? { id: `${W} tidak mau perokok — ${O} tidak merokok`, en: `${W} won't accept a smoker — ${O} doesn't smoke` }
                 : { id: `${W} tidak mau perokok, tapi ${O} merokok`, en: `${W} won't accept a smoker, but ${O} smokes` } });
    }
  }

  // Height
  const hMin = num(w.prefMinHeight), hMax = num(w.prefMaxHeight), h = num(o.height);
  if (hMin || hMax) {
    if (!h) out.push({ key: `h-${wisher.uid}`, result: "unknown", text: { id: `${W} mau tinggi ${hMin ?? ""}${hMax ? `–${hMax}` : "+"} cm — tinggi ${O} belum diisi`, en: `${W} wants ${hMin ?? ""}${hMax ? `–${hMax}` : "+"} cm — ${O}'s height unknown` } });
    else {
      const ok = (!hMin || h >= hMin) && (!hMax || h <= hMax);
      out.push({ key: `h-${wisher.uid}`, result: ok ? "good" : "bad",
        text: { id: `${W} mau tinggi ${hMin ?? ""}${hMax ? `–${hMax}` : "+"} cm — ${O} ${h} cm`, en: `${W} wants ${hMin ?? ""}${hMax ? `–${hMax}` : "+"} cm — ${O} is ${h} cm` } });
    }
  }

  return out;
}

export function fitChecks(client: SuggestionPerson, candidate: SuggestionPerson): FitCheck[] {
  const checks: FitCheck[] = [];

  if (client.gender && candidate.gender && client.gender === candidate.gender) {
    checks.push({ key: "gender", result: "bad", text: { id: "Jenis kelamin sama", en: "Same gender" } });
  }

  checks.push(...oneWay(client, candidate), ...oneWay(candidate, client));

  // Timeline: are they in a similar hurry?
  const a = s(client.facts?.maritalTimeline), b = s(candidate.facts?.maritalTimeline);
  if (TIMELINE.includes(a) && TIMELINE.includes(b)) {
    const gap = Math.abs(TIMELINE.indexOf(a) - TIMELINE.indexOf(b));
    const T = (k: string, lang: Lang) => TIMELINE_LABEL[k][lang];
    checks.push({ key: "timeline", result: gap <= 1 ? "good" : gap >= 3 ? "bad" : "unknown",
      text: { id: `Target menikah: ${first(client)} ${T(a, "id")}, ${first(candidate)} ${T(b, "id")}`, en: `Marriage timing: ${first(client)} ${T(a, "en")}, ${first(candidate)} ${T(b, "en")}` } });
  }

  // Different countries: is the Indonesian side open to a foreigner?
  const na = nationalityKey(client.facts?.nationality), nb = nationalityKey(candidate.facts?.nationality);
  if (na && nb && na !== nb) {
    const local = na === "indonesia" ? client : nb === "indonesia" ? candidate : null;
    const open = local && s(local.facts?.openToForeigner) === "yes";
    checks.push({ key: "country", result: open ? "good" : "unknown",
      text: open
        ? { id: `Beda negara — ${first(local!)} terbuka untuk WNA`, en: `Different countries — ${first(local!)} is open to a foreigner` }
        : { id: "Beda negara — pastikan keduanya siap (pindah, keluarga, dokumen)", en: "Different countries — confirm both are ready (relocation, family, papers)" } });
  }

  return checks;
}

export function fitSummary(checks: FitCheck[]) {
  const good = checks.filter(c => c.result === "good").length;
  const bad = checks.filter(c => c.result === "bad").length;
  const unknown = checks.length - good - bad;
  const level: "strong" | "mixed" | "weak" | "unknown" =
    good + bad === 0 ? "unknown" : bad === 0 ? "strong" : bad >= good ? "weak" : "mixed";
  return { good, bad, unknown, level };
}
