"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { CONTACT_SOURCES, IMPORTED_SOURCES } from "@/lib/calldesk";
import { EMPTY_LEAD, findPage, type CardPerson, type LeadDetails, type SocialPageKey } from "@/lib/social";
import { authFetch } from "./share-api";

const input = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20";
const label = "mb-1 block text-xs font-semibold text-slate-500";
const manualSources = CONTACT_SOURCES.filter((source) => !IMPORTED_SOURCES.includes(source.value));
const str = (value: unknown) => (typeof value === "string" || typeof value === "number" ? String(value) : "");

// A listed lead's details, back in the shape of the form
const detailsOf = (lead: CardPerson): LeadDetails => {
  const p = lead.profile;
  return {
    ...EMPTY_LEAD,
    name: str(p.name), city: str(p.location), gender: str(p.gender), age: str(p.age), maritalStatus: str(p.maritalStatus),
    religion: str(p.religion), nationality: str(p.nationality), occupation: str(p.occupation), education: str(p.educationLevel),
    ethnicity: str(p.ethnicity), hijab: str(p.hijab),
  };
};

/* Subpages → Client cards: add a lead to this page, or correct one already listed.
   The lead is a Call Desk contact, tagged with the page it was added from. */
export default function SubpageLeadForm({ page, lang, lead, onClose, onSaved }: {
  page: SocialPageKey;
  lang: "id" | "en";
  // Given when correcting a lead; left out when adding one
  lead?: CardPerson | null;
  onClose: () => void;
  onSaved: (id: string) => Promise<void> | void;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);
  const pageInfo = findPage(page)!;
  const [form, setForm] = useState<LeadDetails>(() => (lead ? detailsOf(lead) : EMPTY_LEAD));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof LeadDetails) => (event: { target: { value: string } }) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = await authFetch<{ id: string }>("/api/admin/social", {
        method: "POST",
        body: JSON.stringify(lead ? { action: "edit_lead", candidateId: lead.id, lead: form } : { action: "add_lead", page, lead: form }),
      });
      await onSaved(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-900/40" />
      <form onSubmit={submit} className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {lead ? t("Ubah data calon klien", "Edit lead details") : t(`Tambah calon klien @${pageInfo.handle}`, `Add a lead to @${pageInfo.handle}`)}
          </h2>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {lead
            ? t("Data ini mengisi kartu. Perubahan tercatat di riwayat Call Desk.", "These details fill in the card. Changes are noted in the lead's Call Desk history.")
            : t(`Masuk ke Call Desk dengan tanda @${pageInfo.handle}. Cukup nama dan nomor; sisanya mengisi kartu dan bisa dilengkapi nanti.`, `Goes into the Call Desk tagged @${pageInfo.handle}. Only the name and number are needed; the rest fills in the card and can be added later.`)}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className={lead ? "sm:col-span-2" : ""}>
            <label className={label}>{t("Nama *", "Name *")}</label>
            <input required className={input} value={form.name} onChange={set("name")} />
          </div>
          {!lead && (
            <div>
              <label className={label}>{t("Nomor WhatsApp *", "WhatsApp number *")}</label>
              <input required type="tel" className={input} value={form.phone} onChange={set("phone")} placeholder="0812…" />
            </div>
          )}
          <div>
            <label className={label}>{t("Kota", "City")}</label>
            <input className={input} value={form.city} onChange={set("city")} />
          </div>
          {!lead && (
            <div>
              <label className={label}>{t("Menghubungi lewat", "Reached us through")}</label>
              <select className={input} value={form.source} onChange={set("source")}>
                {manualSources.map((source) => <option key={source.value} value={source.value}>{source.label[lang]}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={label}>{t("Jenis kelamin", "Gender")}</label>
            <select className={input} value={form.gender} onChange={set("gender")}>
              <option value="">{t("Belum tahu", "Not known")}</option>
              <option value="female">{t("Perempuan", "Female")}</option>
              <option value="male">{t("Laki-laki", "Male")}</option>
            </select>
          </div>
          <div>
            <label className={label}>{t("Usia", "Age")}</label>
            <input type="number" min={16} max={99} className={input} value={form.age} onChange={set("age")} />
          </div>
          <div>
            <label className={label}>{t("Status pernikahan", "Marital status")}</label>
            <select className={input} value={form.maritalStatus} onChange={set("maritalStatus")}>
              <option value="">{t("Belum tahu", "Not known")}</option>
              <option value="never_married">{t("Belum menikah", "Single")}</option>
              <option value="divorced">{t("Cerai", "Divorced")}</option>
              <option value="widowed">{t("Cerai mati", "Widowed")}</option>
              <option value="married">{t("Menikah", "Married")}</option>
            </select>
          </div>
          <div>
            <label className={label}>{t("Agama", "Religion")}</label>
            <input list="lead-religions" className={input} value={form.religion} onChange={set("religion")} />
            <datalist id="lead-religions">
              {["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"].map((r) => <option key={r} value={r} />)}
            </datalist>
          </div>
          <div>
            <label className={label}>{t("Kewarganegaraan", "Nationality")}</label>
            <input list="lead-nationalities" className={input} value={form.nationality} onChange={set("nationality")} placeholder="Indonesia" />
            <datalist id="lead-nationalities"><option value="Indonesia" /></datalist>
          </div>
          <div>
            <label className={label}>{t("Suku", "Ethnicity")}</label>
            <input className={input} value={form.ethnicity} onChange={set("ethnicity")} />
          </div>
          <div>
            <label className={label}>{t("Pekerjaan", "Job")}</label>
            <input className={input} value={form.occupation} onChange={set("occupation")} />
          </div>
          <div>
            <label className={label}>{t("Pendidikan terakhir", "Education")}</label>
            <input list="lead-educations" className={input} value={form.education} onChange={set("education")} placeholder="S1" />
            <datalist id="lead-educations">
              {["SD", "SMP", "SMA", "D3", "S1", "S2", "S3"].map((e) => <option key={e} value={e} />)}
            </datalist>
          </div>
          {form.gender === "female" && (
            <div className="sm:col-span-2">
              <label className={label}>{t("Berhijab? (menentukan siluet kartu)", "Wears a hijab? (sets the card's silhouette)")}</label>
              <select className={input} value={form.hijab} onChange={set("hijab")}>
                <option value="">{t("Belum tahu", "Not known")}</option>
                <option value="yes">{t("Ya", "Yes")}</option>
                <option value="no">{t("Tidak", "No")}</option>
              </select>
            </div>
          )}
          {!lead && (
            <div className="sm:col-span-2">
              <label className={label}>{t("Catatan", "Note")}</label>
              <textarea rows={3} value={form.note} onChange={set("note")} className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20" />
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>}
        <button type="submit" disabled={saving} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C4294A] text-sm font-bold text-white hover:bg-[#a82340] disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {lead ? t("Simpan perubahan", "Save changes") : t("Simpan calon klien", "Save lead")}
        </button>
      </form>
    </div>
  );
}
