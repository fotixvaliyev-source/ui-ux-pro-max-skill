"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/form";
import { initialState } from "@/lib/action-state";
import { createCircleAction, joinCircleAction, updateCircleAction } from "@/server/actions/circles";
import { updateCircleProfileAction, updateProfileAction } from "@/server/actions/profile";
import { Textarea } from "@/components/ui/form";
import { CircleFields, type CircleDefaults } from "./circle-fields";
import { FormGrid, FormMessage, SubmitButton, fieldError, ActionForm } from "./form-parts";
import { ProfileFields, type ProfileDefaults } from "./profile-fields";

export function CreateCircleForm() {
  const [state, action] = useActionState(createCircleAction, initialState);
  return (
    <ActionForm action={action} className="flex flex-col gap-5">
      <CircleFields state={state} />
      <FormMessage state={state} />
      <SubmitButton size="lg" pending="Creating...">Create circle</SubmitButton>
    </ActionForm>
  );
}

export function JoinCircleForm() {
  const [state, action] = useActionState(joinCircleAction, initialState);
  return (
    <ActionForm action={action} className="flex flex-col gap-5">
      <Field label="Invite code" htmlFor="code" hint="8 letters and numbers." error={fieldError(state, "code")}>
        <Input id="code" name="code" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={12} className="font-display text-xl uppercase tracking-[0.2em]" required />
      </Field>
      <FormMessage state={state} />
      <SubmitButton size="lg" pending="Joining...">Join circle</SubmitButton>
    </ActionForm>
  );
}

export function EditCircleForm({ circleId, defaults }: { circleId: string; defaults: CircleDefaults }) {
  const [state, action] = useActionState(updateCircleAction.bind(null, circleId), initialState);
  return (
    <ActionForm action={action} className="flex flex-col gap-5">
      <CircleFields state={state} defaults={defaults} idPrefix="e-" />
      <FormMessage state={state} success="Saved." />
      <SubmitButton pending="Saving...">Save changes</SubmitButton>
    </ActionForm>
  );
}

export function EditProfileForm({ defaults }: { defaults: ProfileDefaults }) {
  const [state, action] = useActionState(updateProfileAction, initialState);
  return (
    <ActionForm action={action} className="flex flex-col gap-5">
      <ProfileFields state={state} defaults={defaults} />
      <FormMessage state={state} success="Profile saved." />
      <SubmitButton pending="Saving...">Save profile</SubmitButton>
    </ActionForm>
  );
}

export function EditCircleProfileForm({ circleId, defaults }: { circleId: string; defaults: { workingOn?: string | null; canHelpWith?: string | null; lookingFor?: string | null } }) {
  const [state, action] = useActionState(updateCircleProfileAction.bind(null, circleId), initialState);
  return (
    <ActionForm action={action} className="flex flex-col gap-5">
      <FormGrid>
        <Field label="Currently working on" htmlFor="workingOn" error={fieldError(state, "workingOn")}>
          <Textarea id="workingOn" name="workingOn" defaultValue={defaults.workingOn ?? ""} maxLength={300} />
        </Field>
        <Field label="Can help with" htmlFor="canHelpWith" error={fieldError(state, "canHelpWith")}>
          <Textarea id="canHelpWith" name="canHelpWith" defaultValue={defaults.canHelpWith ?? ""} maxLength={300} />
        </Field>
        <Field label="Looking for" htmlFor="lookingFor" error={fieldError(state, "lookingFor")}>
          <Textarea id="lookingFor" name="lookingFor" defaultValue={defaults.lookingFor ?? ""} maxLength={300} />
        </Field>
      </FormGrid>
      <FormMessage state={state} success="Saved." />
      <SubmitButton pending="Saving...">Save</SubmitButton>
    </ActionForm>
  );
}
