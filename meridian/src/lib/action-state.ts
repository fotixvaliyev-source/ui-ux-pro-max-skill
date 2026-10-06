import { z } from "zod";

/** Shape every server action returns to a form. Error messages never contain emoji. */
export interface ActionState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Optional payload, e.g. the id of something just created. */
  data?: Record<string, string>;
}

export const initialState: ActionState = { ok: false };

export function fail(error: string): ActionState {
  return { ok: false, error };
}

export function zodFail(err: z.ZodError): ActionState {
  const { fieldErrors } = z.flattenError(err);
  return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
}

export function succeed(data?: Record<string, string>): ActionState {
  return { ok: true, data };
}

/** Safe in-app redirect target: same-site path only. */
export function safeNext(next: string | null | undefined, fallback = "/app"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
