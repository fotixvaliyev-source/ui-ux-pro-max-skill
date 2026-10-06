"use client";

import { useRouter } from "next/navigation";
import { refreshSoon } from "@/lib/refresh";
import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { initialState } from "@/lib/action-state";
import { GOAL_STATUS_STYLE, GOAL_STATUSES } from "@/lib/constants";
import { addCheckInAction, createGoalAction, deleteGoalAction, setGoalStatusAction, updateGoalAction } from "@/server/actions/goals";
import { ActionForm, FormGrid, FormMessage, SubmitButton, fieldError } from "./form-parts";

interface GoalDefaults {
  title?: string;
  description?: string | null;
  target?: string | null;
  deadline?: string;
  quarter: string;
  status?: string;
}

export function GoalForm({ circleId, goalId, defaults, quarters }: { circleId: string; goalId?: string; defaults: GoalDefaults; quarters: { value: string; label: string }[] }) {
  const bound = goalId ? updateGoalAction.bind(null, circleId, goalId) : createGoalAction.bind(null, circleId);
  const [state, action] = useActionState(bound, initialState);
  const e = (n: string) => fieldError(state, n);
  return (
    <ActionForm action={action} state={state} className="flex flex-col gap-5">
      <FormGrid>
        <Field label="Goal" htmlFor="title" hint="One clear sentence." error={e("title")}>
          <Input id="title" name="title" defaultValue={defaults.title ?? ""} maxLength={120} required aria-invalid={!!e("title")} />
        </Field>
        <Field label="Measurable target" htmlFor="target" hint="How will you know it is done? For example: 3 signed pilots." error={e("target")}>
          <Input id="target" name="target" defaultValue={defaults.target ?? ""} maxLength={200} />
        </Field>
        <Field label="Details (optional)" htmlFor="description" error={e("description")}>
          <Textarea id="description" name="description" defaultValue={defaults.description ?? ""} maxLength={1000} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Quarter" htmlFor="quarter" error={e("quarter")}>
            <Select id="quarter" name="quarter" defaultValue={defaults.quarter}>
              {quarters.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Deadline" htmlFor="deadline" error={e("deadline")}>
            <Input id="deadline" name="deadline" type="date" defaultValue={defaults.deadline ?? ""} />
          </Field>
          <Field label="Status" htmlFor="status" error={e("status")}>
            <Select id="status" name="status" defaultValue={defaults.status ?? "ON_TRACK"}>
              {GOAL_STATUSES.map((s) => (
                <option key={s} value={s}>{GOAL_STATUS_STYLE[s].label}</option>
              ))}
            </Select>
          </Field>
        </div>
      </FormGrid>
      <FormMessage state={state} />
      <div><SubmitButton pending="Saving...">{goalId ? "Save goal" : "Add goal"}</SubmitButton></div>
    </ActionForm>
  );
}

export function StatusControl({ circleId, goalId, status }: { circleId: string; goalId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="goal-status" className="text-sm font-semibold">Status</label>
      <Select
        id="goal-status"
        value={value}
        disabled={pending}
        className="w-auto"
        onChange={(ev) => {
          const next = ev.target.value;
          const prev = value;
          setValue(next);
          start(async () => {
            const r = await setGoalStatusAction(circleId, goalId, next);
            if (!r.ok) {
              setValue(prev);
              setError(r.error ?? "Could not update the status.");
            } else {
              setError("");
              refreshSoon(router);
            }
          });
        }}
      >
        {GOAL_STATUSES.map((s) => (
          <option key={s} value={s}>{GOAL_STATUS_STYLE[s].label}</option>
        ))}
      </Select>
      {error ? <p role="alert" className="text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}

export function CheckInForm({ circleId, goalId }: { circleId: string; goalId: string }) {
  const [state, action] = useActionState(addCheckInAction.bind(null, circleId, goalId), initialState);
  const e = (n: string) => fieldError(state, n);
  return (
    <ActionForm action={action} state={state} resetOnSuccess className="flex flex-col gap-4">
      <Field label="What progressed" htmlFor="progressed" error={e("progressed")}>
        <Textarea id="progressed" name="progressed" maxLength={1000} required />
      </Field>
      <Field label="What is blocked (optional)" htmlFor="blocked" error={e("blocked")}>
        <Textarea id="blocked" name="blocked" maxLength={1000} className="min-h-[64px]" />
      </Field>
      <Field label="What help do you need (optional)" htmlFor="helpNeeded" error={e("helpNeeded")}>
        <Textarea id="helpNeeded" name="helpNeeded" maxLength={1000} className="min-h-[64px]" />
      </Field>
      <FormMessage state={state} success="Check-in saved." />
      <div><SubmitButton pending="Saving...">Post check-in</SubmitButton></div>
    </ActionForm>
  );
}

export function DeleteGoalButton({ circleId, goalId }: { circleId: string; goalId: string }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Delete this goal, its check-ins and comments?")) return;
          start(async () => {
            const r = await deleteGoalAction(circleId, goalId);
            if (!r.ok) setError(r.error ?? "Could not delete the goal.");
            else if (r.data?.redirectTo) router.push(r.data.redirectTo);
          });
        }}
      >
        Delete goal
      </Button>
      {error ? <p role="alert" className="text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
