import { z } from "zod";
import { resourceKindSchema } from "@/lib/constants";
import { normalizeTags } from "@/lib/tags";

export const resourceSchema = z
  .object({
    kind: resourceKindSchema,
    title: z.string().trim().min(2, "Give it a title.").max(140),
    whyUseful: z.string().trim().min(5, "Say in a sentence why this is useful.").max(500),
    url: z.string().trim().optional().transform((v) => (v ? v : undefined)),
    body: z.string().trim().max(10000, "Notes can be up to 10,000 characters.").optional().transform((v) => (v ? v : undefined)),
    tags: z.string().optional().transform((v) => normalizeTags((v ?? "").split(","))),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "LINK" && !(v.url && /^https?:\/\/\S+$/i.test(v.url))) ctx.addIssue({ code: "custom", path: ["url"], message: "Add a full link starting with https://" });
    if (v.kind === "NOTE" && !v.body) ctx.addIssue({ code: "custom", path: ["body"], message: "Write the note." });
  });
