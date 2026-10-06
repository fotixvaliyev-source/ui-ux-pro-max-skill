"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";

/** A button that confirms, runs a server action, then follows its redirectTo or refreshes the page. */
export function ConfirmActionButton({
  label,
  confirmText,
  run,
  ...props
}: ButtonProps & { label: string; confirmText: string; run: () => Promise<ActionState> }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2">
      <Button
        size="sm"
        disabled={pending}
        {...props}
        onClick={() => {
          if (!window.confirm(confirmText)) return;
          start(async () => {
            const r = await run();
            if (!r.ok) {
              setError(r.error ?? "Something went wrong.");
              return;
            }
            setError("");
            if (r.data?.redirectTo) router.push(r.data.redirectTo);
            else router.refresh();
          });
        }}
      >
        {label}
      </Button>
      {error ? <p role="alert" className="text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
