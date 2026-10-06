import { z } from "zod";
import { normalizeTags } from "@/lib/tags";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : undefined));

/** Comma-separated tag input -> clean string[]. */
export const tagsInput = z
  .string()
  .optional()
  .transform((v) => normalizeTags((v ?? "").split(",")));

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(80),
  headline: optionalText(120),
  currentRole: optionalText(80),
  company: optionalText(80),
  industry: optionalText(80),
  bio: optionalText(600),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i.test(v), "Use a full LinkedIn URL starting with https://linkedin.com/"),
  expertise: tagsInput,
});

export const circleProfileSchema = z.object({
  workingOn: optionalText(300),
  canHelpWith: optionalText(300),
  lookingFor: optionalText(300),
});
