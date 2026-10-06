"use client";

import { useActionState } from "react";
import { initialState } from "@/lib/action-state";
import { joinCircleAction } from "@/server/actions/circles";
import { FormMessage, SubmitButton, ActionForm } from "./form-parts";

export function JoinButton({ code }: { code: string }) {
  const [state, action] = useActionState(joinCircleAction, initialState);
  return (
    <ActionForm action={action} className="flex flex-col gap-3">
      <input type="hidden" name="code" value={code} />
      <FormMessage state={state} />
      <SubmitButton size="lg" pending="Joining...">Join this circle</SubmitButton>
    </ActionForm>
  );
}
