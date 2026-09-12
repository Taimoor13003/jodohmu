"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Question } from "@/lib/share-questions";

type Lang = "id" | "en";

const C = {
  border: "#E2E8F0", bg: "#F8FAFC", text: "#0F172A", body: "#334155", label: "#64748B", muted: "#94A3B8",
  navy: "#1B3A6B", rose: "#C4294A",
};

const TYPE_LABEL: Record<Question["type"], Record<Lang, string>> = {
  yes_no: { id: "Ya / Tidak", en: "Yes / No" },
  choice: { id: "Pilihan", en: "Multiple choice" },
  text: { id: "Jawaban tertulis", en: "Written answer" },
};

function uniqueId(base: string, taken: Set<string>): string {
  const root = base.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 30) || "question";
  let id = root;
  let n = 2;
  while (taken.has(id)) id = `${root}_${n++}`;
  return id;
}

const input = "w-full rounded-lg border px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-200";

export function QuestionEditor({ questions, onChange, lang }: {
  questions: Question[];
  onChange: (next: Question[]) => void;
  lang: Lang;
}) {
  const t = (id: string, en: string) => (lang === "id" ? id : en);

  const update = (i: number, patch: Partial<Question>) =>
    onChange(questions.map((q, idx) => (idx === i ? ({ ...q, ...patch } as Question) : q)));

  const remove = (i: number) => {
    const removed = questions[i].id;
    onChange(
      questions
        .filter((_, idx) => idx !== i)
        .map(q => (q.showIf && q.showIf !== "photosHidden" && q.showIf.questionId === removed ? { ...q, showIf: undefined } : q)),
    );
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    const next = [...questions];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const add = () =>
    onChange([
      ...questions,
      { id: uniqueId("question", new Set(questions.map(q => q.id))), type: "text", required: false, label: { id: "", en: "" } },
    ]);

  const setType = (i: number, type: Question["type"]) => {
    const q = questions[i];
    update(i, {
      type,
      options:
        type === "choice"
          ? q.options?.length
            ? q.options
            : [
                { value: "option_1", label: { id: "Pilihan 1", en: "Option 1" } },
                { value: "option_2", label: { id: "Pilihan 2", en: "Option 2" } },
              ]
          : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {questions.map((q, i) => {
        const earlier = questions.slice(0, i).filter(p => p.type !== "text");
        const showIfValue = !q.showIf ? "" : q.showIf === "photosHidden" ? "photosHidden" : `${q.showIf.questionId}=${q.showIf.equals}`;

        return (
          <div key={q.id} className="rounded-2xl border bg-white p-4" style={{ borderColor: C.border }}>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold" style={{ background: C.bg, color: C.navy }}>
                {i + 1}
              </span>
              <select
                value={q.type}
                onChange={e => setType(i, e.target.value as Question["type"])}
                className="h-8 rounded-lg border px-2 text-[12px] font-semibold"
                style={{ borderColor: C.border, color: C.body }}
              >
                {(Object.keys(TYPE_LABEL) as Question["type"][]).map(type => (
                  <option key={type} value={type}>{TYPE_LABEL[type][lang]}</option>
                ))}
              </select>
              <label className="ml-1 flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: C.label }}>
                <input type="checkbox" checked={q.required} onChange={e => update(i, { required: e.target.checked })} />
                {t("Wajib", "Required")}
              </label>
              <div className="flex-1" />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md p-1.5 hover:bg-slate-100 disabled:opacity-30" aria-label="Move up">
                <ArrowUp className="h-3.5 w-3.5" style={{ color: C.label }} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === questions.length - 1} className="rounded-md p-1.5 hover:bg-slate-100 disabled:opacity-30" aria-label="Move down">
                <ArrowDown className="h-3.5 w-3.5" style={{ color: C.label }} />
              </button>
              <button type="button" onClick={() => remove(i)} className="rounded-md p-1.5 hover:bg-red-50" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                value={q.label.id}
                onChange={e => update(i, { label: { ...q.label, id: e.target.value } })}
                placeholder="Pertanyaan (Bahasa Indonesia)"
                className={input}
                style={{ borderColor: C.border, color: C.text }}
              />
              <input
                value={q.label.en}
                onChange={e => update(i, { label: { ...q.label, en: e.target.value } })}
                placeholder="Question (English)"
                className={input}
                style={{ borderColor: C.border, color: C.text }}
              />
            </div>

            {q.type === "choice" && (
              <div className="mt-3 flex flex-col gap-2 rounded-xl p-3" style={{ background: C.bg }}>
                {(q.options ?? []).map((opt, oi) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <input
                      value={opt.label.id}
                      onChange={e => update(i, { options: q.options!.map((o, k) => (k === oi ? { ...o, label: { ...o.label, id: e.target.value } } : o)) })}
                      placeholder="Pilihan"
                      className={input}
                      style={{ borderColor: C.border, color: C.text }}
                    />
                    <input
                      value={opt.label.en}
                      onChange={e => update(i, { options: q.options!.map((o, k) => (k === oi ? { ...o, label: { ...o.label, en: e.target.value } } : o)) })}
                      placeholder="Option"
                      className={input}
                      style={{ borderColor: C.border, color: C.text }}
                    />
                    <button
                      type="button"
                      onClick={() => update(i, { options: q.options!.filter((_, k) => k !== oi) })}
                      className="rounded-md p-1.5 hover:bg-red-50"
                      aria-label="Remove option"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    update(i, {
                      options: [
                        ...(q.options ?? []),
                        { value: uniqueId("option", new Set((q.options ?? []).map(o => o.value))), label: { id: "", en: "" } },
                      ],
                    })
                  }
                  className="self-start text-[12px] font-bold"
                  style={{ color: C.navy }}
                >
                  + {t("Tambah pilihan", "Add option")}
                </button>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[12px]" style={{ color: C.label }}>{t("Tampilkan", "Show")}</span>
              <select
                value={showIfValue}
                onChange={e => {
                  const v = e.target.value;
                  if (!v) update(i, { showIf: undefined });
                  else if (v === "photosHidden") update(i, { showIf: "photosHidden" });
                  else {
                    const [questionId, equals] = v.split("=");
                    update(i, { showIf: { questionId, equals } });
                  }
                }}
                className="h-8 max-w-full rounded-lg border px-2 text-[12px]"
                style={{ borderColor: C.border, color: C.body }}
              >
                <option value="">{t("selalu", "always")}</option>
                <option value="photosHidden">{t("hanya jika foto disembunyikan", "only when photos are hidden")}</option>
                {earlier.flatMap(p =>
                  (p.type === "yes_no"
                    ? [{ value: "yes", label: { id: "Ya", en: "Yes" } }, { value: "no", label: { id: "Tidak", en: "No" } }]
                    : p.options ?? []
                  ).map(opt => (
                    <option key={`${p.id}=${opt.value}`} value={`${p.id}=${opt.value}`}>
                      {t("jika", "if")} “{(p.label[lang] || p.id).slice(0, 40)}” = {opt.label[lang] || opt.value}
                    </option>
                  )),
                )}
              </select>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        disabled={questions.length >= 15}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed py-3 text-[13px] font-bold disabled:opacity-40"
        style={{ borderColor: C.muted, color: C.navy }}
      >
        <Plus className="h-4 w-4" />
        {t("Tambah pertanyaan", "Add question")}
      </button>
    </div>
  );
}
