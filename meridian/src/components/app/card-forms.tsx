"use client";

import { useRouter } from "next/navigation";
import { refreshSoon } from "@/lib/refresh";
import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { initialState } from "@/lib/action-state";
import { addChecklistItemAction, deleteChecklistItemAction, setChecklistDoneAction, updateCardAction } from "@/server/actions/projects";
import { cn } from "@/lib/utils";
import { ActionForm, FormGrid, FormMessage, SubmitButton, fieldError } from "./form-parts";

export function EditCardForm({ circleId, cardId, members, defaults }: { circleId: string; cardId: string; members: { userId: string; name: string }[]; defaults: { title: string; description: string | null; ownerId: string | null; dueDate: string; label: string | null } }) {
  const [state, action] = useActionState(updateCardAction.bind(null, circleId, cardId), initialState);
  const e = (n: string) => fieldError(state, n);
  return (
    <ActionForm action={action} state={state} className="flex flex-col gap-4">
      <FormGrid>
        <Field label="Title" htmlFor="title" error={e("title")}><Input id="title" name="title" defaultValue={defaults.title} maxLength={140} required /></Field>
        <Field label="Description" htmlFor="description" error={e("description")}><Textarea id="description" name="description" defaultValue={defaults.description ?? ""} maxLength={2000} /></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Owner" htmlFor="ownerId" error={e("ownerId")}>
            <Select id="ownerId" name="ownerId" defaultValue={defaults.ownerId ?? ""}>
              <option value="">Unassigned</option>
              {members.map((m) => (<option key={m.userId} value={m.userId}>{m.name}</option>))}
            </Select>
          </Field>
          <Field label="Due date" htmlFor="dueDate" error={e("dueDate")}><Input id="dueDate" name="dueDate" type="date" defaultValue={defaults.dueDate} /></Field>
          <Field label="Label" htmlFor="label" error={e("label")}><Input id="label" name="label" defaultValue={defaults.label ?? ""} maxLength={30} placeholder="For example: Design" /></Field>
        </div>
      </FormGrid>
      <FormMessage state={state} success="Saved." />
      <div><SubmitButton pending="Saving...">Save card</SubmitButton></div>
    </ActionForm>
  );
}

export interface ChecklistView { id: string; text: string; done: boolean }

export function Checklist({ circleId, cardId, items }: { circleId: string; cardId: string; items: ChecklistView[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Something went wrong.");
      else {
        setError("");
        after?.();
        refreshSoon(router);
      }
    });
  const done = items.filter((i) => i.done).length;
  return (
    <div className="flex flex-col gap-3">
      {items.length ? (
        <div className="flex items-center gap-3" aria-label={`${done} of ${items.length} done`}>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-projects-tint"><div className="h-full rounded-full bg-projects transition-all" style={{ width: `${(done / items.length) * 100}%` }} /></div>
          <span className="text-xs font-bold text-ink-soft">{done}/{items.length}</span>
        </div>
      ) : null}
      <ul className="flex flex-col gap-1.5">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 rounded-xl border-2 border-line px-3 py-2">
            <button type="button" role="checkbox" aria-checked={i.done} aria-label={i.text} disabled={pending} onClick={() => run(() => setChecklistDoneAction(circleId, i.id, !i.done))}
              className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-ink text-xs font-extrabold", i.done ? "bg-opps text-[#1b1a2e]" : "bg-surface")}>
              {i.done ? <span aria-hidden>&#10003;</span> : null}
            </button>
            <span className={cn("flex-1", i.done && "text-ink-soft line-through")}>{i.text}</span>
            <button type="button" disabled={pending} onClick={() => run(() => deleteChecklistItemAction(circleId, i.id))} className="text-xs font-semibold text-ink-soft hover:text-danger">Remove</button>
          </li>
        ))}
      </ul>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) run(() => addChecklistItemAction(circleId, cardId, text), () => setText("")); }}>
        <label htmlFor="check-new" className="sr-only">New checklist item</label>
        <Input id="check-new" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a checklist item" maxLength={200} className="h-10" />
        <Button type="submit" size="sm" variant="secondary" disabled={pending || !text.trim()}>Add</Button>
      </form>
      {error ? <p role="alert" className="text-sm font-semibold text-danger">{error}</p> : null}
    </div>
  );
}
