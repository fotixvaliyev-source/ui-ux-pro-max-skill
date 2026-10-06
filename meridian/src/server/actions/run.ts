import { z } from "zod";
import { fail, zodFail, type ActionState } from "@/lib/action-state";
import { ForbiddenError, UserError } from "@/server/access";

/** Turns known failures into form-friendly state. Unknown errors propagate (and are logged by Next). */
export async function guarded(fn: () => Promise<ActionState>): Promise<ActionState> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ForbiddenError || e instanceof UserError) return fail(e.message);
    throw e;
  }
}

/** Validates FormData against a Zod schema. Returns data, or a ready-made failure state. */
export function parseForm<S extends z.ZodType>(schema: S, formData: FormData): { data: z.output<S> } | { state: ActionState } {
  const result = schema.safeParse(Object.fromEntries(formData));
  return result.success ? { data: result.data } : { state: zodFail(result.error) };
}
