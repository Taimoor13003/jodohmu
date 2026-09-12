"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { QuestionEditor } from "@/components/admin/question-editor";
import { authFetch } from "@/components/admin/share-api";
import { questionsSchema, type Question } from "@/lib/share-questions";

const C = {
  bg: "#EEF2F7", border: "#E2E8F0", text: "#0F172A", body: "#334155", label: "#64748B", navy: "#1B3A6B", rose: "#C4294A",
};

export default function DefaultQuestionsPage() {
  const { role, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const l = lang === "en" ? "en" : "id";
  const t = (id: string, en: string) => (l === "id" ? id : en);

  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [customized, setCustomized] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role !== "admin") return;
    authFetch<{ questions: Question[]; customized: boolean }>("/api/admin/share-questions")
      .then(json => {
        setQuestions(json.questions);
        setCustomized(json.customized);
      })
      .catch(err => toast.error(err instanceof Error ? err.message : "Failed"));
  }, [role]);

  const issue = useMemo(() => {
    if (!questions) return null;
    const parsed = questionsSchema.safeParse(questions);
    return parsed.success ? null : parsed.error.issues[0]?.message ?? "Invalid";
  }, [questions]);

  const save = async (body: Record<string, unknown>, msg: string) => {
    setSaving(true);
    try {
      const json = await authFetch<{ questions: Question[]; customized: boolean }>("/api/admin/share-questions", { method: "PUT", body: JSON.stringify(body) });
      setQuestions(json.questions);
      setCustomized(json.customized);
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;
  if (role !== "admin") {
    return <p className="p-8 text-center text-[14px]" style={{ color: C.body }}>{t("Hanya admin yang dapat mengubah pertanyaan bawaan.", "Only admins can edit the default questions.")}</p>;
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div className="mx-auto max-w-3xl px-4 py-6 pb-16">
        <Link href="/admin/shares" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: C.label }}>
          <ArrowLeft className="h-4 w-4" /> {t("Tautan Profil", "Profile Links")}
        </Link>
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[21px] font-extrabold" style={{ color: C.text, fontFamily: "var(--font-playfair), Georgia, serif" }}>
              {t("Pertanyaan bawaan", "Default questions")}
            </h1>
            <p className="text-[13px]" style={{ color: C.label }}>
              {t(
                "Setiap tautan perjodohan baru dimulai dengan pertanyaan ini. Tautan yang sudah dikirim tidak berubah.",
                "Every new matchmaking link starts with these questions. Links already sent keep their own copy.",
              )}
            </p>
          </div>
          {customized && (
            <button disabled={saving} onClick={() => save({ reset: true }, t("Dikembalikan ke bawaan", "Restored built-in questions"))} className="flex items-center gap-1.5 rounded-lg border bg-white px-3.5 py-2 text-[13px] font-bold disabled:opacity-50" style={{ borderColor: C.border, color: C.body }}>
              <RotateCcw className="h-4 w-4" /> {t("Kembalikan bawaan", "Restore built-in")}
            </button>
          )}
          <button
            disabled={saving || !questions || !!issue}
            onClick={() => save({ questions }, t("Pertanyaan disimpan", "Questions saved"))}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
            style={{ background: C.navy }}
          >
            <Save className="h-4 w-4" /> {saving ? t("Menyimpan…", "Saving…") : t("Simpan", "Save")}
          </button>
        </div>

        {issue && <p className="mb-3 text-[12.5px] font-semibold" style={{ color: C.rose }}>{issue}</p>}
        {questions ? <QuestionEditor questions={questions} onChange={setQuestions} lang={l} /> : null}
      </div>
    </div>
  );
}
