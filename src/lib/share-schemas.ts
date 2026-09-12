import { z } from "zod";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ruleSchema = z.object({
  fields: z.array(z.string()).max(100),
  showName: z.boolean(),
  showPhotos: z.boolean(),
});

export const audiencesSchema = z.object({ public: ruleSchema, member: ruleSchema, candidate: ruleSchema });

export const accessSchema = z
  .object({
    mode: z.enum(["anyone", "signin", "invited"]),
    invitedEmails: z.array(z.string().trim().toLowerCase().regex(EMAIL_RE, "Invalid email")).max(50).default([]),
  })
  .refine(a => a.mode !== "invited" || a.invitedEmails.length > 0, { message: "Add at least one invited email" });

export const photoSelectionSchema = z.record(z.string(), z.array(z.number().int().min(0).max(50)).nullable());
