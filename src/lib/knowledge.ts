// What the business has learned from its leads, calls and numbers, kept as short entries
// that can be read by the team and updated after every CRM sync. Safe for client and server.

export const KNOWLEDGE_CATEGORIES = [
  { value: "summary", label: { id: "Ringkasan", en: "Summary" }, hint: { id: "Gambaran besar saat ini", en: "The big picture right now" } },
  { value: "process", label: { id: "Proses kita", en: "How we work" }, hint: { id: "Langkah dari iklan sampai bayar", en: "The steps from ad to payment" } },
  { value: "leads", label: { id: "Siapa calon klien kita", en: "Who our leads are" }, hint: { id: "Usia, lokasi, status, keinginan", en: "Age, location, status, wishes" } },
  { value: "why_lost", label: { id: "Kenapa kita kehilangan lead", en: "Why we lose leads" }, hint: { id: "Alasan dan polanya", en: "Reasons and patterns" } },
  { value: "what_works", label: { id: "Yang berhasil", en: "What works" }, hint: { id: "Apa yang membuat orang bayar", en: "What gets people to pay" } },
  { value: "team", label: { id: "Tim & eksekusi", en: "Team & execution" }, hint: { id: "Janji yang terlewat, kecepatan balas", en: "Missed promises, reply speed" } },
  { value: "pricing", label: { id: "Harga & uang", en: "Pricing & money" }, hint: { id: "Harga, keberatan, keuangan", en: "Prices, objections, finances" } },
  { value: "ads", label: { id: "Iklan", en: "Ads" }, hint: { id: "Iklan mana yang membawa siapa", en: "Which ads bring whom" } },
  { value: "playbook", label: { id: "Panduan & skrip", en: "Playbook & scripts" }, hint: { id: "Cara menangani situasi", en: "How to handle situations" } },
  { value: "actions", label: { id: "Yang harus diperbaiki", en: "What to improve" }, hint: { id: "Langkah konkret berikutnya", en: "Concrete next steps" } },
] as const;
export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number]["value"];

export type KnowledgeEntry = {
  id: string;
  key: string;
  category: KnowledgeCategory;
  title: string;
  // Plain text; lines starting with "- " show as bullet points
  body: string;
  // Names of the leads or sources the entry is based on
  evidence: string[];
  // Higher shows first within its category
  priority: number;
  updatedAt: string | null;
  updatedBy: string | null;
};

export const KNOWLEDGE_BASE = "knowledge_base";
