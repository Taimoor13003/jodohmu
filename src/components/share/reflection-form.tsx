"use client";

import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { optionsFor, visibleQuestions, type ProfileAnswers, type Question } from "@/lib/share-questions";
import type { Lang } from "@/lib/share-display";
import { T, serif } from "./share-theme";

function OptionCard({ selected, onClick, disabled, children }: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[14.5px] font-semibold transition-all disabled:opacity-60"
      style={
        selected
          ? { background: T.navyDeep, color: "#fff", border: `1px solid ${T.navyDeep}`, boxShadow: "0 8px 20px -10px rgba(10,39,84,0.55)" }
          : { background: T.card, color: T.body, border: `1px solid ${T.hairline}` }
      }
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={selected ? { background: "#fff" } : { border: `1.5px solid ${T.faint}` }}
      >
        {selected && <span className="h-2 w-2 rounded-full" style={{ background: T.navyDeep }} />}
      </span>
      {children}
    </button>
  );
}

export function ReflectionForm({
  questions, answers, onChange, photosHidden, lang, highlightId, disabled,
}: {
  questions: Question[];
  answers: ProfileAnswers;
  onChange: (next: ProfileAnswers) => void;
  photosHidden: boolean;
  lang: Lang;
  highlightId?: string | null;
  disabled?: boolean;
}) {
  const visible = visibleQuestions(questions, answers, photosHidden);
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (highlightId) refs.current[highlightId]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId]);

  const set = (id: string, value: string) => onChange({ ...answers, [id]: value });

  return (
    <ol className="flex flex-col gap-9">
      {visible.map((q, i) => {
        const value = answers[q.id] ?? "";
        const flagged = highlightId === q.id;
        return (
          <li key={q.id}>
            <div
              ref={el => { refs.current[q.id] = el; }}
              className="rounded-2xl transition-shadow"
              style={flagged ? { boxShadow: `0 0 0 2px ${T.rose}`, padding: 14, margin: -14 } : undefined}
            >
              <div className="mb-4 flex gap-4">
                <span className="pt-0.5 text-[15px] tabular-nums" style={{ fontFamily: serif, color: T.gold }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <label className="text-[18px] leading-snug" style={{ fontFamily: serif, color: T.ink }}>
                  {q.label[lang]}
                  {!q.required && (
                    <span className="ml-2 align-middle text-[11.5px] font-sans" style={{ color: T.faint }}>
                      {lang === "id" ? "(opsional)" : "(optional)"}
                    </span>
                  )}
                </label>
              </div>

              <div className="pl-0 sm:pl-9">
                {q.type === "text" ? (
                  <div>
                    <textarea
                      value={value}
                      disabled={disabled}
                      onChange={e => set(q.id, e.target.value)}
                      rows={4}
                      maxLength={2000}
                      placeholder={lang === "id" ? "Tulis dengan jujur dan tenang…" : "Write honestly, in your own words…"}
                      className="w-full resize-y rounded-2xl px-4 py-3.5 text-[15px] leading-relaxed focus:outline-none disabled:opacity-60"
                      style={{ background: T.paper, border: `1px solid ${T.hairline}`, color: T.ink }}
                    />
                    <p className="mt-1.5 text-right text-[11px] tabular-nums" style={{ color: T.faint }}>{value.length} / 2000</p>
                  </div>
                ) : (
                  <div role="radiogroup" className={q.type === "yes_no" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-2.5"}>
                    {optionsFor(q).map(option => (
                      <OptionCard key={option.value} selected={value === option.value} onClick={() => set(q.id, option.value)} disabled={disabled}>
                        {q.type === "yes_no" && (option.value === "yes"
                          ? <Check className="h-4 w-4 shrink-0" />
                          : <X className="h-4 w-4 shrink-0" />)}
                        {option.label[lang]}
                      </OptionCard>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
