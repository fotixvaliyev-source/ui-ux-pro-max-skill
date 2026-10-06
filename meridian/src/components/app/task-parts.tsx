"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Field, Input, Select } from "@/components/ui/form";
import { Tag } from "@/components/ui/tag";
import { initialState } from "@/lib/action-state";
import { addActionItemAction, deleteActionItemAction, setActionItemDoneAction } from "@/server/actions/meetings";
import { cn } from "@/lib/utils";
import { ActionForm, FormGrid, FormMessage, SubmitButton, fieldError } from "./form-parts";
import { LocalTime } from "./local-time";

export interface TaskView {
  id: string;
  circleId: string;
  title: string;
  ownerId: string;
  ownerName: string;
  dueIso: string | null;
  done: boolean;
  meeting: { id: string; title: string } | null;
  circleName?: string;
  /** Whether the viewer may tick it off or delete it (owner or Founder). */
  canChange: boolean;
}

export function TaskRow({ task, showOwner = true }: { task: TaskView; showOwner?: boolean }) {
  const router = useRouter();
  const [done, setDone] = useState(task.done);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const overdue = !done && task.dueIso !== null && new Date(task.dueIso).getTime() < Date.now();

  function toggle() {
    const next = !done;
    setDone(next);
    start(async () => {
      const r = await setActionItemDoneAction(task.circleId, task.id, next);
      if (!r.ok) {
        setDone(!next);
        setError(r.error ?? "Could not update.");
      } else {
        setError("");
        router.refresh();
      }
    });
  }

  return (
    <li className="flex items-start gap-3 rounded-card border-2 border-line bg-surface p-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`${done ? "Mark as not done" : "Mark as done"}: ${task.title}`}
        disabled={!task.canChange || pending}
        onClick={toggle}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-ink text-sm font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          done ? "bg-opps text-[#1b1a2e]" : "bg-surface",
        )}
      >
        {done ? <span aria-hidden>&#10003;</span> : null}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("font-semibold leading-snug", done && "text-ink-soft line-through")}>{task.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          {showOwner ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink-soft"><Avatar name={task.ownerName} size="sm" /> {task.ownerName}</span>
          ) : null}
          {task.dueIso ? (
            <Tag tone={overdue ? "danger" : "meetings"} className="gap-1">{overdue ? "Overdue," : "Due"}<LocalTime iso={task.dueIso} format="date" /></Tag>
          ) : null}
          {task.circleName ? <Tag>{task.circleName}</Tag> : null}
          {task.meeting ? (
            <Link href={`/app/c/${task.circleId}/meetings/${task.meeting.id}`} className="font-semibold text-primary hover:underline">{task.meeting.title}</Link>
          ) : null}
        </div>
        {error ? <p role="alert" className="mt-1 text-xs font-semibold text-danger">{error}</p> : null}
      </div>
      {task.canChange ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!window.confirm("Delete this action item?")) return;
            start(async () => {
              const r = await deleteActionItemAction(task.circleId, task.id);
              if (r.ok) router.refresh();
              else setError(r.error ?? "Could not delete.");
            });
          }}
          className="text-xs font-semibold text-ink-soft hover:text-danger"
        >
          Delete
        </button>
      ) : null}
    </li>
  );
}

export function ActionItemForm({ circleId, meetingId, members, defaultOwnerId }: { circleId: string; meetingId?: string; members: { userId: string; name: string }[]; defaultOwnerId: string }) {
  const [state, action] = useActionState(addActionItemAction.bind(null, circleId), initialState);
  const e = (n: string) => fieldError(state, n);
  return (
    <ActionForm action={action} state={state} resetOnSuccess className="flex flex-col gap-3">
      {meetingId ? <input type="hidden" name="meetingId" value={meetingId} /> : null}
      <FormGrid className="sm:grid-cols-[2fr_1fr_1fr]">
        <Field label="Action item" htmlFor="ai-title" error={e("title")}>
          <Input id="ai-title" name="title" maxLength={200} required />
        </Field>
        <Field label="Owner" htmlFor="ai-owner" error={e("ownerId")}>
          <Select id="ai-owner" name="ownerId" defaultValue={defaultOwnerId}>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Due date" htmlFor="ai-due" error={e("dueDate")}>
          <Input id="ai-due" name="dueDate" type="date" />
        </Field>
      </FormGrid>
      <FormMessage state={state} />
      <div><SubmitButton size="sm" pending="Adding...">Add action item</SubmitButton></div>
    </ActionForm>
  );
}
