"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, Input } from "@/components/ui/form";
import { initialState } from "@/lib/action-state";
import { loginAction, signupAction } from "@/server/actions/auth";
import { FormGrid, FormMessage, SubmitButton, fieldError, ActionForm } from "./form-parts";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initialState);
  return (
    <ActionForm action={action} className="flex flex-col gap-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FormGrid>
        <Field label="Email" htmlFor="email" error={fieldError(state, "email")}>
          <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!fieldError(state, "email")} />
        </Field>
        <Field label="Password" htmlFor="password" error={fieldError(state, "password")}>
          <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={!!fieldError(state, "password")} />
        </Field>
      </FormGrid>
      <FormMessage state={state} />
      <SubmitButton size="lg" pending="Logging in...">Log in</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-bold text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </ActionForm>
  );
}

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signupAction, initialState);
  return (
    <ActionForm action={action} className="flex flex-col gap-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FormGrid>
        <Field label="Your name" htmlFor="name" error={fieldError(state, "name")}>
          <Input id="name" name="name" autoComplete="name" required aria-invalid={!!fieldError(state, "name")} />
        </Field>
        <Field label="Email" htmlFor="email" error={fieldError(state, "email")}>
          <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!fieldError(state, "email")} />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 8 characters." error={fieldError(state, "password")}>
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} aria-invalid={!!fieldError(state, "password")} />
        </Field>
      </FormGrid>
      <FormMessage state={state} />
      <SubmitButton size="lg" pending="Creating your account...">Create account</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-bold text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </ActionForm>
  );
}
