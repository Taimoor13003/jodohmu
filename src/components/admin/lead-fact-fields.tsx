"use client";

import type { LeadDetails } from "@/lib/social";

const input = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20";
const label = "mb-1 block text-xs font-semibold text-slate-500";

export type LeadFacts = Pick<LeadDetails, "gender" | "age" | "maritalStatus" | "religion" | "nationality" | "occupation" | "education" | "ethnicity" | "hijab">;
export const EMPTY_FACTS: LeadFacts = { gender: "", age: "", maritalStatus: "", religion: "", nationality: "", occupation: "", education: "", ethnicity: "", hijab: "" };

// A lead's stored facts, back in the shape of the form
export function factsOf(profile: Record<string, unknown> | null | undefined): LeadFacts {
  const str = (value: unknown) => (typeof value === "string" || typeof value === "number" ? String(value) : "");
  const p = profile ?? {};
  return {
    gender: str(p.gender), age: str(p.age), maritalStatus: str(p.maritalStatus), religion: str(p.religion), nationality: str(p.nationality),
    occupation: str(p.occupation), education: str(p.education), ethnicity: str(p.ethnicity), hijab: str(p.hijab),
  };
}

/* What a lead form asks about the person, all optional: age, gender, marital status and so on. Shared by the
   Subpages lead form and the Call Desk's add and edit forms, so a lead carries the same details wherever it
   was typed in. Renders cells for the parent's two-column grid. */
export default function LeadFactFields({ lang, value, onChange }: {
  lang: "id" | "en"; value: LeadFacts; onChange: (patch: Partial<LeadFacts>) => void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const set = (key: keyof LeadFacts) => (event: { target: { value: string } }) => onChange({ [key]: event.target.value });
  return (
    <>
      <div>
        <label className={label}>{t("Jenis kelamin", "Gender")}</label>
        <select className={input} value={value.gender} onChange={set("gender")}>
          <option value="">{t("Belum tahu", "Not known")}</option>
          <option value="female">{t("Perempuan", "Female")}</option>
          <option value="male">{t("Laki-laki", "Male")}</option>
        </select>
      </div>
      <div>
        <label className={label}>{t("Usia", "Age")}</label>
        <input type="number" min={16} max={99} className={input} value={value.age} onChange={set("age")} />
      </div>
      <div>
        <label className={label}>{t("Status pernikahan", "Marital status")}</label>
        <select className={input} value={value.maritalStatus} onChange={set("maritalStatus")}>
          <option value="">{t("Belum tahu", "Not known")}</option>
          <option value="never_married">{t("Belum menikah", "Single")}</option>
          <option value="divorced">{t("Cerai", "Divorced")}</option>
          <option value="widowed">{t("Cerai mati", "Widowed")}</option>
          <option value="married">{t("Menikah", "Married")}</option>
        </select>
      </div>
      <div>
        <label className={label}>{t("Agama", "Religion")}</label>
        <input list="lead-religions" className={input} value={value.religion} onChange={set("religion")} />
        <datalist id="lead-religions">
          {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"].map((r) => <option key={r} value={r} />)}
        </datalist>
      </div>
      <div>
        <label className={label}>{t("Kewarganegaraan", "Nationality")}</label>
        <input list="lead-nationalities" className={input} value={value.nationality} onChange={set("nationality")} placeholder="Indonesia" />
        <datalist id="lead-nationalities"><option value="Indonesia" /></datalist>
      </div>
      <div>
        <label className={label}>{t("Suku", "Ethnicity")}</label>
        <input className={input} value={value.ethnicity} onChange={set("ethnicity")} />
      </div>
      <div>
        <label className={label}>{t("Pekerjaan", "Job")}</label>
        <input className={input} value={value.occupation} onChange={set("occupation")} />
      </div>
      <div>
        <label className={label}>{t("Pendidikan terakhir", "Education")}</label>
        <input list="lead-educations" className={input} value={value.education} onChange={set("education")} placeholder="S1" />
        <datalist id="lead-educations">
          {["SD", "SMP", "SMA", "D3", "S1", "S2", "S3"].map((e) => <option key={e} value={e} />)}
        </datalist>
      </div>
      {value.gender === "female" && (
        <div className="sm:col-span-2">
          <label className={label}>{t("Berhijab? (menentukan siluet kartu)", "Wears a hijab? (sets the card's silhouette)")}</label>
          <select className={input} value={value.hijab} onChange={set("hijab")}>
            <option value="">{t("Belum tahu", "Not known")}</option>
            <option value="yes">{t("Ya", "Yes")}</option>
            <option value="no">{t("Tidak", "No")}</option>
          </select>
        </div>
      )}
    </>
  );
}
