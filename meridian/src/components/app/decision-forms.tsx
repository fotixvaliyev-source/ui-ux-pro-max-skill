"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { initialState } from "@/lib/action-state";
import { DECISION_STATUSES, DECISION_STATUS_STYLE } from "@/lib/constants";
import { createDecisionAction, setDecisionStatusAction, updateDecisionAction } from "@/server/actions/meetings";
import { cn } from "@/lib/utils";
import { ActionForm, FormGrid, FormMessage, SubmitButton, fieldError } from "./form-parts";

interface DecisionDefaults {
  title?: string;
  context?: string;
  decidedOn?: string;
  status?: string;
  involved?: string[];
  meetingId?: string;
}

export function DecisionForm({ circleId, decisionId, members, defaults }: { circleId: string; decisionId?: string; members: { userId: string; name: string }[]; defaults: DecisionDefaults }) {
  const bound = decisionId ? updateDecisionAction.bind(null, circleId, decisionId) : createDecisionAction.bind(null, circleId);
  const [state, action] = useActionState(bound, initialState);
  const [involved, setInvolved] = useState<string[]>(defaults.involved ?? []);
  const e = (n: string) => fieldError(state, n);
  const toggle = (id: string) => setInvolved((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  return (
    <ActionForm action={action} state={state} className="flex flex-col gap-5">
      {defaults.meetingId ? <input type="hidden" name="meetingId" value={defaults.meetingId} /> : null}
      <input type="hidden" name="involved" value={involved.join(",")} />
      <FormGrid>
        <Field label="The decision" htmlFor="title" hint="One clear sentence, in the past tense or as a rule." error={e("title")}>
          <Input id="title" name="title" defaultValue={defaults.title ?? ""} maxLength={300} required aria-invalid={!!e("title")} />
        </Field>
        <Field label="Context and reasoning" htmlFor="context" hint="What was the situation? What did you weigh? Future you will want to know." error={e("context")}>
          <Textarea id="context" name="context" defaultValue={defaults.context ?? ""} maxLength={4000} className="min-h-[140px]" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date decided" htmlFor="decidedOn" error={e("decidedOn")}>
            <Input id="decidedOn" name="decidedOn" type="date" defaultValue={defaults.decidedOn ?? ""} required />
          </Field>
          <Field label="Status" htmlFor="status" error={e("status")}>
            <Select id="status" name="status" defaultValue={defaults.status ?? "ACTIVE"}>
              {DECISION_STATUSES.map((s) => (
                <option key={s} value={s}>{DECISION_STATUS_STYLE[s].label}</option>
              ))}
            </Select>
          </Field>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Who was involved</legend>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const on = involved.includes(m.userId);
              return (
                <button
                  key={m.userId}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(m.userId)}
                  className={cn("inline-flex items-center gap-2 rounded-full border-2 py-1 pl-1 pr-3 text-sm font-semibold transition-colors", on ? "border-ink bg-decisions-tint text-decisions-text" : "border-line hover:border-ink")}
                >
                  <Avatar name={m.name} size="sm" /> {m.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      </FormGrid>
      <FormMessage state={state} />
      <div><SubmitButton pending="Saving...">{decisionId ? "Save decision" : "Log decision"}</SubmitButton></div>
    </ActionForm>
  );
}

export function DecisionStatusControl({ circleId, decisionId, status }: { circleId: string; decisionId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="decision-status" className="text-sm font-semibold">Status</label>
      <Select
        id="decision-status"
        value={value}
        disabled={pending}
        className="w-auto"
        onChange={(ev) => {
          const next = ev.target.value;
          const prev = value;
          setValue(next);
          start(async () => {
            const r = await setDecisionStatusAction(circleId, decisionId, next);
            if (!r.ok) {
              setValue(prev);
              setError(r.error ?? "Could not update the status.");
            } else {
              setError("");
              router.refresh();
            }
          });
        }}
      >
        {DECISION_STATUSES.map((s) => (
          <option key={s} value={s}>{DECISION_STATUS_STYLE[s].label}</option>
        ))}
      </Select>
      {error ? <p role="alert" className="text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
