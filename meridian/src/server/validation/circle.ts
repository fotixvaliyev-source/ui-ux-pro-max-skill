import { z } from "zod";
import { CADENCES, CIRCLE_ACCENTS } from "@/lib/constants";

export const INVITE_CODE_LENGTH = 8;

export const circleSchema = z.object({
  name: z.string().trim().min(2, "Give the circle a name.").max(60),
  purpose: z.string().trim().min(10, "Write at least a sentence about what the circle is for.").max(300),
  cadence: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.enum(CADENCES).optional()),
  accent: z.enum(CIRCLE_ACCENTS).default("indigo"),
});

export const inviteCodeSchema = z
  .string()
  .transform((v) => v.toUpperCase().replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^[A-Z0-9]{8}$/, "Invite codes are 8 letters and numbers."));

export const idSchema = z.string().min(1).max(40);
