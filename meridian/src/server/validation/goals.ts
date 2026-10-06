import { z } from "zod";
import { goalStatusSchema } from "@/lib/constants";
import { QUARTER_RE } from "@/lib/dates";

const optionalText = (max: number) =>
  z.string().trim().max(max, `Keep it under ${max} characters.`).optional().transform((v) => (v ? v : undefined));

/** <input type="date"> value (yyyy-mm-dd) -> Date at noon UTC, or undefined. */
export const dateInput = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return undefined;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      ctx.addIssue({ code: "custom", message: "Use a valid date." });
      return z.NEVER;
    }
    const d = new Date(`${v}T12:00:00Z`);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Use a valid date." });
      return z.NEVER;
    }
    return d;
  });

export const goalSchema = z.object({
  title: z.string().trim().min(3, "Give the goal a short title.").max(120),
  description: optionalText(1000),
  target: optionalText(200),
  deadline: dateInput,
  quarter: z.string().regex(QUARTER_RE, "Pick a quarter."),
  status: goalStatusSchema.default("ON_TRACK"),
});

export const checkInSchema = z.object({
  progressed: z.string().trim().min(3, "Say what moved forward.").max(1000),
  blocked: optionalText(1000),
  helpNeeded: optionalText(1000),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Write something first.").max(2000, "Keep it under 2000 characters."),
});
