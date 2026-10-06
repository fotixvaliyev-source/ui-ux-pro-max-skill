"use client";

import { useRouter } from "next/navigation";
import { refreshSoon } from "@/lib/refresh";
import { useActionState, useState, useTransition } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { initialState } from "@/lib/action-state";
import { OPPORTUNITY_STATUSES, OPPORTUNITY_STATUS_STYLE, OPPORTUNITY_TYPES, OPPORTUNITY_TYPE_STYLE } from "@/lib/constants";
import { createOpportunityAction, setOpportunityStatusAction, updateOpportunityAction } from "@/server/actions/projects";
import { ActionForm, FormGrid, FormMessage, SubmitButton, fieldError } from "./form-parts";

export function OpportunityForm({ circleId, postId, defaults }: { circleId: string; postId?: string; defaults?: { type: string; title: string; description: string; tags: string; status: string } }) {
  const bound = postId ? updateOpportunityAction.bind(null, circleId, postId) : createOpportunityAction.bind(null, circleId);
  const [state, action] = useActionState(bound, initialState);
  const e = (n: string) => fieldError(state, n);
  return (
    <ActionForm action={action} state={state} className="flex flex-col gap-5">
      <FormGrid>
        <Field label="What kind of post is it?" htmlFor="type" error={e("type")}>
          <Select id="type" name="type" defaultValue={defaults?.type ?? "INTRO"}>
            {OPPORTUNITY_TYPES.map((t) => (<option key={t} value={t}>{OPPORTUNITY_TYPE_STYLE[t].label}</option>))}
          </Select>
        </Field>
        <Field label="Title" htmlFor="title" error={e("title")}><Input id="title" name="title" defaultValue={defaults?.title ?? ""} maxLength={140} required /></Field>
        <Field label="Details" htmlFor="description" hint="Say what you need or offer, and what a good response looks like." error={e("description")}>
          <Textarea id="description" name="description" defaultValue={defaults?.description ?? ""} maxLength={3000} className="min-h-[140px]" required />
        </Field>
        <Field label="Tags" htmlFor="tags" hint="Separate with commas." error={e("tags")}><Input id="tags" name="tags" defaultValue={defaults?.tags ?? ""} /></Field>
        {postId ? (
          <Field label="Status" htmlFor="status" error={e("status")}>
            <Select id="status" name="status" defaultValue={defaults?.status ?? "OPEN"}>
              {OPPORTUNITY_STATUSES.map((s) => (<option key={s} value={s}>{OPPORTUNITY_STATUS_STYLE[s].label}</option>))}
            </Select>
          </Field>
        ) : null}
      </FormGrid>
      <FormMessage state={state} />
      <div><SubmitButton pending="Saving...">{postId ? "Save post" : "Post to the circle"}</SubmitButton></div>
    </ActionForm>
  );
}

export function OpportunityStatusControl({ circleId, postId, status }: { circleId: string; postId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="opp-status" className="text-sm font-semibold">Status</label>
      <Select id="opp-status" value={value} disabled={pending} className="w-auto" onChange={(ev) => {
        const next = ev.target.value; const prev = value; setValue(next);
        start(async () => {
          const r = await setOpportunityStatusAction(circleId, postId, next);
          if (!r.ok) { setValue(prev); setError(r.error ?? "Could not update."); } else { setError(""); refreshSoon(router); }
        });
      }}>
        {OPPORTUNITY_STATUSES.map((s) => (<option key={s} value={s}>{OPPORTUNITY_STATUS_STYLE[s].label}</option>))}
      </Select>
      {error ? <p role="alert" className="text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
