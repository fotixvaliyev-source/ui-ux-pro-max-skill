import { z } from "zod";
import { decisionStatusSchema } from "@/lib/constants";
import { dateInput } from "./goals";

const optionalText = (max: number) =>
  z.string().trim().max(max, `Keep it under ${max} characters.`).optional().transform((v) => (v ? v : undefined));

/** ISO timestamp with timezone, produced by the browser from a datetime-local input. */
const instant = z
  .string()
  .trim()
  .min(1, "Pick a date and time.")
  .transform((v, ctx) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Pick a valid date and time." });
      return z.NEVER;
    }
    return d;
  });

const httpUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Use a full link starting with https://");

/** One agenda item per line; blank lines dropped. */
const agendaLines = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 30),
  )
  .pipe(z.array(z.string().max(200, "Keep each agenda item under 200 characters.")));

export const meetingSchema = z.object({
  title: z.string().trim().min(3, "Give the meeting a title.").max(120),
  startsAt: instant,
  location: optionalText(200),
  videoUrl: httpUrl,
  agenda: agendaLines,
});

export const notesSchema = z.object({ notesMd: z.string().max(20000, "Notes can be up to 20,000 characters.") });

export const actionItemSchema = z.object({
  title: z.string().trim().min(2, "Describe the action.").max(200),
  ownerId: z.string().min(1, "Pick an owner.").max(40),
  dueDate: dateInput,
  meetingId: z.string().max(40).optional().transform((v) => (v ? v : undefined)),
});

export const decisionSchema = z.object({
  title: z.string().trim().min(5, "State the decision in a sentence.").max(300),
  context: z.string().trim().min(5, "Add the context and reasoning.").max(4000),
  decidedOn: dateInput.refine((d) => d !== undefined, "Pick the date it was decided."),
  status: decisionStatusSchema.default("ACTIVE"),
  involved: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").filter(Boolean) : [])),
  meetingId: z.string().max(40).optional().transform((v) => (v ? v : undefined)),
});
