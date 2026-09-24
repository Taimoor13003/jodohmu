// Company money out, kept beside the Call Desk so revenue and costs can be read together. Safe for client and server.

export const EXPENSE_CATEGORIES = [
  { value: "salary", label: { id: "Gaji", en: "Salary" } },
  { value: "commission", label: { id: "Komisi", en: "Commission" } },
  { value: "ads", label: { id: "Iklan", en: "Ads" } },
  { value: "setup", label: { id: "Pendirian perusahaan", en: "Company setup" } },
  { value: "other", label: { id: "Lainnya", en: "Other" } },
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

// "owed" is money promised but not yet paid; it is shown apart from what has actually gone out
export const EXPENSE_STATUSES = [
  { value: "paid", label: { id: "Sudah dibayar", en: "Paid" } },
  { value: "owed", label: { id: "Belum dibayar", en: "Owed" } },
] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number]["value"];

export type FinanceExpense = {
  id: string;
  // YYYY-MM-DD; when only the month is known, the first of that month
  date: string;
  amount: number;
  category: ExpenseCategory;
  status: ExpenseStatus;
  payee: string;
  role: string;
  note: string;
  // Contact the cost belongs to, e.g. the client a commission was earned on
  contactId: string | null;
};

export const FINANCE_EXPENSES = "finance_expenses";
