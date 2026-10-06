"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { initialState } from "@/lib/action-state";
import { createMeetingAction, saveNotesAction, updateMeetingAction } from "@/server/actions/meetings";
import { ActionForm, FormGrid, FormMessage, SubmitButton, fieldError } from "./form-parts";

/** ISO instant -> value for <input type="datetime-local"> in the viewer's own time zone. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface MeetingDefaults {
  title?: string;
  startsAtIso?: string;
  location?: string | null;
  videoUrl?: string | null;
  agenda?: string[];
}

export function MeetingForm({ circleId, meetingId, defaults = {} }: { circleId: string; meetingId?: string; defaults?: MeetingDefaults }) {
  const bound = meetingId ? updateMeetingAction.bind(null, circleId, meetingId) : createMeetingAction.bind(null, circleId);
  const [state, action] = useActionState(bound, initialState);
  const [local, setLocal] = useState(() => (defaults.startsAtIso ? toLocalInput(defaults.startsAtIso) : ""));
  // The server needs an unambiguous instant, so the browser converts its local time to ISO (UTC).
  const iso = local ? new Date(local).toISOString() : "";
  const e = (n: string) => fieldError(state, n);
  return (
    <ActionForm action={action} state={state} className="flex flex-col gap-5">
      <FormGrid>
        <Field label="Title" htmlFor="title" error={e("title")}>
          <Input id="title" name="title" defaultValue={defaults.title ?? ""} maxLength={120} required aria-invalid={!!e("title")} />
        </Field>
        <Field label="Date and time" htmlFor="startsAtLocal" hint="Shown to everyone in their own time zone." error={e("startsAt")}>
          <Input id="startsAtLocal" type="datetime-local" value={local} onChange={(ev) => setLocal(ev.target.value)} required />
          <input type="hidden" name="startsAt" value={iso} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location (optional)" htmlFor="location" error={e("location")}>
            <Input id="location" name="location" defaultValue={defaults.location ?? ""} maxLength={200} />
          </Field>
          <Field label="Video link (optional)" htmlFor="videoUrl" error={e("videoUrl")}>
            <Input id="videoUrl" name="videoUrl" type="url" defaultValue={defaults.videoUrl ?? ""} placeholder="https://" />
          </Field>
        </div>
        <Field label="Agenda" htmlFor="agenda" hint="One item per line." error={e("agenda")}>
          <Textarea id="agenda" name="agenda" defaultValue={(defaults.agenda ?? []).join("\n")} className="min-h-[120px]" />
        </Field>
      </FormGrid>
      <FormMessage state={state} />
      <div><SubmitButton pending="Saving...">{meetingId ? "Save meeting" : "Schedule meeting"}</SubmitButton></div>
    </ActionForm>
  );
}

/** Rendered notes with an Edit toggle. Any member of the circle can edit the shared notes. */
export function NotesPanel({ circleId, meetingId, notesMd, rendered }: { circleId: string; meetingId: string; notesMd: string; rendered: React.ReactNode }) {
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState(saveNotesAction.bind(null, circleId, meetingId), initialState);
  if (!editing) {
    return (
      <div className="flex flex-col gap-3">
        {notesMd.trim() ? rendered : <p className="text-ink-soft">No notes yet. Anyone in the circle can add them.</p>}
        <div><Button variant="secondary" size="sm" onClick={() => setEditing(true)}>{notesMd.trim() ? "Edit notes" : "Write notes"}</Button></div>
      </div>
    );
  }
  return (
    <ActionForm action={action} state={state} className="flex flex-col gap-3">
      <label htmlFor="notesMd" className="sr-only">Meeting notes in markdown</label>
      <Textarea id="notesMd" name="notesMd" defaultValue={notesMd} className="min-h-[240px] font-mono text-sm" maxLength={20000} />
      <p className="text-xs text-ink-soft">Markdown is supported: headings, lists, links, tables.</p>
      <FormMessage state={state} success="Notes saved." />
      <div className="flex gap-3">
        <SubmitButton size="sm" pending="Saving...">Save notes</SubmitButton>
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>{state.ok ? "Close" : "Cancel"}</Button>
      </div>
    </ActionForm>
  );
}
