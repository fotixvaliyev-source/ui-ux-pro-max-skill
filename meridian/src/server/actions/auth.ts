"use server";

import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { succeed, type ActionState } from "@/lib/action-state";
import { signupSchema } from "@/server/validation/auth";
import { parseForm } from "./run";

/**
 * Creates the account only. Signing in happens on the client through Auth.js's own endpoint
 * (see auth-forms.tsx), so this action never sets cookies.
 */
export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(signupSchema, formData);
  if ("state" in parsed) return parsed.state;
  const { name, email, password } = parsed.data;
  const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return { ok: false, error: "An account with that email already exists.", fieldErrors: { email: ["Try logging in instead."] } };
  await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 10) } });
  return succeed();
}
