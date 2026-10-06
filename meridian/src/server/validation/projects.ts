import { z } from "zod";
import { opportunityStatusSchema, opportunityTypeSchema } from "@/lib/constants";
import { normalizeTags } from "@/lib/tags";
import { dateInput } from "./goals";

const optionalText = (max: number) =>
  z.string().trim().max(max, `Keep it under ${max} characters.`).optional().transform((v) => (v ? v : undefined));

export const cardSchema = z.object({
  title: z.string().trim().min(2, "Give the card a title.").max(140),
  description: optionalText(2000),
  ownerId: z.string().max(40).optional().transform((v) => (v ? v : undefined)),
  dueDate: dateInput,
  label: optionalText(30),
  columnId: z.string().max(40).optional(),
});

export const columnNameSchema = z.string().trim().min(1, "Name the column.").max(40);

export const opportunitySchema = z.object({
  type: opportunityTypeSchema,
  title: z.string().trim().min(5, "Give the post a clear title.").max(140),
  description: z.string().trim().min(10, "Add a few details so people can respond.").max(3000),
  tags: z.string().optional().transform((v) => normalizeTags((v ?? "").split(","))),
  status: opportunityStatusSchema.default("OPEN"),
});

const optionLines = z
  .string()
  .transform((v) => v.split("\n").map((l) => l.trim()).filter(Boolean))
  .pipe(z.array(z.string().max(120, "Keep each option under 120 characters.")).min(2, "Add at least two options.").max(8, "Up to eight options."));

export const pollSchema = z.object({
  question: z.string().trim().min(5, "Ask a clear question.").max(200),
  options: optionLines,
  closesAt: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v) return undefined;
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({ code: "custom", message: "Pick a valid deadline." });
        return z.NEVER;
      }
      return d;
    }),
});
