"use client";

import { useRouter } from "next/navigation";
import { refreshSoon } from "@/lib/refresh";
import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Pill } from "@/components/ui/tag";
import { initialState } from "@/lib/action-state";
import { createPollAction, deletePollAction, voteAction } from "@/server/actions/projects";
import { cn } from "@/lib/utils";
import { ActionForm, FormGrid, FormMessage, SubmitButton, fieldError } from "./form-parts";
import { LocalTime } from "./local-time";

export function PollForm({ circleId }: { circleId: string }) {
  const [state, action] = useActionState(createPollAction.bind(null, circleId), initialState);
  const [closes, setCloses] = useState("");
  const iso = closes ? new Date(closes).toISOString() : "";
  const e = (n: string) => fieldError(state, n);
  return (
    <ActionForm action={action} state={state} resetOnSuccess className="flex flex-col gap-4">
      <FormGrid>
        <Field label="Question" htmlFor="question" error={e("question")}><Input id="question" name="question" maxLength={200} required /></Field>
        <Field label="Options" htmlFor="options" hint="One per line, two to eight." error={e("options")}><Textarea id="options" name="options" className="min-h-[110px]" required /></Field>
        <Field label="Deadline (optional)" htmlFor="closesLocal" hint="After this, voting closes and results are shown to everyone." error={e("closesAt")}>
          <Input id="closesLocal" type="datetime-local" value={closes} onChange={(ev) => setCloses(ev.target.value)} />
          <input type="hidden" name="closesAt" value={iso} />
        </Field>
      </FormGrid>
      <FormMessage state={state} success="Poll opened." />
      <div><SubmitButton pending="Opening...">Open the poll</SubmitButton></div>
    </ActionForm>
  );
}

export interface PollCardView {
  id: string;
  question: string;
  closed: boolean;
  closesIso: string | null;
  myOptionId: string | null;
  totalVotes: number;
  options: { id: string; text: string; votes: number | null; mine: boolean }[];
  canDelete: boolean;
}

export function PollCard({ circleId, poll }: { circleId: string; poll: PollCardView }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const voted = poll.myOptionId !== null;
  const showResults = voted || poll.closed;
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Something went wrong.");
      else { setError(""); refreshSoon(router); }
    });
  return (
    <article id={`poll-${poll.id}`} className="card-soft flex flex-col gap-4 p-5" style={{ ["--accent" as string]: "var(--primary)" }}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-xl font-bold leading-snug">{poll.question}</h3>
        {poll.closed ? <Pill tone="neutral">Closed</Pill> : <Pill tone="opps">Open</Pill>}
      </div>
      {poll.closesIso ? <p className="text-xs text-ink-soft">{poll.closed ? "Closed" : "Closes"} <LocalTime iso={poll.closesIso} format="full" /></p> : null}
      <ul className="flex flex-col gap-2">
        {poll.options.map((o) => {
          const pct = showResults && poll.totalVotes ? Math.round(((o.votes ?? 0) / poll.totalVotes) * 100) : 0;
          return (
            <li key={o.id}>
              {showResults ? (
                <div className={cn("relative overflow-hidden rounded-xl border-2 px-3 py-2.5", o.mine ? "border-ink" : "border-line")}>
                  <div aria-hidden className="absolute inset-y-0 left-0 bg-primary-soft" style={{ width: `${pct}%` }} />
                  <div className="relative flex items-center justify-between gap-3 text-sm font-semibold">
                    <span>{o.text}{o.mine ? <span className="ml-2 text-xs font-bold text-primary">Your vote</span> : null}</span>
                    <span>{o.votes ?? 0} ({pct}%)</span>
                  </div>
                </div>
              ) : (
                <Button type="button" variant="secondary" className="w-full justify-start whitespace-normal text-left" disabled={pending} onClick={() => run(() => voteAction(circleId, poll.id, o.id))}>{o.text}</Button>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-soft">
        <span>{showResults ? `${poll.totalVotes} ${poll.totalVotes === 1 ? "vote" : "votes"}` : "Vote to see the results. One vote each."}</span>
        {poll.canDelete ? (
          <button type="button" disabled={pending} className="font-semibold hover:text-danger" onClick={() => window.confirm("Delete this poll and its votes?") && run(() => deletePollAction(circleId, poll.id))}>Delete poll</button>
        ) : null}
      </div>
      {error ? <p role="alert" className="text-sm font-semibold text-danger">{error}</p> : null}
    </article>
  );
}
