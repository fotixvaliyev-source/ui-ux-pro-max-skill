"use client";

import { createContext, useContext, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

const PendingContext = createContext(false);

/**
 * A form that calls a useActionState dispatcher without React 19's automatic field reset,
 * so a failed submit keeps what the person typed. SubmitButton reads its pending state.
 */
export function ActionForm({
  action,
  children,
  ...props
}: Omit<React.FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit"> & { action: (payload: FormData) => void }) {
  const [pending, start] = useTransition();
  return (
    <PendingContext.Provider value={pending}>
      <form
        {...props}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          start(() => action(data));
        }}
      >
        {children}
      </form>
    </PendingContext.Provider>
  );
}

export function SubmitButton({ children, pending: pendingText, ...props }: ButtonProps & { pending?: string }) {
  const status = useFormStatus();
  const transitionPending = useContext(PendingContext);
  const pending = status.pending || transitionPending;
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending ? (pendingText ?? "Working...") : children}
    </Button>
  );
}

/** First error message for a field, if any. */
export function fieldError(state: ActionState, name: string): string | undefined {
  return state.fieldErrors?.[name]?.[0];
}

/** Form-level error or a short success note. Never contains emoji. */
export function FormMessage({ state, success }: { state: ActionState; success?: string }) {
  if (state.ok && success) {
    return (
      <p role="status" className="rounded-xl bg-opps-tint px-4 py-2.5 text-sm font-semibold text-opps-text">
        {success}
      </p>
    );
  }
  if (!state.ok && state.error) {
    return (
      <p role="alert" className="rounded-xl bg-danger-tint px-4 py-2.5 text-sm font-semibold text-danger">
        {state.error}
      </p>
    );
  }
  return null;
}

export function FormGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-4", className)} {...props} />;
}
