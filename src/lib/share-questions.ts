import { z } from "zod";

/* ──────────────────────────────────────────────────────────────────────
   Matchmaking questionnaire attached to a profile link.

   Pure and isomorphic: the builder edits questions, the viewer renders and
   pre-validates answers, and the API re-validates against the snapshot
   stored on the link (never against the live default set).
   ────────────────────────────────────────────────────────────────────── */

export const localizedTextSchema = z.object({
  id: z.string().trim().min(1).max(300),
  en: z.string().trim().min(1).max(300),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

export const questionSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]{1,40}$/),
  type: z.enum(["yes_no", "text", "choice"]),
  label: localizedTextSchema,
  options: z.array(z.object({ value: z.string().regex(/^[a-z0-9_]{1,40}$/), label: localizedTextSchema })).max(8).optional(),
  required: z.boolean(),
  showIf: z.union([
    z.object({ questionId: z.string(), equals: z.string() }),
    z.literal("photosHidden"),
  ]).optional(),
});
export type Question = z.infer<typeof questionSchema>;

export const questionsSchema = z
  .array(questionSchema)
  .min(1)
  .max(15)
  .superRefine((qs, ctx) => {
    const ids = new Set<string>();
    qs.forEach((q, i) => {
      if (ids.has(q.id)) ctx.addIssue({ code: "custom", message: `Duplicate question id "${q.id}"`, path: [i, "id"] });
      ids.add(q.id);
      if (q.type === "choice" && (!q.options || q.options.length < 2)) {
        ctx.addIssue({ code: "custom", message: "Choice questions need at least two options", path: [i, "options"] });
      }
      if (q.showIf && q.showIf !== "photosHidden") {
        const parentIdx = qs.findIndex(p => p.id === (q.showIf as { questionId: string }).questionId);
        if (parentIdx === -1 || parentIdx >= i) {
          ctx.addIssue({ code: "custom", message: "A conditional question must follow the question it depends on", path: [i, "showIf"] });
        }
      }
    });
  });

export const YES_NO_OPTIONS = [
  { value: "yes", label: { id: "Ya", en: "Yes" } },
  { value: "no", label: { id: "Tidak", en: "No" } },
];

export const DEFAULT_SHARE_QUESTIONS: Question[] = [
  {
    id: "match",
    type: "yes_no",
    required: true,
    label: { id: "Menurut Anda, apakah Anda cocok dengan orang ini?", en: "Do you think you are a match for this person?" },
  },
  {
    id: "match_yes_why",
    type: "text",
    required: true,
    showIf: { questionId: "match", equals: "yes" },
    label: { id: "Mengapa Anda merasa cocok?", en: "Why do you feel you are a match?" },
  },
  {
    id: "match_no_why",
    type: "text",
    required: true,
    showIf: { questionId: "match", equals: "no" },
    label: { id: "Mengapa Anda merasa tidak cocok?", en: "Why do you feel you are not a match?" },
  },
  {
    id: "like",
    type: "text",
    required: true,
    label: { id: "Apa yang paling Anda sukai dari orang ini?", en: "What do you like most about this person?" },
  },
  {
    id: "compromise",
    type: "text",
    required: false,
    label: { id: "Hal apa yang bisa Anda kompromikan dari orang ini?", en: "What about this person could you compromise on?" },
  },
  {
    id: "photo_hidden",
    type: "choice",
    required: true,
    showIf: "photosHidden",
    label: { id: "Foto orang ini tidak ditampilkan. Apakah itu tidak masalah bagi Anda?", en: "This person's photo isn't shown. Is that okay with you?" },
    options: [
      { value: "fine", label: { id: "Tidak masalah", en: "That's fine" } },
      { value: "prefer_to_see", label: { id: "Saya lebih suka melihat fotonya", en: "I'd prefer to see a photo" } },
      { value: "must_see", label: { id: "Saya harus melihat foto sebelum memutuskan", en: "I need to see a photo before deciding" } },
    ],
  },
];

/** "None of them" value for the closing question on multi-profile links. */
export const FINAL_CHOICE_NONE = "none";

export type ProfileAnswers = Record<string, string>;

export function optionsFor(q: Question) {
  return q.type === "yes_no" ? YES_NO_OPTIONS : q.options ?? [];
}

/**
 * The first yes/no question is answered by the swipe itself, so the deck
 * never renders it as a form field.
 */
export function swipeQuestionId(questions: Question[]): string | null {
  return questions.find(q => q.type === "yes_no" && !q.showIf)?.id ?? null;
}

export function isQuestionVisible(q: Question, answers: ProfileAnswers, photosHidden: boolean): boolean {
  if (!q.showIf) return true;
  if (q.showIf === "photosHidden") return photosHidden;
  return answers[q.showIf.questionId] === q.showIf.equals;
}

export function visibleQuestions(questions: Question[], answers: ProfileAnswers, photosHidden: boolean): Question[] {
  return questions.filter(q => isQuestionVisible(q, answers, photosHidden));
}

const TEXT_MAX = 2000;

export interface AnswerCheck {
  ok: boolean;
  value: ProfileAnswers;
  questionId?: string;
  reason?: "required" | "invalid";
}

/**
 * Keeps only answers to questions this viewer actually saw, trims text, and
 * rejects missing required answers or out-of-range choices.
 */
export function checkProfileAnswers(questions: Question[], raw: unknown, photosHidden: boolean): AnswerCheck {
  const input = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const value: ProfileAnswers = {};

  for (const q of questions) {
    if (!isQuestionVisible(q, value, photosHidden)) continue;
    const given = typeof input[q.id] === "string" ? (input[q.id] as string).trim() : "";

    if (!given) {
      if (q.required) return { ok: false, value, questionId: q.id, reason: "required" };
      continue;
    }
    if (q.type === "text") {
      value[q.id] = given.slice(0, TEXT_MAX);
      continue;
    }
    if (!optionsFor(q).some(o => o.value === given)) return { ok: false, value, questionId: q.id, reason: "invalid" };
    value[q.id] = given;
  }
  return { ok: true, value };
}
