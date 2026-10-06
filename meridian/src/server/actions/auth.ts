"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";
import { signIn, signOut } from "@/server/auth";
import { fail, safeNext, type ActionState } from "@/lib/action-state";
import { loginSchema, signupSchema } from "@/server/validation/auth";
import { parseForm } from "./run";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(loginSchema, formData);
  if ("state" in parsed) return parsed.state;
  const next = safeNext(String(formData.get("next") ?? ""));
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: next });
  } catch (e) {
    if (e instanceof AuthError) return fail("That email and password do not match.");
    throw e; // the redirect on success is thrown by signIn
  }
  return { ok: true };
}

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(signupSchema, formData);
  if ("state" in parsed) return parsed.state;
  const { name, email, password } = parsed.data;
  const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return { ok: false, error: "An account with that email already exists.", fieldErrors: { email: ["Try logging in instead."] } };
  await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 10) } });
  const next = safeNext(String(formData.get("next") ?? ""), "/onboarding");
  try {
    await signIn("credentials", { email, password, redirectTo: next.startsWith("/join/") ? "/onboarding?next=" + encodeURIComponent(next) : "/onboarding" });
  } catch (e) {
    if (e instanceof AuthError) return fail("Your account was created, but we could not log you in. Please log in.");
    throw e;
  }
  return { ok: true };
}

export async function socialSignInAction(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider"));
  if (provider !== "google" && provider !== "linkedin") redirect("/login");
  await signIn(provider, { redirectTo: safeNext(String(formData.get("next") ?? ""), "/app") });
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
