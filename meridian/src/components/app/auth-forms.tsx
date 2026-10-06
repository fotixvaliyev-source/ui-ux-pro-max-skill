"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";
import { Field, Input } from "@/components/ui/form";
import { fail, safeNext, succeed, type ActionState } from "@/lib/action-state";
import { loginSchema } from "@/server/validation/auth";
import { signupAction } from "@/server/actions/auth";
import { FormGrid, FormMessage, SubmitButton, fieldError } from "./form-parts";

/** Credentials sign-in through Auth.js's endpoint, then a full page load so the new cookie is used everywhere. */
async function signInAndGo(email: string, password: string, to: string): Promise<ActionState> {
  const res = await signIn("credentials", { email, password, redirect: false });
  if (!res || res.error) return fail("That email and password do not match.");
  window.location.assign(to);
  return succeed();
}

function useSubmit(handler: (fd: FormData) => Promise<ActionState>) {
  const [state, setState] = useState<ActionState>({ ok: false });
  const [pending, start] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => setState(await handler(fd)));
  };
  return { state, pending, onSubmit };
}

export function LoginForm({ next }: { next?: string }) {
  const { state, pending, onSubmit } = useSubmit(async (fd) => {
    const parsed = loginSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: "Enter your email and password." };
    return signInAndGo(parsed.data.email, parsed.data.password, safeNext(next));
  });
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormGrid>
        <Field label="Email" htmlFor="email" error={fieldError(state, "email")}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password" error={fieldError(state, "password")}>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </Field>
      </FormGrid>
      <FormMessage state={state} />
      <SubmitButton size="lg" pending="Logging in..." disabled={pending} aria-busy={pending}>Log in</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-bold text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignupForm({ next }: { next?: string }) {
  const { state, pending, onSubmit } = useSubmit(async (fd) => {
    const created = await signupAction({ ok: false }, fd);
    if (!created.ok) return created;
    const to = next ? `/onboarding?next=${encodeURIComponent(next)}` : "/onboarding";
    const signedIn = await signInAndGo(String(fd.get("email") ?? "").trim().toLowerCase(), String(fd.get("password") ?? ""), to);
    return signedIn.ok ? signedIn : fail("Your account was created, but we could not log you in. Please log in.");
  });
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormGrid>
        <Field label="Your name" htmlFor="name" error={fieldError(state, "name")}>
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="email" error={fieldError(state, "email")}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 8 characters." error={fieldError(state, "password")}>
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        </Field>
      </FormGrid>
      <FormMessage state={state} />
      <SubmitButton size="lg" pending="Creating your account..." disabled={pending} aria-busy={pending}>Create account</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-bold text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
